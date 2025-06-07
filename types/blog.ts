import { z } from "zod";

// This schema defines the frontmatter structure for MDX blog posts
export const PostFrontmatterSchema = z.object({
  title: z.string({
    required_error: "Title is required",
    invalid_type_error: "Title must be a string",
  }),
  date: z
    .string({
      required_error: "Date is required",
      invalid_type_error: "Date must be a string in YYYY-MM-DD format",
    })
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "Date must be in YYYY-MM-DD format",
    }),
  author: z.string({
    required_error: "Author is required",
    invalid_type_error: "Author must be a string",
  }),
  description: z.string().optional(),
  image: z.string().url({ message: "Image must be a valid URL" }).optional(),
  tags: z.array(z.string()).optional(),
  draft: z.boolean().optional().default(false),
});

// Type for the post frontmatter derived from the schema
export type PostFrontmatter = z.infer<typeof PostFrontmatterSchema>;

// Type for Table of Contents entry
export interface TOCEntry {
  id: string;
  text: string;
  level: number;
}

// Type for related post suggestion
export interface RelatedPost {
  slug: string;
  title: string;
  description?: string;
  date: string;
  similarity: number;
}

// Utility type for post with partial content (for listings)
export type PostPreview = {
  slug: string;
  title: string;
  date: string;
  author: string;
  description?: string;
  image?: string;
  tags?: string[];
  readingTime: number;
};
