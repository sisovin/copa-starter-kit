import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { NextResponse } from "next/server";
import { api } from "./convex/_generated/api";
import createIntlMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n/request";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

// Development mode bypass flag - set to true to bypass auth checks during development
const BYPASS_AUTH =
  process.env.NODE_ENV === "development" || process.env.BYPASS_AUTH === "true";

// Create the internationalization middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export default clerkMiddleware(async (auth, req) => {
  // Handle internationalization first
  const intlResponse = intlMiddleware(req);

  // For development, completely bypass authentication
  if (BYPASS_AUTH) {
    console.log("Development mode: bypassing auth checks in middleware");
    return intlResponse;
  }

  try {
    const clerkAuth = await auth();
    const token = await clerkAuth.getToken({ template: "convex" });

    if (!token) {
      console.warn("No authentication token available");
      // If not authenticated and trying to access dashboard, redirect to login
      if (isProtectedRoute(req)) {
        const loginUrl = new URL("/sign-in", req.nextUrl.origin);
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.next();
    }

    // Only make the subscription check if a token is available
    let hasActiveSubscription = false;
    try {
      const result = await fetchQuery(
        api.subscriptions.getUserSubscriptionStatus,
        {},
        {
          token: token,
        }
      );
      hasActiveSubscription = result.hasActiveSubscription;
    } catch (error) {
      console.error("Failed to check subscription status:", error);
      // Continue without subscription check for development
      if (process.env.NODE_ENV === "development") {
        hasActiveSubscription = true;
      }
    }

    const isDashboard = req.nextUrl.href.includes(`/dashboard`);

    if (isDashboard && !hasActiveSubscription) {
      const pricingUrl = new URL("/pricing", req.nextUrl.origin);
      // Redirect to the pricing page
      return NextResponse.redirect(pricingUrl);
    }

    // Check if route is protected and user is not authenticated
    if (isProtectedRoute(req) && !clerkAuth.userId) {
      const loginUrl = new URL("/sign-in", req.nextUrl.origin);
      return NextResponse.redirect(loginUrl);
    }
    return intlResponse || NextResponse.next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    if (process.env.NODE_ENV === "development") {
      // In development, continue without auth
      return intlResponse || NextResponse.next();
    }
    // In production, redirect to login for protected routes
    if (isProtectedRoute(req)) {
      const loginUrl = new URL("/sign-in", req.nextUrl.origin);
      return NextResponse.redirect(loginUrl);
    }
    return intlResponse || NextResponse.next();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
