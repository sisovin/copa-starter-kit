<<<<<<< HEAD
import Provider from "@/app/provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://nextstarter.xyz/"),
  title: {
    default: "Copa Starter",
    template: `%s | Copa Starter`,
  },
  description:
    "The Ultimate Nextjs 15 Starter Kit for quickly building your SaaS, giving you time to focus on what really matters",
  openGraph: {
    description:
      "The Ultimate Nextjs 15 Starter Kit for quickly building your SaaS, giving you time to focus on what really matters",
    images: [
      "https://dwdwn8b5ye.ufs.sh/f/MD2AM9SEY8GucGJl7b5qyE7FjNDKYduLOG2QHWh3f5RgSi0c",
    ],
    url: "https://nextstarter.xyz/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nextjs Starter Kit",
    description:
      "The Ultimate Nextjs 15 Starter Kit for quickly building your SaaS, giving you time to focus on what really matters",
    siteId: "",
    creator: "@rasmickyy",
    creatorId: "",
    images: [
      "https://dwdwn8b5ye.ufs.sh/f/MD2AM9SEY8GucGJl7b5qyE7FjNDKYduLOG2QHWh3f5RgSi0c",
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In development mode, we can bypass authentication when keys aren't set up
  const isDevelopment = process.env.NODE_ENV === "development";
  const bypassAuth = isDevelopment || process.env.BYPASS_AUTH === "true";
  // Complete bypass - render without any auth in development mode
  if (bypassAuth) {
    console.log("Development mode: bypassing Clerk authentication");
    return (
      <html lang="km" suppressHydrationWarning>
        <body className={GeistSans.className}>
          <Provider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster closeButton richColors position="top-right" />
              <Analytics />
            </ThemeProvider>
          </Provider>
        </body>
      </html>
    );
  } // Normal flow with Clerk authentication
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        baseTheme: undefined,
      }}
    >
      <html lang="km" suppressHydrationWarning>
        <body className={GeistSans.className}>
          <Provider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </Provider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
=======
import { AuthAuditLogProvider } from "@/contexts/auth-audit-provider";
import { NextThemeWrapper, ThemeProvider } from "@/contexts/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./providers/convex-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Copa Starter Kit",
  description: "Next.js application with Clerk authentication",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* All client providers go inside body, not around html/body */}
        <ClerkProvider
          appearance={{
            variables: { colorPrimary: "hsl(210, 100%, 56%)" },
            elements: {
              formButtonPrimary: "bg-primary hover:bg-primary/90",
              card: "bg-background border border-border shadow-sm",
              socialButtonsIconButton:
                "border-border bg-muted hover:bg-muted/80",
              formFieldInput: "bg-input border-input",
            },
          }}
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          afterSignInUrl="/dashboard"
          afterSignUpUrl="/dashboard"
        >
          <NextThemeWrapper
            attribute="class"
            defaultTheme="system"
            enableSystem
            suppressHydrationWarning
          >
            <ThemeProvider>
              <ConvexClientProvider>
                <AuthAuditLogProvider>{children}</AuthAuditLogProvider>
              </ConvexClientProvider>
            </ThemeProvider>
          </NextThemeWrapper>
        </ClerkProvider>
      </body>
    </html>
  );
}
>>>>>>> origin/main
