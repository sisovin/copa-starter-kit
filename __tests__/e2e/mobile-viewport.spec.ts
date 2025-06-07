import { test, expect, Browser, Page } from "@playwright/test";
import { createMockPaymentIntent } from "../mocks/payment-helpers";

/**
 * Mobile Viewport Tests for Payment Flows
 * Tests payment UIs on different mobile screen sizes
 */

// Authenticated user setup helper
async function authenticateUser(page: Page) {
  await page.goto("/sign-in");
  await page.fill('[name="email"]', "test@example.com");
  await page.fill('[name="password"]', "Password123");
  await page.click('button[type="submit"]');
  await page.waitForURL("/dashboard");
}

test.describe("Mobile Viewport Testing", () => {
  // Define common mobile viewport sizes
  const mobileViewports = [
    { width: 375, height: 667, name: "iPhone SE" },
    { width: 414, height: 896, name: "iPhone XR" },
    { width: 360, height: 740, name: "Android (medium)" },
  ];

  for (const viewport of mobileViewports) {
    test(`PayWay payment flow on ${viewport.name} viewport`, async ({
      browser,
    }) => {
      // Create a new context with mobile viewport
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
      });

      const page = await context.newPage();

      // Authenticate the user
      await authenticateUser(page);

      // Create payment intent
      const paymentIntent = await createMockPaymentIntent({
        amount: 15.5,
        currency: "USD",
        description: "Mobile Payment Test",
        gateway: "payway",
      });

      // Navigate to payment page
      await page.goto(`/(main)/payment/payway/${paymentIntent.id}`);

      // Verify mobile-specific UI elements
      await expect(page.locator(".mobile-payment-wrapper")).toBeVisible();
      await expect(page.locator(".payment-summary")).toBeVisible();

      // Verify responsive design elements
      await expect(page.locator(".payment-form")).toHaveCSS(
        "max-width",
        /100%|device-width/
      );

      // Complete the payment
      await page.click('button:has-text("Pay Now")');

      // Handle PayWay checkout on mobile
      const paywayFrame =
        page.frameLocator("#payway-checkout-frame").first() || page;

      await paywayFrame.fill("#card-number", "4111111111111111");
      await paywayFrame.fill("#expiry", "12/25");
      await paywayFrame.fill("#cvc", "123");
      await paywayFrame.click('button[type="submit"]');

      // Verify successful payment on mobile
      await page.waitForURL(/\/payment\/confirmation/);
      await expect(page.locator(".payment-status")).toContainText(
        "Payment Successful"
      );

      // Clean up the context
      await context.close();
    });

    test(`Bakong QR payment on ${viewport.name} viewport`, async ({
      browser,
    }) => {
      // Create a new context with mobile viewport
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
      });

      const page = await context.newPage();

      // Authenticate the user
      await authenticateUser(page);

      // Create payment intent for Bakong
      const paymentIntent = await createMockPaymentIntent({
        amount: 25.75,
        currency: "USD",
        description: "Mobile Bakong Test",
        gateway: "bakong",
        phoneNumber: "85510123456", // Valid Cambodian number
      });

      // Navigate to payment page
      await page.goto(`/(main)/payment/bakong/${paymentIntent.id}`);

      // Verify mobile-specific UI elements for Bakong
      await expect(page.locator(".qr-container")).toBeVisible();
      await expect(page.locator(".mobile-instructions")).toBeVisible();

      // Verify QR code is displayed properly on mobile
      await expect(page.locator(".qr-code-image")).toBeVisible();
      await expect(page.locator(".bakong-app-button")).toBeVisible();

      // Test deep link functionality (specific to mobile)
      await page.click(".bakong-app-button");

      // Since we can't fully test external app launch in Playwright,
      // we'll verify the deep link is correctly formatted
      const deepLinkHref = await page
        .locator(".bakong-app-button")
        .getAttribute("href");
      expect(deepLinkHref).toContain("bakongapp://");

      // Clean up the context
      await context.close();
    });
  }
});
