import { test, expect } from "@playwright/test";
import { createMockPaymentIntent } from "../mocks/payment-helpers";

/**
 * Webhook Timeout Tests
 *
 * Tests how the system handles timeouts and delays in webhook processing
 * for both PayWay and Bakong payment gateways
 */

async function authenticateUser(page) {
  await page.goto("/sign-in");
  await page.fill('[name="email"]', "test@example.com");
  await page.fill('[name="password"]', "Password123");
  await page.click('button[type="submit"]');
  await page.waitForURL("/dashboard");
}

test.describe("Webhook Timeout Scenarios", () => {
  test("Should show pending status for PayWay payment with delayed webhook", async ({
    page,
  }) => {
    await authenticateUser(page);

    // Create a payment intent with webhook delay simulation
    const paymentIntent = await createMockPaymentIntent({
      amount: 15.99,
      currency: "USD",
      description: "Webhook Delay Test",
      gateway: "payway",
      simulateWebhookTimeout: true, // This will make the webhook delayed
    });

    // Navigate to the payment page
    await page.goto(`/(main)/payment/payway/${paymentIntent.id}`);

    // Make the payment
    await page.click('button:has-text("Pay Now")');
    const paywayFrame =
      page.frameLocator("#payway-checkout-frame").first() || page;
    await paywayFrame.fill("#card-number", "4111111111111111");
    await paywayFrame.fill("#expiry", "12/25");
    await paywayFrame.fill("#cvc", "123");
    await paywayFrame.click('button[type="submit"]');

    // Should be redirected to pending page - the transaction is "successful" on PayWay
    // but our server hasn't received the webhook confirmation
    await page.waitForURL(/\/payment\/pending/);

    // Should show pending status message
    await expect(page.locator(".payment-pending-status")).toBeVisible();
    await expect(page.locator(".payment-pending-status")).toContainText(
      "Your payment is being processed"
    );

    // Should have the reload/refresh status button
    await expect(page.locator('button:has-text("Check Status")')).toBeVisible();

    // Wait for a short delay to simulate webhook processing
    await page.waitForTimeout(5000);

    // Click the refresh button to check status
    await page.click('button:has-text("Check Status")');

    // The status should still be pending (webhook still delayed)
    await expect(page.locator(".payment-pending-status")).toBeVisible();

    // Now simulate webhook coming through (by calling our mock webhook endpoint)
    await page.request.post("/api/payway/mock-webhook", {
      data: {
        transactionId: paymentIntent.id,
        status: "APPROVED",
        amount: 15.99,
        currency: "USD",
      },
    });

    // Refresh again to see updated status
    await page.click('button:has-text("Check Status")');

    // Should now show success page
    await page.waitForURL(/\/payment\/confirmation/);
    await expect(page.locator(".payment-status")).toContainText(
      "Payment Successful"
    );
  });

  test("Should handle Bakong webhook completely failing", async ({ page }) => {
    await authenticateUser(page);

    // Create a payment intent with webhook complete failure
    const paymentIntent = await createMockPaymentIntent({
      amount: 25.0,
      currency: "USD",
      description: "Webhook Failure Test",
      gateway: "bakong",
      meta: { webhookCompleteFailure: true }, // Webhook will never arrive
    });

    // Navigate to the payment page
    await page.goto(`/(main)/payment/bakong/${paymentIntent.id}`);

    // QR Code should be visible
    await expect(page.locator(".qr-code-image")).toBeVisible();

    // Simulate the user scanning and completing the payment in Bakong app
    // but the webhook never arrives to our system
    await page.click('button:has-text("Simulate QR Scan")');

    // Page should navigate to pending status
    await page.waitForURL(/\/payment\/pending/);

    // Should show pending message
    await expect(page.locator(".payment-pending-status")).toBeVisible();

    // Should have payment reference for support
    await expect(page.locator(".payment-reference")).toBeVisible();

    // Wait long enough for timeout logic to trigger
    await page.waitForTimeout(15000);

    // Refresh status
    await page.click('button:has-text("Check Status")');

    // Should now show potential webhook failure message
    await expect(page.locator(".webhook-timeout-message")).toBeVisible();
    await expect(page.locator(".webhook-timeout-message")).toContainText(
      "We haven't received confirmation"
    );

    // Should show contact support option
    await expect(page.locator('a:has-text("Contact Support")')).toBeVisible();

    // Should have payment reference ID for support
    const referenceId = await page.locator(".reference-id").textContent();
    expect(referenceId).toBeTruthy();
    expect(referenceId.length).toBeGreaterThan(5);
  });

  test("Should handle intermittent webhook delivery correctly", async ({
    page,
  }) => {
    await authenticateUser(page);

    // Create payment intent with intermittent webhook behavior
    const paymentIntent = await createMockPaymentIntent({
      amount: 35.0,
      currency: "USD",
      description: "Intermittent Webhook Test",
      gateway: "payway",
      meta: { webhookRetryPattern: [false, false, true] }, // Fails twice then succeeds
    });

    // Navigate to payment page
    await page.goto(`/(main)/payment/payway/${paymentIntent.id}`);

    // Make the payment
    await page.click('button:has-text("Pay Now")');
    const paywayFrame =
      page.frameLocator("#payway-checkout-frame").first() || page;
    await paywayFrame.fill("#card-number", "4111111111111111");
    await paywayFrame.fill("#expiry", "12/25");
    await paywayFrame.fill("#cvc", "123");
    await paywayFrame.click('button[type="submit")');

    // Should go to pending page
    await page.waitForURL(/\/payment\/pending/);

    // First webhook attempt - will fail silently on backend
    await page.request.post("/api/payway/mock-webhook", {
      data: {
        transactionId: paymentIntent.id,
        status: "APPROVED",
        retryAttempt: 1,
      },
    });

    // Refresh status - should still be pending
    await page.click('button:has-text("Check Status")');
    await expect(page.locator(".payment-pending-status")).toBeVisible();

    // Second webhook attempt - will also fail
    await page.request.post("/api/payway/mock-webhook", {
      data: {
        transactionId: paymentIntent.id,
        status: "APPROVED",
        retryAttempt: 2,
      },
    });

    // Refresh again - still pending
    await page.click('button:has-text("Check Status")');
    await expect(page.locator(".payment-pending-status")).toBeVisible();

    // Third webhook attempt - should succeed
    await page.request.post("/api/payway/mock-webhook", {
      data: {
        transactionId: paymentIntent.id,
        status: "APPROVED",
        retryAttempt: 3,
      },
    });

    // Refresh final time - should now show success
    await page.click('button:has-text("Check Status")');
    await page.waitForURL(/\/payment\/confirmation/);
    await expect(page.locator(".payment-status")).toContainText(
      "Payment Successful"
    );
  });
});
