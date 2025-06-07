import { test, expect, Page } from "@playwright/test";
import { createMockPaymentIntent } from "../mocks/payment-helpers";

/**
 * Accessibility Tests for Payment Pages
 * Validates WCAG 2.1 AA compliance for payment pages
 */

// TypeScript interface for accessibility violations
interface AccessibilityViolation {
  id: string;
  impact: "minor" | "moderate" | "serious" | "critical";
  help: string;
  helpUrl: string;
  nodes: any[];
}

interface AxeResults {
  violations: AccessibilityViolation[];
  passes: any[];
  incomplete: any[];
  inapplicable: any[];
}

// Helper for authenticated user
async function authenticateUser(page: Page) {
  await page.goto("/sign-in");
  await page.fill('[name="email"]', "test@example.com");
  await page.fill('[name="password"]', "Password123");
  await page.click('button[type="submit"]');
  await page.waitForURL("/dashboard");
}

test.describe("Accessibility Tests - WCAG 2.1 AA", () => {
  test.beforeEach(async ({ page }) => {
    // Load axe-core accessibility testing library
    await page.addInitScript({
      path: require.resolve("axe-core"),
    });
  });

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
    const violations = (await page.evaluate(() => {
      // @ts-expect-error - axe is injected via script
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
    })) as AxeResults;

    // Check if there are any critical or serious violations
    const criticalViolations = violations.violations.filter(
      (v: AccessibilityViolation) =>
        v.impact === "critical" || v.impact === "serious"
    );

    expect(criticalViolations).toHaveLength(
      0,
      `Found ${criticalViolations.length} critical accessibility violations: ${criticalViolations
        .map((v: AccessibilityViolation) => v.help)
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
    const violations = (await page.evaluate(() => {
      // @ts-expect-error - axe is injected via script
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
    })) as AxeResults;

    // Check if there are any critical or serious violations
    const criticalViolations = violations.violations.filter(
      (v: AccessibilityViolation) =>
        v.impact === "critical" || v.impact === "serious"
    );

    expect(criticalViolations).toHaveLength(
      0,
      `Found ${criticalViolations.length} critical accessibility violations: ${criticalViolations
        .map((v: AccessibilityViolation) => v.help)
        .join(", ")}`
    );

    // Specific check for QR code accessibility
    const qrCodeAlt = await page.locator(".qr-code-image").getAttribute("alt");
    expect(qrCodeAlt).toBeTruthy();
    expect(qrCodeAlt).toContain("Bakong QR code");
  });

  test("Payment form input fields have proper labels and ARIA attributes", async ({
    page,
  }) => {
    await authenticateUser(page);

    const paymentIntent = await createMockPaymentIntent({
      amount: 19.99,
      currency: "USD",
      description: "Form Accessibility Test",
      gateway: "payway",
    });

    await page.goto(`/(main)/payment/payway/${paymentIntent.id}`);

    // Check that form fields have appropriate labels/ARIA attributes
    const cardNumberField = page.locator("#card-number");
    const expiryField = page.locator("#expiry");
    const cvcField = page.locator("#cvc");

    // Check for aria-labelledby or aria-label attributes
    expect(
      (await cardNumberField.getAttribute("aria-labelledby")) ||
        (await cardNumberField.getAttribute("aria-label"))
    ).toBeTruthy();

    expect(
      (await expiryField.getAttribute("aria-labelledby")) ||
        (await expiryField.getAttribute("aria-label"))
    ).toBeTruthy();

    expect(
      (await cvcField.getAttribute("aria-labelledby")) ||
        (await cvcField.getAttribute("aria-label"))
    ).toBeTruthy();

    // Check keyboard navigation works properly
    await cardNumberField.focus();
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => document.activeElement?.id)).toBe(
      "expiry"
    );

    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => document.activeElement?.id)).toBe("cvc");
  });
});
