"use client";
import { useAuth } from "@clerk/nextjs";
import { ConvexReactClient, ConvexProvider } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ReactNode } from "react";

// Create a mock auth hook for development
const useDevAuth = () => {
  return {
    getToken: async () => "dev-token-for-testing",
    isLoaded: true,
    isSignedIn: true,
    userId: "dev-user-123"
  };
};

export default function Provider({ children }: { children: ReactNode }) {
  // Use a default development URL if the environment variable is not set
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || 'https://graceful-yeti-724.convex.cloud';
  const convex = new ConvexReactClient(convexUrl);

  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';
  const bypassAuth = isDevelopment || process.env.BYPASS_AUTH === 'true';

  // In development, use a simple ConvexProvider without Clerk
  if (bypassAuth) {
    return (
      <ConvexProvider client={convex}>
        {children}
      </ConvexProvider>
    );  }

  // Production mode with Clerk authentication
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}

