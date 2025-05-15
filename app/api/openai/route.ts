import { OpenAI } from "openai";
import { z } from "zod";
import { ZodError } from "zod";
import { NextRequest } from "next/server";

// Configure for Edge runtime
export const runtime = "edge";

// Rate limiting setup
interface RateLimitState {
  count: number;
  timestamp: number;
  blocked: boolean;
}

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const MAX_REQUESTS_PER_WINDOW = 10;

const ipToRateLimitState = new Map<string, RateLimitState>();

// Validate request schema with Zod
const requestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["system", "user", "assistant"]),
        content: z.string().min(1).max(4000),
      })
    )
    .min(1),
  model: z.string().default("gpt-3.5-turbo"),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  presencePenalty: z.number().min(-2).max(2).optional().default(0),
  frequencyPenalty: z.number().min(-2).max(2).optional().default(0),
  maxTokens: z.number().positive().optional(),
  stream: z.boolean().optional().default(true),
});

export type OpenAIRequestBody = z.infer<typeof requestSchema>;

// Error handling helper
function createErrorResponse(status: number, message: string) {
  return new Response(
    JSON.stringify({
      error: {
        message,
      },
    }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  );
}

// Rate limiting middleware
function checkRateLimit(ip: string): { allowed: boolean; message?: string } {
  const now = Date.now();
  let state = ipToRateLimitState.get(ip);

  if (!state) {
    state = { count: 0, timestamp: now, blocked: false };
    ipToRateLimitState.set(ip, state);
  }

  // Reset counter if outside time window
  if (now - state.timestamp > RATE_LIMIT_WINDOW) {
    state.count = 0;
    state.timestamp = now;
    state.blocked = false;
  }

  // If already blocked
  if (state.blocked) {
    const remainingTime = Math.ceil(
      (RATE_LIMIT_WINDOW - (now - state.timestamp)) / 1000
    );
    return {
      allowed: false,
      message: `Rate limit exceeded. Please try again in ${remainingTime} seconds.`,
    };
  }

  // Check if exceeds rate limit
  if (state.count >= MAX_REQUESTS_PER_WINDOW) {
    state.blocked = true;
    const remainingTime = Math.ceil(RATE_LIMIT_WINDOW / 1000);
    return {
      allowed: false,
      message: `Rate limit exceeded. Please try again in ${remainingTime} seconds.`,
    };
  }

  // Increment counter and allow
  state.count++;
  return { allowed: true };
}

export async function POST(request: NextRequest) {
  // Get IP for rate limiting
  const ip = request.ip || "unknown";

  // Check rate limit
  const rateLimitCheck = checkRateLimit(ip);
  if (!rateLimitCheck.allowed) {
    return createErrorResponse(
      429,
      rateLimitCheck.message || "Too many requests"
    );
  }

  // Get API key from environment variables
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return createErrorResponse(500, "API key not configured");
  }

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    // Parse and validate request body
    const requestBody = await request.json();
    const validatedData = requestSchema.parse(requestBody);

    // Extract parameters
    const {
      messages,
      model,
      temperature,
      presencePenalty,
      frequencyPenalty,
      maxTokens,
      stream,
    } = validatedData;

    if (stream) {
      // Handle streaming response
      const stream = await openai.chat.completions.create({
        model,
        messages,
        temperature,
        presence_penalty: presencePenalty,
        frequency_penalty: frequencyPenalty,
        max_tokens: maxTokens,
        stream: true,
      });

      // Create response stream
      const textEncoder = new TextEncoder();
      const readableStream = new ReadableStream({
        async start(controller) {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(
                textEncoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
              );
            }
          }
          controller.enqueue(textEncoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });

      return new Response(readableStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } else {
      // Handle non-streaming response
      const completion = await openai.chat.completions.create({
        model,
        messages,
        temperature,
        presence_penalty: presencePenalty,
        frequency_penalty: frequencyPenalty,
        max_tokens: maxTokens,
        stream: false,
      });

      return new Response(JSON.stringify(completion), {
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("API error:", error);

    // Handle validation errors
    if (error instanceof ZodError) {
      return createErrorResponse(400, `Validation error: ${error.message}`);
    }

    // Handle OpenAI API errors
    if (error.response) {
      return createErrorResponse(
        error.response.status || 500,
        `OpenAI API error: ${error.response.data?.error?.message || "Unknown error"}`
      );
    }

    // Handle other errors
    return createErrorResponse(500, "Internal server error");
  }
}
