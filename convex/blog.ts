import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { paginationOptsValidator, dateRangeValidator } from "./lib/validators";
import {
  generateSlug,
  validateAuthenticated,
  validateUserRole,
  trackActivity,
  recordAuditLog,
} from "./lib/utils";

/**
 * Get a list of published blog posts
 */
export const listPublishedPosts = query({
  args: {
    pagination: paginationOptsValidator,
    tag: v.optional(v.string()),
    category: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    dateRange: v.optional(dateRangeValidator),
  },
  handler: async (ctx, args) => {
    const { pagination, tag, category, featured, dateRange } = args;
    const { limit = 10, cursor } = pagination;

    // Start with a base query for published posts
    let postsQuery = ctx.db
      .query("blogPosts")
      .filter((q) => q.eq(q.field("status"), "published"))
      .order("desc", (q) => q.field("publishedAt"));

    // Apply tag filter if provided
    if (tag) {
      postsQuery = postsQuery.filter((q) => q.includes(q.field("tags"), tag));
    }

    // Apply category filter if provided
    if (category) {
      postsQuery = postsQuery.filter((q) =>
        q.includes(q.field("categories"), category)
      );
    }

    // Apply featured filter if provided
    if (featured !== undefined) {
      postsQuery = postsQuery.filter((q) =>
        q.eq(q.field("featured"), featured)
      );
    }

    // Apply date range filter if provided
    if (dateRange) {
      if (dateRange.start) {
        postsQuery = postsQuery.filter((q) =>
          q.gte(q.field("publishedAt"), dateRange.start!)
        );
      }
      if (dateRange.end) {
        postsQuery = postsQuery.filter((q) =>
          q.lte(q.field("publishedAt"), dateRange.end!)
        );
      }
    }

    // Execute the query with pagination
    const cursorObj = cursor ? { numericValue: parseFloat(cursor) } : undefined;
    const posts = await postsQuery.paginate(cursorObj, limit);

    // Get author information for each post
    const postsWithAuthors = await Promise.all(
      posts.page.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        let featuredImage = null;

        if (post.featuredImageId) {
          featuredImage = await ctx.db.get(post.featuredImageId);
        }

        return {
          ...post,
          author: author
            ? {
                _id: author._id,
                firstName: author.firstName,
                lastName: author.lastName,
                username: author.username,
                imageUrl: author.imageUrl,
              }
            : null,
          featuredImage: featuredImage
            ? {
                _id: featuredImage._id,
                url: featuredImage.url,
                alt: featuredImage.alt,
              }
            : null,
        };
      })
    );

    return {
      posts: postsWithAuthors,
      continueCursor: posts.continueCursor?.toString(),
      hasMore: !!posts.continueCursor,
    };
  },
});

/**
 * Get a list of all blog posts (including drafts) for a specific author or admin
 */
export const listAuthorPosts = query({
  args: {
    pagination: paginationOptsValidator,
    status: v.optional(
      v.union(
        v.literal("all"),
        v.literal("draft"),
        v.literal("published"),
        v.literal("archived")
      )
    ),
  },
  handler: async (ctx, args) => {
    const { userId } = await validateAuthenticated(ctx);
    const { pagination, status = "all" } = args;
    const { limit = 10, cursor } = pagination;

    // Start with a base query for the user's posts
    let postsQuery = ctx.db
      .query("blogPosts")
      .filter((q) => q.eq(q.field("authorId"), userId))
      .order("desc", (q) => q.field("updatedAt"));

    // Apply status filter if provided
    if (status !== "all") {
      postsQuery = postsQuery.filter((q) => q.eq(q.field("status"), status));
    }

    // Execute the query with pagination
    const cursorObj = cursor ? { numericValue: parseFloat(cursor) } : undefined;
    const posts = await postsQuery.paginate(cursorObj, limit);

    // Get featured image for each post
    const postsWithImages = await Promise.all(
      posts.page.map(async (post) => {
        let featuredImage = null;

        if (post.featuredImageId) {
          featuredImage = await ctx.db.get(post.featuredImageId);
        }

        return {
          ...post,
          featuredImage: featuredImage
            ? {
                _id: featuredImage._id,
                url: featuredImage.url,
                alt: featuredImage.alt,
              }
            : null,
        };
      })
    );

    return {
      posts: postsWithImages,
      continueCursor: posts.continueCursor?.toString(),
      hasMore: !!posts.continueCursor,
    };
  },
});

/**
 * Get a single blog post by ID or slug
 */
export const getBlogPost = query({
  args: {
    id: v.optional(v.id("blogPosts")),
    slug: v.optional(v.string()),
    includeRevisions: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Validate that at least one of id or slug is provided
    if (!args.id && !args.slug) {
      throw new ConvexError("Must provide either id or slug");
    }

    let post;

    if (args.id) {
      post = await ctx.db.get(args.id);
    } else if (args.slug) {
      post = await ctx.db
        .query("blogPosts")
        .filter((q) => q.eq(q.field("slug"), args.slug!))
        .first();
    }

    if (!post) {
      return null;
    }

    // Get the author
    const author = await ctx.db.get(post.authorId);

    // Get the featured image
    let featuredImage = null;
    if (post.featuredImageId) {
      featuredImage = await ctx.db.get(post.featuredImageId);
    }

    // Get post revisions if requested
    let revisions = [];
    if (args.includeRevisions) {
      // Only allow revision access for post authors or admins
      try {
        const { userId } = await validateAuthenticated(ctx);
        const isAdmin = await isUserAdmin(ctx, userId);

        if (isAdmin || post.authorId === userId) {
          revisions = await ctx.db
            .query("blogPostRevisions")
            .filter((q) => q.eq(q.field("postId"), post._id))
            .order("desc", (q) => q.field("createdAt"))
            .collect();
        }
      } catch (e) {
        // Not authenticated or not authorized - don't include revisions
      }
    }

    // If the post is published, increment view count
    if (post.status === "published") {
      await ctx.db.patch(post._id, {
        viewCount: post.viewCount + 1,
      });
    }

    return {
      ...post,
      author: author
        ? {
            _id: author._id,
            firstName: author.firstName,
            lastName: author.lastName,
            username: author.username,
            imageUrl: author.imageUrl,
          }
        : null,
      featuredImage: featuredImage
        ? {
            _id: featuredImage._id,
            url: featuredImage.url,
            alt: featuredImage.alt,
          }
        : null,
      revisions,
    };
  },
});

/**
 * Create a new blog post
 */
export const createBlogPost = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    excerpt: v.optional(v.string()),
    slug: v.optional(v.string()),
    featuredImageId: v.optional(v.id("fileUploads")),
    status: v.optional(v.union(v.literal("draft"), v.literal("published"))),
    tags: v.optional(v.array(v.string())),
    categories: v.optional(v.array(v.string())),
    seoDescription: v.optional(v.string()),
    allowComments: v.optional(v.boolean()),
    featured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Authenticate the user
    const { userId } = await validateAuthenticated(ctx);

    // Generate slug if not provided
    const slug = args.slug || generateSlug(args.title);

    // Check if slug is unique
    const existingPost = await ctx.db
      .query("blogPosts")
      .filter((q) => q.eq(q.field("slug"), slug))
      .first();

    if (existingPost) {
      throw new ConvexError(`A post with the slug "${slug}" already exists`);
    }

    const status = args.status || "draft";
    const now = Date.now();

    // Create the post
    const postId = await ctx.db.insert("blogPosts", {
      title: args.title,
      content: args.content,
      excerpt: args.excerpt || args.content.substring(0, 160),
      slug,
      featuredImageId: args.featuredImageId,
      authorId: userId,
      status,
      tags: args.tags || [],
      categories: args.categories || [],
      seoDescription:
        args.seoDescription || args.excerpt || args.content.substring(0, 160),
      allowComments: args.allowComments ?? true,
      featured: args.featured ?? false,
      createdAt: now,
      updatedAt: now,
      publishedAt: status === "published" ? now : undefined,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
    });

    // Track the activity
    await trackActivity(ctx, userId, "create", "blogPost", postId, {
      title: args.title,
      status,
    });

    return postId;
  },
});

/**
 * Update an existing blog post
 */
export const updateBlogPost = mutation({
  args: {
    id: v.id("blogPosts"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    slug: v.optional(v.string()),
    featuredImageId: v.optional(v.id("fileUploads")),
    status: v.optional(
      v.union(v.literal("draft"), v.literal("published"), v.literal("archived"))
    ),
    tags: v.optional(v.array(v.string())),
    categories: v.optional(v.array(v.string())),
    seoDescription: v.optional(v.string()),
    allowComments: v.optional(v.boolean()),
    featured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Authenticate the user
    const { userId } = await validateAuthenticated(ctx);

    // Get the existing post
    const post = await ctx.db.get(args.id);
    if (!post) {
      throw new ConvexError("Post not found");
    }

    // Check authorization (must be the author or an admin)
    if (post.authorId !== userId) {
      const isAdmin = await isUserAdmin(ctx, userId);
      if (!isAdmin) {
        throw new ConvexError("Not authorized to update this post");
      }
    }

    // If slug is being changed, verify it's unique
    if (args.slug && args.slug !== post.slug) {
      const existingPost = await ctx.db
        .query("blogPosts")
        .filter((q) => q.eq(q.field("slug"), args.slug!))
        .first();

      if (existingPost && existingPost._id !== args.id) {
        throw new ConvexError(
          `A post with the slug "${args.slug}" already exists`
        );
      }
    }

    // Create a revision of the current content
    if (args.content && args.content !== post.content) {
      await ctx.db.insert("blogPostRevisions", {
        postId: post._id,
        title: post.title,
        content: post.content,
        authorId: userId,
        createdAt: Date.now(),
        changeDescription: "Auto-saved before update",
      });
    }

    const now = Date.now();

    // Prepare update data
    const updateData: any = {
      updatedAt: now,
    };

    // Only update fields that are provided
    if (args.title !== undefined) updateData.title = args.title;
    if (args.content !== undefined) updateData.content = args.content;
    if (args.excerpt !== undefined) updateData.excerpt = args.excerpt;
    if (args.slug !== undefined) updateData.slug = args.slug;
    if (args.featuredImageId !== undefined)
      updateData.featuredImageId = args.featuredImageId;
    if (args.tags !== undefined) updateData.tags = args.tags;
    if (args.categories !== undefined) updateData.categories = args.categories;
    if (args.seoDescription !== undefined)
      updateData.seoDescription = args.seoDescription;
    if (args.allowComments !== undefined)
      updateData.allowComments = args.allowComments;
    if (args.featured !== undefined) updateData.featured = args.featured;

    // Handle status changes
    if (args.status !== undefined && args.status !== post.status) {
      updateData.status = args.status;

      // If transitioning to published, set publishedAt
      if (args.status === "published" && post.status !== "published") {
        updateData.publishedAt = now;
      }
    }

    // Apply the update
    await ctx.db.patch(args.id, updateData);

    // Track the activity
    await trackActivity(ctx, userId, "update", "blogPost", args.id, {
      title: updateData.title || post.title,
      status: updateData.status || post.status,
    });

    // Record audit log for sensitive changes
    if (args.status !== undefined && args.status !== post.status) {
      await recordAuditLog(
        ctx,
        userId,
        "statusChange",
        "blogPost",
        args.id,
        { status: post.status },
        { status: args.status }
      );
    }

    return args.id;
  },
});

/**
 * Delete a blog post
 */
export const deleteBlogPost = mutation({
  args: {
    id: v.id("blogPosts"),
    permanent: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Authenticate the user
    const { userId } = await validateAuthenticated(ctx);

    // Get the existing post
    const post = await ctx.db.get(args.id);
    if (!post) {
      throw new ConvexError("Post not found");
    }

    // Check authorization (must be the author or an admin)
    if (post.authorId !== userId) {
      const isAdmin = await isUserAdmin(ctx, userId);
      if (!isAdmin) {
        throw new ConvexError("Not authorized to delete this post");
      }
    }

    // If permanent delete is not specified or false, just mark as archived
    if (!args.permanent) {
      await ctx.db.patch(args.id, {
        status: "archived",
        updatedAt: Date.now(),
      });

      await trackActivity(ctx, userId, "archive", "blogPost", args.id, {
        title: post.title,
      });

      return { success: true, archived: true };
    }

    // For permanent deletion, first delete all revisions
    const revisions = await ctx.db
      .query("blogPostRevisions")
      .filter((q) => q.eq(q.field("postId"), args.id))
      .collect();

    for (const revision of revisions) {
      await ctx.db.delete(revision._id);
    }

    // Delete all comments
    const comments = await ctx.db
      .query("blogComments")
      .filter((q) => q.eq(q.field("postId"), args.id))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    // Delete all reactions
    const reactions = await ctx.db
      .query("blogReactions")
      .filter((q) => q.eq(q.field("postId"), args.id))
      .collect();

    for (const reaction of reactions) {
      await ctx.db.delete(reaction._id);
    }

    // Finally, delete the post
    await ctx.db.delete(args.id);

    // Record audit log for permanent deletion
    await recordAuditLog(
      ctx,
      userId,
      "delete",
      "blogPost",
      args.id,
      { title: post.title, status: post.status },
      null
    );

    await trackActivity(ctx, userId, "delete", "blogPost", args.id, {
      title: post.title,
    });

    return { success: true, archived: false };
  },
});

// Helper function to check if a user is an admin
async function isUserAdmin(ctx: any, userId: Id<"users">): Promise<boolean> {
  const user = await ctx.db.get(userId);
  return user?.role === "admin";
}
