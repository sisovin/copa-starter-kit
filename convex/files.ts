import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import {
  paginationOptsValidator,
  fileMetadataValidator,
} from "./lib/validators";
import {
  validateAuthenticated,
  validateUserRole,
  trackActivity,
  recordAuditLog,
} from "./lib/utils";

/**
 * Generate a URL for file upload
 */
export const generateUploadUrl = mutation({
  args: {
    filename: v.string(),
    mimeType: v.string(),
  },
  handler: async (ctx, args) => {
    // Authenticate the user
    const { userId } = await validateAuthenticated(ctx);

    // Generate the upload URL
    const storageId = await ctx.storage.generateUploadUrl();

    return { storageId, uploadUrl: storageId };
  },
});

/**
 * Create a file record after upload
 */
export const createFile = mutation({
  args: {
    storageId: v.string(),
    filename: v.string(),
    mimeType: v.string(),
    size: v.number(),
    metadata: fileMetadataValidator,
    isPublic: v.optional(v.boolean()),
    folder: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Authenticate the user
    const { userId } = await validateAuthenticated(ctx);

    // Verify the storage ID exists
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) {
      throw new ConvexError("Invalid storage ID or file not found");
    }

    const now = Date.now();

    // Create the file record
    const fileId = await ctx.db.insert("fileUploads", {
      filename: args.filename,
      mimeType: args.mimeType,
      size: args.size,
      storageId: args.storageId,
      url,

      // Metadata
      title: args.metadata.title,
      description: args.metadata.description,
      alt: args.metadata.alt,
      width: args.metadata.width,
      height: args.metadata.height,
      duration: args.metadata.duration,

      // Organization
      uploadedBy: userId,
      isPublic: args.isPublic ?? false,
      folder: args.folder,
      tags: args.tags ?? [],

      // Timestamps
      createdAt: now,
      updatedAt: now,
    });

    // Track activity
    await trackActivity(ctx, userId, "upload", "file", fileId, {
      filename: args.filename,
      mimeType: args.mimeType,
    });

    return { fileId, url };
  },
});

/**
 * List files for the current user
 */
export const listFiles = query({
  args: {
    pagination: paginationOptsValidator,
    mimeType: v.optional(v.string()),
    folder: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Authenticate the user
    const { userId } = await validateAuthenticated(ctx);

    // Build the query
    let filesQuery = ctx.db
      .query("fileUploads")
      .filter((q) => q.eq(q.field("uploadedBy"), userId))
      .order("desc", (q) => q.field("createdAt"));

    // Apply filters
    if (args.mimeType) {
      filesQuery = filesQuery.filter((q) =>
        q.eq(q.field("mimeType"), args.mimeType!)
      );
    }

    if (args.folder) {
      filesQuery = filesQuery.filter((q) =>
        q.eq(q.field("folder"), args.folder!)
      );
    }

    if (args.tags && args.tags.length > 0) {
      filesQuery = filesQuery.filter((q) => {
        let tagFilter = q.includes(q.field("tags"), args.tags![0]);

        for (let i = 1; i < args.tags!.length; i++) {
          tagFilter = q.and(
            tagFilter,
            q.includes(q.field("tags"), args.tags![i])
          );
        }

        return tagFilter;
      });
    }

    // Execute the query with pagination
    const { limit = 20, cursor } = args.pagination;
    const cursorObj = cursor ? { numericValue: parseFloat(cursor) } : undefined;
    const files = await filesQuery.paginate(cursorObj, limit);

    return {
      files: files.page,
      continueCursor: files.continueCursor?.toString(),
      hasMore: !!files.continueCursor,
    };
  },
});

/**
 * Get a specific file by ID
 */
export const getFile = query({
  args: {
    id: v.id("fileUploads"),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.id);
    if (!file) {
      return null;
    }

    // If file is not public, verify user has access
    if (!file.isPublic) {
      try {
        const { userId } = await validateAuthenticated(ctx);

        // Check if user owns the file or is an admin
        if (file.uploadedBy !== userId) {
          const isAdmin = await isUserAdmin(ctx, userId);
          if (!isAdmin) {
            throw new ConvexError("Not authorized to access this file");
          }
        }
      } catch (e) {
        throw new ConvexError("Not authorized to access this file");
      }
    }

    return file;
  },
});

/**
 * Update file metadata
 */
export const updateFile = mutation({
  args: {
    id: v.id("fileUploads"),
    metadata: fileMetadataValidator,
    isPublic: v.optional(v.boolean()),
    folder: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Authenticate the user
    const { userId } = await validateAuthenticated(ctx);

    // Get the existing file
    const file = await ctx.db.get(args.id);
    if (!file) {
      throw new ConvexError("File not found");
    }

    // Check if user owns the file or is an admin
    if (file.uploadedBy !== userId) {
      const isAdmin = await isUserAdmin(ctx, userId);
      if (!isAdmin) {
        throw new ConvexError("Not authorized to update this file");
      }
    }

    // Prepare the update data
    const updateData: any = {
      updatedAt: Date.now(),
    };

    // Only update fields that are provided
    if (args.metadata.title !== undefined)
      updateData.title = args.metadata.title;
    if (args.metadata.description !== undefined)
      updateData.description = args.metadata.description;
    if (args.metadata.alt !== undefined) updateData.alt = args.metadata.alt;
    if (args.metadata.width !== undefined)
      updateData.width = args.metadata.width;
    if (args.metadata.height !== undefined)
      updateData.height = args.metadata.height;
    if (args.metadata.duration !== undefined)
      updateData.duration = args.metadata.duration;
    if (args.metadata.tags !== undefined) updateData.tags = args.metadata.tags;
    if (args.isPublic !== undefined) updateData.isPublic = args.isPublic;
    if (args.folder !== undefined) updateData.folder = args.folder;

    // Apply the update
    await ctx.db.patch(args.id, updateData);

    // Track activity
    await trackActivity(ctx, userId, "update", "file", args.id, {
      filename: file.filename,
    });

    return args.id;
  },
});

/**
 * Delete a file
 */
export const deleteFile = mutation({
  args: {
    id: v.id("fileUploads"),
  },
  handler: async (ctx, args) => {
    // Authenticate the user
    const { userId } = await validateAuthenticated(ctx);

    // Get the existing file
    const file = await ctx.db.get(args.id);
    if (!file) {
      throw new ConvexError("File not found");
    }

    // Check if user owns the file or is an admin
    if (file.uploadedBy !== userId) {
      const isAdmin = await isUserAdmin(ctx, userId);
      if (!isAdmin) {
        throw new ConvexError("Not authorized to delete this file");
      }
    }

    // Check if file is in use (referenced by other records)
    const blogPostsUsingFile = await ctx.db
      .query("blogPosts")
      .filter((q) => q.eq(q.field("featuredImageId"), args.id))
      .first();

    if (blogPostsUsingFile) {
      throw new ConvexError(
        "Cannot delete file as it is used as featured image in a blog post"
      );
    }

    // Delete from storage
    await ctx.storage.delete(file.storageId);

    // Delete the database record
    await ctx.db.delete(args.id);

    // Record audit log
    await recordAuditLog(
      ctx,
      userId,
      "delete",
      "file",
      args.id,
      { filename: file.filename, storageId: file.storageId },
      null
    );

    // Track activity
    await trackActivity(ctx, userId, "delete", "file", args.id, {
      filename: file.filename,
    });

    return { success: true };
  },
});

/**
 * Create a new folder
 */
export const createFolder = mutation({
  args: {
    name: v.string(),
    parentFolderId: v.optional(v.id("fileFolders")),
  },
  handler: async (ctx, args) => {
    // Authenticate the user
    const { userId } = await validateAuthenticated(ctx);

    // Check if parent folder exists if provided
    if (args.parentFolderId) {
      const parentFolder = await ctx.db.get(args.parentFolderId);
      if (!parentFolder) {
        throw new ConvexError("Parent folder not found");
      }

      // Check if user owns the parent folder
      if (parentFolder.ownerId !== userId) {
        throw new ConvexError("Not authorized to create a folder here");
      }
    }

    const now = Date.now();

    // Create the folder
    const folderId = await ctx.db.insert("fileFolders", {
      name: args.name,
      parentFolderId: args.parentFolderId,
      ownerId: userId,
      createdAt: now,
      updatedAt: now,
    });

    return folderId;
  },
});

/**
 * List folders
 */
export const listFolders = query({
  args: {
    parentFolderId: v.optional(v.id("fileFolders")),
  },
  handler: async (ctx, args) => {
    // Authenticate the user
    const { userId } = await validateAuthenticated(ctx);

    // Query folders with the specified parent (or root folders if no parent)
    let foldersQuery = ctx.db
      .query("fileFolders")
      .filter((q) => q.eq(q.field("ownerId"), userId));

    if (args.parentFolderId) {
      foldersQuery = foldersQuery.filter((q) =>
        q.eq(q.field("parentFolderId"), args.parentFolderId)
      );
    } else {
      foldersQuery = foldersQuery.filter((q) =>
        q.eq(q.field("parentFolderId"), null)
      );
    }

    // Order by name
    foldersQuery = foldersQuery.order("asc", (q) => q.field("name"));

    return await foldersQuery.collect();
  },
});

// Helper function to check if a user is an admin
async function isUserAdmin(ctx: any, userId: Id<"users">): Promise<boolean> {
  const user = await ctx.db.get(userId);
  return user?.role === "admin";
}
