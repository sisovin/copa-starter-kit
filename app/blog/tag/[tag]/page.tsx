import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDate } from "@/lib/blog-utils";
import { allPosts } from "contentlayer/generated";
import { ChevronLeft } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface TagPageProps {
  params: {
    tag: string;
  };
}

// Generate metadata for each tag page
export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const tag = decodeURIComponent(params.tag);
  const postsByTag = allPosts.filter(
    (post) => post.tags?.includes(tag) && !post.draft
  );

  if (postsByTag.length === 0) {
    return {
      title: "Tag Not Found",
    };
  }

  return {
    title: `Posts tagged with "${tag}"`,
    description: `Browse all posts tagged with ${tag}`,
  };
}

// Generate static params for all tags
export async function generateStaticParams() {
  const tags = new Set<string>();

  allPosts.forEach((post) => {
    post.tags?.forEach((tag) => {
      tags.add(tag);
    });
  });

  return Array.from(tags).map((tag) => ({
    tag,
  }));
}

export default function TagPage({ params }: TagPageProps) {
  const tag = decodeURIComponent(params.tag);
  const postsByTag = allPosts
    .filter((post) => post.tags?.includes(tag) && !post.draft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (postsByTag.length === 0) {
    notFound();
  }

  return (
    <div className="container py-12">
      <Link
        href="/blog"
        className="flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to all posts
      </Link>

      <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-8">
        <div className="flex-1 space-y-4">
          <h1 className="inline-block text-3xl font-bold tracking-tight lg:text-4xl">
            Posts tagged with <span className="text-primary">#{tag}</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Browse {postsByTag.length} post{postsByTag.length > 1 ? "s" : ""}{" "}
            with this tag
          </p>
        </div>
      </div>

      <hr className="my-8" />

      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {postsByTag.map((post) => (
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
                    {post.tags.map((postTag) => (
                      <Link
                        key={postTag}
                        href={`/blog/tag/${postTag}`}
                        className={`text-xs px-2 py-1 rounded-full ${
                          postTag === tag
                            ? "bg-primary text-white hover:bg-primary/90"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        #{postTag}
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
