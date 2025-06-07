"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useOpenAI } from "@/hooks/use-openai";
import { Check, Copy, Loader2 } from "lucide-react";
import { useState } from "react";

interface CodeGenerationProps {
  className?: string;
}

const programmingLanguages = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "ruby", label: "Ruby" },
];

export function CodeGeneration({ className }: CodeGenerationProps) {
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [copied, setCopied] = useState(false);

  const { isLoading, error, streamedResponse, sendMessage, reset } = useOpenAI({
    onError: (error) => {
      console.error("OpenAI error:", error);
    },
  });

  const handleGenerateCode = async () => {
    if (!prompt.trim() || isLoading) return;

    const systemPrompt = `You are an expert ${language} programmer. 
Respond ONLY with clean, well-commented ${language} code without any explanations or markdown formatting.
Make sure the code is production-ready, follows best practices, and is thoroughly commented.`;

    await sendMessage(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      {
        temperature: 0.5, // Lower for more deterministic code
      }
    );
  };

  const handleCopyCode = () => {
    if (!streamedResponse) return;

    navigator.clipboard.writeText(streamedResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Code Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="language-select">Programming Language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger id="language-select">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {programmingLanguages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="code-prompt">Describe the code you need</Label>
          <Textarea
            id="code-prompt"
            placeholder={`Example: "Create a function that sorts an array of objects by a specific property"`}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        {(streamedResponse || isLoading) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Generated Code</Label>
              {streamedResponse && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyCode}
                  className="h-8 px-2"
                >
                  {copied ? (
                    <Check className="h-4 w-4 mr-1" />
                  ) : (
                    <Copy className="h-4 w-4 mr-1" />
                  )}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              )}
            </div>
            <Card className="overflow-hidden bg-muted">
              <ScrollArea className="h-[300px] w-full p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {streamedResponse}
                  </pre>
                )}
              </ScrollArea>
            </Card>
          </div>
        )}

        {error && (
          <Card className="bg-destructive/10 border-destructive p-4">
            <p className="text-destructive">{error.message}</p>
          </Card>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={reset}
          disabled={isLoading || !streamedResponse}
        >
          Clear
        </Button>
        <Button
          onClick={handleGenerateCode}
          disabled={!prompt.trim() || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Code"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
