"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface ErrorBoundaryProps {
  error: Error;
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorBoundaryProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] px-4">
      <Alert variant="destructive" className="max-w-xl">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>
          <p className="mb-4">
            We encountered an error while loading your dashboard data.
          </p>
          <div className="text-xs mb-4 bg-destructive/10 p-2 rounded-sm">
            <code className="font-mono">{error.message}</code>
          </div>
          <Button size="sm" onClick={reset} className="flex items-center gap-2">
            <ArrowPathIcon className="h-4 w-4" />
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
