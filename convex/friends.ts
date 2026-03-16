import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ---- Get friends for a user ----
export const getUserFriends = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const friendships = await ctx.db
      .query("friendships")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    const friends = await Promise.all(
      friendships.map(async (f) => {
        const user = await ctx.db.get(f.friendId);
        return user ? { ...user, friendshipId: f._id } : null;
      })
    );

    return friends.filter(Boolean);
  },
});

// ---- Add friend ----
export const addFriend = mutation({
  args: {
    userId: v.id("users"),
    friendId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if friendship already exists
    const existing = await ctx.db
      .query("friendships")
      .withIndex("by_pair", (q) =>
        q.eq("userId", args.userId).eq("friendId", args.friendId)
      )
      .first();

    if (existing) return existing._id;

    // Create bidirectional friendship
    await ctx.db.insert("friendships", {
      userId: args.userId,
      friendId: args.friendId,
      status: "active",
    });

    await ctx.db.insert("friendships", {
      userId: args.friendId,
      friendId: args.userId,
      status: "active",
    });

    return "added";
  },
});

// ---- Remove friend ----
export const removeFriend = mutation({
  args: {
    userId: v.id("users"),
    friendId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Remove both directions
    const forward = await ctx.db
      .query("friendships")
      .withIndex("by_pair", (q) =>
        q.eq("userId", args.userId).eq("friendId", args.friendId)
      )
      .first();

    const reverse = await ctx.db
      .query("friendships")
      .withIndex("by_pair", (q) =>
        q.eq("userId", args.friendId).eq("friendId", args.userId)
      )
      .first();

    if (forward) await ctx.db.delete(forward._id);
    if (reverse) await ctx.db.delete(reverse._id);
  },
});

// ---- Get payment methods ----
export const getPaymentMethods = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("paymentMethods")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// ---- Add payment method ----
export const addPaymentMethod = mutation({
  args: {
    userId: v.id("users"),
    type: v.string(),
    last4: v.string(),
    isDefault: v.boolean(),
    stripePaymentMethodId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // If this is default, unset the current default
    if (args.isDefault) {
      const existing = await ctx.db
        .query("paymentMethods")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .filter((q) => q.eq(q.field("isDefault"), true))
        .collect();

      await Promise.all(existing.map((pm) => ctx.db.patch(pm._id, { isDefault: false })));
    }

    return await ctx.db.insert("paymentMethods", args);
  },
});
