/**
 * QR Code Helper Functions
 *
 * This module provides utilities for QR code generation in tests.
 * For actual QR code generation, you would use a library like qrcode.
 */

/**
 * Creates a QR code from the given payload
 *
 * In a real implementation, this would generate an actual QR code.
 * For testing purposes, we'll return a string representation.
 */
export function createQRCode(data: string): string {
  // In a real implementation, you would use a library like 'qrcode'
  // to generate an actual QR code image or string

  // For testing, we'll return a simplified text representation
  return `QR[${data}]`;
}

/**
 * Validates the format of a Bakong QR code payload
 */
export function validateQRPayload(payload: string): boolean {
  // Basic validation of EMVCo QR code format
  // Real implementation would validate according to NBC standards
  return payload.startsWith("00020101021229");
}

/**
 * Generates a realistic Bakong QR code payload based on payment details
 *
 * Format follows the EMVCo QR Code specification used by Bakong
 */
export function generateBakongQRPayload(options: {
  amount: number;
  currency: string;
  merchantId: string;
  transactionId: string;
  expiryMinutes?: number;
}): string {
  const {
    amount,
    currency,
    merchantId,
    transactionId,
    expiryMinutes = 15,
  } = options;

  // Format amount as string with 2 decimal places, no separators
  const formattedAmount = amount.toFixed(2).replace(".", "");

  // Calculate expiry time
  const now = new Date();
  const expiryTime = new Date(now.getTime() + expiryMinutes * 60 * 1000);
  const formattedExpiry = expiryTime
    .toISOString()
    .replace(/[-:T.Z]/g, "")
    .substring(0, 14);

  // Build EMVCo QR code payload (simplified version)
  // Format: EMV tag (2 digits) + length (2 digits) + value

  // Root - Payload Format Indicator
  const payloadFormatIndicator = "000201"; // 00 (tag) + 02 (length) + 01 (value)

  // Point of Initiation Method - Static
  const pointOfInitiationMethod = "010211"; // 01 (tag) + 02 (length) + 11 (static QR)

  // Merchant Account Info for Bakong
  const merchantAccountTag = "29";
  const merchantAccountData = `00${merchantId}01${transactionId}`;
  const merchantAccountInfo = `${merchantAccountTag}${merchantAccountData.length.toString().padStart(2, "0")}${merchantAccountData}`;

  // Transaction Currency - KHR (116) or USD (840)
  const currencyCode = currency === "KHR" ? "116" : "840";
  const transactionCurrency = `5303${currencyCode}`;

  // Transaction Amount
  const transactionAmount = `54${formattedAmount.length.toString().padStart(2, "0")}${formattedAmount}`;

  // Country Code - Cambodia (KH)
  const countryCode = "5802KH";

  // Merchant Name (placeholder)
  const merchantName = "5913BAKONG TEST";

  // Expiry
  const expiryField = `8008${formattedExpiry}`;

  // Combine all fields
  const qrPayload =
    payloadFormatIndicator +
    pointOfInitiationMethod +
    merchantAccountInfo +
    transactionCurrency +
    transactionAmount +
    countryCode +
    merchantName +
    expiryField;

  return qrPayload;
}

/**
 * Simulates creating a QR code image for testing
 * In real implementation, you would use a library like qrcode
 */
export function createQRImageUrl(payload: string): string {
  // In a real implementation, you would generate an actual QR code
  // For tests, we'll return a fake data URL that represents a QR

  const fakeQrBase64 =
    "R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="; // Tiny transparent GIF

  return `data:image/gif;base64,${fakeQrBase64}#${payload}`;
}

/**
 * Simulates QR code failure cases
 */
export function simulateQRError(
  errorType: "generation" | "format" | "expired" | "server"
): Error {
  switch (errorType) {
    case "generation":
      return new Error("Failed to generate QR code: internal processing error");
    case "format":
      return new Error("Invalid QR code format: missing required fields");
    case "expired":
      return new Error("QR code has expired");
    case "server":
      return new Error("Server error: unable to connect to Bakong service");
    default:
      return new Error("Unknown QR code error");
  }
}

/**
 * Creates a deep link for Bakong app
 */
export function createBakongDeepLink(payload: string): string {
  return `bakongapp://qr?data=${encodeURIComponent(payload)}`;
}
