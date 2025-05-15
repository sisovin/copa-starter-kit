import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDate } from "@/lib/blog-utils";
import { allPosts } from "contentlayer/generated";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog",
  description: "Explore our latest articles and insights",
};

export default function BlogPage() {
  const posts = allPosts
    .filter((post) => !post.draft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
                <div className="aspect-video overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="object-cover h-full w-full transition-transform hover:scale-105"
                    width={600}
                    height={340}
                  />
                </div>
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
                        className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground hover:text-foreground"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                )}
                <Link href={`/blog/${post.slug}`}>
                  <h2 className="text-2xl font-bold leading-tight hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                </Link>
                {post.description && (
                  <p className="text-muted-foreground line-clamp-2">
                    {post.description}
                  </p>
                )}
              </div>
              <div className="mt-auto pt-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {formatDate(post.date)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {post.readingTime} min read
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
