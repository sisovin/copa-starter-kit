/**
 * Accessibility Testing Setup
 *
 * This file sets up accessibility testing with axe-core for Playwright
 */

import { PlaywrightTestConfig, devices } from "@playwright/test";
import { join } from "path";
import * as fs from "fs";

// Configuration for axe-core integration
export const playwrightAccessibilityConfig: PlaywrightTestConfig = {
  use: {
    ignoreHTTPSErrors: true,
    baseURL: "http://localhost:3000",
    trace: "on",
    // Load axe-core before each test that needs it
    launchOptions: {
      args: ["--disable-web-security"],
    },
  },
  // Setup for accessibility reports
  reporter: [
    ["html", { outputFolder: "./test-results/accessibility/html-report" }],
    ["json", { outputFile: "./test-results/accessibility/results.json" }],
  ],
};

// Helper function to generate accessibility reports
export async function generateAccessibilityReport(
  testName: string,
  violations: any[],
  screenshotPath?: string
) {
  const reportsDir = join(
    process.cwd(),
    "test-results",
    "accessibility",
    "reports"
  );

  // Create directory if it doesn't exist
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const report = {
    testName,
    timestamp: new Date().toISOString(),
    violations: violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      description: v.help,
      helpUrl: v.helpUrl,
      nodes: v.nodes.map((n) => ({
        html: n.html,
        target: n.target,
      })),
    })),
    screenshotPath,
  };

  const reportPath = join(
    reportsDir,
    `${testName.replace(/\s+/g, "-")}-${Date.now()}.json`
  );
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  return reportPath;
}

// Devices to test for accessibility
export const accessibilityDevices = [
  devices["Desktop Chrome"],
  devices["Desktop Firefox"],
  devices["iPhone 13"],
  devices["Galaxy S9+"],
];

// WCAG test rules by level
export const wcagRules = {
  aa: {
    // Core rules for WCAG 2.1 AA
    "color-contrast": { enabled: true },
    "aria-allowed-role": { enabled: true },
    "aria-required-children": { enabled: true },
    "aria-required-parent": { enabled: true },
    "aria-roles": { enabled: true },
    "aria-valid-attr-value": { enabled: true },
    "aria-valid-attr": { enabled: true },
    "button-name": { enabled: true },
    bypass: { enabled: true },
    "document-title": { enabled: true },
    "form-field-multiple-labels": { enabled: true },
    "frame-title": { enabled: true },
    "heading-order": { enabled: true },
    "html-has-lang": { enabled: true },
    "html-lang-valid": { enabled: true },
    "image-alt": { enabled: true },
    label: { enabled: true },
    "link-name": { enabled: true },
    list: { enabled: true },
    listitem: { enabled: true },
    "meta-viewport": { enabled: true },
  },
  aaa: {
    // Adds WCAG 2.1 AAA rules on top of AA
    ...this.aa,
    "color-contrast-enhanced": { enabled: true },
    "landmark-complementary-is-top-level": { enabled: true },
    "landmark-unique": { enabled: true },
    "p-as-heading": { enabled: true },
  },
};

// Helper to inject axe-core into the page
export async function injectAxe(page: any) {
  await page.addScriptTag({
    path: require.resolve("axe-core/axe.min.js"),
  });
}

// Helper to run axe and return violations
export async function checkAccessibility(page: any, context: string = null) {
  return await page.evaluate((context) => {
    return window.axe.run(context || document, {
      rules: wcagRules.aa,
    });
  }, context);
}
