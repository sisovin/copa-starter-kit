import { mutation } from "./_generated/server";
import { v } from "convex/values";

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
