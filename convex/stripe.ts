import { action } from "./_generated/server";
import { v } from "convex/values";
import Stripe from "stripe";
import { api } from "./_generated/api";

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
