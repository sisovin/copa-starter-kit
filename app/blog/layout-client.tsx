"use client";

import BlogSearch from "@/components/mdx/blog-search";
import Link from "next/link";
import { useEffect, useState } from "react";
import "./blog-styles.css";

interface BlogLayoutProps {
  children: React.ReactNode;
}

export default function BlogLayout({ children }: BlogLayoutProps) {
  // Reading progress state
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    const updateReadingProgress = () => {
      const currentProgress = window.scrollY;
      const scrollHeight = document.body.scrollHeight - window.innerHeight;
      if (scrollHeight) {
        setReadingProgress(
          Number((currentProgress / scrollHeight).toFixed(2)) * 100
        );
      }
    };

    window.addEventListener("scroll", updateReadingProgress);

    return () => {
      window.removeEventListener("scroll", updateReadingProgress);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Reading progress bar */}
      <div className="reading-progress">
        <div
          className="reading-progress-bar"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <span className="hidden font-bold sm:inline-block">
                Your Blog Title
              </span>
            </Link>
            <nav className="flex gap-6">
              <Link
                href="/blog"
                className="flex items-center text-sm font-medium text-foreground/60 hover:text-foreground/80"
              >
                All Posts
              </Link>
              <Link
                href="/blog/categories"
                className="hidden md:flex items-center text-sm font-medium text-foreground/60 hover:text-foreground/80"
              >
                Categories
              </Link>
              <Link
                href="/blog/authors"
                className="hidden md:flex items-center text-sm font-medium text-foreground/60 hover:text-foreground/80"
              >
                Authors
              </Link>
            </nav>
          </div>
          <div className="hidden md:block">
            <BlogSearch />
          </div>
        </div>
      </header>

      <main className="flex-1 blog-content">{children}</main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Your Blog. All rights reserved.
          </p>
          <div className="md:hidden">
            <BlogSearch />
          </div>
        </div>
      </footer>
    </div>
  );
}
