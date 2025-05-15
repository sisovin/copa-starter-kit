"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { useState } from "react";

// Define the template structure
type PromptTemplate = {
  id: string;
  title: string;
  prompt: string;
  category: string;
  tags: string[];
};

interface PromptTemplatesProps {
  onSelectTemplate: (prompt: string) => void;
  className?: string;
}

// Sample prompt templates
const predefinedTemplates: PromptTemplate[] = [
  {
    id: "1",
    title: "Brainstorm Ideas",
    prompt:
      "I need 5 creative ideas about [topic]. For each idea, provide a brief description and potential benefits.",
    category: "Creativity",
    tags: ["brainstorming", "ideas", "creativity"],
  },
  {
    id: "2",
    title: "Explain a Concept",
    prompt:
      "Explain [concept] in simple terms as if you're talking to a 10-year-old.",
    category: "Education",
    tags: ["explanation", "simplified", "learning"],
  },
  {
    id: "3",
    title: "Debug Code",
    prompt:
      "Here's my [programming language] code that has an issue:\n\n```\n[paste code here]\n```\n\nThe error message is: [error message]\n\nPlease help me debug this code.",
    category: "Programming",
    tags: ["debugging", "coding", "help"],
  },
  {
    id: "4",
    title: "Summarize Text",
    prompt:
      "Please summarize the following text in 3-5 bullet points:\n\n[paste text here]",
    category: "Writing",
    tags: ["summary", "bullets", "concise"],
  },
  {
    id: "5",
    title: "Create a Learning Plan",
    prompt:
      "I want to learn [topic]. Create a step-by-step learning plan for me, including resources and estimated time needed for each step.",
    category: "Education",
    tags: ["learning", "plan", "roadmap"],
  },
  {
    id: "6",
    title: "Compare and Contrast",
    prompt:
      "Compare and contrast [item 1] and [item 2] in terms of their [aspects to compare].",
    category: "Analysis",
    tags: ["comparison", "analysis", "differences"],
  },
  {
    id: "7",
    title: "Write a Story",
    prompt:
      "Write a short story about [character] who [situation] in the style of [author or genre].",
    category: "Creative Writing",
    tags: ["story", "fiction", "creative"],
  },
  {
    id: "8",
    title: "Create a Marketing Description",
    prompt:
      "Write a compelling marketing description for [product/service] that highlights its benefits and unique selling points for [target audience].",
    category: "Marketing",
    tags: ["copywriting", "marketing", "description"],
  },
];

export function PromptTemplates({
  onSelectTemplate,
  className,
}: PromptTemplatesProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get unique categories from templates
  const categories = [
    ...new Set(predefinedTemplates.map((template) => template.category)),
  ];

  // Filter templates by search and category
  const filteredTemplates = predefinedTemplates.filter((template) => {
    const matchesSearch =
      search === "" ||
      template.title.toLowerCase().includes(search.toLowerCase()) ||
      template.prompt.toLowerCase().includes(search.toLowerCase()) ||
      template.tags.some((tag) =>
        tag.toLowerCase().includes(search.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === null || template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleSelectTemplate = (prompt: string) => {
    onSelectTemplate(prompt);
  };

  return (
    <div className={className}>
      <div className="flex flex-col space-y-4 mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "secondary" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "secondary" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="text-center p-8 text-muted-foreground">
          No templates match your search
        </div>
      ) : (
        <ScrollArea className="h-[500px] pr-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className="hover:bg-accent/10 transition-colors"
              >
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {template.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    {template.prompt}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectTemplate(template.prompt)}
                  >
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
