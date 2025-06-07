import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Define types for user fields
interface UserFields {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  username?: string;
  createdAt: number;
  updatedAt: number;
  lastActive: number;
  totalSessions: number;
}

interface UpdateFields {
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  username?: string;
  updatedAt: number;
  lastActive: number;
  totalSessions?: number;
}

export const updateStat = mutation({
  args: {
    id: v.optional(v.id("stats")),
    title: v.string(),
    value: v.string(),
    description: v.string(),
    icon: v.string(),
    trend: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, ...statData } = args;

    if (id) {
      // Update existing stat
      await ctx.db.patch(id, {
        ...statData,
        updatedAt: Date.now(),
      });
      return id;
    } else {
      // Create new stat
      return await ctx.db.insert("stats", {
        ...statData,
        updatedAt: Date.now(),
      });
    }
  },
});

/**
 * Create or update user from Clerk data
 * This is the correct implementation to use with api.actions.createOrUpdateUser
 */
export const createOrUpdateUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    username: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    const now = Date.now();
    if (existingUser) {
      // Update existing user with only the fields that are in the schema
      const updateFields: UpdateFields = {
        email: args.email,
        updatedAt: now,
        lastActive: now,
      };

      // Conditionally add optional fields if they exist in the schema
      if (args.firstName !== undefined) updateFields.firstName = args.firstName;
      if (args.lastName !== undefined) updateFields.lastName = args.lastName;
      if ("imageUrl" in existingUser && args.imageUrl !== undefined) {
        updateFields.imageUrl = args.imageUrl;
      }
      if ("username" in existingUser && args.username !== undefined) {
        updateFields.username = args.username;
      }

      // Update the totalSessions if it exists
      if ("totalSessions" in existingUser) {
        updateFields.totalSessions = (existingUser.totalSessions || 0) + 1;
      }

      await ctx.db.patch(existingUser._id, updateFields);
      return existingUser._id;
    } else {
      // Create new user with basic required fields
      const userFields: UserFields = {
        clerkId: args.clerkId,
        email: args.email,
        createdAt: now,
        updatedAt: now,
        lastActive: now,
        totalSessions: 1,
      };

      // Add optional fields
      if (args.firstName !== undefined) userFields.firstName = args.firstName;
      if (args.lastName !== undefined) userFields.lastName = args.lastName;
      if (args.imageUrl !== undefined) userFields.imageUrl = args.imageUrl;
      if (args.username !== undefined) userFields.username = args.username;

      return await ctx.db.insert("users", userFields);
    }
  },
});

export const updateUserActivity = mutation({
  args: {
    clerkId: v.string(),
    action: v.string(),
    resourceType: v.string(),
    resourceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Find the user
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Update user's last active time
    await ctx.db.patch(user._id, {
      lastActive: Date.now(),
      totalSessions: user.totalSessions + 1,
    });

    // Record the activity
    return await ctx.db.insert("activities", {
      userId: user._id,
      action: args.action,
      resourceType: args.resourceType,
      resourceId: args.resourceId,
      timestamp: Date.now(),
    });
  },
});
