import AuthorBio from "@/components/mdx/author-bio";
import { MdxProvider } from "@/components/mdx/mdx-provider";
import RelatedPosts from "@/components/mdx/related-posts";
import ShareButtons from "@/components/mdx/share-buttons";
import TableOfContents from "@/components/mdx/table-of-contents";
import { extractTOC, findRelatedPosts, formatDate } from "@/lib/blog-utils";
import { allPosts } from "contentlayer/generated";
import { ChevronLeft, Clock } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PostPageProps {
  params: {
    slug: string;
  };
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  return allPosts.map((post) => ({
    slug: post.slug,
  }));
}

// Generate metadata for each blog post
export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const post = allPosts.find((post) => post.slug === params.slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.description,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      images: post.image ? [post.image] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: post.image ? [post.image] : [],
    },
  };
}

export default function PostPage({ params }: PostPageProps) {
  // Find the post from all available posts
  const post = allPosts.find((post) => post.slug === params.slug);

  // Handle post not found case
  if (!post) {
    notFound();
  }

  // Extract table of contents from the post content
  const toc = extractTOC(post.body.html);

  // Find related posts based on tags
  const relatedPosts = findRelatedPosts(params.slug);

  // Get the current URL for sharing
  const postUrl = `/blog/${post.slug}`;

  return (
    <div className="container relative py-6 lg:py-10">
      <Link
        href="/blog"
        className="flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to all posts
      </Link>

      <article className="prose dark:prose-invert blog-content mx-auto w-full max-w-3xl">
        {/* Post header */}
        <header className="space-y-4 mb-8">
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {post.tags?.map((tag) => (
              <Link
                key={tag}
                href={`/blog/tag/${tag}`}
                className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground hover:text-foreground"
              >
                #{tag}
              </Link>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold">{post.title}</h1>

          {/* Description (if available) */}
          {post.description && (
            <p className="text-xl text-muted-foreground">{post.description}</p>
          )}

          {/* Post metadata */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <p className="font-medium">{post.author}</p>
            <div className="h-1 w-1 rounded-full bg-muted-foreground"></div>
            <p>{formatDate(post.date)}</p>
            <div className="h-1 w-1 rounded-full bg-muted-foreground"></div>

            {/* Reading time with icon */}
            <div className="reading-time">
              <Clock className="h-4 w-4" />
              <span>{post.readingTime} min read</span>
            </div>
          </div>

          {/* Share buttons */}
          <ShareButtons title={post.title} url={postUrl} />
        </header>

        {/* Featured image (if available) */}
        {post.image && (
          <div className="my-8 aspect-video overflow-hidden rounded-lg shadow-md">
            <Image
              src={post.image}
              alt={post.title}
              width={1200}
              height={675}
              className="object-cover w-full h-full"
              priority
            />
          </div>
        )}

        {/* Post content with table of contents */}
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            {/* MDX content */}
            <MdxProvider code={post.body.code} />

            {/* Author bio */}
            <div className="mt-16 mb-8">
              <AuthorBio author={post.author} />
            </div>

            {/* Share buttons (bottom of post) */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Share this post</h3>
              <ShareButtons title={post.title} url={postUrl} />
            </div>
          </div>

          {/* Table of contents (desktop) */}
          <aside className="hidden lg:block w-64">
            <div className="table-of-contents">
              <h4 className="toc-heading">On this page</h4>
              <TableOfContents toc={toc} />
            </div>
          </aside>
        </div>

        <hr className="my-10" />

        {/* Related posts */}
        <RelatedPosts posts={relatedPosts} />
      </article>
    </div>
  );
}
