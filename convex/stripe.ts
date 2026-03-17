import { action } from "./_generated/server";
import { v } from "convex/values";
import Stripe from "stripe";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set in Convex environment");
  return new Stripe(key, {
    apiVersion: "2024-12-18.acacia" as any,
  });
};

export const createPaymentIntent = action({
  args: {
    amount: v.number(), // Amount in cents
    currency: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args): Promise<{ clientSecret: string | null }> => {
    // 1. Get user record
    const user = await ctx.runQuery(api.users.getUser, { userId: args.userId });
    if (!user) throw new Error("User not found");

    let customerId: string | undefined = user.stripeCustomerId;

    // 2. Create customer if they don't have one
    if (!customerId) {
       const stripeInstance = getStripe();
       const customer = await stripeInstance.customers.create({
         email: user.email ?? undefined,
         name: user.name,
         metadata: { convexUserId: args.userId },
       });
       customerId = customer.id;
       // 3. Save customerId to user record
       await ctx.runMutation(api.users.updateStripeCustomer, {
         userId: args.userId,
         stripeCustomerId: customerId,
       });
    }

    // 4. Create PaymentIntent
    const stripeInstance = getStripe();
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: args.amount,
      currency: args.currency,
      customer: customerId,
      automatic_payment_methods: { enabled: true },
    });

    return {
      clientSecret: paymentIntent.client_secret,
    };
  },
});

export const createSetupIntent = action({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args): Promise<{ clientSecret: string | null }> => {
    const user = await ctx.runQuery(api.users.getUser, { userId: args.userId });
    if (!user) throw new Error("User not found");

    let customerId: string | undefined = user.stripeCustomerId;

    if (!customerId) {
       const stripeInstance = getStripe();
       const customer = await stripeInstance.customers.create({
         email: user.email ?? undefined,
         name: user.name,
         metadata: { convexUserId: args.userId },
       });
       customerId = customer.id;
       await ctx.runMutation(api.users.updateStripeCustomer, {
         userId: args.userId,
         stripeCustomerId: customerId,
       });
    }

    const stripeInstance = getStripe();
    const setupIntent = await stripeInstance.setupIntents.create({
      customer: customerId,
      automatic_payment_methods: { enabled: true },
    });

    return {
      clientSecret: setupIntent.client_secret,
    };
  },
});

export const saveStripePaymentMethod = action({
  args: {
    userId: v.id("users"),
    paymentMethodId: v.string(),
  },
  handler: async (ctx, args) => {
    const stripeInstance = getStripe();
    
    // 1. Retrieve payment method from Stripe
    const paymentMethod = await stripeInstance.paymentMethods.retrieve(args.paymentMethodId);
    
    // 2. Extract card details
    const last4 = paymentMethod.card?.last4 || "0000";
    const brand = paymentMethod.card?.brand || "card";
    
    // 3. Save to database using mutation
    await ctx.runMutation(api.friends.addPaymentMethod, {
      userId: args.userId,
      type: brand,
      last4: last4,
      isDefault: true, // Defaulting new cards for now
      stripePaymentMethodId: args.paymentMethodId,
    });
    
    return { success: true };
  },
});

export const executeAutoPull = action({
  args: {
    eventId: v.id("splitEvents"),
  },
  handler: async (ctx, args): Promise<Array<{ userId: Id<"users">; success: boolean; error?: string }>> => {
    const stripeInstance = getStripe();
    
    // 1. Get all participants for the event
    const participants = await ctx.runQuery(api.splitEvents.getEventParticipants, { eventId: args.eventId });
    
    const results: Array<{ userId: Id<"users">; success: boolean; error?: string }> = [];

    for (const p of participants) {
      // 2. Only process if ready/authorized and pending/authorized
      const isPending = p.paymentStatus === "pending";
      const isAuthorized = p.paymentStatus === "authorized" && p.stripeAuthIntentId;

      if ((p.isReadyToPay || isAuthorized) && (isPending || isAuthorized)) {
        const amount = Math.round((p.calculatedTotal || 0) * 100);
        if (amount <= 0) continue;

        try {
          if (isAuthorized && p.stripeAuthIntentId) {
            // ---- CAPTURE HOLD ----
            await stripeInstance.paymentIntents.capture(p.stripeAuthIntentId, {
              amount_to_capture: amount,
            });
          } else {
            // ---- NEW PULL ----
            const paymentMethods = await ctx.runQuery(api.friends.getPaymentMethods, { userId: p.userId });
            const defaultMethod = paymentMethods.find((m: any) => m.isDefault) || paymentMethods[0];

            if (defaultMethod?.stripePaymentMethodId) {
              const user = await ctx.runQuery(api.users.getUser, { userId: p.userId });
              await stripeInstance.paymentIntents.create({
                amount,
                currency: "usd",
                customer: user?.stripeCustomerId,
                payment_method: defaultMethod.stripePaymentMethodId,
                off_session: true,
                confirm: true,
              });
            } else {
              throw new Error("No payment method found");
            }
          }

          // 5. Mark as charged in database
          await ctx.runMutation(api.splitEvents.updateParticipantStatus, {
            eventId: args.eventId,
            userId: p.userId,
            status: "charged"
          });

          results.push({ userId: p.userId, success: true });
        } catch (e: any) {
          console.error(`Auto-pull failed for user ${p.userId}:`, e.message);
          results.push({ userId: p.userId, success: false, error: e.message });
        }
      }
    }

    return results;
  },
});

export const authorizeSquadHolds = action({
  args: {
    eventId: v.id("splitEvents"),
  },
  handler: async (ctx, args): Promise<Array<{ userId: Id<"users">; success: boolean; error?: string }>> => {
    const stripeInstance = getStripe();
    const participants = await ctx.runQuery(api.splitEvents.getEventParticipants, { eventId: args.eventId });
    const results: Array<{ userId: Id<"users">; success: boolean; error?: string }> = [];

    for (const p of participants) {
      if (p.isReadyToPay && p.paymentStatus === "pending") {
        const amount = Math.round((p.calculatedTotal || 0) * 100);
        if (amount <= 0) continue;

        const paymentMethods = await ctx.runQuery(api.friends.getPaymentMethods, { userId: p.userId });
        const defaultMethod = paymentMethods.find((m: any) => m.isDefault) || paymentMethods[0];

        if (defaultMethod?.stripePaymentMethodId) {
          try {
            const user = await ctx.runQuery(api.users.getUser, { userId: p.userId });
            const intent = await stripeInstance.paymentIntents.create({
              amount,
              currency: "usd",
              customer: user?.stripeCustomerId,
              payment_method: defaultMethod.stripePaymentMethodId,
              off_session: true,
              confirm: true,
              capture_method: "manual", // PLACE HOLD
            });

            await ctx.runMutation(api.splitEvents.updateParticipantAuth, {
              eventId: args.eventId,
              userId: p.userId,
              stripeAuthIntentId: intent.id,
            });

            results.push({ userId: p.userId, success: true });
          } catch (e: any) {
            console.error(`Auth hold failed for user ${p.userId}:`, e.message);
            results.push({ userId: p.userId, success: false, error: e.message });
          }
        }
      }
    }

    // Mark event as secured if any hold succeeded
    if (results.some(r => r.success)) {
      await ctx.runMutation(api.splitEvents.updateEventSecured, {
        eventId: args.eventId,
        isSecured: true,
      });
    }

    return results;
  },
});
