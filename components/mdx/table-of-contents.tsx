import { cn } from "@/lib/utils";
import { TOCEntry } from "@/types/blog";
import React from "react";

interface TableOfContentsProps {
  toc: TOCEntry[];
}

const TableOfContents = ({ toc }: TableOfContentsProps) => {
  const [activeId, setActiveId] = React.useState<string>("");

  // Set up intersection observer to track which heading is in view
  React.useEffect(() => {
    const headingElements = toc.map(({ id }) => document.getElementById(id));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0px 0px -80% 0px" }
    );

    headingElements.forEach((element) => {
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      headingElements.forEach((element) => {
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [toc]);

  if (toc.length === 0) {
    return null;
  }

  return (
    <div className="hidden lg:block w-64 flex-none pl-8 py-8">
      <div className="sticky top-20">
        <h3 className="text-sm font-semibold mb-4">On this page</h3>
        <div className="space-y-2">
          {toc.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              className={cn(
                "block text-sm py-1 hover:text-primary transition-colors",
                heading.level === 2 ? "pl-0" : "pl-4",
                activeId === heading.id
                  ? "text-primary font-medium"
                  : "text-muted-foreground"
              )}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(heading.id)?.scrollIntoView({
                  behavior: "smooth",
                });
                setActiveId(heading.id);
              }}
            >
              {heading.text}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TableOfContents;
