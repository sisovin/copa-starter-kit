"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertTriangle,
  Bot,
  Copy,
  Loader2,
  Send,
  StopCircle,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

// Define types for messages
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Mock API for demonstration
async function* mockStreamingAPI(
  prompt: string,
  signal: AbortSignal
): AsyncGenerator<string> {
  const response = `Thank you for your question!\n\nHere's a sample response with **markdown** support:\n\n## Features\n\n1. Streaming responses\n2. Markdown rendering\n3. Code highlighting\n\n\`\`\`javascript\nconst greeting = "Hello, world!";\nconsole.log(greeting);\n\`\`\`\n\nYou can also create tables:\n\n| Feature | Status |\n| ------- | ------ |\n| Streaming | ✅ |\n| Markdown | ✅ |\n| History | ✅ |\n`;

  // Split response into chunks to simulate streaming
  const chunks = response.split(" ");

  for (let i = 0; i < chunks.length; i++) {
    if (signal.aborted) {
      return;
    }

    yield chunks[i] + " ";
    await new Promise((resolve) =>
      setTimeout(resolve, 20 + Math.random() * 80)
    );
  }
}

export default function PlaygroundChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitTimer, setRateLimitTimer] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Rate limit countdown timer
  useEffect(() => {
    if (isRateLimited && rateLimitTimer > 0) {
      const timer = setTimeout(() => {
        setRateLimitTimer(rateLimitTimer - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (rateLimitTimer === 0 && isRateLimited) {
      setIsRateLimited(false);
    }
  }, [isRateLimited, rateLimitTimer]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load messages from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem("playground-chat-messages");
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        // Convert timestamp strings back to Date objects
        const messagesWithDateObjects = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(messagesWithDateObjects);
      } catch (error) {
        console.error("Failed to parse saved messages:", error);
      }
    }
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(
        "playground-chat-messages",
        JSON.stringify(messages)
      );
    }
  }, [messages]);

  async function handleSendMessage() {
    if (!input.trim() || isGenerating) return;

    // Check if user is rate limited
    if (isRateLimited) {
      toast({
        title: "Rate limited",
        description: `Please wait ${rateLimitTimer} seconds before sending a new message.`,
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setIsGenerating(true);

    // Create assistant message placeholder
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, assistantMessage]);

    // Simulate rate limiting
    setIsRateLimited(true);
    setRateLimitTimer(15); // Set rate limit for 15 seconds

    // Streaming API call with abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      const stream = mockStreamingAPI(input, signal);

      for await (const chunk of stream) {
        setMessages((prevMessages) => {
          return prevMessages.map((msg) => {
            if (msg.id === assistantMessageId) {
              return {
                ...msg,
                content: msg.content + chunk,
              };
            }
            return msg;
          });
        });
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        console.log("Message generation was stopped");
      } else {
        console.error("Error generating response:", error);
        toast({
          title: "Error",
          description: "Failed to generate a response. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  }

  function handleStopGeneration() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
  }

  function handleCopyMessage(content: string) {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: "Message content copied successfully!",
        });
      })
      .catch((err) => {
        toast({
          title: "Copy failed",
          description: "Failed to copy content to clipboard.",
          variant: "destructive",
        });
        console.error("Failed to copy:", err);
      });
  }

  function clearChat() {
    setMessages([]);
    localStorage.removeItem("playground-chat-messages");
    toast({
      title: "Chat cleared",
      description: "All messages have been removed.",
    });
  }

  return (
    <div className="flex flex-col h-[800px] max-h-[80vh] rounded-lg border">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">AI Playground Chat</h2>
        <Button variant="outline" onClick={clearChat}>
          Clear Chat
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col gap-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
              <Bot size={48} className="mb-4 opacity-50" />
              <h3 className="text-lg font-medium">Start a conversation</h3>
              <p>Ask a question to begin chatting with the AI assistant.</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/bot-avatar.png" />
                    <AvatarFallback>
                      <Bot size={16} />
                    </AvatarFallback>
                  </Avatar>
                )}

                <Card
                  className={`max-w-[85%] ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                >
                  <CardContent className="p-3 relative">
                    {message.role === "user" ? (
                      <p className="whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    ) : (
                      <>
                        <div className="prose dark:prose-invert max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkBreaks]}
                            components={{
                              code({
                                node,
                                inline,
                                className,
                                children,
                                ...props
                              }) {
                                const match = /language-(\w+)/.exec(
                                  className || ""
                                );
                                return !inline && match ? (
                                  <SyntaxHighlighter
                                    style={vscDarkPlus}
                                    language={match[1]}
                                    PreTag="div"
                                    {...props}
                                  >
                                    {String(children).replace(/\n$/, "")}
                                  </SyntaxHighlighter>
                                ) : (
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                );
                              },
                            }}
                          >
                            {message.content || "*Generating...*"}
                          </ReactMarkdown>
                        </div>
                        <button
                          onClick={() => handleCopyMessage(message.content)}
                          className="absolute top-2 right-2 p-1 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                          aria-label="Copy message"
                        >
                          <Copy size={14} />
                        </button>
                      </>
                    )}
                  </CardContent>
                </Card>

                {message.role === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/user-avatar.png" />
                    <AvatarFallback>
                      <User size={16} />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {isRateLimited && (
        <div className="p-2 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 border-t flex items-center justify-center text-sm">
          <AlertTriangle size={16} className="mr-2 text-amber-500" />
          Rate limited for {rateLimitTimer} seconds
        </div>
      )}

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            className="min-h-[60px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isGenerating || isRateLimited}
          />
          <div className="flex flex-col gap-2">
            {isGenerating ? (
              <Button onClick={handleStopGeneration} variant="destructive">
                <StopCircle className="mr-2 h-4 w-4" />
                Stop
              </Button>
            ) : (
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isRateLimited}
              >
                {isRateLimited ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Send
              </Button>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Shift+Enter for a new line. Messages are preserved in your
          browser.
        </p>
      </div>
    </div>
  );
}
