import { test, expect } from "@playwright/test";
import { createMockPaymentIntent } from "../mocks/payment-helpers";

/**
 * Additional API Tests for Payment Integrations
 * - Tests webhook handling and status updates
 * - Validates error handling for edge cases
 * - Tests idempotency and duplicate detection
 */

// Helper to trigger a webhook simulation
async function triggerMockWebhook(
  paymentId: string,
  status: string,
  gateway: "payway" | "bakong"
) {
  const apiUrl = `/api/${gateway}/mock-webhook`;

  // This would make a POST to our internal testing API to simulate a webhook
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      transactionId: paymentId,
      status,
      timestamp: new Date().toISOString(),
    }),
  });

  return response.json();
}

test.describe("Webhook and Payment Status Updates", () => {
  test("PayWay webhook should update payment status correctly", async ({
    request,
  }) => {
    // Create a payment intent
    const paymentIntent = await createMockPaymentIntent({
      amount: 25.75,
      currency: "USD",
      description: "Webhook Test",
      gateway: "payway",
    });

    // Trigger a mock webhook to update status to completed
    await triggerMockWebhook(paymentIntent.id, "APPROVED", "payway");

    // Verify the payment status via API
    const statusResponse = await request.get(
      `/api/payments/status/${paymentIntent.id}`
    );
    expect(statusResponse.ok()).toBeTruthy();

    const statusData = await statusResponse.json();
    expect(statusData.status).toBe("completed");
    expect(statusData.updatedAt).not.toBeNull();
  });

  test("Bakong webhook should handle phone number validation", async ({
    request,
  }) => {
    // Create a payment intent with a phone number
    const paymentIntent = await createMockPaymentIntent({
      amount: 50000,
      currency: "KHR",
      description: "Phone Validation Test",
      gateway: "bakong",
      phoneNumber: "855INVALID", // Invalid format
    });

    // Attempt to process the payment should fail validation
    const processResponse = await request.post(`/api/bakong/process`, {
      data: {
        paymentId: paymentIntent.id,
      },
    });

    // Should return validation error
    expect(processResponse.status()).toBe(400);
    const errorData = await processResponse.json();
    expect(errorData.error).toContain("Invalid phone number format");
  });

  test("Duplicate webhook calls should be idempotent", async ({ request }) => {
    // Create a payment intent
    const paymentIntent = await createMockPaymentIntent({
      amount: 15.99,
      currency: "USD",
      description: "Idempotency Test",
      gateway: "payway",
    });

    // Trigger the same webhook multiple times
    await triggerMockWebhook(paymentIntent.id, "APPROVED", "payway");
    await triggerMockWebhook(paymentIntent.id, "APPROVED", "payway");
    await triggerMockWebhook(paymentIntent.id, "APPROVED", "payway");

    // Check payment history - should only have one status update
    const historyResponse = await request.get(
      `/api/payments/history/${paymentIntent.id}`
    );
    const historyData = await historyResponse.json();

    // Filter status updates to only "completed" events
    const completedEvents = historyData.history.filter(
      (event: any) =>
        event.type === "status_change" && event.data.status === "completed"
    );

    // Should only have one completed status change despite multiple webhooks
    expect(completedEvents.length).toBe(1);
  });
});
