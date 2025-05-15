"use client";

import { MobileNav } from "@/components/dashboard/mobile-nav";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { NavSection } from "@/types/navigation";
import { useClerk } from "@clerk/nextjs";
import { Bell, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface HeaderProps {
  sections: NavSection[];
  onToggleSidebar: () => void;
}

export function Header({ sections, onToggleSidebar }: HeaderProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [unreadNotifications] = useState(3); // Example state for notifications
  const pathname = usePathname();
  const { signOut, user } = useClerk();

  // Get the current page title based on the active route
  const getPageTitle = (): string => {
    for (const section of sections) {
      for (const item of section.items) {
        if (item.href === pathname) {
          return item.title;
        }
      }
    }
    return "Dashboard";
  };

  useEffect(() => {
    // Close mobile nav when ESC key is pressed
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isMobileNavOpen) {
        setIsMobileNavOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [isMobileNavOpen]);

  return (
    <>
      <header
        className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b bg-background px-4 lg:px-6"
        role="banner"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:hidden"
            onClick={() => setIsMobileNavOpen(true)}
            aria-label="Open mobile menu"
            aria-expanded={isMobileNavOpen}
            aria-controls="mobile-navigation"
          >
            <Menu size={18} aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hidden md:flex lg:hidden"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu size={18} aria-hidden="true" />
          </Button>
          <Link
            href="/dashboard"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md p-1"
          >
            <h1 className="font-semibold text-lg hidden md:block">
              {getPageTitle()}
            </h1>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 relative"
            aria-label={`Notifications: ${unreadNotifications} unread`}
            aria-haspopup="true"
          >
            <Bell size={18} aria-hidden="true" />
            {unreadNotifications > 0 && (
              <span
                className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-red-500"
                aria-hidden="true"
              >
                <span className="sr-only">
                  {unreadNotifications} unread notifications
                </span>
              </span>
            )}
          </Button>

          {/* Custom User Avatar with dropdown menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full"
                aria-label="User menu"
                aria-haspopup="true"
              >
                <UserAvatar size="sm" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {user?.fullName || user?.username || "My Account"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/user-profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />{" "}
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() =>
                  signOut().then(() => (window.location.href = "/sign-in"))
                }
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        sections={sections}
      />
    </>
  );
}
