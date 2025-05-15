import { OpenAIRequestType, OpenAIStreamChunk } from "./openai-schema";

/**
 * Sends a request to the OpenAI API endpoint
 */
export async function fetchOpenAI(body: OpenAIRequestType): Promise<Response> {
  return fetch("/api/openai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

/**
 * Processes a streaming response from the OpenAI API
 * @param response The fetch response from the API
 * @param onChunk Callback function that receives each chunk of text
 * @param onDone Callback function that is called when the stream is complete
 * @param onError Callback function that is called if an error occurs
 */
export async function processOpenAIStream(
  response: Response,
  {
    onChunk,
    onDone,
    onError,
  }: {
    onChunk: (chunk: string) => void;
    onDone?: () => void;
    onError?: (error: Error) => void;
  }
): Promise<void> {
  if (!response.ok) {
    try {
      const errorData = await response.json();
      onError?.(
        new Error(errorData.error?.message || `API error: ${response.status}`)
      );
    } catch (e) {
      onError?.(new Error(`API error: ${response.status}`));
    }
    return;
  }

  if (!response.body) {
    onError?.(new Error("Response body is null"));
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let accumulatedData = "";

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      // Decode the received bytes into text
      const text = decoder.decode(value, { stream: true });
      accumulatedData += text;

      // Process complete SSE messages
      const messages = accumulatedData.split("\n\n");
      accumulatedData = messages.pop() || "";

      for (const message of messages) {
        if (message.trim() === "") continue;
        if (!message.startsWith("data: ")) continue;

        const data = message.slice(6); // Remove 'data: ' prefix

        // Check for stream completion
        if (data === "[DONE]") {
          onDone?.();
          return;
        }

        try {
          const parsedData = JSON.parse(data) as OpenAIStreamChunk;
          if (parsedData.content) {
            onChunk(parsedData.content);
          }
        } catch (e) {
          console.warn("Error parsing SSE message:", e);
        }
      }
    }

    onDone?.();
  } catch (error) {
    reader.cancel().catch(console.error);
    onError?.(error instanceof Error ? error : new Error("Unknown error"));
  }
}
