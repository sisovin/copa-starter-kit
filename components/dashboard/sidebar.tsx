"use client";

import { IconComponent } from "@/components/dashboard/icons";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { SidebarProps } from "@/types/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function Sidebar({
  isOpen,
  onToggle,
  sections,
  className,
}: SidebarProps) {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<string[]>([]);

  // Handle section toggle
  const toggleSection = (title: string) => {
    setOpenSections((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  // Initialize open sections based on active route
  useEffect(() => {
    // Find which section contains the active route and open it
    const activeSection = sections.find((section) =>
      section.items.some((item) => pathname === item.href)
    );

    if (activeSection && !openSections.includes(activeSection.title)) {
      setOpenSections((prev) => [...prev, activeSection.title]);
    }
  }, [pathname, sections, openSections]);
  return (
    <nav
      className={cn(
        "flex flex-col border-r bg-background transition-all duration-300 ease-in-out dark:border-gray-800",
        isOpen ? "w-64" : "w-16",
        className
      )}
      aria-label="Main navigation"
      role="navigation"
    >
      <div className="flex h-14 items-center justify-between border-b px-4">
        <div className={cn("flex items-center gap-2", !isOpen && "hidden")}>
          <span className="font-semibold">Dashboard</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onToggle}
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          aria-expanded={isOpen}
          aria-controls="sidebar-nav"
        >
          {isOpen ? (
            <ChevronLeft size={16} aria-hidden="true" />
          ) : (
            <ChevronRight size={16} aria-hidden="true" />
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-2 py-4" id="sidebar-nav">
          {sections.map((section, index) => (
            <Collapsible
              key={section.title}
              open={isOpen && openSections.includes(section.title)}
              onOpenChange={
                isOpen ? () => toggleSection(section.title) : undefined
              }
              className="mb-2"
              disabled={!isOpen}
              id={`nav-section-${section.id || index}`}
            >
              {" "}
              <div className="flex items-center px-2 py-1">
                {isOpen ? (
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex w-full items-center justify-between p-2 text-muted-foreground hover:text-foreground"
                      aria-expanded={openSections.includes(section.title)}
                      aria-controls={`section-content-${section.id || index}`}
                      aria-label={`${section.title} section, ${
                        openSections.includes(section.title)
                          ? "expanded"
                          : "collapsed"
                      }`}
                    >
                      <span className="text-sm font-medium">
                        {section.title}
                      </span>
                      <ChevronRight
                        size={16}
                        className={cn(
                          "transition-transform duration-200",
                          openSections.includes(section.title) && "rotate-90"
                        )}
                        aria-hidden="true"
                      />
                    </Button>
                  </CollapsibleTrigger>
                ) : (
                  <div className="h-8 w-full" aria-hidden="true" />
                )}
              </div>{" "}
              <CollapsibleContent id={`section-content-${section.id || index}`}>
                {" "}
                <div
                  className="space-y-1 px-2 py-1"
                  role="group"
                  aria-label={`${section.title} navigation items`}
                >
                  {section.items.map((item, itemIndex) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={itemIndex}
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        aria-disabled={item.disabled}
                        tabIndex={item.disabled ? -1 : 0}
                        role="link"
                        title={item.description}
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
                        {...(item.external
                          ? {
                              target: "_blank",
                              rel: "noopener noreferrer",
                              "aria-label": `${
                                item.ariaLabel || item.title
                              } (opens in new tab)`,
                            }
                          : { "aria-label": item.ariaLabel || item.title })}
                      >
                        <div
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "transparent hover:bg-accent hover:text-accent-foreground",
                            item.disabled && "cursor-not-allowed opacity-60"
                          )}
                        >
                          {item.icon && (
                            <IconComponent
                              name={item.icon}
                              size={18}
                              aria-hidden="true"
                            />
                          )}
                          {isOpen && <span>{item.title}</span>}{" "}
                          {isOpen && item.label && (
                            <span className="ml-auto text-xs">
                              {item.label}
                              <span className="sr-only"> items</span>
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>{" "}
      </ScrollArea>
    </nav>
  );
}
