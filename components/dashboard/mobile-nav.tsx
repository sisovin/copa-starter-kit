"use client";

import { IconComponent } from "@/components/dashboard/icons";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { MobileNavProps } from "@/types/navigation";
import { ChevronDown, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function MobileNav({ isOpen, onClose, sections }: MobileNavProps) {
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

  // Close sheet when route changes
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [pathname, isOpen, onClose]);

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
    <Sheet open={isOpen} onOpenChange={onClose}>
      {" "}
      <SheetContent
        side="left"
        className="w-64 p-0"
        role="dialog"
        aria-label="Mobile navigation"
        id="mobile-navigation"
      >
        <SheetHeader className="border-b px-5 py-4">
          <div className="flex items-center justify-between">
            <SheetTitle>Menu</SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
              aria-label="Close menu"
            >
              <X size={16} aria-hidden="true" />
            </Button>
          </div>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <nav aria-label="Mobile navigation menu" className="px-2 py-4">
            {sections.map((section, sectionIndex) => (
              <Collapsible
                key={section.title}
                open={openSections.includes(section.title)}
                onOpenChange={() => toggleSection(section.title)}
                className="mb-2"
                id={`mobile-section-${section.id || sectionIndex}`}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex w-full items-center justify-between px-4 py-2 text-sm font-medium"
                    aria-expanded={openSections.includes(section.title)}
                    aria-controls={`mobile-section-content-${
                      section.id || sectionIndex
                    }`}
                    aria-label={`${section.title} section, ${
                      openSections.includes(section.title)
                        ? "expanded"
                        : "collapsed"
                    }`}
                  >
                    {section.title}
                    <ChevronDown
                      size={16}
                      className={cn(
                        "transition-transform duration-200",
                        openSections.includes(section.title) && "rotate-180"
                      )}
                      aria-hidden="true"
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent
                  id={`mobile-section-content-${section.id || sectionIndex}`}
                >
                  {" "}
                  <div
                    className="space-y-1 px-2 py-1"
                    role="group"
                    aria-label={`${section.title} navigation items`}
                  >
                    {section.items.map((item, index) => {
                      const isActive = pathname === item.href;

                      return (
                        <Link
                          key={index}
                          href={item.href}
                          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
                          aria-current={isActive ? "page" : undefined}
                          aria-disabled={item.disabled}
                          tabIndex={item.disabled ? -1 : 0}
                          role="link"
                          title={item.description}
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
                              "flex items-center gap-3 rounded-md px-4 py-2 text-sm font-medium",
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "transparent hover:bg-accent hover:text-accent-foreground",
                              item.disabled && "cursor-not-allowed opacity-60"
                            )}
                          >
                            {item.icon && (
                              <IconComponent
                                name={item.icon}
                                size={16}
                                aria-hidden="true"
                              />
                            )}
                            <span>{item.title}</span>{" "}
                            {item.label && (
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
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
