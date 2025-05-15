import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  stats: defineTable({
    title: v.string(),
    value: v.string(),
    description: v.string(),
    icon: v.string(), // Name of the icon
    trend: v.string(), // "up" or "down"
    updatedAt: v.number(),
  }),

  users: defineTable({
    clerkId: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.string(),
    lastActive: v.number(),
    totalSessions: v.number(),
  }),

  activities: defineTable({
    userId: v.string(),
    action: v.string(),
    resourceType: v.string(),
    resourceId: v.optional(v.string()),
    timestamp: v.number(),
  }),

  payments: defineTable({
    // Transaction information
    transactionId: v.string(),
    amount: v.number(),
    currency: v.string(),
    status: v.string(), // "pending", "completed", "failed", "refunded"
    paymentMethod: v.string(), // "payway", "bakong", etc.

    // Customer information
    customerId: v.optional(v.string()), // Link to users table clerkId
    customerEmail: v.string(),
    customerName: v.optional(v.string()),

    // Gateway-specific data
    gatewayTransactionId: v.optional(v.string()),
    gatewayResponse: v.optional(v.object({})),
    checkoutUrl: v.optional(v.string()),

    // Metadata and timestamps
    metadata: v.optional(v.object({})),
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
  }),
});
