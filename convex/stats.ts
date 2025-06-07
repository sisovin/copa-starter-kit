import { query } from "./_generated/server";
import { v } from "convex/values";

export const getStats = query({
  handler: async (ctx) => {
    const stats = await ctx.db.query("stats").collect();

    // Sort by updatedAt to get the most recent stats first
    return stats.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const getUserStats = query({
  args: { clerkId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.clerkId) return null;

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    if (!user) return null;

    // Get today's activities for this user
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayActivities = await ctx.db
      .query("activities")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), user._id),
          q.gte(q.field("timestamp"), today.getTime())
        )
      )
      .collect();

    // Get recent activities for this user
    const recentActivities = await ctx.db
      .query("activities")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .order("desc")
      .take(5);

    return {
      user,
      stats: {
        todayActivities: todayActivities.length,
        recentActivities,
      },
    };
  },
});
