"use client";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useEffect } from "react";
import Footer from "./footer";
import NavBar from "./navbar";

// Create a mock auth hook for development mode
const useDevelopmentAuth = () => {
  return {
    isSignedIn: true,
    userId: "dev-user-123",
    sessionId: "dev-session-123",
    getToken: async () => "dev-token-for-testing",
  };
};

export default function PageWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if we're in development mode with auth bypass
  const isDevelopment = process.env.NODE_ENV === "development";
  const bypassAuth = isDevelopment || process.env.BYPASS_AUTH === "true";

  // Use real or mock auth based on environment
  // Always call both hooks unconditionally
  const devAuth = useDevelopmentAuth();
  const prodAuth = useAuth();

  // Use real or mock auth based on environment
  const { isSignedIn } = bypassAuth ? devAuth : prodAuth;
  const user = useQuery(api.users.getUser);
  const storeUser = useMutation(api.users.store);

  useEffect(() => {
    if (user && isSignedIn) {
      storeUser();
    }
  }, [user, isSignedIn, storeUser]);

  return (
    <>
      <NavBar />
      <main className="flex min-w-screen min-h-screen flex-col pt-[4rem] items-center dark:bg-black bg-white justify-between">
        <div className="absolute z-[-99] pointer-events-none inset-0 flex items-center justify-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        {children}
      </main>
      <Footer />
    </>
  );
}
