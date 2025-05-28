/**
 * PayWay Payment Gateway Utility Library
 *
 * This library provides utility functions for integrating with PayWay payment gateway,
 * including signature generation, webhook verification, API client, and error mapping.
 */

import crypto from "crypto";
import axios from "axios";

// Define types to work around axios type export issues
interface AxiosInstance {
  defaults: Record<string, unknown>;
  interceptors: {
    request: {
      use: (fn: (config: AxiosRequestConfig) => AxiosRequestConfig) => void;
    };
    response: {
      use: (
        onFulfilled: (response: AxiosResponse) => AxiosResponse,
        onRejected?: (error: AxiosError) => unknown
      ) => void;
    };
  };
  request<T = unknown>(config: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  get<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>>;
  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>>;
  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>>;
  delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>>;
}

// Common Axios types to better replace 'any'
interface AxiosRequestConfig {
  url?: string;
  method?: string;
  baseURL?: string;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  data?: unknown;
  timeout?: number;
  withCredentials?: boolean;
  responseType?: string;
  validateStatus?: (status: number) => boolean;
  [key: string]: unknown;
}

interface AxiosResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: AxiosRequestConfig;
}

interface AxiosError<T = unknown> {
  response?: {
    data: T;
    status: number;
    headers: Record<string, string>;
  };
  request?: XMLHttpRequest | null;
  message: string;
  config?: AxiosRequestConfig;
  code?: string;
  isAxiosError: boolean;
}

import { z } from "zod";

// ---------- Types ----------

/**
 * PayWay API Configuration
 */
export interface PayWayConfig {
  /** Merchant ID provided by PayWay */
  merchantId: string;
  /** API key for authentication */
  apiKey: string;
  /** Webhook secret for verifying callbacks */
  webhookSecret: string;
  /** Base URL for PayWay API (defaults to sandbox) */
  baseUrl?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
}

/**
 * PayWay payment status
 */
export type PayWayTransactionStatus =
  | "PENDING"
  | "APPROVED"
  | "FAILED"
  | "REJECTED";

/**
 * PayWay supported currencies
 */
export type PayWayCurrency = "USD" | "KHR";

/**
 * PayWay create transaction request
 * @example
 * ```
 * const request: PayWayCreateTransactionRequest = {
 *   merchant: "merchant_123",
 *   transactionId: "tx_abc123",
 *   amount: 10.50,
 *   currency: "USD",
 *   customer: {
 *     email: "customer@example.com",
 *     firstName: "John",
 *     lastName: "Doe"
 *   },
 *   returnUrl: "https://example.com/payment/complete",
 *   returnMethod: "GET"
 * };
 * ```
 */
export interface PayWayCreateTransactionRequest {
  /** Merchant identifier */
  merchant: string;
  /** Unique transaction ID for this payment */
  transactionId: string;
  /** Payment amount */
  amount: number;
  /** Currency code (USD or KHR) */
  currency: PayWayCurrency;
  /** Optional line items */
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  /** Customer information */
  customer: {
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    address?: string;
  };
  /** URL to redirect after payment completion */
  returnUrl: string;
  /** URL to redirect after successful payment - if different from returnUrl */
  continueSuccessUrl?: string;
  /** HTTP method for return redirect */
  returnMethod?: "GET" | "POST";
  /** Additional custom fields */
  customFields?: Record<string, string>;
}

/**
 * PayWay create transaction response
 */
export interface PayWayCreateTransactionResponse {
  status: number;
  message: string;
  response: {
    transactionId: string;
    checkoutUrl: string;
  };
}

/**
 * PayWay transaction status response
 */
export interface PayWayTransactionStatusResponse {
  status: number;
  message: string;
  response: {
    transactionId: string;
    amount: number;
    currency: string;
    status: PayWayTransactionStatus;
    description?: string;
    approvalCode?: string;
    paymentMethod?: string;
    paymentMethodName?: string;
    timeCreated?: string;
    timeCompleted?: string;
    refundedAmount?: number;
    refundStatus?: string;
    customer?: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
    };
  };
}

/**
 * PayWay webhook payload schema
 */
export interface PayWayWebhookPayload {
  transactionId: string;
  merchantId: string;
  amount: number;
  currency: string;
  status: PayWayTransactionStatus;
  approvalCode?: string;
  paymentMethod?: string;
  timeCreated: string;
  timeCompleted?: string;
  customFields?: Record<string, string>;
  signature: string;
}

/**
 * Refund request parameters
 */
export interface PayWayRefundRequest {
  transactionId: string;
  amount?: number; // If not provided, full amount will be refunded
  description?: string;
}

/**
 * PayWay refund response
 */
export interface PayWayRefundResponse {
  status: number;
  message: string;
  response: {
    transactionId: string;
    refundTransactionId: string;
    amount: number;
    status: string;
  };
}

/**
 * PayWay error response
 */
export interface PayWayErrorResponse {
  status: number;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Common PayWay error codes and messages
 */
export enum PayWayErrorCode {
  INVALID_MERCHANT = "INVALID_MERCHANT",
  INVALID_TRANSACTION = "INVALID_TRANSACTION",
  DUPLICATE_TRANSACTION = "DUPLICATE_TRANSACTION",
  INVALID_AMOUNT = "INVALID_AMOUNT",
  PAYMENT_DECLINED = "PAYMENT_DECLINED",
  EXPIRED = "EXPIRED",
  INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS",
  INVALID_CARD = "INVALID_CARD",
  UNAUTHORIZED = "UNAUTHORIZED",
}

// ---------- Validation Schema ----------

/**
 * Zod schema for validating webhook payloads
 */
export const PayWayWebhookSchema = z.object({
  transactionId: z.string(),
  merchantId: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.enum(["PENDING", "APPROVED", "FAILED", "REJECTED"]),
  approvalCode: z.string().optional(),
  paymentMethod: z.string().optional(),
  timeCreated: z.string(),
  timeCompleted: z.string().optional(),
  customFields: z.record(z.string()).optional(),
  signature: z.string(),
});

// ---------- Utility Functions ----------

/**
 * Generate HMAC signature for PayWay API requests
 * @param data - The data to sign
 * @param secret - The secret key for signing
 * @returns HMAC SHA-256 signature as hex string
 *
 * @example
 * ```
 * const data = JSON.stringify({ amount: 100, currency: "USD" });
 * const signature = generateSignature(data, "your-secret-key");
 * ```
 */
export function generateSignature(
  data: string | Record<string, unknown>,
  secret: string
): string {
  // Ensure data is a string
  const dataString = typeof data === "object" ? JSON.stringify(data) : data;

  // Create HMAC with SHA-256 algorithm
  return crypto.createHmac("sha256", secret).update(dataString).digest("hex");
}

/**
 * Verify PayWay webhook signature
 * @param payload - The webhook payload including the signature
 * @param secret - The webhook secret for verification
 * @returns boolean indicating if signature is valid
 *
 * @example
 * ```
 * const isValid = verifyWebhook(webhookPayload, process.env.PAYWAY_WEBHOOK_SECRET);
 * if (isValid) {
 *   // Process the webhook
 * } else {
 *   // Reject the webhook
 * }
 * ```
 */
export function verifyWebhook(
  payload: PayWayWebhookPayload,
  secret: string
): boolean {
  try {
    // Remove signature from the payload for verification
    const { signature, ...dataToVerify } = payload; // Sort keys alphabetically for consistent hashing
    const orderedData = Object.keys(dataToVerify)
      .sort()
      .reduce((obj: Record<string, unknown>, key: string) => {
        obj[key] = dataToVerify[key as keyof typeof dataToVerify];
        return obj;
      }, {});

    // Generate expected signature
    const expectedSignature = generateSignature(orderedData, secret);

    // Compare signatures using timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error("PayWay signature verification error:", error);
    return false;
  }
}

/**
 * Map PayWay error codes to human-readable messages
 * @param errorCode - PayWay error code
 * @returns Human-readable error message
 *
 * @example
 * ```
 * const errorMessage = getErrorMessage(PayWayErrorCode.DUPLICATE_TRANSACTION);
 * console.log(errorMessage); // "Transaction with this ID already exists"
 * ```
 */
export function getErrorMessage(errorCode: PayWayErrorCode | string): string {
  const errorMap: Record<string, string> = {
    [PayWayErrorCode.INVALID_MERCHANT]: "Invalid merchant credentials",
    [PayWayErrorCode.INVALID_TRANSACTION]: "Invalid transaction details",
    [PayWayErrorCode.DUPLICATE_TRANSACTION]:
      "Transaction with this ID already exists",
    [PayWayErrorCode.INVALID_AMOUNT]: "Invalid payment amount",
    [PayWayErrorCode.PAYMENT_DECLINED]: "Payment was declined by the issuer",
    [PayWayErrorCode.EXPIRED]: "Transaction has expired",
    [PayWayErrorCode.INSUFFICIENT_FUNDS]:
      "Insufficient funds in customer account",
    [PayWayErrorCode.INVALID_CARD]: "Invalid payment card information",
    [PayWayErrorCode.UNAUTHORIZED]: "Unauthorized access to PayWay API",
  };

  return errorMap[errorCode] || `Unknown error: ${errorCode}`;
}

/**
 * Currency conversion between USD and KHR
 * @param amount - The amount to convert
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 * @param exchangeRate - Custom exchange rate (optional)
 * @returns Converted amount
 *
 * @example
 * ```
 * // Convert 10 USD to KHR using default exchange rate
 * const amountInKHR = convertCurrency(10, "USD", "KHR");
 *
 * // Convert 40000 KHR to USD with custom exchange rate
 * const amountInUSD = convertCurrency(40000, "KHR", "USD", 4100);
 * ```
 */
export function convertCurrency(
  amount: number,
  fromCurrency: PayWayCurrency,
  toCurrency: PayWayCurrency,
  exchangeRate?: number
): number {
  // Default exchange rate: 1 USD = 4100 KHR (adjust based on current rates)
  const rate = exchangeRate || 4100;

  if (fromCurrency === toCurrency) {
    return amount;
  }

  if (fromCurrency === "USD" && toCurrency === "KHR") {
    return Math.round(amount * rate);
  }

  if (fromCurrency === "KHR" && toCurrency === "USD") {
    return parseFloat((amount / rate).toFixed(2));
  }

  throw new Error(
    `Unsupported currency conversion: ${fromCurrency} to ${toCurrency}`
  );
}

// ---------- PayWay API Client ----------

/**
 * PayWay API client for making payment requests
 *
 * @example
 * ```
 * // Initialize client
 * const payway = new PayWayClient({
 *   merchantId: "merchant_123",
 *   apiKey: "api_key_456",
 *   webhookSecret: "webhook_secret_789"
 * });
 *
 * // Create a payment
 * const payment = await payway.createPayment({
 *   transactionId: "tx_123",
 *   amount: 10.50,
 *   currency: "USD",
 *   customer: {
 *     email: "customer@example.com",
 *     firstName: "John",
 *     lastName: "Doe"
 *   },
 *   returnUrl: "https://example.com/success"
 * });
 *
 * // Check payment status
 * const status = await payway.checkStatus("tx_123");
 * ```
 */
export class PayWayClient {
  private readonly client: AxiosInstance;
  private readonly config: PayWayConfig;

  /**
   * Create a new PayWay API client
   * @param config - PayWay API configuration
   */ constructor(config: PayWayConfig) {
    this.config = {
      ...config,
      baseUrl:
        config.baseUrl ||
        "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1",
      timeout: config.timeout || 10000,
    };

    // Use type assertion to match our interface
    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
    }) as unknown as AxiosInstance; // Type assertion to match our interface

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError<unknown>) =>
        this.handleApiError(
          error as AxiosError<{ message?: string; errors?: unknown[] }>
        )
    );
  }

  /**
   * Create a new payment transaction
   * @param payment - Payment transaction details
   * @returns PayWay transaction response with checkout URL
   */
  public async createPayment(
    payment: Omit<PayWayCreateTransactionRequest, "merchant">
  ): Promise<PayWayCreateTransactionResponse> {
    const payload: PayWayCreateTransactionRequest = {
      ...payment,
      merchant: this.config.merchantId,
    };

    const response = await this.client.post<PayWayCreateTransactionResponse>(
      "/payments",
      payload
    );
    return response.data;
  }

  /**
   * Check status of an existing transaction
   * @param transactionId - The transaction ID to check
   * @returns Payment transaction status
   */
  public async checkStatus(
    transactionId: string
  ): Promise<PayWayTransactionStatusResponse> {
    const response = await this.client.get<PayWayTransactionStatusResponse>(
      `/payments/${transactionId}`
    );
    return response.data;
  }

  /**
   * Process a refund for a transaction
   * @param request - Refund request parameters
   * @returns Refund transaction result
   */
  public async refundPayment(
    request: PayWayRefundRequest
  ): Promise<PayWayRefundResponse> {
    const response = await this.client.post<PayWayRefundResponse>(
      `/payments/${request.transactionId}/refund`,
      {
        amount: request.amount,
        description: request.description,
      }
    );
    return response.data;
  }
  /**
   * Handle API errors with detailed information
   * @private
   * @param error - Axios error object
   */ private handleApiError(
    error: AxiosError<{ message?: string; errors?: unknown[] }>
  ): never {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      // Format error message
      const message = data?.message || "Unknown PayWay error";
      const details = data?.errors ? `: ${JSON.stringify(data.errors)}` : "";

      throw new Error(`PayWay API error (${status}): ${message}${details}`);
    }

    if (error.request) {
      throw new Error(`PayWay API request failed: No response received`);
    }

    throw new Error(
      `PayWay API request failed: ${error.message || "Unknown error"}`
    );
  }
}
