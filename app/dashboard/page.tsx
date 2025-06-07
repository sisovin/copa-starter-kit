import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { RefreshButton } from "@/components/dashboard/refresh-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ConvexStats } from "./convex-stats";
import { InitConvex } from "./init-convex";

export default async function DashboardPage() {
  // Wrap in try/catch to handle and log any errors from currentUser()
  try {
    const user = await currentUser();

    if (!user) {
      redirect("/sign-in");
    }

    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {user.firstName || "User"}!
            </p>
          </div>
          <RefreshButton className="self-start" />
        </div>{" "}
        {/* Real-time dashboard stats from Convex */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <ConvexStats />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome, {user.firstName || "User"}!</CardTitle>
              <CardDescription>Your account overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    User ID
                  </div>
                  <div className="text-sm">{user.id}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Email
                  </div>
                  <div className="text-sm">
                    {user.emailAddresses[0]?.emailAddress ||
                      "No email provided"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Account Created
                  </div>
                  <div className="text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>{" "}
          <DashboardCard
            title="Convex Database"
            description="Initialize sample data for the dashboard"
          >
            <InitConvex />
          </DashboardCard>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Dashboard error:", error);

    // Provide a fallback UI when there's an error
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md max-w-xl">
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="mb-4">
            We encountered an error while trying to load your dashboard. This
            might be due to a temporary issue with the authentication service.
          </p>
          <div className="flex gap-2">
            {" "}
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-red-100 dark:bg-red-800/30 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-800/50"
            >
              Retry
            </Link>
            <Link
              href="/sign-in"
              className="px-4 py-2 bg-primary/80 text-primary-foreground rounded-md hover:bg-primary"
            >
              Sign in again
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
