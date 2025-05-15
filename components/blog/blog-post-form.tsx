"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Id } from "@/convex/_generated/dataModel";
import { useBlogPosts, useFileManager } from "@/hooks/use-convex";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface BlogPostFormProps {
  postId?: Id<"blogPosts">;
  defaultValues?: {
    title?: string;
    content?: string;
    excerpt?: string;
    slug?: string;
    tags?: string[];
    status?: "draft" | "published";
    featuredImageId?: Id<"fileUploads">;
    allowComments?: boolean;
    featured?: boolean;
  };
}

export function BlogPostForm({
  postId,
  defaultValues = {},
}: BlogPostFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  // State for form values
  const [title, setTitle] = useState(defaultValues.title || "");
  const [content, setContent] = useState(defaultValues.content || "");
  const [excerpt, setExcerpt] = useState(defaultValues.excerpt || "");
  const [slug, setSlug] = useState(defaultValues.slug || "");
  const [tags, setTags] = useState<string[]>(defaultValues.tags || []);
  const [status, setStatus] = useState<"draft" | "published">(
    defaultValues.status || "draft"
  );
  const [featuredImageId, setFeaturedImageId] = useState<
    Id<"fileUploads"> | undefined
  >(defaultValues.featuredImageId);
  const [allowComments, setAllowComments] = useState(
    defaultValues.allowComments !== false
  );
  const [featured, setFeatured] = useState(defaultValues.featured || false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("content");

  // Get mutations
  const { createPost, updatePost } = useBlogPosts();
  const { uploadFile, files } = useFileManager();

  // Helpers for slug generation
  const generateSlugFromTitle = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // Handle title change and auto-generate slug
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);

    // Only auto-generate slug if it hasn't been manually edited
    if (!slug || slug === generateSlugFromTitle(title)) {
      setSlug(generateSlugFromTitle(newTitle));
    }
  };

  // Handle tags change
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsValue = e.target.value;
    const tagArray = tagsValue
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    setTags(tagArray);
  };

  // Handle featured image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const result = await uploadFile(file, {
        title: `Featured image for: ${title}`,
        alt: title,
        isPublic: true,
      });

      if (result?.fileId) {
        setFeaturedImageId(result.fileId as Id<"fileUploads">);
        toast({
          title: "Image uploaded",
          description: "Featured image has been uploaded successfully.",
        });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading the image.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const postData = {
        title,
        content,
        excerpt,
        slug,
        tags,
        status,
        featuredImageId,
        allowComments,
        featured,
      };

      if (postId) {
        // Update existing post
        await updatePost({
          id: postId,
          ...postData,
        });

        toast({
          title: "Post updated",
          description: "Your blog post has been updated successfully.",
        });
      } else {
        // Create new post
        const newPostId = await createPost(postData);

        toast({
          title: "Post created",
          description: "Your blog post has been created successfully.",
        });

        // Redirect to edit page for the new post
        router.push(`/dashboard/blog/edit/${newPostId}`);
      }
    } catch (error) {
      console.error("Error saving post:", error);
      toast({
        title: "Error saving post",
        description: "There was an error saving your blog post.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {postId ? "Edit Blog Post" : "Create New Blog Post"}
        </h1>

        <div className="space-x-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : postId
                ? "Update Post"
                : "Create Post"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={handleTitleChange}
              required
              placeholder="Post title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={15}
              placeholder="Write your post content here... (Markdown supported)"
              className="min-h-[300px] font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              placeholder="Brief summary of your post (Optional)"
            />
          </div>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Featured Image</CardTitle>
              <CardDescription>
                Upload a featured image for your post
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {featuredImageId && (
                  <div className="border rounded-md p-2">
                    <p className="text-sm text-gray-500 mb-2">
                      Currently selected image:
                    </p>
                    {files?.find((file) => file._id === featuredImageId)
                      ?.url ? (
                      <div className="aspect-video relative bg-muted rounded-md overflow-hidden">
                        <img
                          src={
                            files?.find((file) => file._id === featuredImageId)
                              ?.url
                          }
                          alt="Featured"
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Loading image...</p>
                    )}
                  </div>
                )}

                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="featured-image">Upload new image</Label>
                  <Input
                    id="featured-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                  {isUploading && (
                    <p className="text-sm text-gray-500">Uploading...</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Post Settings</CardTitle>
              <CardDescription>
                Configure post metadata and publishing options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="url-friendly-slug"
                />
                <p className="text-xs text-gray-500">
                  This will be used in the URL: /blog/{slug}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={tags.join(", ")}
                  onChange={handleTagsChange}
                  placeholder="tech, news, tutorial"
                />
                <p className="text-xs text-gray-500">
                  Separate tags with commas
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Publishing Status</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="status"
                    checked={status === "published"}
                    onCheckedChange={(checked) =>
                      setStatus(checked ? "published" : "draft")
                    }
                  />
                  <Label htmlFor="status">
                    {status === "published" ? "Published" : "Draft"}
                  </Label>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allowComments"
                    checked={allowComments}
                    onCheckedChange={setAllowComments}
                  />
                  <Label htmlFor="allowComments">Allow comments</Label>
                </div>
              </div>

              <div className="pt-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={featured}
                    onCheckedChange={setFeatured}
                  />
                  <Label htmlFor="featured">Featured post</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
}
