import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ---- Add receipt items (batch) ----
export const addItems = mutation({
  args: {
    eventId: v.id("splitEvents"),
    items: v.array(
      v.object({
        name: v.string(),
        price: v.number(),
        quantity: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const ids = await Promise.all(
      args.items.map((item) =>
        ctx.db.insert("receiptItems", {
          eventId: args.eventId,
          ...item,
        })
      )
    );

    // Move event to "claiming" status
    await ctx.db.patch(args.eventId, { status: "claiming" });

    return ids;
  },
});

// ---- Get items for an event ----
export const getEventItems = query({
  args: { eventId: v.id("splitEvents") },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("receiptItems")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    // Get claims for each item
    const enriched = await Promise.all(
      items.map(async (item) => {
        const claims = await ctx.db
          .query("itemClaims")
          .withIndex("by_item", (q) => q.eq("itemId", item._id))
          .collect();

        const claimUsers = await Promise.all(
          claims.map(async (c) => {
            const user = await ctx.db.get(c.userId);
            return { claimId: c._id, user };
          })
        );

        return { ...item, claims: claimUsers };
      })
    );

    return enriched;
  },
});

// ---- Claim an item (tap-to-claim) ----
export const claimItem = mutation({
  args: {
    itemId: v.id("receiptItems"),
    userId: v.id("users"),
    eventId: v.id("splitEvents"),
  },
  handler: async (ctx, args) => {
    // Check if user already claimed this item
    const existing = await ctx.db
      .query("itemClaims")
      .withIndex("by_item", (q) => q.eq("itemId", args.itemId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (existing) {
      // Unclaim — toggle behavior
      await ctx.db.delete(existing._id);
      return { action: "unclaimed" };
    }

    await ctx.db.insert("itemClaims", {
      itemId: args.itemId,
      userId: args.userId,
      eventId: args.eventId,
    });

    return { action: "claimed" };
  },
});

// ---- Get all claims for a user in an event ----
export const getUserClaims = query({
  args: {
    userId: v.id("users"),
    eventId: v.id("splitEvents"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("itemClaims")
      .withIndex("by_user_event", (q) =>
        q.eq("userId", args.userId).eq("eventId", args.eventId)
      )
      .collect();
  },
});
