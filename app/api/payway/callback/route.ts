import { NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@upstash/redis";
import crypto from "crypto";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

// Configure for Edge runtime
export const runtime = "edge";

// Configure Upstash Redis for rate limiting
const redis = createClient({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Webhook payload validation schema
const PayWayWebhookSchema = z.object({
  transactionId: z.string(),
  merchantId: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.enum(["PENDING", "APPROVED", "FAILED", "REJECTED"]),
  approvalCode: z.string().optional(),
  paymentMethod: z.string().optional(),
  timeCreated: z.string(),
  timeCompleted: z.string().optional(),
  customFields: z.record(z.string()).optional(),
  signature: z.string(),
});

// TypeScript type for webhook payload
export type PayWayWebhookPayload = z.infer<typeof PayWayWebhookSchema>;

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // 1 request per second on average

/**
 * Verify HMAC signature from PayWay
 */
function verifySignature(
  payload: any,
  signature: string,
  secret: string
): boolean {
  // Remove signature from the payload for verification
  const { signature: _, ...dataToVerify } = payload;

  // Sort keys alphabetically for consistent hashing
  const orderedData = Object.keys(dataToVerify)
    .sort()
    .reduce((obj: any, key: string) => {
      obj[key] = dataToVerify[key];
      return obj;
    }, {});

  const hmac = crypto.createHmac("sha256", secret);
  const expectedSignature = hmac
    .update(JSON.stringify(orderedData))
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Handle rate limiting
 */
async function checkRateLimit(ip: string): Promise<boolean> {
  const key = `payway_webhook_ratelimit:${ip}`;

  try {
    // Use Redis to track request rates
    const requestCount = await redis.incr(key);

    // Set expiry on first request
    if (requestCount === 1) {
      await redis.expire(key, RATE_LIMIT_WINDOW);
    }

    return requestCount <= MAX_REQUESTS_PER_WINDOW;
  } catch (error) {
    // If Redis fails, default to allowing the request but log the error
    console.error("Rate limiting error:", error);
    return true;
  }
}

/**
 * POST handler for PayWay webhook
 */
export async function POST(request: NextRequest) {
  const ip = request.ip || "unknown";

  // Check rate limit
  const isRateLimitOk = await checkRateLimit(ip);
  if (!isRateLimitOk) {
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": RATE_LIMIT_WINDOW.toString(),
      },
    });
  }

  try {
    // Parse and validate the request body
    const rawBody = await request.json();
    const { signature, ...payload } = PayWayWebhookSchema.parse(rawBody);

    // Get the webhook secret
    const webhookSecret = process.env.PAYWAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("PayWay webhook secret is not configured");
      return new Response(
        JSON.stringify({
          error: "Server misconfiguration",
        }),
        { status: 500 }
      );
    }

    // Verify the signature
    const isValidSignature = verifySignature(rawBody, signature, webhookSecret);
    if (!isValidSignature) {
      console.error("Invalid PayWay webhook signature");
      return new Response(
        JSON.stringify({
          error: "Invalid signature",
        }),
        { status: 401 }
      );
    }

    // Initialize Convex client
    const convex = new ConvexHttpClient(
      process.env.NEXT_PUBLIC_CONVEX_URL || ""
    );

    // Call Convex mutation to update payment status
    await convex.mutation(api.payments.handlePayWayWebhook, {
      payload,
      signature,
    });

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("PayWay webhook error:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: "Invalid webhook payload",
          details: error.errors,
        }),
        { status: 400 }
      );
    }

    // Handle other errors
    return new Response(
      JSON.stringify({
        error: "Server error",
      }),
      { status: 500 }
    );
  }
}
