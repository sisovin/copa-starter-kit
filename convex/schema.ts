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
});
