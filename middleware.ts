import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Enhanced Auth Middleware that:
 * 1. Protects all /** routes
 * 2. Redirects unauthenticated users to sign-in
 * 3. Stores original request path for post-login redirect
 * 4. Handles edge cases like API routes and public assets
 * 5. Allows custom role-based access control (optional)
 */

// Define public and ignored routes
const PUBLIC_ROUTES = [
  "/", // Home page
  "/sign-in(.*)", // All sign-in routes
  "/sign-up(.*)", // All sign-up routes
  "/api/webhooks(.*)", // Webhooks
  "/api/public/(.*)", // Public API routes
  "/legal/(.*)", // Legal pages (terms, privacy, etc)
  "/about", // About page
  "/contact", // Contact page
  "/blog(.*)", // Blog posts (read-only)
  "/favicon.ico", // Favicon
];

// Routes that are completely ignored by the middleware
const IGNORED_ROUTES = [
  "/api/health", // Health check endpoints
  "/api/public/(.*)", // Public API endpoints
  "/_next/(.*)", // Next.js system files
  "/static/(.*)", // Static assets
  "/images/(.*)", // Image assets
  "/assets/(.*)", // Other assets
];

// Create route matchers using the new API
const isPublicRoute = createRouteMatcher(PUBLIC_ROUTES);
const isIgnoredRoute = createRouteMatcher(IGNORED_ROUTES);

// Configure Clerk middleware options
const clerkOptions = {
  // Enable debug mode for troubleshooting
  debug: process.env.CLERK_MIDDLEWARE_DEBUG === "1",
};

// Export the new clerk middleware implementation
export default clerkMiddleware(async (auth, req) => {
  const { pathname, search, origin } = req.nextUrl;

  // Skip auth check for specific file extensions that are always public
  if (
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js(?!on)|woff|woff2|ttf|map)$/)
  ) {
    return NextResponse.next();
  }

  // For ignored routes, simply continue
  if (isIgnoredRoute(req)) {
    return NextResponse.next();
  }

  // Allow public routes to pass through without authentication
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // For protected routes, check authentication
  try {
    // This will throw an error if the user is not authenticated
    await auth.protect();

    // Optional: Role-based access control for specific paths (examples)
    if (pathname.startsWith("/admin")) {
      // Check if user has admin permissions
      // In a real app, you would implement proper role checking with auth.has()
      /*
      await auth.protect((has) => {
        return has({ role: "admin" });
      });
      */
    }

    return NextResponse.next();
  } catch {
    // If auth.protect() throws, the user is not authenticated
    // Store the original URL to redirect after authentication
    const returnBackUrl = encodeURIComponent(pathname + (search || ""));

    // Create sign-in URL with return URL parameter
    const signInUrl = new URL(`/sign-in?redirect_url=${returnBackUrl}`, origin);

    // Add custom header for tracking auth redirects (useful for analytics)
    const response = NextResponse.redirect(signInUrl);
    response.headers.set("x-middleware-redirect", "auth-required");

    return response;
  }
}, clerkOptions);

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|.*\\..*).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

// To debug Clerk errors, set environment variable CLERK_MIDDLEWARE_DEBUG=1
