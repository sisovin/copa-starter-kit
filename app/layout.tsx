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
