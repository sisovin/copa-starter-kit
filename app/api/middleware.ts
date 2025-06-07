import { NextResponse, NextRequest } from "next/server";

// Define routes that require API key validation
const API_ROUTES = ["/api/openai"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply middleware to API routes
  if (API_ROUTES.some((route) => pathname.startsWith(route))) {
    // Check if the request method is POST
    if (request.method !== "POST") {
      return NextResponse.json(
        { error: { message: "Method not allowed" } },
        { status: 405 }
      );
    }

    // Check for API key in environment (this doesn't validate individual requests
    // but ensures the API is configured properly)
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY is not set in environment variables");
      return NextResponse.json(
        { error: { message: "API not properly configured" } },
        { status: 500 }
      );
    }

    // Optional: Add CORS headers for API routes
    const response = NextResponse.next();
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    return response;
  }

  // For all other routes, continue without modification
  return NextResponse.next();
}

// Configure matcher for middleware
export const config = {
  matcher: ["/api/openai/:path*"],
};
