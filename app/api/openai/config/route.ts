import { NextResponse } from "next/server";
import { getOpenAIConfig } from "@/lib/openai-server-utils";

// This API route checks if the OpenAI API is properly configured
// It does not expose the API key, only whether it's configured

export async function GET() {
  const config = getOpenAIConfig();

  return NextResponse.json({
    configured: !!config.apiKey,
    defaults: {
      model: config.defaultModel,
      // Don't expose sensitive configuration values
    },
  });
}

// Use edge runtime for better performance
export const runtime = "edge";
