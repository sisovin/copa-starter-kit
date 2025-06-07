"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";
import { useEffect, useState } from "react";

type Language = {
  code: string;
  name: string;
  flag: string;
  localeCode: string;
};

const languages: Language[] = [
  { code: "en", name: "English", flag: "🇺🇸", localeCode: "en-US" },
  { code: "km", name: "ខ្មែរ", flag: "🇰🇭", localeCode: "km-KH" },
];

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    languages[0]
  );

  useEffect(() => {
    // Get user's preferred language from localStorage or browser settings
    const savedLanguage = localStorage.getItem("preferredLanguage");

    if (savedLanguage) {
      const found = languages.find((lang) => lang.code === savedLanguage);
      if (found) setCurrentLanguage(found);
    } else {
      // Use browser language preferences as fallback
      const browserLang = navigator.language.split("-")[0];
      const found = languages.find((lang) => lang.code === browserLang);
      if (found) {
        setCurrentLanguage(found);
        localStorage.setItem("preferredLanguage", found.code);
      }
    }
  }, []);

  const switchLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem("preferredLanguage", language.code);

    // Here you would typically update your i18n context/provider
    // For example with next-intl or react-i18next

    // For demo purposes, we're just reloading the page
    // In a real app, you'd use your i18n library's language switching mechanism
    // router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8 relative", className)}
          aria-label="Switch language"
        >
          <Globe size={18} aria-hidden="true" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => switchLanguage(language)}
            className={cn(
              "flex items-center gap-2 cursor-pointer",
              currentLanguage.code === language.code && "font-bold bg-accent"
            )}
            aria-current={
              currentLanguage.code === language.code ? "true" : "false"
            }
          >
            <span className="text-base">{language.flag}</span>
            <span>{language.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
