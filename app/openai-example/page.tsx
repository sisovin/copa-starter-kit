"use client";

import { ChatHistory } from "@/components/openai/chat-history";
import { CodeGeneration } from "@/components/openai/code-generation";
import { OpenAIChat } from "@/components/openai/openai-chat";
import { PromptTemplates } from "@/components/openai/prompt-templates";
import { OpenAISettingsPanel } from "@/components/openai/settings-panel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OpenAIProvider } from "@/contexts/openai-provider";
import { AlertCircle } from "lucide-react";
import { useState } from "react";

// Define the message type for sharing between components
type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

function APIConfigAlert() {
  return (
    <Alert className="mb-6" variant="warning">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Configuration Required</AlertTitle>
      <AlertDescription>
        To use this example, you need to add your OpenAI API key to the{" "}
        <code className="bg-muted px-1 py-0.5 rounded">.env.local</code> file.
        See the{" "}
        <code className="bg-muted px-1 py-0.5 rounded">.env.example</code> file
        for reference.
      </AlertDescription>
    </Alert>
  );
}

function ImplementationDetails() {
  return (
    <div className="mt-4">
      <h2 className="text-2xl font-bold mb-4">Implementation Details</h2>
      <Separator className="mb-6" />

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-3">Features</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Zod schema validation for request &amp; response</li>
            <li>Edge runtime support for fast API responses</li>
            <li>Streaming responses for real-time UI updates</li>
            <li>Rate limiting to prevent abuse</li>
            <li>Proper error handling and logging</li>
            <li>Fine control over model parameters</li>
            <li>Chat history persistence</li>
            <li>Prompt templates library</li>
            <li>Code generation specialized UI</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-3">API Structure</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <code>/api/openai/route.ts</code> - Main API endpoint
            </li>
            <li>
              <code>/lib/openai-schema.ts</code> - Zod validation schemas
            </li>
            <li>
              <code>/lib/openai-client.ts</code> - Client utilities
            </li>
            <li>
              <code>/hooks/use-openai.ts</code> - React hook for API integration
            </li>
            <li>
              <code>/components/openai/openai-chat.tsx</code> - Chat component
            </li>
            <li>
              <code>/components/openai/settings-panel.tsx</code> - Settings UI
            </li>
            <li>
              <code>/components/openai/chat-history.tsx</code> - History
              management
            </li>
            <li>
              <code>/components/openai/prompt-templates.tsx</code> - Prompt
              templates
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function OpenAIExample() {
  // State to share between components
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      role: "system",
      content:
        "You are a helpful assistant. Be concise and provide clear information.",
    },
  ]);

  const [activePrompt, setActivePrompt] = useState("");

  const handleSelectSession = (messages: Message[]) => {
    setChatMessages(messages);
  };

  const handleSelectTemplate = (prompt: string) => {
    setActivePrompt(prompt);
  };

  return (
    <OpenAIProvider>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">OpenAI Integration Examples</h1>

        <APIConfigAlert />

        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="chat">AI Chat</TabsTrigger>
            <TabsTrigger value="code">Code Generation</TabsTrigger>
            <TabsTrigger value="history">Chat History</TabsTrigger>
            <TabsTrigger value="templates">Prompt Templates</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-6">
            <Card className="w-full h-[600px]">
              <CardHeader className="pb-2">
                <CardTitle>AI Chat</CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-56px)]">
                <OpenAIChat
                  initialMessages={chatMessages.filter(
                    (msg) => msg.role !== "system"
                  )}
                  systemPrompt={
                    chatMessages.find((msg) => msg.role === "system")?.content
                  }
                  placeholder={activePrompt || "Type your message here..."}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="code">
            <CodeGeneration className="max-w-4xl mx-auto" />
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Chat History</CardTitle>
              </CardHeader>
              <CardContent>
                <ChatHistory
                  onSelectSession={handleSelectSession}
                  currentMessages={chatMessages}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Prompt Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <PromptTemplates onSelectTemplate={handleSelectTemplate} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="max-w-2xl mx-auto">
              <OpenAISettingsPanel />
            </div>
          </TabsContent>

          <TabsContent value="about">
            <Card>
              <CardContent className="pt-6">
                <ImplementationDetails />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </OpenAIProvider>
  );
}
