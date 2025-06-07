"use client";

import { Header } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ThemeProvider } from "@/contexts/theme-provider";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import type { NavSection } from "@/types/navigation";
import { useEffect, useState } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  sections: NavSection[];
}

export function DashboardLayout({ children, sections }: DashboardLayoutProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Handle sidebar state based on screen size
  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  return (
    <ThemeProvider>
      <div className="flex min-h-screen flex-col" role="application">
        <Header
          sections={sections}
          onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
        />
        <div className="flex flex-1">
          <Sidebar
            isOpen={isSidebarOpen}
            onToggle={() => setSidebarOpen(!isSidebarOpen)}
            sections={sections}
            className="hidden md:flex"
          />
          <main
            className={cn(
              "flex-1 overflow-auto p-4 lg:p-6",
              isSidebarOpen ? "md:ml-64" : "md:ml-16"
            )}
            id="main-content"
            tabIndex={-1}
            aria-label="Main content"
          >
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
