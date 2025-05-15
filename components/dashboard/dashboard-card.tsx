"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  description?: string;
  className?: string;
  children: ReactNode;
  footer?: ReactNode;
  isLoading?: boolean;
}

export function DashboardCard({
  title,
  description,
  className,
  children,
  footer,
  isLoading = false,
}: DashboardCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-muted/50 p-4">
        {isLoading ? (
          <>
            <Skeleton className="h-6 w-1/2 mb-1" />
            {description && <Skeleton className="h-4 w-2/3" />}
          </>
        ) : (
          <>
            <h3 className="text-base font-semibold">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </>
        )}
      </CardHeader>

      <CardContent className={cn("p-4", isLoading ? "pt-4" : "pt-0")}>
        {isLoading ? (
          <div className="space-y-2 pt-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-5/6" />
            <Skeleton className="h-8 w-4/6" />
          </div>
        ) : (
          children
        )}
      </CardContent>

      {footer && <CardFooter className="border-t p-4">{footer}</CardFooter>}
    </Card>
  );
}
