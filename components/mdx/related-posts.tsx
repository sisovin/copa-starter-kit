import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/blog-utils";
import { RelatedPost } from "@/types/blog";
import Link from "next/link";

interface RelatedPostsProps {
  posts: RelatedPost[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="mt-16">
      <h3 className="text-2xl font-bold mb-6">Related Posts</h3>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Card key={post.slug} className="overflow-hidden">
            <div className="p-4">
              <Link href={`/blog/${post.slug}`}>
                <h4 className="text-lg font-semibold hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h4>
              </Link>
              {post.description && (
                <p className="text-muted-foreground mt-2 line-clamp-2">
                  {post.description}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-4">
                {formatDate(post.date)}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
