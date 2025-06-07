import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { PostFrontmatterSchema } from "@/types/blog";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { TOCEntry, RelatedPost } from "@/types/blog";
import { allPosts } from "contentlayer/generated";

/**
 * Extract the table of contents from HTML content
 */
export function extractTOC(content: string): TOCEntry[] {
  const headingRegex = /<h([2-3]).*?id="(.*?)".*?>(.*?)<\/h[2-3]>/g;
  const toc: TOCEntry[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = parseInt(match[1], 10);
    const id = match[2];
    // Remove HTML tags from heading text
    const text = match[3].replace(/<[^>]*>?/gm, "");
    toc.push({ level, id, text });
  }

  return toc;
}

/**
 * Validate frontmatter against schema
 */
export function validateFrontmatter(frontmatter: Record<string, any>) {
  try {
    return {
      data: PostFrontmatterSchema.parse(frontmatter),
      error: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        data: null,
        error: fromZodError(error).toString(),
      };
    }
    return {
      data: null,
      error: "Invalid frontmatter",
    };
  }
}

/**
 * Find related posts based on tags
 */
export function findRelatedPosts(
  currentSlug: string,
  limit = 3
): RelatedPost[] {
  const currentPost = allPosts.find((post) => post.slug === currentSlug);

  if (!currentPost || !currentPost.tags) {
    return [];
  }

  const currentTags = new Set(currentPost.tags);

  return allPosts
    .filter((post) => post.slug !== currentSlug && !post.draft)
    .map((post) => {
      // Calculate similarity score based on shared tags
      const postTags = new Set(post.tags || []);
      const sharedTags = [...currentTags].filter((tag) => postTags.has(tag));
      const similarity =
        sharedTags.length / Math.max(currentTags.size, postTags.size);

      return {
        slug: post.slug,
        title: post.title,
        description: post.description,
        date: post.date,
        similarity,
      };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

/**
 * Parse date to formatted string
 */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
