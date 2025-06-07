import { z } from "zod";

export const openAIRequestSchema = z.object({
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

export type OpenAIRequestType = z.infer<typeof openAIRequestSchema>;

export const openAIResponseSchema = z.object({
  id: z.string(),
  object: z.string(),
  created: z.number(),
  model: z.string(),
  choices: z.array(
    z.object({
      index: z.number(),
      message: z.object({
        role: z.string(),
        content: z.string(),
      }),
      finish_reason: z.string().nullable(),
    })
  ),
  usage: z
    .object({
      prompt_tokens: z.number(),
      completion_tokens: z.number(),
      total_tokens: z.number(),
    })
    .optional(),
});

export type OpenAIResponseType = z.infer<typeof openAIResponseSchema>;

export interface OpenAIStreamChunk {
  content: string;
}

// Error types
export interface OpenAIErrorResponse {
  error: {
    message: string;
    type?: string;
    code?: string;
  };
}
