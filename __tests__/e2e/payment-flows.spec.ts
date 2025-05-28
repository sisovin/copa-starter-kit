import { test, expect, Page, Browser } from "@playwright/test";
import { createMockPaymentIntent } from "../mocks/payment-helpers";

// Definition for accessibility violations
interface AccessibilityViolation {
  id: string;
  impact: "minor" | "moderate" | "serious" | "critical";
  help: string;
  helpUrl: string;
  nodes: any[];
}

/**
 * E2E Tests for PayWay and Bakong Payment Flows
 *
 * These tests cover:
 * 1. Happy path PayWay flow
 * 2. Bakong QR code failure case
 * 3. Concurrent payment attempts
 * 4. Webhook timeout scenarios
 */

// Authenticated user setup helper
async function authenticateUser(page: Page) {
  await page.goto("/sign-in");
  await page.fill('[name="email"]', "test@example.com");
  await page.fill('[name="password"]', "Password123");
  await page.click('button[type="submit"]');
  await page.waitForURL("/dashboard");
}

test.describe("PayWay Payment Flows", () => {
  test.beforeEach(async ({ page }) => {
    // Set up the authenticated user session
    await authenticateUser(page);
  });

  test("Happy path: successful PayWay payment flow", async ({ page }) => {
    // Create a payment intent for the test
    const paymentIntent = await createMockPaymentIntent({
      amount: 10.99,
      currency: "USD",
      description: "Test Product Purchase",
      gateway: "payway",
    });

    // Navigate to the payment page with the intent ID
    await page.goto(`/(main)/payment/payway/${paymentIntent.id}`);

    // Verify the payment details are correctly displayed
    await expect(page.locator(".payment-amount")).toContainText("$10.99");
    await expect(page.locator(".payment-description")).toContainText(
      "Test Product Purchase"
    );

    // Click the Pay Now button
    await page.click('button:has-text("Pay Now")');

    // Wait for the PayWay checkout to load in iframe or redirect
    await page.waitForSelector("#payway-checkout-frame, .payway-checkout-page");

    // Fill in the credit card details in the PayWay iframe/page
    // Note: If in an iframe, we'll need to use frame handling
    const paywayFrame =
      page.frameLocator("#payway-checkout-frame").first() || page;

    await paywayFrame.fill("#card-number", "4111111111111111");
    await paywayFrame.fill("#expiry", "12/25");
    await paywayFrame.fill("#cvc", "123");
    await paywayFrame.click('button[type="submit"]');

    // Wait for the payment to process and redirect back to confirmation page
    await page.waitForURL(/\/payment\/confirmation/);

    // Verify the success message
    await expect(page.locator(".payment-status")).toContainText(
      "Payment Successful"
    );

    // Check that the transaction ID is displayed
    await expect(page.locator(".transaction-id")).toBeVisible();
  });

  test("Concurrent payment attempts should be prevented", async ({
    browser,
  }) => {
    // Create payment intent
    const paymentIntent = await createMockPaymentIntent({
      amount: 25.0,
      currency: "USD",
      description: "Concurrent Payment Test",
      gateway: "payway",
    });

    // Open two browser contexts (simulating two tabs/windows)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    // Create pages for each context
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // Authenticate both sessions
    await authenticateUser(page1);
    await authenticateUser(page2);

    // Navigate both pages to the same payment
    await page1.goto(`/(main)/payment/payway/${paymentIntent.id}`);
    await page1.waitForSelector(".payment-amount");

    // Start payment process in first window
    await page1.click('button:has-text("Pay Now")');

    // Try to access the same payment in second window
    await page2.goto(`/(main)/payment/payway/${paymentIntent.id}`);

    // Should see a warning that payment is in progress elsewhere
    await expect(page2.locator(".alert-warning")).toContainText(
      "Payment in progress"
    );

    // Clean up
    await context1.close();
    await context2.close();
  });

  test("Webhook timeout scenario should display friendly error", async ({
    page,
  }) => {
    // Create a payment intent with a webhook timeout simulation flag
    const paymentIntent = await createMockPaymentIntent({
      amount: 15.5,
      currency: "USD",
      description: "Webhook Timeout Test",
      gateway: "payway",
      simulateWebhookTimeout: true,
    });

    // Navigate to the payment page with the intent ID
    await page.goto(`/(main)/payment/payway/${paymentIntent.id}`);

    // Verify the payment details are correctly displayed
    await expect(page.locator(".payment-amount")).toContainText("$15.50");

    // Click the Pay Now button
    await page.click('button:has-text("Pay Now")');

    // Complete payment in the PayWay checkout frame
    const paywayFrame =
      page.frameLocator("#payway-checkout-frame").first() || page;
    await paywayFrame.fill("#card-number", "4111111111111111");
    await paywayFrame.fill("#expiry", "12/25");
    await paywayFrame.fill("#cvc", "123");
    await paywayFrame.click('button[type="submit"]');

    // Should redirect to a "payment processing" page due to webhook timeout
    await page.waitForURL(/\/payment\/processing/);

    // Should display appropriate message about delayed confirmation
    await expect(page.locator(".payment-status")).toContainText(
      "Payment is being processed"
    );
    await expect(page.locator(".payment-instructions")).toContainText(
      "You will receive a confirmation"
    );
  });
});

test.describe("Bakong Payment Flows", () => {
  test.beforeEach(async ({ page }) => {
    // Set up the authenticated user session
    await authenticateUser(page);
  });

  test("Bakong QR code failure case should display helpful error", async ({
    page,
  }) => {
    // Create payment intent for Bakong
    const paymentIntent = await createMockPaymentIntent({
      amount: 100000, // 100,000 KHR
      currency: "KHR",
      description: "Bakong QR Test",
      gateway: "bakong",
      simulateQrFailure: true,
    });

    // Navigate to the Bakong payment page
    await page.goto(`/(main)/payment/bakong/${paymentIntent.id}`);

    // Verify the payment details
    await expect(page.locator(".payment-amount")).toContainText("100,000 KHR");

    // Click to generate QR code
    await page.click('button:has-text("Generate QR Code")');

    // Should display QR code error message
    await expect(page.locator(".error-message")).toBeVisible();
    await expect(page.locator(".error-message")).toContainText(
      "Unable to generate QR code"
    );

    // Should offer alternative payment method
    await expect(
      page.locator('a:has-text("Try PayWay Instead")')
    ).toBeVisible();
  });
});

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

test.describe("Accessibility Tests", () => {
  test("PayWay payment page meets WCAG 2.1 AA standards", async ({ page }) => {
    // Authenticate the user
    await authenticateUser(page);

    // Create payment intent
    const paymentIntent = await createMockPaymentIntent({
      amount: 29.99,
      currency: "USD",
      description: "Accessibility Test",
      gateway: "payway",
    });

    // Navigate to the payment page
    await page.goto(`/(main)/payment/payway/${paymentIntent.id}`);

    // Wait for the page to be fully loaded
    await page.waitForSelector(".payment-form", { state: "visible" });

    // Perform accessibility audit using axe-core (integrated with Playwright)
    const violations = await page.evaluate(() => {
      // @ts-ignore - axe is injected via the a11y plugin configuration
      return window.axe.run(document, {
        rules: {
          "color-contrast": { enabled: true },
          "html-has-lang": { enabled: true },
          "image-alt": { enabled: true },
          label: { enabled: true },
          "form-field-multiple-labels": { enabled: true },
          "landmark-one-main": { enabled: true },
          region: { enabled: true },
          "page-has-heading-one": { enabled: true },
        },
      });
    });

    // Check if there are any critical or serious violations
    const criticalViolations = violations.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    expect(criticalViolations).toHaveLength(
      0,
      `Found ${criticalViolations.length} critical accessibility violations: ${criticalViolations
        .map((v) => v.help)
        .join(", ")}`
    );
  });

  test("Bakong QR payment page meets WCAG 2.1 AA standards", async ({
    page,
  }) => {
    // Authenticate the user
    await authenticateUser(page);

    // Create payment intent for Bakong
    const paymentIntent = await createMockPaymentIntent({
      amount: 35.5,
      currency: "USD",
      description: "Accessibility Test",
      gateway: "bakong",
    });

    // Navigate to the payment page
    await page.goto(`/(main)/payment/bakong/${paymentIntent.id}`);

    // Wait for the QR code to be displayed
    await page.waitForSelector(".qr-code-image", { state: "visible" });

    // Perform accessibility audit using axe-core
    const violations = await page.evaluate(() => {
      // @ts-ignore - axe is injected via the a11y plugin configuration
      return window.axe.run(document, {
        rules: {
          "color-contrast": { enabled: true },
          "html-has-lang": { enabled: true },
          "image-alt": { enabled: true },
          label: { enabled: true },
          "form-field-multiple-labels": { enabled: true },
          "landmark-one-main": { enabled: true },
          region: { enabled: true },
          "page-has-heading-one": { enabled: true },
        },
      });
    });

    // Check if there are any critical or serious violations
    const criticalViolations = violations.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    expect(criticalViolations).toHaveLength(
      0,
      `Found ${criticalViolations.length} critical accessibility violations: ${criticalViolations
        .map((v) => v.help)
        .join(", ")}`
    );

    // Specific check for QR code accessibility
    const qrCodeAlt = await page.locator(".qr-code-image").getAttribute("alt");
    expect(qrCodeAlt).toBeTruthy();
    expect(qrCodeAlt).toContain("Bakong QR code");
  });
});
