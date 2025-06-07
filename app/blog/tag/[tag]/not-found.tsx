import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center py-20">
      <h1 className="text-4xl font-bold mb-4">Tag Not Found</h1>
      <p className="text-muted-foreground text-xl mb-8">
        The tag you are looking for doesn't exist or has been removed.
      </p>
      <Link
        href="/blog"
        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1"
      >
        Go to Blog
      </Link>
    </div>
  );
}
