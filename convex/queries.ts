import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id, Doc } from "./_generated/dataModel";

/**
 * Types for query pagination options
 */
export type PaginationOptions = {
  limit?: number;
  cursor?: string | null;
};

// Define validator for pagination options
const paginationOptsValidator = v.object({
  limit: v.optional(v.number()),
  cursor: v.optional(v.string()),
});

// Define the query context type for our helpers
// Import TableNames type from Convex's generated types
import { TableNames } from "./_generated/dataModel";

// Import the necessary types from Convex
import { QueryInitializer as ConvexQueryInitializer, GenericTableInfo } from "convex/server";

// Define a generic type for the query initializer
type QueryInitializer<T extends TableNames> = {
  filter: (filterFunction: (q: ConvexQueryInitializer<GenericTableInfo>) => ConvexQueryInitializer<GenericTableInfo>) => QueryInitializer<T>;
  order: (direction: "asc" | "desc") => QueryInitializer<T>;
  paginate: (opts: {
    numItems: number;
    cursor: string | null;
  }) => Promise<{ page: Doc<T>[]; continueCursor: string | null }>;
  first: () => Promise<Doc<T> | null>;
  collect: () => Promise<Doc<T>[]>;
};

interface QueryCtx {
  db: {
    query: <T extends TableNames>(tableName: T) => QueryInitializer<T>;
    get: <T extends TableNames>(id: Id<T>) => Promise<Doc<T> | null>;
  };
  auth: {
    getUserIdentity: () => Promise<{ subject: string } | null>;
  };
  storage: {
    generateUploadUrl: () => Promise<string>;
    getUrl: (storageId: string) => Promise<string | null>;
  };
}

// Define a User interface for extended properties
interface UserDoc extends Doc<"users"> {
  imageUrl?: string;
  username?: string;
}

/**
 * Helper function to get a user ID from a Clerk ID
 */
async function getUserIdFromClerkId(
  ctx: QueryCtx,
  clerkId: string
): Promise<Id<"users"> | null> {
  const user = await ctx.db
    .query("users")
    .filter((q: any) => q.eq(q.field("clerkId"), clerkId))
    .first();

  return user?._id ?? null;
}

/**
 * Type-safe query builders for the Convex schema
 * This file provides reusable query and mutation builders for common operations
 */

// =================== USER RELATED QUERY BUILDERS ===================

/**
 * Get user by Clerk ID - useful for authentication
 */
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    return user;
  },
});

// =================== BLOG POST QUERY BUILDERS ===================

/**
 * Get published blog posts with pagination
 */
export const getPublishedBlogPosts = query({
  args: {
    pagination: paginationOptsValidator,
    tag: v.optional(v.string()),
    authorId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const { pagination, tag, authorId } = args;
    const { limit = 10, cursor } = pagination;    // Type the query correctly with proper table name
    let query = ctx.db
      .query("blogPosts")
      .filter((q) => q.eq(q.field("status"), "published"))
      .order("desc");    // Apply tag filter if provided
    if (tag) {
      // Use appropriate array filter method for Convex
      query = query.filter((q) => {
        const tags = q.field("tags");
        // Check if tags exists and use appropriate method to check inclusion
        return tags ? q.or(...(Array.isArray(tags) ? tags.map(t => q.eq(t, tag)) : [])) : false;
      });
    }    // Apply author filter if provided
    if (authorId) {
      query = query.filter((q) =>
        q.eq(q.field("authorId"), authorId)
      );
    }    // Apply pagination with proper parameter format
    const posts = await query.paginate({ numItems: limit, cursor: cursor ? cursor : null });

    // Get author details for each post
    const postsWithAuthors = await Promise.all(
      posts.page.map(async (post) => {
        // Safely get the author
        const author = post.authorId ? await ctx.db.get(post.authorId) : null;

        // Create return object with proper typing
        return {
          ...post,
          author: author 
            ? {
                _id: author._id,
                firstName: author.firstName || null,
                lastName: author.lastName || null,
                // Use proper type assertion for UserDoc interface
                imageUrl: (author as UserDoc).imageUrl || null,
                username: (author as UserDoc).username || null,
              }
            : undefined,
        };
      })
    );

    return {
      posts: postsWithAuthors,
      continueCursor: posts.continueCursor?.toString(),
    };
  },
});

/**
 * Get a blog post by slug
 */
export const getBlogPostBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("blogPosts")
      .filter((q) => q.eq(q.field("slug"), args.slug))
      .first();

    if (!post) return null;

    // Get author details
    const author = post.authorId ? await ctx.db.get(post.authorId) : null;

    // Get featured image if exists
    const featuredImage = post.featuredImageId
      ? await ctx.db.get(post.featuredImageId)
      : null;

    // Return the enriched post
    return {
      ...post,      author: author
        ? {
            _id: author._id,
            firstName: author.firstName || null,
            lastName: author.lastName || null,
            // Use proper type assertion for UserDoc interface
            imageUrl: (author as UserDoc).imageUrl || null,
            username: (author as UserDoc).username || null,
          }
        : undefined,
      featuredImage: featuredImage
        ? {
            _id: featuredImage._id,
            url: featuredImage.url || "",
            alt: featuredImage.alt || "",
          }
        : undefined,
    };
  },
});

/**
 * Create or update a blog post
 */
export const createOrUpdateBlogPost = mutation({
  args: {
    id: v.optional(v.id("blogPosts")),
    title: v.string(),
    content: v.string(),
    excerpt: v.optional(v.string()),
    slug: v.string(),
    featuredImageId: v.optional(v.id("fileUploads")),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    ),
    tags: v.optional(v.array(v.string())),
    categories: v.optional(v.array(v.string())),
    seoDescription: v.optional(v.string()),
    allowComments: v.optional(v.boolean()),
    featured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Get the current user
    const auth = await ctx.auth.getUserIdentity();
    if (!auth) {
      throw new ConvexError("Unauthorized");
    } // Cast to unknown first to avoid type errors
    const userId = await getUserIdFromClerkId(
      ctx as unknown as QueryCtx,
      auth.subject
    );
    if (!userId) {
      throw new ConvexError("User not found");
    }

    const now = Date.now();

    // If updating an existing post
    if (args.id) {
      const post = await ctx.db.get(args.id);
      if (!post) {
        throw new ConvexError("Post not found");
      }

      // Check if user is the author
      if (post.authorId !== userId) {
        throw new ConvexError("Not authorized to edit this post");
      }

      // Save the previous version
      await ctx.db.insert("blogPostRevisions", {
        postId: args.id,
        title: post.title,
        content: post.content,
        authorId: userId,
        createdAt: now,
        changeDescription: "Auto-saved revision",
      });

      // Update the post
      await ctx.db.patch(args.id, {
        title: args.title,
        content: args.content,
        excerpt: args.excerpt,
        slug: args.slug,
        featuredImageId: args.featuredImageId,
        status: args.status,
        tags: args.tags,
        categories: args.categories,
        seoDescription: args.seoDescription,
        allowComments: args.allowComments ?? post.allowComments,
        featured: args.featured ?? post.featured,
        updatedAt: now,
        // Only set publishedAt if transitioning to published state
        ...(args.status === "published" && post.status !== "published"
          ? { publishedAt: now }
          : {}),
      });

      return args.id;
    }
    // Creating a new post
    else {
      return await ctx.db.insert("blogPosts", {
        title: args.title,
        content: args.content,
        excerpt: args.excerpt,
        slug: args.slug,
        featuredImageId: args.featuredImageId,
        authorId: userId,
        status: args.status,
        tags: args.tags ?? [],
        categories: args.categories ?? [],
        seoDescription: args.seoDescription,
        allowComments: args.allowComments ?? true,
        featured: args.featured ?? false,
        createdAt: now,
        updatedAt: now,
        publishedAt: args.status === "published" ? now : undefined,
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
      });
    }
  },
});

// =================== FILE UPLOAD QUERY BUILDERS ===================

/**
 * Generate a URL for file upload
 */
export const generateUploadUrl = mutation({
  args: {
    filename: v.string(),
    mimeType: v.string(),
    folder: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Get the current user
    const auth = await ctx.auth.getUserIdentity();
    if (!auth) {
      throw new ConvexError("Unauthorized");
    }

    const userId = await getUserIdFromClerkId(
      ctx as unknown as QueryCtx,
      auth.subject
    );
    if (!userId) {
      throw new ConvexError("User not found");
    }

    // Generate a URL for the file upload
    const storageId = await ctx.storage.generateUploadUrl();

    // Add the placeholder record in the fileUploads table
    const fileId = await ctx.db.insert("fileUploads", {
      filename: args.filename,
      mimeType: args.mimeType,
      size: 0, // Will be updated when the file is uploaded
      storageId,
      url: "", // Will be updated when the file is uploaded
      uploadedBy: userId,
      folder: args.folder,
      isPublic: args.isPublic ?? false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { storageId, fileId, uploadUrl: storageId };
  },
});

/**
 * Complete the file upload process
 */
export const completeFileUpload = mutation({
  args: {
    fileId: v.id("fileUploads"),
    size: v.number(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    duration: v.optional(v.number()),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    alt: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Get the current user
    const auth = await ctx.auth.getUserIdentity();
    if (!auth) {
      throw new ConvexError("Unauthorized");
    }

    // Get the file record
    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new ConvexError("File not found");
    }

    // Make sure the user is the uploader
    const userId = await getUserIdFromClerkId(
      ctx as unknown as QueryCtx,
      auth.subject
    );
    if (file.uploadedBy !== userId) {
      throw new ConvexError("Not authorized to update this file");
    }

    // Get the URL for the file
    const url = await ctx.storage.getUrl(file.storageId);
    if (!url) {
      throw new ConvexError("File storage URL not found");
    }

    // Update the file record
    await ctx.db.patch(args.fileId, {
      size: args.size,
      url,
      width: args.width,
      height: args.height,
      duration: args.duration,
      title: args.title ?? file.title,
      description: args.description ?? file.description,
      alt: args.alt ?? file.alt,
      tags: args.tags ?? file.tags,
      updatedAt: Date.now(),
    });

    return { fileId: args.fileId, url };
  },
});

// =================== ANALYTICS QUERY BUILDERS ===================

/**
 * Track API usage
 */
export const trackApiUsage = mutation({
  args: {
    endpoint: v.string(),
    method: v.string(),
    statusCode: v.number(),
    latencyMs: v.number(),
    requestSize: v.optional(v.number()),
    responseSize: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the current user if authenticated
    const auth = await ctx.auth.getUserIdentity();

    // Safely handle the optional userId
    let userId: Id<"users"> | undefined = undefined;
    if (auth) {
      const tempUserId = await getUserIdFromClerkId(
        ctx as unknown as QueryCtx,
        auth.subject
      );
      if (tempUserId) {
        userId = tempUserId;
      }
    }

    // Log the API usage
    await ctx.db.insert("apiUsage", {
      endpoint: args.endpoint,
      method: args.method,
      userId: userId,
      statusCode: args.statusCode,
      latencyMs: args.latencyMs,
      timestamp: Date.now(),
      requestSize: args.requestSize,
      responseSize: args.responseSize,
      ipAddress: undefined,
      userAgent: undefined,
      errorMessage: args.errorMessage,
    });
  },
});

/**
 * Get API usage statistics
 */
export const getApiUsageStats = query({
  handler: async (ctx) => {
    // Get all API usage records from the last 24 hours
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const apiUsage = await ctx.db
      .query("apiUsage")
      .filter((q) => q.gte(q.field("timestamp"), oneDayAgo))
      .collect();

    // Calculate statistics
    const totalRequests = apiUsage.length;
    const successRequests = apiUsage.filter(
      (r) => r.statusCode >= 200 && r.statusCode < 300
    ).length;
    const errorRequests = apiUsage.filter((r) => r.statusCode >= 400).length;

    const endpointCounts = apiUsage.reduce(
      (acc, record) => {
        acc[record.endpoint] = (acc[record.endpoint] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const averageLatency =
      apiUsage.reduce((sum, record) => sum + record.latencyMs, 0) /
      (totalRequests || 1);

    return {
      totalRequests,
      successRequests,
      errorRequests,
      successRate: totalRequests ? (successRequests / totalRequests) * 100 : 0,
      endpointCounts,
      averageLatency,
    };
  },
});
