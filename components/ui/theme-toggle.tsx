"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/theme-provider";
import { Moon, Sun } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={`relative h-9 w-9 rounded-full focus-visible:ring-2 focus-visible:ring-offset-2 ${className}`}
          aria-label={`Change color theme, current theme: ${theme}`}
        >
          <Sun
            className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
            aria-hidden="true"
          />
          <Moon
            className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
            aria-hidden="true"
          />
          <span className="sr-only">Toggle between dark and light mode</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" aria-label="Theme options">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          aria-current={theme === "light" ? "true" : "false"}
        >
          <Sun className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          aria-current={theme === "dark" ? "true" : "false"}
        >
          <Moon className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          aria-current={theme === "system" ? "true" : "false"}
        >
          <span className="mr-2 inline-block w-4 h-4 align-text-bottom">
            💻
          </span>
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
