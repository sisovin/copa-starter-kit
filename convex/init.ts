import { mutation } from "./_generated/server";

export const seedStats = mutation({
  handler: async (ctx) => {
    // Check if we already have stats
    const existingStats = await ctx.db.query("stats").collect();
    if (existingStats.length > 0) {
      // Stats already seeded
      return { status: "already seeded", count: existingStats.length };
    }

    // Seed initial stats
    const now = Date.now();

    await ctx.db.insert("stats", {
      title: "Total Revenue",
      value: "$45,231.89",
      description: "+20.1% from last month",
      icon: "DollarSign",
      trend: "up",
      updatedAt: now,
    });

    await ctx.db.insert("stats", {
      title: "Active Users",
      value: "2,350",
      description: "+180 new users",
      icon: "Users",
      trend: "up",
      updatedAt: now,
    });

    await ctx.db.insert("stats", {
      title: "Sales",
      value: "$12,234",
      description: "-8% from last month",
      icon: "LineChart",
      trend: "down",
      updatedAt: now,
    });

    await ctx.db.insert("stats", {
      title: "Active Sessions",
      value: "573",
      description: "+201 since yesterday",
      icon: "BarChart3",
      trend: "up",
      updatedAt: now,
    });

    return { status: "seeded", count: 4 };
  },
});
