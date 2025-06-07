import { useState, useCallback, useRef } from "react";
import { fetchOpenAI, processOpenAIStream } from "@/lib/openai-client";
import { OpenAIRequestType } from "@/lib/openai-schema";

interface UseOpenAIOptions {
  onError?: (error: Error) => void;
  onFinish?: () => void;
}

interface UseOpenAIReturn {
  isLoading: boolean;
  error: Error | null;
  streamedResponse: string;
  sendMessage: (
    messages: OpenAIRequestType["messages"],
    options?: Partial<Omit<OpenAIRequestType, "messages">>
  ) => Promise<void>;
  stopGeneration: () => void;
  reset: () => void;
}

export function useOpenAI({
  onError,
  onFinish,
}: UseOpenAIOptions = {}): UseOpenAIReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [streamedResponse, setStreamedResponse] = useState("");

  // Use AbortController to cancel fetch requests
  const abortControllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setStreamedResponse("");
  }, []);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (
      messages: OpenAIRequestType["messages"],
      options: Partial<Omit<OpenAIRequestType, "messages">> = {}
    ) => {
      try {
        // Stop any ongoing generation
        stopGeneration();

        // Create new AbortController
        abortControllerRef.current = new AbortController();

        setIsLoading(true);
        setError(null);
        setStreamedResponse("");

        const payload: OpenAIRequestType = {
          messages,
          model: options.model || "gpt-3.5-turbo",
          temperature: options.temperature ?? 0.7,
          presencePenalty: options.presencePenalty ?? 0,
          frequencyPenalty: options.frequencyPenalty ?? 0,
          maxTokens: options.maxTokens,
          stream: options.stream ?? true,
        };

        const response = await fetchOpenAI(payload);

        if (payload.stream) {
          await processOpenAIStream(response, {
            onChunk: (chunk) => {
              setStreamedResponse((prev) => prev + chunk);
            },
            onDone: () => {
              setIsLoading(false);
              abortControllerRef.current = null;
              onFinish?.();
            },
            onError: (err) => {
              setError(err);
              setIsLoading(false);
              abortControllerRef.current = null;
              onError?.(err);
            },
          });
        } else {
          const data = await response.json();

          if (response.ok) {
            setStreamedResponse(data.choices[0]?.message?.content || "");
          } else {
            throw new Error(data.error?.message || "Unknown error");
          }

          setIsLoading(false);
          abortControllerRef.current = null;
          onFinish?.();
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
        setIsLoading(false);
        abortControllerRef.current = null;
        onError?.(error);
      }
    },
    [onError, onFinish, stopGeneration]
  );

  return {
    isLoading,
    error,
    streamedResponse,
    sendMessage,
    stopGeneration,
    reset,
  };
}
