import { v } from "convex/values";

/**
 * This file contains common validators used across the Convex API
 */

// Validator for pagination options
export const paginationOptsValidator = v.object({
  limit: v.optional(v.number()),
  cursor: v.optional(v.string()),
});

// Validator for sorting options
export const sortOptsValidator = v.object({
  field: v.string(),
  direction: v.union(v.literal("asc"), v.literal("desc")),
});

// Validator for date range filters
export const dateRangeValidator = v.object({
  start: v.optional(v.number()),
  end: v.optional(v.number()),
});

// Validator for text search queries
export const textSearchValidator = v.object({
  query: v.string(),
  fields: v.array(v.string()),
});

// Validator for file metadata
export const fileMetadataValidator = v.object({
  title: v.optional(v.string()),
  description: v.optional(v.string()),
  alt: v.optional(v.string()),
  width: v.optional(v.number()),
  height: v.optional(v.number()),
  duration: v.optional(v.number()),
  tags: v.optional(v.array(v.string())),
});
