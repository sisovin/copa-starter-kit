/**
 * Bakong Mock Server
 *
 * This module provides a mock implementation of the Bakong API for testing purposes.
 * It can simulate QR code generation, status updates, and various error conditions.
 */

import express from "express";
import crypto from "crypto";
import bodyParser from "body-parser";
import { createQRCode } from "./qr-helpers";

// Mock database for storing transactions
const transactions = new Map();
const qrCodes = new Map();

// Configurable options for simulating different behaviors
interface MockServerConfig {
  responseDelay?: number; // Milliseconds of artificial delay
  errorRate?: number; // 0-1 probability of returning errors
  qrFailureRate?: number; // 0-1 probability of QR generation failures
  webhookDelay?: number; // Milliseconds to delay webhooks
  environment: "development" | "staging" | "production";
}

let config: MockServerConfig = {
  responseDelay: 0,
  errorRate: 0,
  qrFailureRate: 0,
  webhookDelay: 0,
  environment: "development",
};

// Simplified phone number validation for testing
function isValidPhoneNumber(phone: string): boolean {
  // Basic validation - should start with 855 and be 10-12 digits
  return /^(855|0)[1-9]\d{7,9}$/.test(phone);
}

// Create the mock server
export function createBakongMockServer(
  port = 3200,
  initialConfig: Partial<MockServerConfig> = {}
) {
  // Update configuration with any provided options
  config = { ...config, ...initialConfig };

  const app = express();
  app.use(bodyParser.json());

  // Middleware to simulate delays and errors
  app.use((req, res, next) => {
    // Simulate random server errors
    if (Math.random() < config.errorRate) {
      return setTimeout(() => {
        res.status(500).json({
          status: 500,
          message: "Bakong server error (simulated)",
        });
      }, Math.random() * 1000); // Random delay for errors
    }

    // Apply configured response delay
    setTimeout(next, config.responseDelay);
  });

  // Generate QR code endpoint
  app.post("/api/v1/transaction/qr/generate", (req, res) => {
    const { phoneNumber, amount, reference, currency, description } = req.body;

    // Basic validation
    if (!phoneNumber || !amount || !reference) {
      return res.status(400).json({
        status: 400,
        message: "Missing required fields",
      });
    }

    // Validate phone number
    if (!isValidPhoneNumber(phoneNumber)) {
      return res.status(400).json({
        status: 400,
        message: "Invalid phone number format",
      });
    }

    // Simulate QR generation failures
    if (Math.random() < config.qrFailureRate) {
      return res.status(500).json({
        status: 500,
        message: "Failed to generate QR code (simulated failure)",
      });
    }

    // Create transaction
    const transactionId = `qr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const transaction = {
      id: transactionId,
      phoneNumber,
      amount,
      currency: currency || "KHR",
      description: description || reference,
      reference,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: null,
      completedAt: null,
    };

    // Store transaction
    transactions.set(transactionId, transaction);

    // Generate mock QR code
    const qrPayload = createMockQRPayload(transaction);

    // Generate expiration timestamp (30 minutes from now)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    // Try to generate actual QR code if helper available
    let qrString = qrPayload;
    try {
      qrString = createQRCode(qrPayload);
      qrCodes.set(transactionId, qrString);
    } catch (err) {
      console.error("Error generating QR code:", err);
      // Fall back to the payload if QR generation fails
    }

    // Return success response
    res.json({
      status: 200,
      message: "QR code generated successfully",
      response: {
        transactionId: transactionId,
        qrString: qrString,
        expiresAt: expiresAt,
      },
    });
  });

  // Check transaction status endpoint
  app.get("/api/v1/transaction/:transactionId/status", (req, res) => {
    const { transactionId } = req.params;

    // Check if transaction exists
    const transaction = transactions.get(transactionId);
    if (!transaction) {
      return res.status(404).json({
        status: 404,
        message: "Transaction not found",
      });
    }

    // Return transaction status
    res.json({
      status: 200,
      message: "Transaction status retrieved successfully",
      response: {
        transactionId: transaction.id,
        amount: transaction.amount,
        currency: transaction.currency,
        reference: transaction.reference,
        status: transaction.status,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
        completedAt: transaction.completedAt || null,
      },
    });
  });

  // Admin endpoint to update transaction status (for testing)
  app.post("/admin/transaction/:transactionId/status", (req, res) => {
    const { transactionId } = req.params;
    const { status, webhookUrl } = req.body;

    // Check if transaction exists
    const transaction = transactions.get(transactionId);
    if (!transaction) {
      return res.status(404).json({
        status: 404,
        message: "Transaction not found",
      });
    }

    // Update transaction status
    transaction.status = status;
    transaction.updatedAt = new Date().toISOString();

    if (status === "completed") {
      transaction.completedAt = new Date().toISOString();
    }

    // Send webhook if URL provided
    if (webhookUrl) {
      setTimeout(() => {
        sendWebhook(transaction, webhookUrl);
      }, config.webhookDelay);
    }

    // Return updated transaction
    res.json({
      status: 200,
      message: "Transaction status updated",
      transaction: transaction,
    });
  });

  // Get QR code image endpoint
  app.get("/api/v1/qr/:transactionId", (req, res) => {
    const { transactionId } = req.params;

    // Check if QR code exists
    const qrString = qrCodes.get(transactionId);
    if (!qrString) {
      return res.status(404).json({
        status: 404,
        message: "QR code not found",
      });
    }

    // For a real implementation, we would generate and return a PNG
    // Since this is a mock, we'll just return text
    res.type("text/plain").send(qrString);
  });

  // Configuration endpoint for testing
  app.post("/admin/config", (req, res) => {
    config = { ...config, ...req.body };
    res.json({ status: "ok", config });
  });

  // Generate mock QR payload
  function createMockQRPayload(transaction) {
    return `00020101021229300012D156000000000510A93FO3230Q31280012D15600000001030812345678520441115802KH5915Bakong Test${transaction.amount}530376064${transaction.reference}`;
  }

  // Helper function to send webhooks
  function sendWebhook(transaction, webhookUrl) {
    // Build webhook payload
    const payload = {
      event: "payment.success",
      data: {
        transactionId: transaction.id,
        amount: transaction.amount,
        currency: transaction.currency,
        reference: transaction.reference,
        status: transaction.status,
        phoneNumber: transaction.phoneNumber,
        createdAt: transaction.createdAt,
        completedAt: transaction.completedAt,
      },
    };

    // Generate signature
    const signatureBase = `${transaction.id}|${transaction.status}|${transaction.amount}`;
    const signature = crypto
      .createHmac("sha256", "mock_webhook_secret")
      .update(signatureBase)
      .digest("hex");

    payload.signature = signature;

    // Send webhook via HTTP POST (this is a mock, we'll just log it)
    console.log(`[Bakong Mock] Sending webhook to ${webhookUrl}:`, payload);

    // In a real implementation, you would use fetch or axios to actually send the webhook
    // fetch(webhookUrl, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload)
    // });
  }

  // Start the server
  const server = app.listen(port, () => {
    console.log(`Bakong mock server running at http://localhost:${port}`);
  });

  return { app, server, config };
}

// Allow direct execution for testing
if (require.main === module) {
  createBakongMockServer();
}
