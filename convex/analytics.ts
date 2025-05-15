import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator, dateRangeValidator } from "./lib/validators";
import { validateAuthenticated, validateUserRole } from "./lib/utils";

/**
 * Track API usage for analytics
 */
export const trackApiUsage = mutation({
  args: {
    endpoint: v.string(),
    method: v.string(),
    statusCode: v.number(),
    latencyMs: v.number(),
    requestSize: v.optional(v.number()),
    responseSize: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the current user if authenticated
    let userId;
    try {
      const auth = await ctx.auth.getUserIdentity();
      if (auth) {
        const user = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("clerkId"), auth.subject))
          .first();

        if (user) {
          userId = user._id;

          // Update user's last active time
          await ctx.db.patch(user._id, {
            lastActive: Date.now(),
          });
        }
      }
    } catch (e) {
      // Ignore authentication errors for this endpoint
    }

    // Log the API usage
    await ctx.db.insert("apiUsage", {
      endpoint: args.endpoint,
      method: args.method,
      userId,
      statusCode: args.statusCode,
      latencyMs: args.latencyMs,
      timestamp: Date.now(),
      requestSize: args.requestSize,
      responseSize: args.responseSize,
      ipAddress: ctx.request?.headers?.[1]?.find(
        ([k]) => k.toLowerCase() === "x-forwarded-for"
      )?.[1],
      userAgent: ctx.request?.headers?.[1]?.find(
        ([k]) => k.toLowerCase() === "user-agent"
      )?.[1],
      errorMessage: args.errorMessage,
    });

    return { success: true };
  },
});

/**
 * Get API usage statistics (admin only)
 */
export const getApiUsageStats = query({
  args: {
    dateRange: dateRangeValidator,
    endpoint: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify admin access
    await validateUserRole(ctx, ["admin"]);

    // Set default date range if not provided
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const start = args.dateRange?.start ?? oneDayAgo;
    const end = args.dateRange?.end ?? now;

    // Query API usage within the date range
    let usageQuery = ctx.db
      .query("apiUsage")
      .filter((q) =>
        q.and(
          q.gte(q.field("timestamp"), start),
          q.lte(q.field("timestamp"), end)
        )
      );

    // Filter by endpoint if specified
    if (args.endpoint) {
      usageQuery = usageQuery.filter((q) =>
        q.eq(q.field("endpoint"), args.endpoint)
      );
    }

    const usageData = await usageQuery.collect();

    // Calculate statistics
    const totalRequests = usageData.length;
    const successRequests = usageData.filter(
      (r) => r.statusCode >= 200 && r.statusCode < 300
    ).length;
    const errorRequests = usageData.filter((r) => r.statusCode >= 400).length;

    // Group by endpoint
    const endpointCounts: Record<string, number> = {};
    const endpointLatencies: Record<string, number[]> = {};

    for (const record of usageData) {
      endpointCounts[record.endpoint] =
        (endpointCounts[record.endpoint] || 0) + 1;

      if (!endpointLatencies[record.endpoint]) {
        endpointLatencies[record.endpoint] = [];
      }
      endpointLatencies[record.endpoint].push(record.latencyMs);
    }

    // Calculate average latencies
    const endpointStats = Object.keys(endpointCounts).map((endpoint) => {
      const latencies = endpointLatencies[endpoint];
      const avgLatency =
        latencies.reduce((sum, val) => sum + val, 0) / latencies.length;
      const minLatency = Math.min(...latencies);
      const maxLatency = Math.max(...latencies);

      return {
        endpoint,
        requestCount: endpointCounts[endpoint],
        avgLatencyMs: avgLatency,
        minLatencyMs: minLatency,
        maxLatencyMs: maxLatency,
      };
    });

    return {
      timeRange: { start, end },
      totalRequests,
      successRequests,
      errorRequests,
      successRate:
        totalRequests > 0 ? (successRequests / totalRequests) * 100 : 0,
      endpoints: endpointStats,
      averageLatencyMs:
        usageData.reduce((sum, record) => sum + record.latencyMs, 0) /
        (totalRequests || 1),
    };
  },
});

/**
 * Get user activity analytics (admin only)
 */
export const getUserActivityStats = query({
  args: {
    dateRange: dateRangeValidator,
  },
  handler: async (ctx, args) => {
    // Verify admin access
    await validateUserRole(ctx, ["admin"]);

    // Set default date range if not provided
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const start = args.dateRange?.start ?? thirtyDaysAgo;
    const end = args.dateRange?.end ?? now;

    // Get active users in the date range
    const activeUsers = await ctx.db
      .query("users")
      .filter((q) =>
        q.and(
          q.gte(q.field("lastActive"), start),
          q.lte(q.field("lastActive"), end)
        )
      )
      .collect();

    // Get all activities in the date range
    const activities = await ctx.db
      .query("activities")
      .filter((q) =>
        q.and(
          q.gte(q.field("timestamp"), start),
          q.lte(q.field("timestamp"), end)
        )
      )
      .collect();

    // Group by action type
    const actionCounts: Record<string, number> = {};
    for (const activity of activities) {
      actionCounts[activity.action] = (actionCounts[activity.action] || 0) + 1;
    }

    // Group by resource type
    const resourceCounts: Record<string, number> = {};
    for (const activity of activities) {
      resourceCounts[activity.resourceType] =
        (resourceCounts[activity.resourceType] || 0) + 1;
    }

    // Create daily activity counts
    const dailyActivity: Record<string, number> = {};
    const msPerDay = 24 * 60 * 60 * 1000;

    // Initialize days
    let currentDay = start;
    while (currentDay <= end) {
      const dateStr = new Date(currentDay).toISOString().split("T")[0];
      dailyActivity[dateStr] = 0;
      currentDay += msPerDay;
    }

    // Count activities per day
    for (const activity of activities) {
      const dateStr = new Date(activity.timestamp).toISOString().split("T")[0];
      dailyActivity[dateStr] = (dailyActivity[dateStr] || 0) + 1;
    }

    // Top 5 most active users
    const userActivityCounts: Record<string, number> = {};
    for (const activity of activities) {
      const userId = activity.userId.toString();
      userActivityCounts[userId] = (userActivityCounts[userId] || 0) + 1;
    }

    const topUsers = await Promise.all(
      Object.entries(userActivityCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(async ([userId, count]) => {
          const user = await ctx.db.get(userId as any);
          return {
            userId,
            name: user
              ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
              : "Unknown",
            email: user?.email || "Unknown",
            activityCount: count,
          };
        })
    );

    return {
      timeRange: { start, end },
      totalActiveUsers: activeUsers.length,
      totalActivities: activities.length,
      actionBreakdown: actionCounts,
      resourceBreakdown: resourceCounts,
      dailyActivity,
      topActiveUsers: topUsers,
    };
  },
});

/**
 * Get dashboard stats for user (for personal dashboard)
 */
export const getDashboardStats = query({
  handler: async (ctx) => {
    // Get authenticated user
    let userId;
    try {
      const { userId: id } = await validateAuthenticated(ctx);
      userId = id;
    } catch (e) {
      return null; // Return null if not authenticated
    }

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    // Get user
    const user = await ctx.db.get(userId);

    // Get recent activities
    const recentActivities = await ctx.db
      .query("activities")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc", (q) => q.field("timestamp"))
      .take(5);

    // Get today's activity count
    const todayActivities = await ctx.db
      .query("activities")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), userId),
          q.gte(q.field("timestamp"), oneDayAgo)
        )
      )
      .collect();

    // Get weekly activity count
    const weeklyActivities = await ctx.db
      .query("activities")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), userId),
          q.gte(q.field("timestamp"), oneWeekAgo)
        )
      )
      .collect();

    // Get user's blog post count
    const blogPosts = await ctx.db
      .query("blogPosts")
      .filter((q) => q.eq(q.field("authorId"), userId))
      .collect();

    const draftPostsCount = blogPosts.filter(
      (post) => post.status === "draft"
    ).length;
    const publishedPostsCount = blogPosts.filter(
      (post) => post.status === "published"
    ).length;

    // Get user's file upload count
    const fileUploads = await ctx.db
      .query("fileUploads")
      .filter((q) => q.eq(q.field("uploadedBy"), userId))
      .collect();

    return {
      user: {
        name: `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
        email: user?.email,
        lastActive: user?.lastActive,
        totalSessions: user?.totalSessions,
      },
      activityStats: {
        todayCount: todayActivities.length,
        weeklyCount: weeklyActivities.length,
        recentActivities,
      },
      contentStats: {
        totalBlogPosts: blogPosts.length,
        draftPosts: draftPostsCount,
        publishedPosts: publishedPostsCount,
        totalFiles: fileUploads.length,
        totalFileSize: fileUploads.reduce((sum, file) => sum + file.size, 0),
      },
    };
  },
});
