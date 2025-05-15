"use client";

import { StatCardSkeleton } from "@/components/dashboard/refresh-button";
import { StatCard } from "@/components/dashboard/stat-card";
import { useQuery } from "convex/react";
import { BarChart3, DollarSign, LineChart, Users } from "lucide-react";
import { useEffect, useState } from "react";

// Import the API
import { api } from "@/convex/_generated/api";

// Define the StatData type to match the Convex schema
interface StatData {
  _id: { toString: () => string };
  title: string;
  value: string;
  description: string;
  icon: string;
  trend: string;
  updatedAt: number;
}

export function ConvexStats() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Always call the hook unconditionally
  const stats = useQuery(api.stats.getStats) as StatData[] | undefined;

  // Handle potential errors
  useEffect(() => {
    try {
      if (!api || !api.stats) {
        setError("Convex API not found. Make sure to run 'npx convex dev'");
      }
    } catch (e) {
      setError(`Error initializing Convex: ${e instanceof Error ? e.message : String(e)}`);
    }
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Icons mapping
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "DollarSign":
        return <DollarSign className="h-4 w-4 text-emerald-500" />;
      case "Users":
        return <Users className="h-4 w-4 text-blue-500" />;
      case "LineChart":
        return <LineChart className="h-4 w-4 text-red-500" />;
      case "BarChart3":
        return <BarChart3 className="h-4 w-4 text-purple-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-500" />;
    }
  };
  if (error) {
    return (
      <div className="col-span-4 p-6 text-center border rounded-lg bg-muted/10">
        <p className="text-red-500 mb-2">{error}</p>
        <p className="text-sm text-muted-foreground">
          Check your terminal and make sure Convex is running.
        </p>
      </div>
    );
  }
  if (!stats || !Array.isArray(stats) || isLoading) {
    return (
      <>
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </>
    );
  }

  // If we have data, but it's empty, show a message
  if (stats.length === 0) {
    return (
      <div className="col-span-4 p-6 text-center border rounded-lg bg-muted/10">
        <p className="mb-2">No stats available yet</p>
        <p className="text-sm text-muted-foreground">
          Initialize the demo data to see statistics here.
        </p>
      </div>
    );
  }
  return (
    <>
      {stats.map((stat) => (
        <StatCard
          key={stat._id.toString()}
          title={stat.title}
          value={stat.value}
          description={stat.description}
          icon={getIcon(stat.icon)}
          trend={stat.trend as "up" | "down" | "neutral"}
        />
      ))}
    </>
  );
}
