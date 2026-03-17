import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ---- Create a new split event ----
export const createEvent = mutation({
  args: {
    name: v.string(),
    emoji: v.optional(v.string()),
    hostId: v.id("users"),
    venue: v.optional(v.string()),
    date: v.string(),
    splitMethod: v.union(v.literal("even"), v.literal("itemized")),
  },
  handler: async (ctx, args) => {
    // Generate a random invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const eventId = await ctx.db.insert("splitEvents", {
      ...args,
      status: "open",
      inviteCode,
    });

    // Auto-add host as participant
    await ctx.db.insert("participants", {
      eventId,
      userId: args.hostId,
      paymentStatus: "pending",
      joinedAt: new Date().toISOString(),
    });

    return { eventId, inviteCode };
  },
});

// ---- Get event by ID ----
export const getEvent = query({
  args: { eventId: v.id("splitEvents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.eventId);
  },
});

// ---- Get event by invite code ----
export const getEventByInviteCode = query({
  args: { inviteCode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("splitEvents")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", args.inviteCode))
      .first();
  },
});

// ---- List events for a user (as host) ----
export const listUserEvents = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const hosted = await ctx.db
      .query("splitEvents")
      .withIndex("by_host", (q) => q.eq("hostId", args.userId))
      .order("desc")
      .collect();

    // Also get events user is participating in
    const participations = await ctx.db
      .query("participants")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const participatingEventIds = new Set(participations.map((p) => p.eventId));
    const participatingEvents = await Promise.all(
      [...participatingEventIds]
        .filter((id) => !hosted.some((h) => h._id === id))
        .map((id) => ctx.db.get(id))
    );

    return [...hosted, ...participatingEvents.filter(Boolean)].sort(
      (a, b) => new Date(b!.date).getTime() - new Date(a!.date).getTime()
    );
  },
});

// ---- Update event totals ----
export const updateEventTotals = mutation({
  args: {
    eventId: v.id("splitEvents"),
    totalBill: v.number(),
    subtotal: v.number(),
    taxAmount: v.number(),
    tipAmount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { eventId, ...totals } = args;
    await ctx.db.patch(eventId, totals);
  },
});

// ---- Update event status ----
export const updateEventStatus = mutation({
  args: {
    eventId: v.id("splitEvents"),
    status: v.union(
      v.literal("open"),
      v.literal("claiming"),
      v.literal("confirmed"),
      v.literal("paid"),
      v.literal("settled")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.eventId, { status: args.status });
  },
});

// ---- Join event as participant ----
export const joinEvent = mutation({
  args: {
    eventId: v.id("splitEvents"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if already joined
    const existing = await ctx.db
      .query("participants")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", args.userId)
      )
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("participants", {
      eventId: args.eventId,
      userId: args.userId,
      paymentStatus: "pending",
      joinedAt: new Date().toISOString(),
    });
  },
});

// ---- Get participants for an event ----
export const getEventParticipants = query({
  args: { eventId: v.id("splitEvents") },
  handler: async (ctx, args) => {
    const participants = await ctx.db
      .query("participants")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    // Enrich with user data and calculate individual shares
    const event = await ctx.db.get(args.eventId);
    if (!event) return [];

    // Get all items and claims for this event once to avoid N+1 inside map
    const items = await ctx.db
      .query("receiptItems")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    const allClaims = await ctx.db
      .query("itemClaims")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    // Map of itemId -> list of userIds who claimed it
    const itemClaimsMap = new Map<string, string[]>();
    allClaims.forEach((c) => {
      const existing = itemClaimsMap.get(c.itemId) || [];
      itemClaimsMap.set(c.itemId, [...existing, c.userId]);
    });

    const enriched = await Promise.all(
      participants.map(async (p) => {
        const user = await ctx.db.get(p.userId);
        
        // Calculate subtotal for this participant
        let subtotal = 0;
        items.forEach((item) => {
          const claimers = itemClaimsMap.get(item._id) || [];
          if (claimers.includes(p.userId)) {
            // Split item price by number of people who claimed it
            subtotal += (item.price * item.quantity) / claimers.length;
          }
        });

        // Calculate proportional tax
        const eventSubtotal = event.subtotal || 1; // Avoid divide by zero
        const taxShare = (subtotal / eventSubtotal) * (event.taxAmount || 0);
        
        // Calculate tip based on percentage or amount
        const tipPercentage = p.tipPercentage ?? event.tipAmount ?? 0;
        const tipAmount = p.tipAmount ?? (subtotal + taxShare) * (tipPercentage / 100);
        
        const totalOwed = subtotal + taxShare + tipAmount;

        return { 
          ...p, 
          user, 
          calculatedSubtotal: subtotal,
          calculatedTax: taxShare,
          calculatedTip: tipAmount,
          calculatedTotal: totalOwed
        };
      })
    );

    return enriched;
  },
});

// ---- Update participant tip ----
export const updateParticipantTip = mutation({
  args: {
    eventId: v.id("splitEvents"),
    userId: v.id("users"),
    tipPercentage: v.optional(v.number()),
    tipAmount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const participant = await ctx.db
      .query("participants")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", args.userId)
      )
      .first();

    if (!participant) return null;

    await ctx.db.patch(participant._id, {
      tipPercentage: args.tipPercentage,
      tipAmount: args.tipAmount,
    });
  },
});

// ---- Update participant ready status ----
export const updateParticipantReady = mutation({
  args: {
    eventId: v.id("splitEvents"),
    userId: v.id("users"),
    isReady: v.boolean(),
  },
  handler: async (ctx, args) => {
    const participant = await ctx.db
      .query("participants")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", args.userId)
      )
      .first();

    if (!participant) return null;

    await ctx.db.patch(participant._id, {
      isReadyToPay: args.isReady,
    });
  },
});

// ---- Update participant payment status ----
export const updateParticipantStatus = mutation({
  args: {
    eventId: v.id("splitEvents"),
    userId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("authorized"),
      v.literal("charged"),
      v.literal("failed")
    ),
  },
  handler: async (ctx, args) => {
    const participant = await ctx.db
      .query("participants")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", args.userId)
      )
      .first();

    if (!participant) return null;

    await ctx.db.patch(participant._id, {
      paymentStatus: args.status,
    });
  },
});
