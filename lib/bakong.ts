/**
 * Bakong Payment System Utility Library
 *
 * This library provides utility functions for integrating with Bakong payment system,
 * including QR code payload generation, phone number validation, API client with retry logic,
 * webhook signature verification, and a mock provider for development.
 */

import crypto from "crypto";
import axios from "axios";

// Define types to work around axios type export issues
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

import { z } from "zod";

// ---------- TypeScript Types ----------

/**
 * Bakong API Configuration
 */
export interface BakongConfig {
  /** API key provided by Bakong/NBC */
  apiKey: string;
  /** API secret for request signing */
  apiSecret: string;
  /** Webhook secret for verifying callbacks */
  webhookSecret: string;
  /** Base URL for Bakong API (defaults to sandbox) */
  baseUrl?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Max retries for API calls */
  maxRetries?: number;
  /** Initial retry delay in milliseconds */
  retryDelay?: number;
}

/**
 * Bakong payment event types
 */
export type BakongEventType =
  | "payment.success"
  | "payment.failed"
  | "payment.refunded"
  | "payment.expired";

/**
 * Bakong payment status
 */
export type BakongPaymentStatus =
  | "completed"
  | "failed"
  | "refunded"
  | "expired"
  | "pending";

/**
 * QR Code payment request
 */
export interface BakongQRPaymentRequest {
  /** Customer phone number registered with Bakong */
  phoneNumber: string;
  /** Payment amount in KHR */
  amount: number;
  /** Payment reference (invoice number, order ID etc.) */
  reference: string;
  /** Currency code (currently only KHR is supported) */
  currency?: string;
  /** Payment description */
  description?: string;
  /** Additional metadata */
  metadata?: Record<string, string>;
}

/**
 * QR Code payment response
 */
export interface BakongQRPaymentResponse {
  /** Status code (200 for success) */
  status: number;
  /** Response message */
  message: string;
  /** Response data */
  response: {
    /** Generated QR string in EMVCo format */
    qrString: string;
    /** Transaction ID for tracking */
    transactionId: string;
    /** Expiration timestamp */
    expiresAt: string;
  };
}

/**
 * Bakong transaction status request
 */
export interface BakongStatusRequest {
  /** Transaction ID to check */
  transactionId: string;
}

/**
 * Bakong transaction status response
 */
export interface BakongStatusResponse {
  /** Status code (200 for success) */
  status: number;
  /** Response message */
  message: string;
  /** Response data */
  response: {
    /** Transaction ID */
    transactionId: string;
    /** Payment amount */
    amount: number;
    /** Currency code */
    currency: string;
    /** Transaction status */
    status: BakongPaymentStatus;
    /** Merchant reference */
    reference: string;
    /** Customer account ID */
    accountId?: string;
    /** Customer phone number */
    phoneNumber?: string;
    /** Transaction creation timestamp */
    createdAt: string;
    /** Transaction completion timestamp */
    completedAt?: string;
  };
}

/**
 * Bakong refund request
 */
export interface BakongRefundRequest {
  /** Original transaction ID */
  transactionId: string;
  /** Refund amount (defaults to full amount if not provided) */
  amount?: number;
  /** Refund reason */
  reason?: string;
}

/**
 * Bakong refund response
 */
export interface BakongRefundResponse {
  /** Status code (200 for success) */
  status: number;
  /** Response message */
  message: string;
  /** Response data */
  response: {
    /** Original transaction ID */
    originalTransactionId: string;
    /** Refund transaction ID */
    refundTransactionId: string;
    /** Refund amount */
    amount: number;
    /** Currency code */
    currency: string;
    /** Refund status */
    status: string;
    /** Refund timestamp */
    refundedAt: string;
  };
}

/**
 * Bakong webhook payload
 */
export interface BakongWebhookPayload {
  /** Event ID */
  id: string;
  /** Event type */
  event: BakongEventType;
  /** Event creation timestamp */
  created: number;
  /** Event data */
  data: {
    /** Transaction ID */
    transactionId: string;
    /** Payment amount */
    amount: number;
    /** Currency code */
    currency: string;
    /** Payment status */
    status: BakongPaymentStatus;
    /** Optional metadata */
    metadata?: Record<string, string>;
    /** Completion timestamp */
    completedAt?: number;
    /** Failure timestamp */
    failedAt?: number;
    /** Refund timestamp */
    refundedAt?: number;
    /** Refund reason */
    refundReason?: string;
    /** Payment method (always "bakong") */
    paymentMethod: "bakong";
    /** Customer account ID */
    accountId?: string;
    /** Customer phone number */
    phoneNumber?: string;
  };
  /** Idempotency key for preventing duplicate processing */
  idempotencyKey: string;
}

/**
 * Bakong error response
 */
export interface BakongErrorResponse {
  /** Status code (4xx or 5xx) */
  status: number;
  /** Error message */
  message: string;
  /** Error code */
  code: string;
  /** Error details */
  errors?: Array<{
    /** Field that caused the error */
    field: string;
    /** Error message for this field */
    message: string;
  }>;
}

/**
 * Common Bakong error codes
 */
export enum BakongErrorCode {
  INVALID_PHONE_NUMBER = "INVALID_PHONE_NUMBER",
  ACCOUNT_NOT_FOUND = "ACCOUNT_NOT_FOUND",
  INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS",
  TRANSACTION_NOT_FOUND = "TRANSACTION_NOT_FOUND",
  DUPLICATE_TRANSACTION = "DUPLICATE_TRANSACTION",
  TRANSACTION_EXPIRED = "TRANSACTION_EXPIRED",
  SYSTEM_ERROR = "SYSTEM_ERROR",
  INVALID_AMOUNT = "INVALID_AMOUNT",
  UNAUTHORIZED = "UNAUTHORIZED",
}

// ---------- Validation Schemas ----------

/**
 * Zod schema for validating webhook payloads
 */
export const BakongWebhookSchema = z.object({
  id: z.string(),
  event: z.enum([
    "payment.success",
    "payment.failed",
    "payment.refunded",
    "payment.expired",
  ]),
  created: z.number(),
  data: z.object({
    transactionId: z.string(),
    amount: z.number(),
    currency: z.string().default("KHR"),
    status: z.enum(["completed", "failed", "refunded", "expired"]),
    metadata: z.record(z.string()).optional(),
    completedAt: z.number().optional(),
    failedAt: z.number().optional(),
    refundedAt: z.number().optional(),
    refundReason: z.string().optional(),
    paymentMethod: z.literal("bakong"),
    accountId: z.string().optional(),
    phoneNumber: z.string().optional(),
  }),
  idempotencyKey: z.string(),
});

// ---------- Utility Functions ----------

/**
 * Validates a Cambodian phone number
 *
 * @param phoneNumber - Phone number to validate
 * @returns Boolean indicating if phone number is valid
 *
 * @example
 * ```
 * // Check if a phone number is valid
 * const isValid = isValidPhoneNumber('0123456789');
 *
 * // Format a phone number to standard format
 * const formatted = formatPhoneNumber('012345678');
 * ```
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  // Validate Cambodian phone number format
  // Supports formats: 0XX XXX XXX, +855 XX XXX XXX, 855 XX XXX XXX
  const phoneRegex =
    /^(0|855|\+855)?((?:1[0-2]|6\d|7[0-7]|8\d|9\d)(?:\d{6,7}))$/;
  return phoneRegex.test(phoneNumber);
}

/**
 * Formats a Cambodian phone number to standard format for Bakong API
 *
 * @param phoneNumber - Phone number to format
 * @returns Formatted phone number in +855 format
 */
export function formatPhoneNumber(phoneNumber: string): string {
  if (!isValidPhoneNumber(phoneNumber)) {
    throw new Error("Invalid Cambodian phone number");
  }

  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, "");

  // Check for different prefix types and standardize to +855 format
  if (digits.startsWith("855")) {
    return `+${digits}`;
  } else if (digits.startsWith("0")) {
    return `+855${digits.substring(1)}`;
  } else {
    return `+855${digits}`;
  }
}

/**
 * Generate QR code payload according to NBC specifications
 *
 * @param data - QR payment data
 * @returns QR code string in EMVCo format
 *
 * @example
 * ```
 * const qrString = generateQRPayload({
 *   phoneNumber: '0123456789',
 *   amount: 10000,
 *   reference: 'INV-123',
 *   description: 'Payment for order #123'
 * });
 * ```
 */
export function generateQRPayload(data: BakongQRPaymentRequest): string {
  // Format and validate phone number (validation side effect only)
  formatPhoneNumber(data.phoneNumber);

  // Generate a transaction ID if not provided in metadata
  const transactionId = data.metadata?.transactionId || `TX${Date.now()}`;

  // Format reference (truncate if too long)
  const reference = data.reference.substring(0, 20);

  // Build QR code string according to EMVCo QR Code Specification for Payments
  // Format: 00020101021229300012D156000000000510A93FO324[amount]5802KH5915[merchant name]6006[city]62290705[txnId]0807[reference]6304[checksum]

  // Hardcoded values based on NBC specs
  const qrPrefix = "00020101021229300012D156000000000510A93FO3240208";
  const countryCode = "5802KH";
  const merchantName = "5915ACME Corporation"; // Replace with actual merchant name in production
  const cityCode = "6006Phnom Penh"; // Replace with actual city in production

  // Construct the transaction and reference fields
  const txnField = `62290705${transactionId}`;
  const referenceField = `0807${reference}`;

  // Combine all parts (excluding checksum)
  const qrData = [
    qrPrefix,
    data.amount.toString(),
    countryCode,
    merchantName,
    cityCode,
    txnField,
    referenceField,
  ].join("");

  // Calculate CRC-16 checksum (simplified version, in production use proper CRC-16 algorithm)
  // This is a placeholder - actual implementation would need proper CRC calculation
  const checksum = "E2C2"; // In real implementation, calculate CRC-16

  // Return full QR string with checksum
  return `${qrData}6304${checksum}`;
}

/**
 * Verify Bakong webhook signature
 *
 * @param payload - The webhook payload
 * @param signature - The signature from HTTP header
 * @param timestamp - The timestamp from HTTP header
 * @param secret - The webhook secret for verification
 * @returns boolean indicating if signature is valid
 *
 * @example
 * ```
 * const isValid = verifyWebhookSignature(
 *   webhookPayload,
 *   request.headers.get('BAKONG-SIGNATURE'),
 *   request.headers.get('BAKONG-TIMESTAMP'),
 *   process.env.BAKONG_WEBHOOK_SECRET
 * );
 *
 * if (isValid) {
 *   // Process the webhook
 * } else {
 *   // Reject the webhook
 * }
 * ```
 */
export function verifyWebhookSignature(
  payload: unknown,
  signature: string,
  timestamp: string,
  secret: string
): boolean {
  try {
    const dataToSign = `${timestamp}.${JSON.stringify(payload)}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(dataToSign)
      .digest("hex");

    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error("Bakong signature verification error:", error);
    return false;
  }
}

/**
 * Map Bakong error codes to human-readable messages
 *
 * @param errorCode - Bakong error code
 * @returns Human-readable error message
 *
 * @example
 * ```
 * const errorMessage = getErrorMessage(BakongErrorCode.INSUFFICIENT_FUNDS);
 * console.log(errorMessage); // "Insufficient funds in customer account"
 * ```
 */
export function getErrorMessage(errorCode: BakongErrorCode | string): string {
  const errorMap: Record<string, string> = {
    [BakongErrorCode.INVALID_PHONE_NUMBER]: "Invalid phone number format",
    [BakongErrorCode.ACCOUNT_NOT_FOUND]:
      "Bakong account not found for this phone number",
    [BakongErrorCode.INSUFFICIENT_FUNDS]:
      "Insufficient funds in customer account",
    [BakongErrorCode.TRANSACTION_NOT_FOUND]: "Transaction not found",
    [BakongErrorCode.DUPLICATE_TRANSACTION]: "Transaction already exists",
    [BakongErrorCode.TRANSACTION_EXPIRED]: "Transaction has expired",
    [BakongErrorCode.SYSTEM_ERROR]: "Bakong system error",
    [BakongErrorCode.INVALID_AMOUNT]: "Invalid payment amount",
    [BakongErrorCode.UNAUTHORIZED]: "Unauthorized access to Bakong API",
  };

  return errorMap[errorCode] || `Unknown error: ${errorCode}`;
}

// ---------- Bakong API Client ----------

/**
 * Bakong API client with retry logic
 *
 * @example
 * ```
 * // Initialize client
 * const bakong = new BakongClient({
 *   apiKey: "api_key_123",
 *   apiSecret: "api_secret_456",
 *   webhookSecret: "webhook_secret_789"
 * });
 *
 * // Generate QR payment
 * const payment = await bakong.createQRPayment({
 *   phoneNumber: "012345678",
 *   amount: 10000,
 *   reference: "INV-123",
 *   description: "Payment for order #123"
 * });
 *
 * // Check payment status
 * const status = await bakong.checkStatus("TX123456789");
 * ```
 */
export class BakongClient {
  private readonly client: AxiosInstance;
  private readonly config: BakongConfig;

  /**
   * Create a new Bakong API client
   *
   * @param config - Bakong API configuration
   */
  constructor(config: BakongConfig) {
    this.config = {
      ...config,
      baseUrl: config.baseUrl || "https://api-sandbox.bakong.com/api/v1",
      timeout: config.timeout || 10000,
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 500,
    };
    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": this.config.apiKey,
      },
    }) as unknown as AxiosInstance; // Add request interceptor for signing requests
    this.client.interceptors.request.use((config) => {
      // Generate timestamp
      const timestamp = Date.now().toString();

      // Initialize headers if undefined
      if (!config.headers) {
        config.headers = {};
      }

      // Add timestamp header
      config.headers["X-TIMESTAMP"] = timestamp;

      // Generate signature based on payload
      if (config.data) {
        const signature = this.generateRequestSignature(
          config.data,
          timestamp,
          this.config.apiSecret
        );
        config.headers["X-SIGNATURE"] = signature;
      }

      return config;
    });
  }

  /**
   * Create a QR payment request
   *
   * @param payment - QR payment request data
   * @returns QR payment response with QR string
   */
  public async createQRPayment(
    payment: BakongQRPaymentRequest
  ): Promise<BakongQRPaymentResponse> {
    // Format phone number
    const formattedPayment = {
      ...payment,
      phoneNumber: formatPhoneNumber(payment.phoneNumber),
      currency: payment.currency || "KHR",
    };

    return this.executeWithRetry<BakongQRPaymentResponse>(() =>
      this.client.post<BakongQRPaymentResponse>(
        "/payments/qr",
        formattedPayment
      )
    );
  }

  /**
   * Check status of a payment
   *
   * @param transactionId - The transaction ID to check
   * @returns Payment status response
   */
  public async checkStatus(
    transactionId: string
  ): Promise<BakongStatusResponse> {
    return this.executeWithRetry<BakongStatusResponse>(() =>
      this.client.get<BakongStatusResponse>(`/payments/${transactionId}`)
    );
  }

  /**
   * Process a refund
   *
   * @param refund - Refund request parameters
   * @returns Refund response
   */
  public async processRefund(
    refund: BakongRefundRequest
  ): Promise<BakongRefundResponse> {
    return this.executeWithRetry<BakongRefundResponse>(() =>
      this.client.post<BakongRefundResponse>(
        `/payments/${refund.transactionId}/refund`,
        {
          amount: refund.amount,
          reason: refund.reason,
        }
      )
    );
  }

  /**
   * Execute a request with retry logic
   *
   * @private
   * @param requestFn - Function that returns a promise with the request
   * @returns Response data
   */ private async executeWithRetry<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    retries = 0
  ): Promise<T> {
    try {
      const response = await requestFn();
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<BakongErrorResponse>;

      // If max retries reached or not a retryable error, throw
      if (
        retries >= this.config.maxRetries! ||
        !this.isRetryableError(axiosError)
      ) {
        throw this.formatError(axiosError);
      }

      // Calculate delay with exponential backoff
      const delay = this.config.retryDelay! * Math.pow(2, retries);

      // Wait for the delay
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Retry request
      return this.executeWithRetry<T>(requestFn, retries + 1);
    }
  }

  /**
   * Determine if an error is retryable
   *
   * @private
   * @param error - Axios error
   * @returns Whether the request should be retried
   */
  private isRetryableError(error: AxiosError): boolean {
    // Retry on network errors
    if (!error.response) {
      return true;
    }

    // Retry on 5xx errors or specific 4xx errors
    const status = error.response.status;
    return (
      status >= 500 ||
      status === 429 || // Too Many Requests
      status === 408 // Request Timeout
    );
  }

  /**
   * Format error for better debugging
   *
   * @private
   * @param error - Axios error
   * @returns Formatted error
   */ private formatError(error: AxiosError<BakongErrorResponse>): Error {
    if (error.response?.data) {
      const { status, data } = error.response;

      const message = data.message || "Unknown Bakong error";
      const code = data.code || "UNKNOWN_ERROR";
      const details = data.errors ? `: ${JSON.stringify(data.errors)}` : "";

      const err = new Error(
        `Bakong API error (${status}): ${message} [${code}]${details}`
      );

      // Add additional properties to the error
      const enhancedError = err as Error & { code: string; status: number };
      enhancedError.code = code;
      enhancedError.status = status;

      return enhancedError;
    }

    if (error.request) {
      return new Error(`Bakong API request failed: No response received`);
    }

    return new Error(`Bakong API request failed: ${error.message}`);
  }

  /**
   * Generate signature for API requests
   *
   * @private
   * @param data - Request payload
   * @param timestamp - Request timestamp
   * @param secret - API secret
   * @returns HMAC signature
   */
  private generateRequestSignature(
    data: unknown,
    timestamp: string,
    secret: string
  ): string {
    const payload = `${timestamp}.${JSON.stringify(data)}`;
    return crypto.createHmac("sha256", secret).update(payload).digest("hex");
  }
}

// ---------- Bakong Mock Provider ----------

/**
 * Mock provider for Bakong payments (development only)
 * This simulates Bakong API responses for testing purposes.
 *
 * @example
 * ```
 * const mockBakong = new BakongMockProvider();
 *
 * // Generate mock QR payment
 * const payment = await mockBakong.createQRPayment({
 *   phoneNumber: "012345678",
 *   amount: 10000,
 *   reference: "INV-123"
 * });
 *
 * // Simulate payment completion
 * await mockBakong.simulatePaymentComplete(payment.response.transactionId);
 *
 * // Check status (should now be completed)
 * const status = await mockBakong.checkStatus(payment.response.transactionId);
 * ```
 */
export class BakongMockProvider {
  private transactions: Map<
    string,
    {
      data: BakongQRPaymentRequest;
      status: BakongPaymentStatus;
      created: number;
      completed?: number;
      failed?: number;
      qrString: string;
    }
  >;

  constructor() {
    this.transactions = new Map();
  }

  /**
   * Create a mock QR payment
   *
   * @param payment - QR payment request data
   * @returns Mock QR payment response
   */
  public async createQRPayment(
    payment: BakongQRPaymentRequest
  ): Promise<BakongQRPaymentResponse> {
    // Generate a unique transaction ID
    const transactionId = `MOCK${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Format phone number
    const formattedPhoneNumber = formatPhoneNumber(payment.phoneNumber);

    // Generate QR code string
    const qrString = generateQRPayload({
      ...payment,
      phoneNumber: formattedPhoneNumber,
      metadata: { ...(payment.metadata || {}), transactionId },
    });

    // Store transaction in memory
    const created = Date.now();
    this.transactions.set(transactionId, {
      data: {
        ...payment,
        phoneNumber: formattedPhoneNumber,
      },
      status: "pending",
      created,
      qrString,
    });

    // Set expiry timer (15 minutes)
    setTimeout(
      () => {
        const tx = this.transactions.get(transactionId);
        if (tx && tx.status === "pending") {
          tx.status = "expired";
          tx.failed = Date.now();
        }
      },
      15 * 60 * 1000
    );

    // Create expiry time 15 minutes in the future
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 15);

    // Return mock response
    return {
      status: 200,
      message: "Success",
      response: {
        qrString,
        transactionId,
        expiresAt: expiryTime.toISOString(),
      },
    };
  }

  /**
   * Check status of mock payment
   *
   * @param transactionId - The transaction ID to check
   * @returns Mock payment status response
   */
  public async checkStatus(
    transactionId: string
  ): Promise<BakongStatusResponse> {
    const tx = this.transactions.get(transactionId);

    if (!tx) {
      throw new Error(`Transaction not found: ${transactionId}`);
    }

    return {
      status: 200,
      message: "Success",
      response: {
        transactionId,
        amount: tx.data.amount,
        currency: tx.data.currency || "KHR",
        status: tx.status,
        reference: tx.data.reference,
        phoneNumber: tx.data.phoneNumber,
        createdAt: new Date(tx.created).toISOString(),
        completedAt: tx.completed
          ? new Date(tx.completed).toISOString()
          : undefined,
      },
    };
  }

  /**
   * Process a mock refund
   *
   * @param refund - Refund request parameters
   * @returns Mock refund response
   */
  public async processRefund(
    refund: BakongRefundRequest
  ): Promise<BakongRefundResponse> {
    const tx = this.transactions.get(refund.transactionId);

    if (!tx) {
      throw new Error(`Transaction not found: ${refund.transactionId}`);
    }

    if (tx.status !== "completed") {
      throw new Error(`Cannot refund transaction with status: ${tx.status}`);
    }

    // Update transaction status
    tx.status = "refunded";

    // Generate refund transaction ID
    const refundTransactionId = `REF-${refund.transactionId}`;
    const refundAmount = refund.amount || tx.data.amount;

    return {
      status: 200,
      message: "Refund processed successfully",
      response: {
        originalTransactionId: refund.transactionId,
        refundTransactionId,
        amount: refundAmount,
        currency: tx.data.currency || "KHR",
        status: "completed",
        refundedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Simulate payment completion (for testing)
   *
   * @param transactionId - Transaction ID to complete
   */
  public async simulatePaymentComplete(transactionId: string): Promise<void> {
    const tx = this.transactions.get(transactionId);

    if (!tx) {
      throw new Error(`Transaction not found: ${transactionId}`);
    }

    if (tx.status !== "pending") {
      throw new Error(`Cannot complete transaction with status: ${tx.status}`);
    }

    tx.status = "completed";
    tx.completed = Date.now();
  }

  /**
   * Simulate payment failure (for testing)
   *
   * @param transactionId - Transaction ID to fail
   * @param reason - Failure reason
   */
  public async simulatePaymentFailure(
    transactionId: string,
    reason = "Payment rejected by user"
  ): Promise<void> {
    const tx = this.transactions.get(transactionId);

    if (!tx) {
      throw new Error(`Transaction not found: ${transactionId}`);
    }

    if (tx.status !== "pending") {
      throw new Error(`Cannot fail transaction with status: ${tx.status}`);
    }

    tx.status = "failed";
    tx.failed = Date.now();
    tx.data.metadata = {
      ...(tx.data.metadata || {}),
      failureReason: reason,
    };
  }

  /**
   * Generate webhook payload (for testing)
   *
   * @param transactionId - Transaction ID to generate webhook for
   * @returns Webhook payload
   */
  public generateWebhookPayload(transactionId: string): BakongWebhookPayload {
    const tx = this.transactions.get(transactionId);

    if (!tx) {
      throw new Error(`Transaction not found: ${transactionId}`);
    }

    let event: BakongEventType;
    switch (tx.status) {
      case "completed":
        event = "payment.success";
        break;
      case "failed":
        event = "payment.failed";
        break;
      case "refunded":
        event = "payment.refunded";
        break;
      case "expired":
        event = "payment.expired";
        break;
      default:
        throw new Error(`Cannot generate webhook for status: ${tx.status}`);
    }

    return {
      id: `evt_${Date.now()}${Math.floor(Math.random() * 1000)}`,
      event,
      created: Date.now(),
      data: {
        transactionId,
        amount: tx.data.amount,
        currency: tx.data.currency || "KHR",
        status: tx.status,
        metadata: tx.data.metadata,
        completedAt: tx.completed,
        failedAt: tx.failed,
        paymentMethod: "bakong",
        phoneNumber: tx.data.phoneNumber,
      },
      idempotencyKey: `key_${Date.now()}${Math.floor(Math.random() * 1000)}`,
    };
  }

  /**
   * Sign webhook payload (for testing)
   *
   * @param payload - Webhook payload
   * @param secret - Secret key for signing
   * @returns Signed webhook with headers
   */
  public signWebhookPayload(
    payload: BakongWebhookPayload,
    secret: string
  ): {
    payload: BakongWebhookPayload;
    signature: string;
    timestamp: string;
  } {
    const timestamp = Date.now().toString();

    const dataToSign = `${timestamp}.${JSON.stringify(payload)}`;
    const signature = crypto
      .createHmac("sha256", secret)
      .update(dataToSign)
      .digest("hex");

    return {
      payload,
      signature,
      timestamp,
    };
  }
}
