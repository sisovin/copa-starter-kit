import { ConvexError, v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { z } from "zod";
import { paginationOptsValidator, sortOptsValidator } from "./lib/validators";
import { internalMutation } from "./_generated/server";

// =================== ZOD VALIDATORS ===================

// User schema validator
const userValidator = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email(),
  imageUrl: z.string().url().optional(),
  username: z.string().min(3).max(50).optional(),
});

// Rate limiting state (in-memory for demo purposes)
// Note: For production, use a persistent store like Redis
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// =================== HELPER FUNCTIONS ===================

/**
 * Rate limiting helper function
 * @param userId - The user's ID to track limits
 * @param limit - Max number of requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns boolean - Whether the request should be allowed
 */
const checkRateLimit = (
  userId: string,
  limit: number = 10,
  windowMs: number = 60000
) => {
  const now = Date.now();
  const userRateLimit = rateLimitMap.get(userId);

  if (!userRateLimit || now > userRateLimit.resetTime) {
    // First request or reset period
    rateLimitMap.set(userId, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (userRateLimit.count >= limit) {
    // Rate limit exceeded
    return false;
  }

  // Increment counter and allow
  userRateLimit.count += 1;
  return true;
};

/**
 * Authentication check helper
 */
const requireAuth = async (ctx: any) => {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError("Unauthorized: You must be logged in");
  }

  return identity;
};

// =================== QUERIES ===================

/**
 * Get a user by ID with type-safe return
 */
export const getUser = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);

    if (!user) {
      throw new ConvexError({
        code: "not-found",
        message: "User not found",
      });
    }

    return user;
  },
});

/**
 * Get a user by Clerk ID with type-safe return
 */
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    if (!user) {
      return null;
    }

    return user;
  },
});

/**
 * Get the current authenticated user
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await requireAuth(ctx);
    const clerkId = identity.subject;

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), clerkId))
      .first();

    return user;
  },
});

/**
 * List users with pagination, filtering and sorting
 */
export const listUsers = query({
  args: {
    pagination: paginationOptsValidator,
    sort: v.optional(sortOptsValidator),
    filter: v.optional(
      v.object({
        email: v.optional(v.string()),
        nameContains: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Default pagination values
    const limit = args.pagination.limit ?? 10;
    const cursor = args.pagination.cursor;

    let usersQuery = ctx.db.query("users");

    // Apply filters if provided
    if (args.filter) {
      if (args.filter.email) {
        usersQuery = usersQuery.filter((q) =>
          q.eq(q.field("email"), args.filter!.email!)
        );
      }

      if (args.filter.nameContains) {
        usersQuery = usersQuery.filter((q) =>
          q.or(
            q.contains(q.field("firstName") ?? "", args.filter!.nameContains!),
            q.contains(q.field("lastName") ?? "", args.filter!.nameContains!)
          )
        );
      }
    }

    // Apply sorting if provided
    if (args.sort) {
      const { field, direction } = args.sort;
      usersQuery =
        direction === "asc"
          ? usersQuery.order("asc", field as any)
          : usersQuery.order("desc", field as any);
    } else {
      // Default sorting by lastActive
      usersQuery = usersQuery.order("desc", "lastActive");
    }

    // Execute query with pagination
    const users = await usersQuery.paginate(cursor, limit);

    // Return type-safe result with pagination info
    return {
      users: users.page,
      pagination: {
        hasMore: users.isDone === false,
        cursor: users.continueCursor,
      },
    };
  },
});

// =================== MUTATIONS ===================

/**
 * Create a new user
 */
export const createUser = mutation({
  args: {
    clerkId: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    username: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Authentication check
    await requireAuth(ctx);

    // Validate input data with Zod
    try {
      userValidator.parse({
        firstName: args.firstName,
        lastName: args.lastName,
        email: args.email,
        imageUrl: args.imageUrl,
        username: args.username,
      });
    } catch (error) {
      throw new ConvexError({
        code: "invalid-argument",
        message: `Invalid user data: ${(error as Error).message}`,
      });
    }

    // Check if user with this clerkId already exists
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    if (existingUser) {
      throw new ConvexError({
        code: "conflict",
        message: "User with this ID already exists",
      });
    }

    // Create user
    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      imageUrl: args.imageUrl,
      username: args.username,
      createdAt: now,
      updatedAt: now,
      lastActive: now,
      totalSessions: 1,
    });

    // Record creation activity
    await ctx.db.insert("activities", {
      userId,
      action: "user_created",
      resourceType: "users",
      resourceId: userId,
      timestamp: now,
    });

    return { userId };
  },
});

/**
 * Update an existing user with rate limiting
 */
export const updateUser = mutation({
  args: {
    id: v.id("users"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    username: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Authentication check
    const identity = await requireAuth(ctx);
    const clerkId = identity.subject;

    // Rate limiting check
    if (!checkRateLimit(`${clerkId}-update`, 5, 60000)) {
      throw new ConvexError({
        code: "rate-limited",
        message: "Too many update requests. Please try again later.",
      });
    }

    // Get the user
    const user = await ctx.db.get(args.id);

    if (!user) {
      throw new ConvexError({
        code: "not-found",
        message: "User not found",
      });
    }

    // Authorization check - only allow users to update their own data
    // or admin users (which we could check with a role property)
    if (user.clerkId !== clerkId) {
      throw new ConvexError({
        code: "forbidden",
        message: "You can only update your own user data",
      });
    }

    // Validate input data with Zod
    // Only validate fields that are provided
    const dataToValidate: any = {};
    if (args.firstName !== undefined) dataToValidate.firstName = args.firstName;
    if (args.lastName !== undefined) dataToValidate.lastName = args.lastName;
    if (args.email !== undefined) dataToValidate.email = args.email;
    if (args.imageUrl !== undefined) dataToValidate.imageUrl = args.imageUrl;
    if (args.username !== undefined) dataToValidate.username = args.username;

    try {
      userValidator.partial().parse(dataToValidate);
    } catch (error) {
      throw new ConvexError({
        code: "invalid-argument",
        message: `Invalid user data: ${(error as Error).message}`,
      });
    }

    // Prepare update data
    const updateData: any = {
      ...dataToValidate,
      updatedAt: Date.now(),
    };

    // Update user
    await ctx.db.patch(args.id, updateData);

    // Record update activity
    await ctx.db.insert("activities", {
      userId: args.id,
      action: "user_updated",
      resourceType: "users",
      resourceId: args.id,
      timestamp: Date.now(),
    });

    // Return updated user
    return { success: true, userId: args.id };
  },
});

/**
 * Delete a user
 */
export const deleteUser = mutation({
  args: {
    id: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Authentication check
    const identity = await requireAuth(ctx);
    const clerkId = identity.subject;

    // Get the user
    const user = await ctx.db.get(args.id);

    if (!user) {
      throw new ConvexError({
        code: "not-found",
        message: "User not found",
      });
    }

    // Authorization check - only allow users to delete themselves
    // or admin users (which we could check with a role property)
    if (user.clerkId !== clerkId) {
      throw new ConvexError({
        code: "forbidden",
        message: "You can only delete your own account",
      });
    }

    // Delete user
    await ctx.db.delete(args.id);

    return { success: true };
  },
});

// =================== BATCH OPERATIONS ===================

/**
 * Batch update multiple users at once
 */
export const batchUpdateUsers = mutation({
  args: {
    updates: v.array(
      v.object({
        id: v.id("users"),
        data: v.object({
          firstName: v.optional(v.string()),
          lastName: v.optional(v.string()),
          email: v.optional(v.string()),
          imageUrl: v.optional(v.string()),
          username: v.optional(v.string()),
        }),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Authentication check
    const identity = await requireAuth(ctx);

    // Only allow admins to batch update
    // For this example, assuming an admin role check would be done here
    // if (!identity.hasRole("admin")) {...}

    const now = Date.now();
    const results: { id: Id<"users">; success: boolean; error?: string }[] = [];

    // Process each update
    for (const { id, data } of args.updates) {
      try {
        // Validate with Zod
        userValidator.partial().parse(data);

        // Check if user exists
        const user = await ctx.db.get(id);
        if (!user) {
          results.push({
            id,
            success: false,
            error: "User not found",
          });
          continue;
        }

        // Update user
        await ctx.db.patch(id, {
          ...data,
          updatedAt: now,
        });

        // Record activity
        await ctx.db.insert("activities", {
          userId: id,
          action: "user_updated_batch",
          resourceType: "users",
          resourceId: id,
          timestamp: now,
        });

        results.push({ id, success: true });
      } catch (error) {
        results.push({
          id,
          success: false,
          error: (error as Error).message,
        });
      }
    }

    return { results };
  },
});

/**
 * Batch delete multiple users
 */
export const batchDeleteUsers = mutation({
  args: {
    ids: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Authentication check
    const identity = await requireAuth(ctx);

    // Only allow admins to batch delete
    // For this example, assuming an admin role check would be done here
    // if (!identity.hasRole("admin")) {...}

    const results: { id: Id<"users">; success: boolean; error?: string }[] = [];

    // Process each deletion
    for (const id of args.ids) {
      try {
        // Check if user exists
        const user = await ctx.db.get(id);
        if (!user) {
          results.push({
            id,
            success: false,
            error: "User not found",
          });
          continue;
        }

        // Delete user
        await ctx.db.delete(id);
        results.push({ id, success: true });
      } catch (error) {
        results.push({
          id,
          success: false,
          error: (error as Error).message,
        });
      }
    }

    return { results };
  },
});

// =================== SERVER ACTIONS ===================

/**
 * Import users in bulk (server action)
 * Server actions are useful for long-running operations that might
 * exceed the timeout limit of regular mutations
 */
export const bulkImportUsers = action({
  args: {
    users: v.array(
      v.object({
        clerkId: v.string(),
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        email: v.string(),
        imageUrl: v.optional(v.string()),
        username: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Authentication would happen here

    // This action calls an internal mutation, which doesn't have
    // the same timeout constraints as regular mutations
    return await ctx.runMutation(async () => {
      const now = Date.now();
      const results: { email: string; success: boolean; error?: string }[] = [];

      for (const userData of args.users) {
        try {
          // Validate data
          userValidator.partial().parse(userData);

          // Check for existing user
          const existingUser = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("clerkId"), userData.clerkId))
            .first();

          if (existingUser) {
            results.push({
              email: userData.email,
              success: false,
              error: "User with this ID already exists",
            });
            continue;
          }

          // Create user
          const userId = await ctx.db.insert("users", {
            ...userData,
            createdAt: now,
            updatedAt: now,
            lastActive: now,
            totalSessions: 1,
          });

          results.push({
            email: userData.email,
            success: true,
          });
        } catch (error) {
          results.push({
            email: userData.email,
            success: false,
            error: (error as Error).message,
          });
        }
      }

      return { results };
    });
  },
});

// Internal mutation for administrative operations
// These are not exposed to the client directly
export const _adminResetUserSessions = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      totalSessions: 0,
      lastActive: Date.now(),
    });
    return true;
  },
});
