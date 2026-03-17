import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ---- Users ----
  users: defineTable({
    clerkId: v.optional(v.string()), // Stable ID from Clerk
    stripeCustomerId: v.optional(v.string()), // ID from Stripe
    name: v.string(),
    handle: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    memberSince: v.string(),
    defaultTipPercent: v.optional(v.number()),
    splitMethod: v.optional(v.union(v.literal("even"), v.literal("itemized"))),
    notificationsEnabled: v.optional(v.boolean()),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_stripe_customer_id", ["stripeCustomerId"])
    .index("by_phone", ["phone"])
    .index("by_email", ["email"]),

  // ---- Payment Methods ----
  paymentMethods: defineTable({
    userId: v.id("users"),
    type: v.string(), // "visa", "mastercard", "apple_pay", etc.
    last4: v.string(),
    isDefault: v.boolean(),
    stripePaymentMethodId: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  // ---- Friendships ----
  friendships: defineTable({
    userId: v.id("users"),
    friendId: v.id("users"),
    status: v.union(
      v.literal("active"),
      v.literal("pending"),
      v.literal("blocked")
    ),
  })
    .index("by_user", ["userId"])
    .index("by_friend", ["friendId"])
    .index("by_pair", ["userId", "friendId"]),

  // ---- Split Events ----
  splitEvents: defineTable({
    name: v.string(),
    emoji: v.optional(v.string()),
    hostId: v.id("users"),
    venue: v.optional(v.string()),
    date: v.string(),
    totalBill: v.optional(v.number()),
    subtotal: v.optional(v.number()),
    taxAmount: v.optional(v.number()),
    tipAmount: v.optional(v.number()),
    splitMethod: v.union(v.literal("even"), v.literal("itemized")),
    status: v.union(
      v.literal("open"),
      v.literal("claiming"),
      v.literal("confirmed"),
      v.literal("paid"),
      v.literal("settled")
    ),
    inviteCode: v.optional(v.string()),
    isSecured: v.optional(v.boolean()),
  })
    .index("by_host", ["hostId"])
    .index("by_status", ["status"])
    .index("by_invite_code", ["inviteCode"]),

  // ---- Participants (join table for events) ----
  participants: defineTable({
    eventId: v.id("splitEvents"),
    userId: v.id("users"),
    shareAmount: v.optional(v.number()),
    tipPercentage: v.optional(v.number()),
    tipAmount: v.optional(v.number()),
    totalOwed: v.optional(v.number()),
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("authorized"),
      v.literal("charged"),
      v.literal("failed")
    ),
    isReadyToPay: v.optional(v.boolean()),
    stripeAuthIntentId: v.optional(v.string()),
    joinedAt: v.string(),
  })
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"])
    .index("by_event_user", ["eventId", "userId"]),

  // ---- Receipt Items ----
  receiptItems: defineTable({
    eventId: v.id("splitEvents"),
    name: v.string(),
    price: v.number(),
    quantity: v.number(),
  }).index("by_event", ["eventId"]),

  // ---- Item Claims (who claimed which item) ----
  itemClaims: defineTable({
    itemId: v.id("receiptItems"),
    userId: v.id("users"),
    eventId: v.id("splitEvents"),
  })
    .index("by_item", ["itemId"])
    .index("by_user_event", ["userId", "eventId"])
    .index("by_event", ["eventId"]),
});
