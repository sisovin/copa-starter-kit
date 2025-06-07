"use client";

import {
  ErrorBoundary,
  ErrorCode,
  useErrorWithCode,
} from "@/components/error-boundary";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useTheme,
  useThemePalette,
  useToggleTheme,
} from "@/contexts/theme-provider";
import { errorLogger } from "@/lib/error-logger";
import * as React from "react";

// Component that demonstrates theme customization
function ThemeDemonstrator() {
  const { theme, setTheme, themes, resetTheme } = useTheme();
  const toggleTheme = useToggleTheme();
  const {
    applyCustomPalette,
    resetPalette,
    backgroundColor,
    foregroundColor,
    primaryColor,
  } = useThemePalette();

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Theme System</CardTitle>
        <CardDescription>
          Customize the appearance of your application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Current Theme: {theme}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {themes.map((t) => (
              <Button
                key={t}
                variant={theme === t ? "default" : "outline"}
                onClick={() => setTheme(t as any)}
                className="capitalize"
              >
                {t}
              </Button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Quick Actions</h3>
          <div className="flex flex-wrap gap-2">
            <Button onClick={toggleTheme}>Toggle Light/Dark</Button>
            <Button variant="outline" onClick={resetTheme}>
              Reset Theme
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Custom Palette</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Primary Color
              </label>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: `hsl(${primaryColor})` }}
                />
                <span className="text-xs font-mono">{primaryColor}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Background
              </label>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: `hsl(${backgroundColor})` }}
                />
                <span className="text-xs font-mono">{backgroundColor}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Foreground
              </label>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: `hsl(${foregroundColor})` }}
                />
                <span className="text-xs font-mono">{foregroundColor}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              onClick={() =>
                applyCustomPalette("222.2 47.4% 11.2%", undefined, undefined)
              }
              variant="outline"
              size="sm"
            >
              Default Primary
            </Button>
            <Button
              onClick={() =>
                applyCustomPalette("230 100% 50%", undefined, undefined)
              }
              variant="outline"
              size="sm"
            >
              Blue Primary
            </Button>
            <Button
              onClick={() =>
                applyCustomPalette("280 100% 50%", undefined, undefined)
              }
              variant="outline"
              size="sm"
            >
              Purple Primary
            </Button>
            <Button onClick={resetPalette} variant="outline" size="sm">
              Reset Colors
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Component that demonstrates error handling
function ErrorThrower() {
  const throwError = useErrorWithCode();

  const simulateError = (code: ErrorCode) => {
    throwError(`This is a simulated error with code ${code}`, code, {
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Error Boundary</CardTitle>
        <CardDescription>
          Test error handling with different error codes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <Button
            variant="outline"
            onClick={() => simulateError(ErrorCode.NETWORK)}
            size="sm"
          >
            Network Error
          </Button>
          <Button
            variant="outline"
            onClick={() => simulateError(ErrorCode.AUTHENTICATION)}
            size="sm"
          >
            Auth Error
          </Button>
          <Button
            variant="outline"
            onClick={() => simulateError(ErrorCode.PERMISSION)}
            size="sm"
          >
            Permission Error
          </Button>
          <Button
            variant="outline"
            onClick={() => simulateError(ErrorCode.VALIDATION)}
            size="sm"
          >
            Validation Error
          </Button>
          <Button
            variant="outline"
            onClick={() => simulateError(ErrorCode.SERVER)}
            size="sm"
          >
            Server Error
          </Button>
          <Button
            variant="outline"
            onClick={() => simulateError(ErrorCode.NOT_FOUND)}
            size="sm"
          >
            Not Found Error
          </Button>
        </div>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        <p>
          When you click a button, an error will be thrown and caught by the
          ErrorBoundary.
        </p>
      </CardFooter>
    </Card>
  );
}

// Main component that demonstrates both features
export default function UtilityShowcase() {
  // Initialize error logger (would normally be done in a layout or provider)
  React.useEffect(() => {
    errorLogger.initialize({
      dsn: "https://example@sentry.io/123456",
      environment: process.env.NODE_ENV,
    });
  }, []);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Utility Components Showcase</h1>

      <Tabs defaultValue="theme">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="theme">Theme System</TabsTrigger>
          <TabsTrigger value="errors">Error Handling</TabsTrigger>
        </TabsList>

        <TabsContent value="theme">
          <ThemeDemonstrator />
        </TabsContent>

        <TabsContent value="errors">
          <ErrorBoundary
            onError={(error, errorInfo) => {
              // This would send to Sentry in production
              errorLogger.captureException(error, {
                extra: { errorInfo: errorInfo.componentStack },
              });
            }}
          >
            <ErrorThrower />
          </ErrorBoundary>
        </TabsContent>
      </Tabs>
    </div>
  );
}
