"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

/**
 * Hook for blog post operations
 */
export function useBlogPosts() {
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  // Query for published blog posts with pagination
  const publishedPosts = useQuery(api.blog.listPublishedPosts, {
    pagination: { limit: 10, cursor },
  });

  // Load more posts
  const loadMore = () => {
    if (publishedPosts?.continueCursor) {
      setCursor(publishedPosts.continueCursor);
    }
  };

  // Reset pagination
  const resetPagination = () => {
    setCursor(undefined);
  };

  // Create a new blog post
  const createPost = useMutation(api.blog.createBlogPost);

  // Update a blog post
  const updatePost = useMutation(api.blog.updateBlogPost);

  // Delete a blog post
  const deletePost = useMutation(api.blog.deleteBlogPost);

  // Get a single blog post
  const getPost = (slug: string) => {
    return useQuery(api.blog.getBlogPost, { slug });
  };

  return {
    publishedPosts: publishedPosts?.posts || [],
    hasMore: !!publishedPosts?.hasMore,
    loading: publishedPosts === undefined,
    loadMore,
    resetPagination,
    createPost,
    updatePost,
    deletePost,
    getPost,
  };
}

/**
 * Hook for user blog posts (as an author)
 */
export function useAuthorPosts() {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<
    "all" | "draft" | "published" | "archived"
  >("all");

  // Query for the user's posts
  const authorPosts = useQuery(api.blog.listAuthorPosts, {
    pagination: { limit: 10, cursor },
    status,
  });

  // Load more posts
  const loadMore = () => {
    if (authorPosts?.continueCursor) {
      setCursor(authorPosts.continueCursor);
    }
  };

  // Reset pagination
  const resetPagination = () => {
    setCursor(undefined);
  };

  // Filter by status
  const filterByStatus = (
    newStatus: "all" | "draft" | "published" | "archived"
  ) => {
    setStatus(newStatus);
    setCursor(undefined);
  };

  return {
    posts: authorPosts?.posts || [],
    hasMore: !!authorPosts?.hasMore,
    loading: authorPosts === undefined,
    loadMore,
    resetPagination,
    filterByStatus,
    currentStatus: status,
  };
}

/**
 * Hook for file management
 */
export function useFileManager() {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [filter, setFilter] = useState<{
    mimeType?: string;
    folder?: string;
    tags?: string[];
  }>({});

  // Query for files
  const files = useQuery(api.files.listFiles, {
    pagination: { limit: 20, cursor },
    ...filter,
  });

  // Generate upload URL
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  // Create file record
  const createFile = useMutation(api.files.createFile);

  // Update file
  const updateFile = useMutation(api.files.updateFile);

  // Delete file
  const deleteFile = useMutation(api.files.deleteFile);

  // Query for folders
  const folders = useQuery(api.files.listFolders, {});

  // Create folder
  const createFolder = useMutation(api.files.createFolder);

  // Handle file upload (complete process)
  const uploadFile = async (file: File, metadata: any = {}) => {
    try {
      // Step 1: Get upload URL
      const { storageId } = await generateUploadUrl({
        filename: file.name,
        mimeType: file.type,
      });

      // Step 2: Upload the file directly to storage
      await fetch(storageId, {
        method: "POST",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      // Step 3: Create the file record
      const result = await createFile({
        storageId,
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        metadata: {
          title: metadata.title || file.name,
          description: metadata.description,
          alt: metadata.alt || file.name,
          ...metadata,
        },
        isPublic: metadata.isPublic !== undefined ? metadata.isPublic : true,
        folder: metadata.folder,
        tags: metadata.tags,
      });

      return result;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  // Load more files
  const loadMore = () => {
    if (files?.continueCursor) {
      setCursor(files.continueCursor);
    }
  };

  // Apply filter
  const applyFilter = (newFilter: {
    mimeType?: string;
    folder?: string;
    tags?: string[];
  }) => {
    setFilter(newFilter);
    setCursor(undefined);
  };

  // Reset filter
  const resetFilter = () => {
    setFilter({});
    setCursor(undefined);
  };

  return {
    files: files?.files || [],
    folders: folders || [],
    loading: files === undefined,
    hasMore: !!files?.hasMore,
    loadMore,
    applyFilter,
    resetFilter,
    uploadFile,
    updateFile,
    deleteFile,
    createFolder,
  };
}

/**
 * Hook for dashboard and analytics
 */
export function useDashboard() {
  // Get dashboard stats for the current user
  const dashboardStats = useQuery(api.analytics.getDashboardStats);

  // Admin-only stats (will return null for non-admins)
  const apiUsageStats = useQuery(api.analytics.getApiUsageStats, {
    dateRange: {
      start: Date.now() - 24 * 60 * 60 * 1000, // Last 24 hours
      end: Date.now(),
    },
  });

  // Track API usage
  const trackApiUsage = useMutation(api.analytics.trackApiUsage);

  return {
    stats: dashboardStats,
    apiUsageStats,
    loading: dashboardStats === undefined,
    trackApiUsage,
  };
}
