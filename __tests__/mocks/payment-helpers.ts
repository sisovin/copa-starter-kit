/**
 * Payment Testing Helpers
 *
 * This module provides helper functions for creating and managing mock payment intents
 * during automated testing.
 */

export interface MockPaymentIntent {
  id: string;
  amount: number;
  currency: string;
  description: string;
  gateway: "payway" | "bakong";
  status: string;
  createdAt: string;
  updatedAt: string | null;
  meta?: Record<string, any>;
}

interface CreatePaymentOptions {
  amount: number;
  currency: string;
  description: string;
  gateway: "payway" | "bakong";
  phoneNumber?: string;
  simulateQrFailure?: boolean;
  simulateWebhookTimeout?: boolean;
}

/**
 * Creates a mock payment intent for testing
 */
export async function createMockPaymentIntent(
  options: CreatePaymentOptions
): Promise<MockPaymentIntent> {
  // In a real test environment, we would make an API call to a test endpoint
  // For the purpose of this mock, we'll simulate the response

  const id = `test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // For simulation, store any test parameters in meta
  const meta: Record<string, any> = {};

  if (options.simulateQrFailure) {
    meta.simulateQrFailure = true;
  }

  if (options.simulateWebhookTimeout) {
    meta.simulateWebhookTimeout = true;
  }

  if (options.phoneNumber) {
    meta.phoneNumber = options.phoneNumber;
  }

  // Create the mock payment intent
  const paymentIntent: MockPaymentIntent = {
    id,
    amount: options.amount,
    currency: options.currency,
    description: options.description,
    gateway: options.gateway,
    status: "created",
    createdAt: new Date().toISOString(),
    updatedAt: null,
    meta,
  };

  // In a real test environment, this would be stored in a test database or in-memory store
  // For mock purposes, we'll just return it
  return paymentIntent;
}

/**
 * Gets the current status of a payment intent
 */
export async function getPaymentStatus(paymentId: string): Promise<string> {
  // In a real test, this would query the API or database
  // For now, we'll just return a mock status
  return "created";
}

/**
 * Simulates updating the status of a payment
 */
export async function updatePaymentStatus(
  paymentId: string,
  newStatus: string
): Promise<void> {
  // In a real test, this would update the status via API
  console.log(`[Test] Updated payment ${paymentId} to ${newStatus}`);
}
