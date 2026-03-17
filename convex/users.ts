import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ---- Get current user with absolute resilience ----
export const getUser = query({
  args: { 
    userId: v.optional(v.id("users")),
    clerkId: v.optional(v.string()),
    phone: v.optional(v.string()), 
    email: v.optional(v.string()) 
  },
  handler: async (ctx, args) => {
    console.log("[getUser] Request received with args:", JSON.stringify(args));
    
    try {
      // 1. Direct ID lookup (fastest, no index required)
      if (args.userId) {
        return await ctx.db.get(args.userId);
      }

      // 2. Clerk ID lookup (Stable ID)
      if (args.clerkId) {
        try {
          // Attempt indexed scan
          return await ctx.db.query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();
        } catch (e) {
          console.warn("[getUser] Clerk ID indexed scan failed, falling back to filter:", e);
          // Fallback to table scan filter
          return await ctx.db.query("users")
            .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
            .first();
        }
      }
      
      // 3. Email lookup
      if (args.email) {
        try {
          return await ctx.db.query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();
        } catch (e) {
          console.warn("[getUser] Email indexed scan failed, falling back to filter:", e);
          return await ctx.db.query("users")
            .filter((q) => q.eq(q.field("email"), args.email))
            .first();
        }
      }

      // 4. Phone lookup
      if (args.phone) {
        try {
          return await ctx.db.query("users")
            .withIndex("by_phone", (q) => q.eq("phone", args.phone))
            .first();
        } catch (e) {
          console.warn("[getUser] Phone indexed scan failed, falling back to filter:", e);
          return await ctx.db.query("users")
            .filter((q) => q.eq(q.field("phone"), args.phone))
            .first();
        }
      }
    } catch (criticalError) {
      console.error("[getUser] CRITICAL FAILURE:", criticalError);
      // We throw a clear error here so we can see it in client logs if needed, 
      // but return null to prevent app crash if possible.
      return null;
    }
    
    return null;
  },
});

export const getUserByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();
  },
});

// ---- Create user ----
export const createUser = mutation({
  args: {
    clerkId: v.optional(v.string()),
    name: v.string(),
    handle: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("[createUser] Creating profile for:", args.name);
    return await ctx.db.insert("users", {
      ...args,
      memberSince: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      defaultTipPercent: 20,
      splitMethod: "even",
      notificationsEnabled: true,
    });
  },
});

// ---- Update user preferences ----
export const updatePreferences = mutation({
  args: {
    userId: v.id("users"),
    defaultTipPercent: v.optional(v.number()),
    splitMethod: v.optional(v.union(v.literal("even"), v.literal("itemized"))),
    notificationsEnabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    const cleanUpdates = Object.fromEntries(Object.entries(updates).filter(([, val]) => val !== undefined));
    await ctx.db.patch(userId, cleanUpdates);
  },
});

// ---- Update Stripe Customer ID ----
export const updateStripeCustomer = mutation({
  args: {
    userId: v.id("users"),
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { stripeCustomerId: args.stripeCustomerId });
  },
});
