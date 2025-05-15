import { OpenAIRequestType } from "./openai-schema";

// Define custom error types for OpenAI API calls
export class OpenAIError extends Error {
  status: number;
  type: string;

  constructor(
    message: string,
    status: number = 500,
    type: string = "openai_error"
  ) {
    super(message);
    this.name = "OpenAIError";
    this.status = status;
    this.type = type;
  }
}

export class RateLimitError extends OpenAIError {
  retryAfter?: number;

  constructor(message: string, retryAfter?: number) {
    super(message, 429, "rate_limit_error");
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

export class AuthenticationError extends OpenAIError {
  constructor(message: string = "Invalid API key or not authorized") {
    super(message, 401, "authentication_error");
    this.name = "AuthenticationError";
  }
}

export class ValidationError extends OpenAIError {
  constructor(message: string) {
    super(message, 400, "validation_error");
    this.name = "ValidationError";
  }
}

// Helper function to safely log errors without exposing sensitive data
export function logOpenAIError(
  error: any,
  userInfo?: { id?: string; ip?: string }
) {
  // Extract useful information from the error
  const errorData = {
    name: error.name || "UnknownError",
    message: error.message || "An unknown error occurred",
    status: error.status || 500,
    type: error.type || "unknown_error",
    timestamp: new Date().toISOString(),
    userInfo: userInfo
      ? {
          id: userInfo.id ? `...${userInfo.id.slice(-4)}` : undefined, // Only log last 4 chars
          ip: userInfo.ip ? `...${userInfo.ip.slice(-4)}` : undefined, // Only log last 4 chars
        }
      : undefined,
  };

  // Avoid logging sensitive data
  const sanitizedError = { ...errorData };

  // Log to console (in production, this could go to a proper logging service)
  console.error("OpenAI API Error:", sanitizedError);

  // Return a safe error message for client
  return {
    message: error.message || "An error occurred with the AI service",
    type: error.type || "api_error",
    status: error.status || 500,
  };
}

// Utility to handle dynamic environment variables
export function getOpenAIConfig() {
  return {
    apiKey: process.env.OPENAI_API_KEY,
    defaultModel: process.env.OPENAI_DEFAULT_MODEL || "gpt-3.5-turbo",
    organization: process.env.OPENAI_ORGANIZATION,
    rateLimitRequests: parseInt(process.env.OPENAI_RATE_LIMIT_REQUESTS || "10"),
    rateLimitWindowMs: parseInt(
      process.env.OPENAI_RATE_LIMIT_WINDOW || "60000"
    ),
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || "4096"),
  };
}

// Format request payload with sensible defaults
export function formatOpenAIRequest(
  payload: Partial<OpenAIRequestType>
): OpenAIRequestType {
  const config = getOpenAIConfig();

  return {
    messages: payload.messages || [],
    model: payload.model || config.defaultModel,
    temperature: payload.temperature ?? 0.7,
    presencePenalty: payload.presencePenalty ?? 0,
    frequencyPenalty: payload.frequencyPenalty ?? 0,
    maxTokens: payload.maxTokens || config.maxTokens,
    stream: payload.stream ?? true,
  };
}
