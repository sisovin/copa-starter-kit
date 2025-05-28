import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDate } from "@/lib/blog-utils";
// Temporarily comment out contentlayer import until it's properly set up
// import { allPosts } from "contentlayer/generated";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Blog",
  description: "Explore our latest articles and insights",
};

export default function BlogPage() {
  // Mock blog posts until contentlayer is properly set up
  const posts = [
    {
      slug: "getting-started-with-mdx",
      title: "Getting Started with MDX",
      date: "2025-05-15",
      description: "Learn how to use MDX features in your blog posts",
      image: "/blog-placeholder.jpg",
      tags: ["mdx", "markdown", "blog"],
      author: "GitHub Copilot",
    },
    {
      slug: "advanced-mdx-techniques",
      title: "Advanced MDX Techniques",
      date: "2025-05-10",
      description:
        "Take your MDX skills to the next level with these advanced techniques",
      image: "/blog-placeholder.jpg",
      tags: ["mdx", "advanced", "react"],
      author: "GitHub Copilot",
    },
  ];

  return (
    <div className="container py-12">
      <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-8">
        <div className="flex-1 space-y-4">
          <h1 className="inline-block text-4xl font-extrabold tracking-tight lg:text-5xl">
            Blog
          </h1>
          <p className="text-xl text-muted-foreground">
            Explore our latest articles and insights
          </p>
        </div>
      </div>
      <hr className="my-8" />
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Card key={post.slug} className="flex flex-col overflow-hidden">
            <CardHeader className="border-b p-0">
              {post.image && (
                <Image
                  src={post.image}
                  alt={post.title}
                  className="object-cover h-full w-full transition-transform hover:scale-105"
                  width={600}
                  height={340}
                  priority
                />
              )}
            </CardHeader>
            <CardContent className="flex flex-col flex-1 p-5">
              <div className="space-y-2.5">
                {post.tags && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/blog/tag/${tag}`}
                        className="text-xs font-medium text-muted-foreground hover:text-foreground bg-muted px-2 py-1 rounded-md transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                )}
                <h3 className="font-bold text-xl leading-tight">
                  <Link href={`/blog/${post.slug}`} className="hover:underline">
                    {post.title}
                  </Link>
                </h3>
                <p className="text-muted-foreground text-sm">
                  {post.description}
                </p>
              </div>
              <div className="mt-auto pt-5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{post.author}</span>
                  <span>•</span>
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
