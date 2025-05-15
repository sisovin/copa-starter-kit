"use client";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { StatCardSkeleton } from "@/components/dashboard/refresh-button";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Skeleton className="h-9 w-[180px] mb-1" />
        <Skeleton className="h-6 w-[240px]" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCard
          title="Loading..."
          description="Please wait"
          isLoading={true}
        >
          <div></div>
        </DashboardCard>

        <DashboardCard
          title="Loading..."
          description="Please wait"
          isLoading={true}
        >
          <div></div>
        </DashboardCard>
      </div>
    </div>
  );
}
