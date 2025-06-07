/**
 * PayWay Mock Server
 *
 * This module provides a mock implementation of the PayWay API for testing purposes.
 * It can simulate various scenarios like delayed responses, invalid signatures, and error conditions.
 */

import express from "express";
import crypto from "crypto";
import bodyParser from "body-parser";

// Mock database for storing transactions
const transactions = new Map();
const paymentPages = new Map();

// Configurable options for simulating different behaviors
interface MockServerConfig {
  responseDelay?: number; // Milliseconds of artificial delay
  invalidSignatureRate?: number; // 0-1 probability of returning invalid signatures
  errorRate?: number; // 0-1 probability of returning 500 errors
  webhookDelay?: number; // Milliseconds to delay webhooks
  environment: "development" | "staging" | "production";
}

let config: MockServerConfig = {
  responseDelay: 0,
  invalidSignatureRate: 0,
  errorRate: 0,
  webhookDelay: 0,
  environment: "development",
};

// Create the mock server
export function createPayWayMockServer(
  port = 3100,
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
          message: "PayWay server error (simulated)",
        });
      }, Math.random() * 1000); // Random delay for errors
    }

    // Apply configured response delay
    setTimeout(next, config.responseDelay);
  });

  // Create transaction endpoint
  app.post("/api/payment-gateway/v1/payments/create", (req, res) => {
    const { merchant, transactionId, amount, currency, returnUrl, customer } =
      req.body;

    // Basic validation
    if (!merchant || !transactionId || !amount || !currency || !returnUrl) {
      return res.status(400).json({
        status: 400,
        message: "Missing required fields",
      });
    }

    // Create mock transaction
    const transaction = {
      id: transactionId,
      merchant,
      amount,
      currency,
      customer,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      updatedAt: null,
      completedAt: null,
    };

    // Store transaction
    transactions.set(transactionId, transaction);

    // Generate checkout URL
    const checkoutUrl = `http://localhost:${port}/checkout/${transactionId}`;
    paymentPages.set(transactionId, {
      returnUrl,
      transaction,
    });

    // Simulate invalid signature based on configuration
    let signature = "";
    if (Math.random() < config.invalidSignatureRate) {
      signature = "invalid_signature_for_testing";
    } else {
      // Generate a proper signature
      const signatureBase = `${merchant}|${transactionId}|${amount}|${currency}`;
      signature = crypto
        .createHmac("sha256", "mock_secret_key")
        .update(signatureBase)
        .digest("hex");
    }

    // Return success response
    res.json({
      status: 200,
      message: "Transaction created successfully",
      response: {
        transactionId: transactionId,
        checkoutUrl: checkoutUrl,
        signature: signature,
      },
    });
  });

  // Check transaction status endpoint
  app.get(
    "/api/payment-gateway/v1/payments/:transactionId/status",
    (req, res) => {
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
          status: transaction.status,
          createdAt: transaction.createdAt,
          completedAt: transaction.completedAt || null,
        },
      });
    }
  );

  // Refund endpoint
  app.post(
    "/api/payment-gateway/v1/payments/:transactionId/refund",
    (req, res) => {
      const { transactionId } = req.params;
      const { amount, description } = req.body;

      // Check if transaction exists
      const transaction = transactions.get(transactionId);
      if (!transaction) {
        return res.status(404).json({
          status: 404,
          message: "Transaction not found",
        });
      }

      // Check if transaction can be refunded
      if (transaction.status !== "APPROVED") {
        return res.status(400).json({
          status: 400,
          message: "Transaction cannot be refunded - must be in APPROVED state",
        });
      }

      // Create refund transaction
      const refundId = `refund_${Date.now()}`;
      const refundAmount = amount || transaction.amount;

      // Update original transaction
      transaction.status = "REFUNDED";
      transaction.updatedAt = new Date().toISOString();

      // Return success response
      res.json({
        status: 200,
        message: "Refund processed successfully",
        response: {
          transactionId: transaction.id,
          refundTransactionId: refundId,
          amount: refundAmount,
          status: "APPROVED",
          description: description || "Refund",
        },
      });
    }
  );

  // Mock checkout page for testing
  app.get("/checkout/:transactionId", (req, res) => {
    const { transactionId } = req.params;

    // Check if checkout page exists
    const paymentPage = paymentPages.get(transactionId);
    if (!paymentPage) {
      return res.status(404).send("Checkout page not found");
    }

    // Render mock checkout page with form
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>PayWay Checkout (Mock)</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; }
            .header { background: #f8f8f8; padding: 10px; border-radius: 8px 8px 0 0; margin: -20px -20px 20px; }
            .form-group { margin-bottom: 15px; }
            label { display: block; margin-bottom: 5px; }
            input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
            button { background: #007bff; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
            .amount { font-size: 24px; text-align: center; margin: 20px 0; }
            .environment { position: absolute; top: 10px; right: 10px; padding: 5px 10px; background: #ff7700; color: white; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="environment">${config.environment}</div>
          <div class="card">
            <div class="header">
              <h2>PayWay Checkout</h2>
            </div>
            <div class="amount">
              ${paymentPage.transaction.currency} ${paymentPage.transaction.amount}
            </div>
            <form id="payment-form" method="post" action="/process-payment/${transactionId}">
              <div class="form-group">
                <label for="card-number">Card Number</label>
                <input type="text" id="card-number" name="cardNumber" placeholder="4111 1111 1111 1111" required>
              </div>
              <div class="form-group">
                <label for="expiry">Expiry Date (MM/YY)</label>
                <input type="text" id="expiry" name="expiry" placeholder="12/25" required>
              </div>
              <div class="form-group">
                <label for="cvc">CVC</label>
                <input type="text" id="cvc" name="cvc" placeholder="123" required>
              </div>
              <button type="submit">Pay Now</button>
            </form>
          </div>
          
          <script>
            // Simulate form submission
            document.getElementById('payment-form').addEventListener('submit', function(e) {
              e.preventDefault();
              
              // Show processing message
              this.innerHTML = '<div style="text-align: center;"><h3>Processing payment...</h3><p>Please wait...</p></div>';
              
              // Submit the form after a short delay
              setTimeout(() => {
                this.submit();
              }, 2000);
            });
          </script>
        </body>
      </html>
    `);
  });

  // Process payment endpoint (simulates the form submission)
  app.post("/process-payment/:transactionId", (req, res) => {
    const { transactionId } = req.params;

    // Check if checkout page exists
    const paymentPage = paymentPages.get(transactionId);
    if (!paymentPage) {
      return res.status(404).send("Payment not found");
    }

    // Update transaction status
    const transaction = transactions.get(transactionId);
    transaction.status = "APPROVED";
    transaction.updatedAt = new Date().toISOString();
    transaction.completedAt = new Date().toISOString();

    // Send webhook if configured (asynchronously)
    if (paymentPage.returnUrl) {
      setTimeout(() => {
        sendWebhook(transaction, paymentPage.returnUrl);
      }, config.webhookDelay);
    }

    // Redirect to return URL with successful payment
    const redirectUrl = new URL(paymentPage.returnUrl);
    redirectUrl.searchParams.append("tran_id", transactionId);
    redirectUrl.searchParams.append("status", "APPROVED");

    res.redirect(redirectUrl.toString());
  });

  // Helper function to send webhooks
  function sendWebhook(transaction, webhookUrl) {
    // Build webhook payload
    const payload = {
      transactionId: transaction.id,
      merchantId: transaction.merchant,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      timeCreated: transaction.createdAt,
      timeCompleted: transaction.completedAt,
    };

    // Generate signature
    const signatureBase = `${transaction.merchant}|${transaction.id}|${transaction.amount}|${transaction.status}`;
    const signature = crypto
      .createHmac("sha256", "mock_webhook_secret")
      .update(signatureBase)
      .digest("hex");

    payload.signature = signature;

    // Send webhook via HTTP POST (this is a mock, we'll just log it)
    console.log(`[PayWay Mock] Sending webhook to ${webhookUrl}:`, payload);

    // In a real implementation, you would use fetch or axios to actually send the webhook
    // fetch(webhookUrl, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload)
    // });
  }

  // Configuration endpoint for testing
  app.post("/admin/config", (req, res) => {
    config = { ...config, ...req.body };
    res.json({ status: "ok", config });
  });

  // Start the server
  const server = app.listen(port, () => {
    console.log(`PayWay mock server running at http://localhost:${port}`);
  });

  return { app, server, config };
}

// Allow direct execution for testing
if (require.main === module) {
  createPayWayMockServer();
}
