import { Id } from "../_generated/dataModel";
import { ConvexError } from "convex/values";

/**
 * This file contains utility functions for the Convex API
 */

/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/**
 * Helper function to get a paginated response
 */
export async function getPaginatedResults<T>(
  queryFn: (
    cursor: any,
    limit: number
  ) => Promise<{ page: T[]; continueCursor: any }>,
  cursor: string | undefined,
  limit: number = 10
) {
  // Parse the cursor if it exists
  const cursorObj = cursor ? { numericValue: parseFloat(cursor) } : undefined;

  // Get the paginated results
  const results = await queryFn(cursorObj, limit);

  return {
    items: results.page,
    continueCursor: results.continueCursor?.toString(),
    hasNextPage: !!results.continueCursor,
  };
}

/**
 * Helper function to validate that a user is authenticated
 */
export async function validateAuthenticated(
  ctx: any
): Promise<{ userId: Id<"users">; clerkId: string }> {
  const auth = await ctx.auth.getUserIdentity();
  if (!auth) {
    throw new ConvexError({ code: 401, message: "Unauthorized" });
  }

  const user = await ctx.db
    .query("users")
    .filter((q) => q.eq(q.field("clerkId"), auth.subject))
    .first();

  if (!user) {
    throw new ConvexError({ code: 404, message: "User not found" });
  }

  return { userId: user._id, clerkId: auth.subject };
}

/**
 * Helper function to validate that a user has a specific role
 */
export async function validateUserRole(
  ctx: any,
  allowedRoles: ("admin" | "editor" | "author" | "reader")[]
): Promise<{ userId: Id<"users">; role: string | undefined }> {
  const { userId } = await validateAuthenticated(ctx);

  const user = await ctx.db.get(userId);

  if (!user.role || !allowedRoles.includes(user.role as any)) {
    throw new ConvexError({
      code: 403,
      message: `Forbidden: requires one of these roles: ${allowedRoles.join(", ")}`,
    });
  }

  return { userId, role: user.role };
}

/**
 * Helper function to track user activity
 */
export async function trackActivity(
  ctx: any,
  userId: Id<"users">,
  action: string,
  resourceType: string,
  resourceId?: string,
  metadata?: Record<string, any>
) {
  await ctx.db.insert("activities", {
    userId,
    action,
    resourceType,
    resourceId,
    metadata,
    timestamp: Date.now(),
    ipAddress: ctx.request?.headers?.[1]?.find(
      ([k]) => k.toLowerCase() === "x-forwarded-for"
    )?.[1],
    userAgent: ctx.request?.headers?.[1]?.find(
      ([k]) => k.toLowerCase() === "user-agent"
    )?.[1],
  });
}

/**
 * Helper function to record audit logs for sensitive operations
 */
export async function recordAuditLog(
  ctx: any,
  userId: Id<"users"> | undefined,
  action: string,
  resourceType: string,
  resourceId?: string,
  previousState?: any,
  newState?: any
) {
  await ctx.db.insert("auditLogs", {
    userId,
    action,
    resourceType,
    resourceId,
    previousState,
    newState,
    timestamp: Date.now(),
    ipAddress: ctx.request?.headers?.[1]?.find(
      ([k]) => k.toLowerCase() === "x-forwarded-for"
    )?.[1],
  });
}
