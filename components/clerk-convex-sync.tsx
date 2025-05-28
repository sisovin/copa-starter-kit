"use client";

import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * This component syncs Clerk user data to Convex
 * It should be rendered in the app layout or a global provider
 */
export function ClerkConvexSync() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const createOrUpdateUser = useMutation(api.actions.createOrUpdateUser);
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Only run once both Clerk and Convex are loaded and authenticated
    if (isAuthLoading || !isUserLoaded || !isAuthenticated || !user) {
      return;
    }

    // Get user data from Clerk
    const syncUser = async () => {
      try {
        const primaryEmail = user.primaryEmailAddress?.emailAddress;

        if (!primaryEmail) {
          console.error("User does not have a primary email address");
          return;
        }

        // Sync user data to Convex
        await createOrUpdateUser({
          clerkId: user.id,
          email: primaryEmail,
          firstName: user.firstName ?? undefined,
          lastName: user.lastName ?? undefined,
          imageUrl: user.imageUrl ?? undefined,
          username: user.username ?? undefined,
        });

        // Refresh the page data if needed
        router.refresh();
      } catch (err) {
        console.error("Error syncing user data to Convex:", err);
      }
    };

    syncUser();
  }, [
    isAuthenticated,
    isAuthLoading,
    isUserLoaded,
    user,
    createOrUpdateUser,
    router,
  ]);

  // This is a utility component that doesn't render anything
  return null;
}
