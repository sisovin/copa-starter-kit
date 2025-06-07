"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const languages = [
  { code: "km", name: "ខ្មែរ", flag: "🇰🇭" },
  { code: "en", name: "English", flag: "🇺🇸" },
];

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(false);

  const currentLanguage =
    languages.find((lang) => lang.code === locale) || languages[0];

  const switchLanguage = async (newLocale: string) => {
    if (newLocale === locale) return;

    setIsLoading(true);

    // Remove current locale from pathname if it exists
    const segments = pathname.split("/");
    const currentLocaleInPath = segments[1];

    let newPathname = pathname;
    if (languages.some((lang) => lang.code === currentLocaleInPath)) {
      // Remove current locale from path
      segments.splice(1, 1);
      newPathname = segments.join("/") || "/";
    }

    // Add new locale to path (unless it's the default)
    const finalPath =
      newLocale === "km" ? newPathname : `/${newLocale}${newPathname}`;

    router.push(finalPath);
    setIsLoading(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          <Globe className="h-4 w-4" />
          <span className="text-sm">{currentLanguage.flag}</span>
          <span className="hidden sm:inline text-sm">
            {currentLanguage.name}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => switchLanguage(language.code)}
            className={`flex items-center gap-2 ${
              language.code === locale ? "bg-accent" : ""
            }`}
          >
            <span>{language.flag}</span>
            <span>{language.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
