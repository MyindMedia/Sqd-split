import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ---- Get current user (by phone or email) ----
export const getUser = query({
  args: { phone: v.optional(v.string()), email: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.phone) {
      return await ctx.db.query("users").withIndex("by_phone", (q) => q.eq("phone", args.phone!)).first();
    }
    if (args.email) {
      return await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", args.email!)).first();
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
    name: v.string(),
    handle: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
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
