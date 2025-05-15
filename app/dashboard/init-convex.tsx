"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircledIcon, ReloadIcon } from "@radix-ui/react-icons";
import { useMutation } from "convex/react";
import { RefreshCcw } from "lucide-react";
import { useState } from "react";

// Import the API
import { api } from "@/convex/_generated/api";

export function InitConvex() {
  // Type the mutation with its expected return value
  const seedStats = useMutation(api?.init.seedStats);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initResult, setInitResult] = useState<{
    status?: string;
    error?: string;
  } | null>(null);
  const handleInit = async () => {
    setIsInitializing(true);
    try {
      if (!seedStats || !api) {
        throw new Error(
          "Convex is not properly initialized. Make sure to run 'npx convex dev'"
        );
      }

      const result = await seedStats();
      setInitResult(result);
    } catch (error) {
      setInitResult({
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="space-y-4">
      {initResult && (
        <Alert
          variant={initResult.error ? "destructive" : "default"}
          className="mb-4"
        >
          <CheckCircledIcon className="h-4 w-4" />
          <AlertTitle>Convex Initialization</AlertTitle>
          <AlertDescription>
            {initResult.status === "seeded" &&
              "Successfully initialized sample data!"}
            {initResult.status === "already seeded" &&
              "Data is already initialized."}
            {initResult.error && `Error: ${initResult.error}`}
          </AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleInit}
        disabled={isInitializing}
        className="flex items-center gap-2"
      >
        {isInitializing ? (
          <>
            <ReloadIcon className="h-4 w-4 animate-spin" />
            Initializing...
          </>
        ) : (
          <>
            <RefreshCcw className="h-4 w-4" />
            Initialize Demo Data
          </>
        )}
      </Button>
    </div>
  );
}
