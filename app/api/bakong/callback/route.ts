import { NextRequest } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import * as Sentry from "@sentry/nextjs";

// Configure for Edge runtime
export const runtime = "edge";

// Define webhook event types
type BakongEventType =
  | "payment.success"
  | "payment.failed"
  | "payment.refunded"
  | "payment.expired";

// Webhook payload validation schema
const BakongWebhookSchema = z.object({
  id: z.string(),
  event: z.enum([
    "payment.success",
    "payment.failed",
    "payment.refunded",
    "payment.expired",
  ]),
  created: z.number(),
  data: z.object({
    transactionId: z.string(),
    amount: z.number(),
    currency: z.string().default("KHR"),
    status: z.enum(["completed", "failed", "refunded", "expired"]),
    metadata: z.record(z.string()).optional(),
    completedAt: z.number().optional(),
    failedAt: z.number().optional(),
    refundedAt: z.number().optional(),
    refundReason: z.string().optional(),
    paymentMethod: z.literal("bakong"),
    accountId: z.string().optional(),
    phoneNumber: z.string().optional(),
  }),
  idempotencyKey: z.string(),
});

// TypeScript type for webhook payload
export type BakongWebhookPayload = z.infer<typeof BakongWebhookSchema>;

/**
 * Verify Bakong signature
 */
function verifyBakongSignature(
  payload: any,
  signature: string,
  timestamp: string,
  secret: string
): boolean {
  const dataToSign = `${timestamp}.${JSON.stringify(payload)}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(dataToSign)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

/**
 * Store processed idempotency keys in memory
 * In production, use Redis or database for this
 */
const processedIdempotencyKeys = new Set<string>();

/**
 * POST handler for Bakong webhook
 */
export async function POST(request: NextRequest) {
  try {
    // Get signature from headers
    const signature = request.headers.get("BAKONG-SIGNATURE");
    const timestamp = request.headers.get("BAKONG-TIMESTAMP");

    if (!signature || !timestamp) {
      const error = "Missing BAKONG-SIGNATURE or BAKONG-TIMESTAMP header";
      console.error(error);
      Sentry.captureMessage(error, "error");

      return new Response(JSON.stringify({ error }), { status: 401 });
    }

    // Parse the request body
    const rawBody = await request.json();

    // Validate against schema
    const payload = BakongWebhookSchema.parse(rawBody);

    // Check idempotency key to avoid duplicate processing
    if (processedIdempotencyKeys.has(payload.idempotencyKey)) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Event already processed",
        }),
        { status: 200 }
      );
    }

    // Get the webhook secret
    const webhookSecret = process.env.BAKONG_WEBHOOK_SECRET;
    if (!webhookSecret) {
      const error = "Bakong webhook secret is not configured";
      console.error(error);
      Sentry.captureError(new Error(error));

      return new Response(
        JSON.stringify({ error: "Server misconfiguration" }),
        { status: 500 }
      );
    }

    // Verify signature
    const isValidSignature = verifyBakongSignature(
      rawBody,
      signature,
      timestamp,
      webhookSecret
    );

    if (!isValidSignature) {
      const error = "Invalid Bakong webhook signature";
      console.error(error);
      Sentry.captureMessage(error, Sentry.Severity.Warning, {
        extra: {
          signature,
          timestamp,
          ip: request.ip,
        },
      });

      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
      });
    }

    // Initialize Convex client
    const convex = new ConvexHttpClient(
      process.env.NEXT_PUBLIC_CONVEX_URL || ""
    );

    // Map Bakong event types to payment statuses
    let paymentStatus;
    switch (payload.event) {
      case "payment.success":
        paymentStatus = "completed";
        break;
      case "payment.failed":
        paymentStatus = "failed";
        break;
      case "payment.refunded":
        paymentStatus = "refunded";
        break;
      case "payment.expired":
        paymentStatus = "failed";
        break;
    }

    // Update payment in Convex DB
    await convex.mutation(api.payments.updatePaymentStatus, {
      transactionId: payload.data.transactionId,
      status: paymentStatus,
      gatewayResponse: payload,
      completedAt: payload.event === "payment.success" ? Date.now() : undefined,
    });

    // Mark idempotency key as processed
    processedIdempotencyKeys.add(payload.idempotencyKey);

    // Clean up old keys (should use Redis TTL in production)
    if (processedIdempotencyKeys.size > 1000) {
      // Clear oldest entries if we have too many
      const keysIterator = processedIdempotencyKeys.keys();
      for (let i = 0; i < 200; i++) {
        const key = keysIterator.next().value;
        processedIdempotencyKeys.delete(key);
      }
    }

    // Return success response
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Log error to Sentry
    Sentry.captureException(error);
    console.error("Bakong webhook error:", error);

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
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}

// For testing purposes - export these functions
export const _testing = {
  verifyBakongSignature,
  BakongWebhookSchema,
};
