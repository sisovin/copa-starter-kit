"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps as NextThemesProviderProps } from "next-themes/dist/types";
import * as React from "react";

// Type-safe theme names
export type Theme = "dark" | "light" | "system" | "brand-blue" | "brand-purple";

export type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  themes?: string[];
  forcedTheme?: Theme;
  disableTransitionOnChange?: boolean;
};

export type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: string[];
  systemTheme?: "dark" | "light";
  foregroundColor?: string;
  backgroundColor?: string;
  primaryColor?: string;
  resetTheme: () => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  themes: ["light", "dark", "system"],
  resetTheme: () => null,
};

const ThemeProviderContext =
  React.createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "copa-theme",
  themes = ["light", "dark", "system", "brand-blue", "brand-purple"],
  forcedTheme,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  // Using next-themes to handle the theming
  const [mounted, setMounted] = React.useState(false);

  // Store the current CSS variable values
  const [foregroundColor, setForegroundColor] = React.useState<string>();
  const [backgroundColor, setBackgroundColor] = React.useState<string>();
  const [primaryColor, setPrimaryColor] = React.useState<string>();

  // Function to get computed colors from CSS variables
  const updateColorValues = React.useCallback(() => {
    if (typeof window !== "undefined") {
      const root = window.document.documentElement;
      const computedStyle = getComputedStyle(root);

      setForegroundColor(computedStyle.getPropertyValue("--foreground").trim());
      setBackgroundColor(computedStyle.getPropertyValue("--background").trim());
      setPrimaryColor(computedStyle.getPropertyValue("--primary").trim());
    }
  }, []);

  // Get system preference with proper SSR handling
  const prefersDarkMq = React.useMemo(
    () =>
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : null,
    []
  );

  const [systemTheme, setSystemTheme] = React.useState<"dark" | "light">(
    prefersDarkMq?.matches ? "dark" : "light"
  );

  // Monitor for system preference changes
  React.useEffect(() => {
    if (!prefersDarkMq) return;

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    prefersDarkMq.addEventListener("change", handleChange);
    return () => prefersDarkMq.removeEventListener("change", handleChange);
  }, [prefersDarkMq]);

  // Initial state from localStorage with SSR safety
  const [theme, setThemeState] = React.useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme;
    return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
  });

  // Set the theme and handle transitions
  React.useEffect(() => {
    const root = window.document.documentElement;

    if (disableTransitionOnChange) {
      root.classList.add("disable-transitions");
    }

    root.classList.remove(...themes);

    if (forcedTheme) {
      root.classList.add(forcedTheme);
    } else if (theme === "system") {
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    if (disableTransitionOnChange) {
      // Force a reflow
      const _ = root.offsetHeight;
      root.classList.remove("disable-transitions");
    }

    // Update color values whenever theme changes
    updateColorValues();
  }, [
    theme,
    systemTheme,
    forcedTheme,
    disableTransitionOnChange,
    themes,
    updateColorValues,
  ]);

  // Handle mounting
  React.useEffect(() => {
    setMounted(true);
    updateColorValues();
  }, [updateColorValues]);

  const setTheme = React.useCallback(
    (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setThemeState(theme);
    },
    [storageKey]
  );

  const resetTheme = React.useCallback(() => {
    localStorage.removeItem(storageKey);
    setThemeState(defaultTheme);
  }, [defaultTheme, storageKey]);

  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
      themes,
      systemTheme,
      foregroundColor,
      backgroundColor,
      primaryColor,
      resetTheme,
    }),
    [
      theme,
      setTheme,
      themes,
      systemTheme,
      foregroundColor,
      backgroundColor,
      primaryColor,
      resetTheme,
    ]
  );

  // Prevent flash of wrong theme by rendering only when mounted
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

// Also export the NextThemesProvider for use in root layout
export function NextThemeWrapper({
  children,
  ...props
}: NextThemesProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

// Enhanced useTheme hook with type safety
export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};

// Helper hook for toggling between dark and light
export const useToggleTheme = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = React.useCallback(() => {
    setTheme(
      theme === "dark" ||
        (theme === "system" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
        ? "light"
        : "dark"
    );
  }, [theme, setTheme]);

  return toggleTheme;
};

// Helper hook for palette customization
export const useThemePalette = () => {
  const { foregroundColor, backgroundColor, primaryColor, theme } = useTheme();

  // Custom palette manipulation functions
  const applyCustomPalette = React.useCallback(
    (primary?: string, background?: string, foreground?: string) => {
      const root = window.document.documentElement;

      if (primary) root.style.setProperty("--primary", primary);
      if (background) root.style.setProperty("--background", background);
      if (foreground) root.style.setProperty("--foreground", foreground);
    },
    []
  );

  const resetPalette = React.useCallback(() => {
    const root = window.document.documentElement;
    root.style.removeProperty("--primary");
    root.style.removeProperty("--background");
    root.style.removeProperty("--foreground");
  }, []);

  return {
    foregroundColor,
    backgroundColor,
    primaryColor,
    currentTheme: theme,
    applyCustomPalette,
    resetPalette,
  };
};
