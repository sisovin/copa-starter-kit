import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import crypto from "crypto";
import { POST } from "../app/api/payway/callback/route";

// Mock Convex client
vi.mock("convex/browser", () => {
  return {
    ConvexHttpClient: vi.fn().mockImplementation(() => ({
      mutation: vi.fn().mockResolvedValue({ success: true }),
    })),
  };
});

// Mock Upstash Redis
vi.mock("@upstash/redis", () => {
  return {
    createClient: vi.fn().mockImplementation(() => ({
      incr: vi.fn().mockResolvedValue(1),
      expire: vi.fn().mockResolvedValue(true),
    })),
  };
});

describe("PayWay webhook handler", () => {
  const mockWebhookSecret = "test-payway-secret";

  beforeEach(() => {
    // Set environment variables
    process.env.PAYWAY_WEBHOOK_SECRET = mockWebhookSecret;
    process.env.NEXT_PUBLIC_CONVEX_URL = "https://example-convex.com";
    process.env.UPSTASH_REDIS_REST_URL = "https://example-redis.com";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

    // Reset mocks
    vi.resetAllMocks();
  });

  afterEach(() => {
    // Clean up environment
    delete process.env.PAYWAY_WEBHOOK_SECRET;
    delete process.env.NEXT_PUBLIC_CONVEX_URL;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  test("should accept valid webhook with correct signature", async () => {
    const payload = {
      transactionId: "tx_123456789",
      merchantId: "merchant_123456",
      amount: 1000,
      currency: "USD",
      status: "APPROVED",
      timeCreated: new Date().toISOString(),
    };

    // Calculate signature
    const hmac = crypto.createHmac("sha256", mockWebhookSecret);
    const signature = hmac.update(JSON.stringify(payload)).digest("hex");

    const fullPayload = {
      ...payload,
      signature,
    };

    const request = new NextRequest("https://example.com/api/payway/callback", {
      method: "POST",
      body: JSON.stringify(fullPayload),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    const responseData = await response.json();
    expect(responseData.success).toBe(true);
  });

  test("should reject invalid signatures", async () => {
    const payload = {
      transactionId: "tx_123456789",
      merchantId: "merchant_123456",
      amount: 1000,
      currency: "USD",
      status: "APPROVED",
      timeCreated: new Date().toISOString(),
      signature: "invalid-signature",
    };

    const request = new NextRequest("https://example.com/api/payway/callback", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
  });

  test("should handle missing webhook secret", async () => {
    delete process.env.PAYWAY_WEBHOOK_SECRET;

    const payload = {
      transactionId: "tx_123456789",
      merchantId: "merchant_123456",
      amount: 1000,
      currency: "USD",
      status: "APPROVED",
      timeCreated: new Date().toISOString(),
      signature: "some-signature",
    };

    const request = new NextRequest("https://example.com/api/payway/callback", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const response = await POST(request);

    expect(response.status).toBe(500);
  });

  test("should validate payload schema", async () => {
    const invalidPayload = {
      transactionId: "tx_123456789",
      // Missing required fields
      signature: "some-signature",
    };

    const request = new NextRequest("https://example.com/api/payway/callback", {
      method: "POST",
      body: JSON.stringify(invalidPayload),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    const responseData = await response.json();
    expect(responseData.error).toBe("Invalid webhook payload");
  });

  test("should process different payment statuses", async () => {
    const testCases = [
      { status: "PENDING" },
      { status: "APPROVED" },
      { status: "FAILED" },
      { status: "REJECTED" },
    ];

    for (const testCase of testCases) {
      const payload = {
        transactionId: `tx_${testCase.status.toLowerCase()}`,
        merchantId: "merchant_123456",
        amount: 1000,
        currency: "USD",
        status: testCase.status,
        timeCreated: new Date().toISOString(),
      };

      // Calculate signature
      const hmac = crypto.createHmac("sha256", mockWebhookSecret);
      const signature = hmac.update(JSON.stringify(payload)).digest("hex");

      const fullPayload = {
        ...payload,
        signature,
      };

      const request = new NextRequest(
        "https://example.com/api/payway/callback",
        {
          method: "POST",
          body: JSON.stringify(fullPayload),
        }
      );

      const response = await POST(request);

      expect(response.status).toBe(200);
    }
  });
});
