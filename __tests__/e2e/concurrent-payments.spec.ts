import { test, expect, Browser, BrowserContext, Page } from "@playwright/test";
import { createMockPaymentIntent } from "../mocks/payment-helpers";

/**
 * Concurrent Payment Tests
 *
 * Tests how the system handles multiple concurrent payment attempts
 * for the same payment intent from different browser sessions
 */

async function authenticateUser(page: Page, email = "test@example.com") {
  await page.goto("/sign-in");
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', "Password123");
  await page.click('button[type="submit"]');
  await page.waitForURL("/dashboard");
}

test.describe("Concurrent Payment Attempts", () => {
  test("Should prevent multiple payments for the same intent with PayWay", async ({
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

    // Authenticate both sessions (could be same or different users)
    await authenticateUser(page1, "user1@example.com");
    await authenticateUser(page2, "user2@example.com");

    // Navigate both pages to the same payment
    await page1.goto(`/(main)/payment/payway/${paymentIntent.id}`);
    await page1.waitForSelector(".payment-amount");

    await page2.goto(`/(main)/payment/payway/${paymentIntent.id}`);
    await page2.waitForSelector(".payment-amount");

    // Start payment process on first page
    await page1.click('button:has-text("Pay Now")');

    // Small wait to ensure first payment is registered
    await page1.waitForTimeout(500);

    // Attempt to start payment process on second page
    await page2.click('button:has-text("Pay Now")');

    // Second page should show locked/in-progress message
    await expect(page2.locator(".payment-in-progress-message")).toBeVisible();
    await expect(page2.locator(".payment-in-progress-message")).toContainText(
      "Payment is being processed in another session"
    );

    // Complete payment in first session
    const paywayFrame =
      page1.frameLocator("#payway-checkout-frame").first() || page1;

    await paywayFrame.fill("#card-number", "4111111111111111");
    await paywayFrame.fill("#expiry", "12/25");
    await paywayFrame.fill("#cvc", "123");
    await paywayFrame.click('button[type="submit"]');

    // First page should reach success page
    await page1.waitForURL(/\/payment\/confirmation/);
    await expect(page1.locator(".payment-status")).toContainText(
      "Payment Successful"
    );

    // Second page should now show payment already completed
    await page2.reload();
    await expect(page2.locator(".payment-already-complete")).toBeVisible();

    // Clean up
    await context1.close();
    await context2.close();
  });

  test("Should handle concurrent attempts from different devices/browsers", async ({
    browser,
  }) => {
    // Create payment intent
    const paymentIntent = await createMockPaymentIntent({
      amount: 35.0,
      currency: "USD",
      description: "Multi-Device Concurrent Test",
      gateway: "bakong",
    });

    // Simulate desktop browser
    const desktopContext = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
    });

    // Simulate mobile browser
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 667 },
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
    });

    const desktopPage = await desktopContext.newPage();
    const mobilePage = await mobileContext.newPage();

    // Authenticate both sessions (same account accessing from different devices)
    await authenticateUser(desktopPage);
    await authenticateUser(mobilePage);

    // Navigate both to the same Bakong payment
    await desktopPage.goto(`/(main)/payment/bakong/${paymentIntent.id}`);
    await mobilePage.goto(`/(main)/payment/bakong/${paymentIntent.id}`);

    // Both should see QR code initially
    await expect(desktopPage.locator(".qr-code-image")).toBeVisible();
    await expect(mobilePage.locator(".qr-code-image")).toBeVisible();

    // Simulate payment initiation from desktop
    await desktopPage.click('button:has-text("Pay Now")');

    // Mobile should show notification that payment is in progress elsewhere
    await mobilePage.reload();
    await expect(
      mobilePage.locator(".concurrent-session-notice")
    ).toBeVisible();

    // Simulate successful payment completion
    // This would normally come from a webhook, but we'll simulate it directly
    const webhookResponse = await desktopPage.request.post(
      `/api/bakong/mock-webhook`,
      {
        data: {
          transactionId: paymentIntent.id,
          status: "PAID",
        },
      }
    );
    expect(webhookResponse.ok()).toBeTruthy();

    // Desktop should show success
    await desktopPage.reload();
    await expect(desktopPage.locator(".payment-success")).toBeVisible();

    // Mobile should also show success after reload
    await mobilePage.reload();
    await expect(mobilePage.locator(".payment-success")).toBeVisible();

    // Clean up
    await desktopContext.close();
    await mobileContext.close();
  });

  test("Should handle race conditions with multiple browsers submitting payments", async ({
    browser,
  }) => {
    // Create a test payment intent
    const paymentIntent = await createMockPaymentIntent({
      amount: 45.0,
      currency: "USD",
      description: "Race Condition Test",
      gateway: "payway",
    });

    // Create 3 browser contexts to simulate 3 concurrent sessions
    const contexts = [
      await browser.newContext(),
      await browser.newContext(),
      await browser.newContext(),
    ];

    const pages = await Promise.all(
      contexts.map(async (context) => {
        const page = await context.newPage();
        await authenticateUser(page);
        return page;
      })
    );

    // Load the same payment page in all three browsers
    await Promise.all(
      pages.map((page) =>
        page.goto(`/(main)/payment/payway/${paymentIntent.id}`)
      )
    );

    // Click Pay Now simultaneously on all three pages
    await Promise.all(
      pages.map((page) => page.click('button:has-text("Pay Now")'))
    );

    // Verify that only one session can proceed (should get the lock)
    // The other two should see an error message
    let successfulSessionsCount = 0;
    let blockedSessionsCount = 0;

    // Give a little time for all sessions to attempt getting the lock
    await pages[0].waitForTimeout(2000);

    for (const page of pages) {
      const isCheckoutVisible = await page
        .locator("#payway-checkout-frame")
        .isVisible();
      const isErrorVisible = await page
        .locator(".payment-in-progress-message")
        .isVisible();

      if (isCheckoutVisible) {
        successfulSessionsCount++;
      }

      if (isErrorVisible) {
        blockedSessionsCount++;
      }
    }

    // Only one session should succeed, the others should be blocked
    expect(successfulSessionsCount).toBe(1);
    expect(blockedSessionsCount).toBe(2);

    // Clean up
    await Promise.all(contexts.map((context) => context.close()));
  });
});
