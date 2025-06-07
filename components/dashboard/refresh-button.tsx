"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

interface RefreshButtonProps {
  onRefresh?: () => void | Promise<void>;
  className?: string;
}

export function RefreshButton({ onRefresh, className }: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshStatus, setRefreshStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    setRefreshStatus("idle");

    try {
      if (onRefresh) {
        await onRefresh();
      }
      setRefreshStatus("success");

      // Reset success status after 2 seconds
      setTimeout(() => {
        setRefreshStatus("idle");
      }, 2000);
    } catch (error) {
      console.error("Refresh error:", error);
      setRefreshStatus("error");

      // Reset error status after 3 seconds
      setTimeout(() => {
        setRefreshStatus("idle");
      }, 3000);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      onClick={handleRefresh}
      disabled={isRefreshing}
    >
      {isRefreshing ? (
        <>
          <ArrowPathIcon className="mr-1 h-4 w-4 animate-spin" />
          Refreshing...
        </>
      ) : refreshStatus === "success" ? (
        <>
          <CheckCircleIcon className="mr-1 h-4 w-4 text-green-500" />
          Updated
        </>
      ) : refreshStatus === "error" ? (
        <>
          <ExclamationCircleIcon className="mr-1 h-4 w-4 text-red-500" />
          Failed
        </>
      ) : (
        <>
          <ArrowPathIcon className="mr-1 h-4 w-4" />
          Refresh
        </>
      )}
    </Button>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6 flex flex-col space-y-2">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-9 w-1/2 mt-1" />
        <div className="flex items-center justify-between mt-4">
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
      </div>
    </div>
  );
}
