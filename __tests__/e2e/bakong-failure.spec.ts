import { test, expect, Page } from "@playwright/test";
import { createMockPaymentIntent } from "../mocks/payment-helpers";

/**
 * Bakong QR Code Failure Test Cases
 * Tests how the system handles QR code generation failures
 * and other error scenarios with Bakong payments
 */

async function authenticateUser(page: Page) {
  await page.goto("/sign-in");
  await page.fill('[name="email"]', "test@example.com");
  await page.fill('[name="password"]', "Password123");
  await page.click('button[type="submit"]');
  await page.waitForURL("/dashboard");
}

test.describe("Bakong QR Code Failure Cases", () => {
  test.beforeEach(async ({ page }) => {
    await authenticateUser(page);
  });

  test("Should display error message when QR code generation fails", async ({
    page,
  }) => {
    // Create a payment intent that should trigger QR failure
    const paymentIntent = await createMockPaymentIntent({
      amount: 50.0,
      currency: "USD",
      description: "QR Failure Test",
      gateway: "bakong",
      simulateQrFailure: true, // Special flag to trigger QR generation failure
    });

    // Navigate to the payment page
    await page.goto(`/(main)/payment/bakong/${paymentIntent.id}`);

    // Error message should be displayed instead of the QR code
    await expect(page.locator(".error-message")).toBeVisible();
    await expect(page.locator(".error-message")).toContainText(
      "Unable to generate QR code"
    );

    // Retry button should be available
    await expect(page.locator('button:has-text("Try Again")')).toBeVisible();
  });

  test("Should handle invalid phone number gracefully", async ({ page }) => {
    // Create payment with invalid phone number
    const paymentIntent = await createMockPaymentIntent({
      amount: 25.0,
      currency: "USD",
      description: "Invalid Phone Test",
      gateway: "bakong",
      phoneNumber: "12345", // Invalid Cambodian phone number
    });

    // Navigate to payment page
    await page.goto(`/(main)/payment/bakong/${paymentIntent.id}`);

    // Should show validation error
    await expect(page.locator(".validation-error")).toBeVisible();
    await expect(page.locator(".validation-error")).toContainText(
      "Invalid Cambodian phone number"
    );

    // Should allow updating the phone number
    await page.fill('input[name="phoneNumber"]', "85510456789");
    await page.click('button:has-text("Update")');

    // QR code should now be displayed
    await expect(page.locator(".qr-code-image")).toBeVisible();
  });

  test("Should handle backend server errors during QR creation", async ({
    page,
  }) => {
    // Create payment intent that will trigger server error
    const paymentIntent = await createMockPaymentIntent({
      amount: 75.0,
      currency: "USD",
      description: "Server Error Test",
      gateway: "bakong",
      meta: { triggerServerError: true },
    });

    // Navigate to payment page
    await page.goto(`/(main)/payment/bakong/${paymentIntent.id}`);

    // Should display server error message
    await expect(page.locator(".server-error-message")).toBeVisible();

    // Should offer alternative payment options
    await expect(page.locator(".alternative-payment-options")).toBeVisible();

    // Should have a "Contact Support" option
    await expect(page.locator('a:has-text("Contact Support")')).toBeVisible();
  });

  test("Should handle QR code expiry correctly", async ({ page }) => {
    // Create payment intent with short expiry time
    const paymentIntent = await createMockPaymentIntent({
      amount: 35.0,
      currency: "USD",
      description: "QR Expiry Test",
      gateway: "bakong",
      meta: { qrExpirySeconds: 5 }, // Very short expiry for testing
    });

    // Navigate to payment page
    await page.goto(`/(main)/payment/bakong/${paymentIntent.id}`);

    // QR should initially be visible
    await expect(page.locator(".qr-code-image")).toBeVisible();

    // Countdown timer should be visible
    await expect(page.locator(".qr-expiry-timer")).toBeVisible();

    // Wait for QR to expire
    await page.waitForTimeout(6000); // Wait just over the expiry time

    // Should show expired message
    await expect(page.locator(".qr-expired-message")).toBeVisible();

    // Should have refresh button
    const refreshButton = page.locator('button:has-text("Generate New QR")');
    await expect(refreshButton).toBeVisible();

    // Test refreshing QR
    await refreshButton.click();

    // Should show new QR code
    await expect(page.locator(".qr-code-image")).toBeVisible();
  });
});
