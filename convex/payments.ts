import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";
import { z } from "zod";
import { nanoid } from "nanoid";
import type { Id } from "./_generated/dataModel";
// Uncomment for real API calls
// import axios from "axios";

// PayWay API interfaces
export interface PayWayCreateTransactionRequest {
  merchant: string;
  transactionId: string;
  amount: number;
  currency: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  customer: {
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    address?: string;
  };
  returnUrl: string;
  continueSuccessUrl?: string;
  returnMethod?: "GET" | "POST";
  customFields?: Record<string, string>;
}

export interface PayWayCreateTransactionResponse {
  status: number;
  message: string;
  response: {
    transactionId: string;
    checkoutUrl: string;
  };
}

export interface PayWayTransactionStatusResponse {
  status: number;
  message: string;
  response: {
    transactionId: string;
    amount: number;
    currency: string;
    status: "PENDING" | "FAILED" | "APPROVED" | "REJECTED";
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

export interface PayWayWebhookPayload {
  transactionId: string;
  merchantId: string;
  amount: number;
  currency: string;
  status: "PENDING" | "FAILED" | "APPROVED" | "REJECTED";
  approvalCode?: string;
  paymentMethod?: string;
  timeCreated: string;
  timeCompleted?: string;
  customFields?: Record<string, string>;
  signature: string;
}

// Bakong API interfaces
export interface BakongQRPaymentRequest {
  phoneNumber: string;
  amount: number;
  reference: string;
  currency?: string; // Default to KHR
  description?: string;
  metadata?: Record<string, string>;
}

export interface BakongQRPaymentResponse {
  status: number;
  message: string;
  response: {
    qrString: string;
    transactionId: string;
    expiresAt: string;
  };
}

// Input validation schemas
const PayWayPaymentInputSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().min(3).max(3).default("USD"),
  customerEmail: z.string().email("Valid email is required"),
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  returnUrl: z.string().url("Valid return URL is required"),
  items: z
    .array(
      z.object({
        name: z.string(),
        quantity: z.number().int().positive(),
        price: z.number().positive(),
      })
    )
    .optional(),
  metadata: z.record(z.string()).optional(),
});

const BakongPaymentInputSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^(0|855|\+855)?((?:1[0-2]|6\d|7[0-7]|8\d|9\d)(?:\d{6,7}))$/),
  amount: z.number().min(1000, "Amount must be at least 1000 KHR"),
  reference: z.string().min(3),
  customerId: z.string().optional(),
  customerEmail: z.string().email().optional(),
  description: z.string().optional(),
  metadata: z.record(z.string()).optional(),
});

const WebhookPayloadSchema = z.object({
  transactionId: z.string(),
  merchantId: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.enum(["PENDING", "FAILED", "APPROVED", "REJECTED"]),
  signature: z.string(),
  timeCreated: z.string(),
  timeCompleted: z.string().optional(),
});

/**
 * Process a payment through PayWay gateway
 */
export const processPayWayPayment = mutation({
  args: {
    amount: v.number(),
    currency: v.string(),
    customerEmail: v.string(),
    customerId: v.optional(v.string()),
    customerName: v.optional(v.string()),
    returnUrl: v.string(),
    items: v.optional(
      v.array(
        v.object({
          name: v.string(),
          quantity: v.number(),
          price: v.number(),
        })
      )
    ),
    metadata: v.optional(v.object({})),
  },
  handler: async (ctx, args) => {
    // Validate input
    const validatedInput = PayWayPaymentInputSchema.parse(args);

    // Generate a secure transaction ID
    const transactionId = `PW-${nanoid(12)}`;
    const now = Date.now();

    // Get environment variables
    const merchantId = process.env.PAYWAY_MERCHANT_ID;
    const apiKey = process.env.PAYWAY_API_KEY;

    if (!merchantId || !apiKey) {
      throw new ConvexError("PayWay configuration is missing");
    }

    // Store the pending payment in Convex DB
    const paymentId = await ctx.db.insert("payments", {
      transactionId,
      amount: validatedInput.amount,
      currency: validatedInput.currency,
      status: "pending",
      paymentMethod: "payway",
      customerEmail: validatedInput.customerEmail,
      customerName: validatedInput.customerName,
      customerId: validatedInput.customerId,
      metadata: validatedInput.metadata,
      createdAt: now,
      updatedAt: now,
    });
    try {
      // In a real implementation, we would use axios here to call PayWay API
      // For this example, we'll simulate the API call

      // NOTE: In production, uncomment and use this payload
      /*
      const payloadForApi: PayWayCreateTransactionRequest = {
        merchant: merchantId,
        transactionId,
        amount: validatedInput.amount,
        currency: validatedInput.currency,
        customer: {
          email: validatedInput.customerEmail,
          firstName: validatedInput.customerName?.split(" ")[0],
          lastName: validatedInput.customerName?.split(" ").slice(1).join(" "),
        },
        items: validatedInput.items,
        returnUrl: validatedInput.returnUrl,
        returnMethod: "GET",
        customFields: validatedInput.metadata,
      };
      
      // Real API call
      const response = await axios.post(
        "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments",
        payloadForApi,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );
      const apiResponse = response.data as PayWayCreateTransactionResponse;
      */

      // Mock API response
      const mockResponse: PayWayCreateTransactionResponse = {
        status: 200,
        message: "Success",
        response: {
          transactionId,
          checkoutUrl: `https://checkout-sandbox.payway.com.kh/checkout?id=${transactionId}`,
        },
      };

      // Update payment with checkout URL
      await ctx.db.patch(paymentId, {
        checkoutUrl: mockResponse.response.checkoutUrl,
        updatedAt: Date.now(),
      });

      return {
        success: true,
        transactionId,
        checkoutUrl: mockResponse.response.checkoutUrl,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Update payment as failed
      await ctx.db.patch(paymentId, {
        status: "failed",
        gatewayResponse: { error: errorMessage },
        updatedAt: Date.now(),
      });

      throw new ConvexError(`Payment processing failed: ${errorMessage}`);
    }
  },
});

/**
 * Handle PayWay webhook callbacks
 */
export const handlePayWayWebhook = action({
  args: {
    payload: v.any(),
    signature: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify HMAC signature
    const calculatedSignature = calculateHmac(
      JSON.stringify(args.payload),
      process.env.PAYWAY_WEBHOOK_SECRET || ""
    );

    if (calculatedSignature !== args.signature) {
      throw new ConvexError("Invalid webhook signature");
    }

    // Validate payload
    const payload = WebhookPayloadSchema.parse(args.payload); // Find the corresponding payment in the database
    const payment = await ctx.db
      .query("payments")
      .filter((q) => q.eq(q.field("transactionId"), payload.transactionId))
      .first();

    if (!payment) {
      throw new ConvexError("Payment not found");
    }

    // Update payment status
    let newStatus;
    switch (payload.status) {
      case "APPROVED":
        newStatus = "completed";
        break;
      case "REJECTED":
      case "FAILED":
        newStatus = "failed";
        break;
      default:
        newStatus = "pending";
    }

    // Update the payment in the database
    await ctx.db.patch(payment._id, {
      status: newStatus,
      gatewayTransactionId: payload.transactionId,
      gatewayResponse: payload,
      completedAt: payload.status === "APPROVED" ? Date.now() : undefined,
      updatedAt: Date.now(),
    });

    // Send email receipt if payment was successful
    if (newStatus === "completed") {
      await sendPaymentReceipt(ctx, payment);
    }

    return { success: true };
  },
});

// Query to get payment by transaction ID
export const getPaymentByTransactionId = query({
  args: { transactionId: v.string() },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("payments")
      .filter((q) => q.eq(q.field("transactionId"), args.transactionId))
      .first();

    if (!payment) {
      return { found: false, payment: null };
    }

    return { found: true, payment };
  },
});

// Mutation to update payment status
export const updatePaymentStatus = mutation({
  args: {
    id: v.id("payments"),
    status: v.string(),
    gatewayTransactionId: v.optional(v.string()),
    gatewayResponse: v.optional(v.object({})),
    completedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      gatewayTransactionId: args.gatewayTransactionId,
      gatewayResponse: args.gatewayResponse,
      completedAt: args.completedAt,
      updatedAt: Date.now(),
    });
  },
});

// Update payment by transaction ID (for webhook handlers)
export const updatePaymentByTransactionId = mutation({
  args: {
    transactionId: v.string(),
    status: v.string(),
    gatewayResponse: v.optional(v.object({})),
    completedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("payments")
      .filter((q) => q.eq(q.field("transactionId"), args.transactionId))
      .first();

    if (!payment) {
      throw new ConvexError(
        `Payment with transaction ID ${args.transactionId} not found`
      );
    }

    await ctx.db.patch(payment._id, {
      status: args.status,
      gatewayResponse: args.gatewayResponse,
      completedAt: args.completedAt,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Process Bakong QR payment
export const processBakongPayment = mutation({
  args: {
    phoneNumber: v.string(),
    amount: v.number(),
    reference: v.string(),
    customerId: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    description: v.optional(v.string()),
    metadata: v.optional(v.object({})),
  },
  handler: async (ctx, args) => {
    // Validate input
    const validatedInput = BakongPaymentInputSchema.parse(args);

    // Generate transaction ID
    const transactionId = `BK-${nanoid(12)}`;
    const now = Date.now();

    // Store pending payment in DB
    const paymentId = await ctx.db.insert("payments", {
      transactionId,
      amount: validatedInput.amount,
      currency: "KHR",
      status: "pending",
      paymentMethod: "bakong",
      customerEmail: validatedInput.customerEmail || "",
      customerId: validatedInput.customerId,
      metadata: {
        phoneNumber: validatedInput.phoneNumber,
        reference: validatedInput.reference,
        description: validatedInput.description,
        ...validatedInput.metadata,
      },
      createdAt: now,
      updatedAt: now,
    });

    try {
      // In a real implementation, we would call the Bakong API here
      // For this example, we'll simulate the QR code generation

      // Mock API response
      const expiryTime = new Date();
      expiryTime.setMinutes(expiryTime.getMinutes() + 15);

      const mockResponse: BakongQRPaymentResponse = {
        status: 200,
        message: "Success",
        response: {
          qrString: `00020101021229300012D156000000000510A93FO3240208${validatedInput.amount}5802KH5915ACME Corporation6006Phnom Penh62290705${transactionId}0807${validatedInput.reference}6304E2C2`,
          transactionId,
          expiresAt: expiryTime.toISOString(),
        },
      };

      // Update payment with QR data
      await ctx.db.patch(paymentId, {
        gatewayTransactionId: transactionId,
        gatewayResponse: mockResponse.response,
        updatedAt: Date.now(),
      });

      return {
        success: true,
        transactionId,
        qrString: mockResponse.response.qrString,
        expiresAt: mockResponse.response.expiresAt,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Update payment as failed
      await ctx.db.patch(paymentId, {
        status: "failed",
        gatewayResponse: { error: errorMessage },
        updatedAt: Date.now(),
      });

      throw new ConvexError(
        `Bakong payment processing failed: ${errorMessage}`
      );
    }
  },
});

// Query payment status
export const getPaymentStatus = query({
  args: { transactionId: v.string() },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("payments")
      .filter((q) => q.eq(q.field("transactionId"), args.transactionId))
      .first();

    if (!payment) {
      return { found: false };
    }

    return {
      found: true,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      updatedAt: payment.updatedAt,
      completedAt: payment.completedAt,
    };
  },
});

// Get recent payments for a user
export const getRecentPayments = query({
  args: {
    userId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let paymentsQuery = ctx.db.query("payments");

    // Filter by user if provided
    if (args.userId) {
      paymentsQuery = paymentsQuery.filter((q) =>
        q.eq(q.field("customerId"), args.userId)
      );
    }

    // Order by creation time, most recent first
    paymentsQuery = paymentsQuery.order("desc");

    // Limit the number of results
    if (args.limit) {
      paymentsQuery = paymentsQuery.take(args.limit);
    } else {
      paymentsQuery = paymentsQuery.take(10); // Default limit
    }

    return await paymentsQuery;
  },
});

// Utility functions
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function calculateHmac(_data: string, _secret: string): string {
  // In a real implementation, this would use crypto:
  // import * as crypto from "crypto";
  // return crypto.createHmac("sha256", _secret).update(_data).digest("hex");

  // For this example, we'll just return a mock signature
  return "mock-signature-for-demonstration-purposes-only";
}

interface PaymentRecord {
  _id: Id<"payments">;
  transactionId: string;
  amount: number;
  currency: string;
  customerEmail: string;
}

async function sendPaymentReceipt(_ctx: unknown, payment: PaymentRecord) {
  // In a real implementation, this would use Resend or another email provider:
  // await resend.emails.send({
  //   from: "receipts@yourcompany.com",
  //   to: payment.customerEmail,
  //   subject: "Payment Receipt",
  //   html: `<p>Thank you for your payment of ${payment.amount} ${payment.currency}</p>`,
  // });

  console.log(
    `[MOCK] Sending receipt to ${payment.customerEmail} for payment ${payment.transactionId}`
  );
}
