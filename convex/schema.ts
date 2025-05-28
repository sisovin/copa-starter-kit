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
    imageUrl: v.optional(v.string()),
    username: v.optional(v.string()),
    lastActive: v.number(),
    totalSessions: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
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

  blogPosts: defineTable({
    title: v.string(),
    content: v.string(),
    excerpt: v.optional(v.string()),
    slug: v.string(),
    authorId: v.id("users"),
    featuredImageId: v.optional(v.id("fileUploads")),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    ),
    tags: v.optional(v.array(v.string())),
    categories: v.optional(v.array(v.string())),
    seoDescription: v.optional(v.string()),
    allowComments: v.optional(v.boolean()),
    featured: v.optional(v.boolean()),
    viewCount: v.number(),
    likeCount: v.optional(v.number()),
    commentCount: v.optional(v.number()),
    publishedAt: v.optional(v.number()),
    createdAt: v.optional(v.number()),
    updatedAt: v.number(),
  }),

  blogPostRevisions: defineTable({
    postId: v.id("blogPosts"),
    title: v.string(),
    content: v.string(),
    authorId: v.id("users"),
    createdAt: v.number(),
    changeDescription: v.string(),
  }),

  fileUploads: defineTable({
    filename: v.string(),
    mimeType: v.string(),
    size: v.number(),
    storageId: v.string(),
    url: v.string(),
    uploadedBy: v.optional(v.id("users")),
    folder: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    alt: v.optional(v.string()),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    duration: v.optional(v.number()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }),

  apiUsage: defineTable({
    endpoint: v.string(),
    method: v.string(),
    userId: v.optional(v.id("users")),
    statusCode: v.number(),
    latencyMs: v.number(),
    timestamp: v.number(),
    requestSize: v.optional(v.number()),
    responseSize: v.optional(v.number()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
  }),
});
