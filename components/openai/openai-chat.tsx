"use client";

import { OpenAISettingsPanel } from "@/components/openai/settings-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useCreateOpenAIPayload } from "@/contexts/openai-provider";
import { useOpenAI } from "@/hooks/use-openai";
import { Loader2, Send, Settings2, StopCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

interface OpenAIChatProps {
  systemPrompt?: string;
  placeholder?: string;
  initialMessages?: Message[];
}

export function OpenAIChat({
  systemPrompt = "You are a helpful assistant. Be concise and provide clear information.",
  placeholder = "Type your message here...",
  initialMessages = [],
}: OpenAIChatProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    const systemMessage = { role: "system" as const, content: systemPrompt };
    return [systemMessage, ...initialMessages];
  });

  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const createPayload = useCreateOpenAIPayload();

  const { isLoading, error, streamedResponse, sendMessage, stopGeneration } =
    useOpenAI({
      onFinish: () => {
        // When stream is complete, add the assistant's response to the messages
        if (streamedResponse) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: streamedResponse },
          ]);
        }
      },
    });

  // Update messages when initialMessages changes (e.g., when loading from history)
  useEffect(() => {
    if (initialMessages.length > 0) {
      const systemMsg = { role: "system" as const, content: systemPrompt };
      setMessages([systemMsg, ...initialMessages]);
    }
  }, [initialMessages, systemPrompt]);

  // Set input to active prompt if provided
  useEffect(() => {
    if (placeholder && placeholder !== "Type your message here...") {
      setInput(placeholder);
    }
  }, [placeholder]);

  // Scroll to bottom when messages change or when streaming
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, streamedResponse]);

  // Focus textarea on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSendMessage = async () => {
    if (input.trim() === "" || isLoading) return;

    // Add user message to the chat
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Prepare the payload for the API
    const messagesForAPI = [...messages, userMessage].filter(
      (msg) => msg.role !== "system" || msg === messages[0]
    );

    // Send to API
    await sendMessage(messagesForAPI);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          <div className="space-y-4 mb-4">
            {messages
              .filter((msg) => msg.role !== "system")
              .map((msg, index) => (
                <Card
                  key={index}
                  className={`overflow-hidden ${
                    msg.role === "user" ? "bg-muted/50" : "bg-background"
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="flex gap-2">
                      <div
                        className={`font-semibold ${
                          msg.role === "user"
                            ? "text-primary"
                            : "text-secondary-foreground"
                        }`}
                      >
                        {msg.role === "user" ? "You:" : "AI:"}
                      </div>
                      <div className="flex-1 whitespace-pre-wrap">
                        {msg.content}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

            {isLoading && (
              <Card className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex gap-2">
                    <div className="font-semibold text-secondary-foreground">
                      AI:
                    </div>
                    <div className="flex-1 whitespace-pre-wrap">
                      {streamedResponse || (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {error && (
              <Card className="overflow-hidden border-destructive">
                <CardContent className="p-3">
                  <div className="text-destructive text-sm">
                    Error: {error.message}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="border-t p-4">
        <div className="flex items-end gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings2 className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <OpenAISettingsPanel compact />
            </PopoverContent>
          </Popover>

          <Textarea
            ref={textareaRef}
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-12 resize-none flex-1"
            rows={1}
            maxRows={5}
          />

          {isLoading ? (
            <Button variant="destructive" onClick={stopGeneration}>
              <StopCircle className="h-4 w-4 mr-2" />
              Stop
            </Button>
          ) : (
            <Button onClick={handleSendMessage} disabled={input.trim() === ""}>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
