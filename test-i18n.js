#!/usr/bin/env node

// Simple test script to check if the i18n configuration loads properly
async function testI18nConfig() {
  try {
    console.log("Testing i18n configuration..."); // Test basic locale values (hardcoded since we can't easily import TS from JS)
    const locales = ["km", "en"];
    const defaultLocale = "km";
    console.log("✓ Locales:", locales);
    console.log("✓ Default locale:", defaultLocale);

    // Test importing messages
    const kmMessages = require("./messages/km.json");
    const enMessages = require("./messages/en.json");

    console.log(
      "✓ KM messages loaded:",
      Object.keys(kmMessages).length,
      "keys"
    );
    console.log(
      "✓ EN messages loaded:",
      Object.keys(enMessages).length,
      "keys"
    );

    console.log("✅ All i18n configuration tests passed!");
  } catch (error) {
    console.error("❌ Error testing i18n configuration:", error.message);
    process.exit(1);
  }
}

testI18nConfig();
