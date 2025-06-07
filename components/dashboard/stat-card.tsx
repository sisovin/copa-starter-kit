import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <span className="text-sm font-medium">{title}</span>
        <div className="w-4 h-4">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          {trend && (
            <>
              {trend === "up" ? (
                <ArrowUp className="mr-1 h-3 w-3 text-emerald-500" />
              ) : trend === "down" ? (
                <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
              ) : null}
              <span
                className={cn(
                  trend === "up" && "text-emerald-500",
                  trend === "down" && "text-red-500"
                )}
              >
                {description}
              </span>
            </>
          )}
          {!trend && description}
        </div>
      </CardContent>
    </Card>
  );
}
