"use client";

import { ClerkConvexSync } from "@/components/clerk-convex-sync";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

// Create a Convex client
const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL as string
);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      <ClerkConvexSync />
      {children}
    </ConvexProvider>
  );
}
