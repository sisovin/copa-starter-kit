import { NextResponse } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";

// Define public routes
const publicRoutes = [
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/api/payway/callback(.*)",
  "/api/bakong/callback(.*)",
  "/api/siwe/(.*)",
  "/api/public/(.*)",
  "/legal/(.*)",
  "/about",
  "/contact",
  "/blog(.*)",
  "/favicon.ico",
];

// Apply security headers to responses
function setupSecurityHeaders(response: NextResponse): NextResponse {
  // Set security headers
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

// Check if a path matches any public route pattern
function isPublicRoute(path: string): boolean {
  return publicRoutes.some((pattern) => {
    const regex = new RegExp(`^${pattern.replace(/\(.*\)/g, ".*")}$`);
    return regex.test(path);
  });
}

// Use Clerk's middleware
export default clerkMiddleware(async (auth, req) => {
  const { pathname, search } = req.nextUrl;

  // Skip auth check for static assets
  if (pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf|map)$/)) {
    return NextResponse.next();
  }

  // Skip auth for public routes
  if (isPublicRoute(pathname)) {
    return setupSecurityHeaders(NextResponse.next());
  }

  try {
    // Attempt to authenticate the request
    await auth.protect();
    return setupSecurityHeaders(NextResponse.next());
  } catch {
    // Redirect to sign-in with return URL
    const returnUrl = encodeURIComponent(pathname + (search || ""));
    const signInUrl = new URL(`/sign-in?redirect_url=${returnUrl}`, req.url);

    // If the path is a payment route, store in cookie for later
    if (
      pathname.startsWith("/(main)/payment") ||
      pathname.startsWith("/payments")
    ) {
      const response = NextResponse.redirect(signInUrl);
      response.cookies.set("payment_intent_url", pathname + (search || ""), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 30, // 30 minutes
        path: "/",
      });
      return setupSecurityHeaders(response);
    }

    return setupSecurityHeaders(NextResponse.redirect(signInUrl));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
