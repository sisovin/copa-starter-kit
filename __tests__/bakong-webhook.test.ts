import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { POST, _testing } from "../app/api/bakong/callback/route";

// Mock Convex client
vi.mock("convex/browser", () => {
  return {
    ConvexHttpClient: vi.fn().mockImplementation(() => ({
      mutation: vi.fn().mockResolvedValue({ success: true }),
    })),
  };
});

// Mock Sentry
vi.mock("@sentry/nextjs", () => {
  return {
    captureException: vi.fn(),
    captureMessage: vi.fn(),
    Severity: {
      Warning: "warning",
    },
  };
});

describe("Bakong webhook handler", () => {
  const mockWebhookSecret = "test-webhook-secret";

  beforeEach(() => {
    // Set environment variables
    process.env.BAKONG_WEBHOOK_SECRET = mockWebhookSecret;
    process.env.NEXT_PUBLIC_CONVEX_URL = "https://example-convex.com";

    // Reset mocks
    vi.resetAllMocks();
  });

  afterEach(() => {
    // Clean up environment
    delete process.env.BAKONG_WEBHOOK_SECRET;
    delete process.env.NEXT_PUBLIC_CONVEX_URL;
  });

  test("should verify valid signatures correctly", () => {
    const payload = { test: "data" };
    const timestamp = Date.now().toString();
    const dataToSign = `${timestamp}.${JSON.stringify(payload)}`;

    const signature = crypto
      .createHmac("sha256", mockWebhookSecret)
      .update(dataToSign)
      .digest("hex");

    const isValid = _testing.verifyBakongSignature(
      payload,
      signature,
      timestamp,
      mockWebhookSecret
    );

    expect(isValid).toBe(true);
  });

  test("should reject invalid signatures", () => {
    const payload = { test: "data" };
    const timestamp = Date.now().toString();
    const invalidSignature = "invalid-signature";

    const isValid = _testing.verifyBakongSignature(
      payload,
      invalidSignature,
      timestamp,
      mockWebhookSecret
    );

    expect(isValid).toBe(false);
  });

  test("should accept valid payment.success webhook", async () => {
    const timestamp = Date.now().toString();
    const payload = {
      id: "evt_123456789",
      event: "payment.success",
      created: Date.now(),
      data: {
        transactionId: "tx_123456789",
        amount: 10000,
        currency: "KHR",
        status: "completed",
        paymentMethod: "bakong",
        phoneNumber: "+855123456789",
      },
      idempotencyKey: "key_123456789",
    };

    const dataToSign = `${timestamp}.${JSON.stringify(payload)}`;
    const signature = crypto
      .createHmac("sha256", mockWebhookSecret)
      .update(dataToSign)
      .digest("hex");

    const headers = new Headers();
    headers.set("BAKONG-SIGNATURE", signature);
    headers.set("BAKONG-TIMESTAMP", timestamp);

    const request = new NextRequest("https://example.com/api/bakong/callback", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    const responseData = await response.json();
    expect(responseData.success).toBe(true);
  });

  test("should reject requests with missing signature headers", async () => {
    const payload = {
      id: "evt_123456789",
      event: "payment.success",
      created: Date.now(),
      data: {
        transactionId: "tx_123456789",
        amount: 10000,
        currency: "KHR",
        status: "completed",
        paymentMethod: "bakong",
      },
      idempotencyKey: "key_123456789",
    };

    // No signature headers
    const request = new NextRequest("https://example.com/api/bakong/callback", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
  });

  test("should handle payment.failed event correctly", async () => {
    const timestamp = Date.now().toString();
    const payload = {
      id: "evt_123456789",
      event: "payment.failed",
      created: Date.now(),
      data: {
        transactionId: "tx_123456789",
        amount: 10000,
        currency: "KHR",
        status: "failed",
        paymentMethod: "bakong",
        failedAt: Date.now(),
      },
      idempotencyKey: "key_123456789",
    };

    const dataToSign = `${timestamp}.${JSON.stringify(payload)}`;
    const signature = crypto
      .createHmac("sha256", mockWebhookSecret)
      .update(dataToSign)
      .digest("hex");

    const headers = new Headers();
    headers.set("BAKONG-SIGNATURE", signature);
    headers.set("BAKONG-TIMESTAMP", timestamp);

    const request = new NextRequest("https://example.com/api/bakong/callback", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  test("should reject invalid payload schema", async () => {
    const timestamp = Date.now().toString();
    const invalidPayload = {
      id: "evt_123456789",
      event: "payment.unknown", // Invalid event type
      data: {
        transactionId: "tx_123456789",
      },
      // Missing required fields
    };

    const dataToSign = `${timestamp}.${JSON.stringify(invalidPayload)}`;
    const signature = crypto
      .createHmac("sha256", mockWebhookSecret)
      .update(dataToSign)
      .digest("hex");

    const headers = new Headers();
    headers.set("BAKONG-SIGNATURE", signature);
    headers.set("BAKONG-TIMESTAMP", timestamp);

    const request = new NextRequest("https://example.com/api/bakong/callback", {
      method: "POST",
      headers,
      body: JSON.stringify(invalidPayload),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  test("should handle idempotency correctly", async () => {
    const timestamp = Date.now().toString();
    const payload = {
      id: "evt_123456789",
      event: "payment.success",
      created: Date.now(),
      data: {
        transactionId: "tx_123456789",
        amount: 10000,
        currency: "KHR",
        status: "completed",
        paymentMethod: "bakong",
      },
      idempotencyKey: "duplicate_key_test",
    };

    const dataToSign = `${timestamp}.${JSON.stringify(payload)}`;
    const signature = crypto
      .createHmac("sha256", mockWebhookSecret)
      .update(dataToSign)
      .digest("hex");

    const headers = new Headers();
    headers.set("BAKONG-SIGNATURE", signature);
    headers.set("BAKONG-TIMESTAMP", timestamp);

    const request1 = new NextRequest(
      "https://example.com/api/bakong/callback",
      {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      }
    );

    // First request should succeed
    const response1 = await POST(request1);
    expect(response1.status).toBe(200);

    // Second identical request should also return 200 but indicate already processed
    const request2 = new NextRequest(
      "https://example.com/api/bakong/callback",
      {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      }
    );

    const response2 = await POST(request2);
    expect(response2.status).toBe(200);

    const responseData = await response2.json();
    expect(responseData.message).toBe("Event already processed");
  });
});
