"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import * as React from "react";

// Define error codes for different types of errors
export enum ErrorCode {
  UNKNOWN = "ERR_UNKNOWN",
  NETWORK = "ERR_NETWORK",
  AUTHENTICATION = "ERR_AUTH",
  PERMISSION = "ERR_PERMISSION",
  VALIDATION = "ERR_VALIDATION",
  SERVER = "ERR_SERVER",
  NOT_FOUND = "ERR_NOT_FOUND",
  TIMEOUT = "ERR_TIMEOUT",
  SSR = "ERR_SSR",
}

// Define properties for our enhanced error
export interface EnhancedErrorProps extends Error {
  code?: ErrorCode;
  metadata?: Record<string, unknown>;
  isOperational?: boolean; // Helps distinguish between operational vs programmer errors
}

// Create a custom error class
export class AppError extends Error implements EnhancedErrorProps {
  code: ErrorCode;
  metadata?: Record<string, unknown>;
  isOperational: boolean;

  constructor({
    message,
    code = ErrorCode.UNKNOWN,
    metadata = {},
    isOperational = true,
  }: {
    message: string;
    code?: ErrorCode;
    metadata?: Record<string, unknown>;
    isOperational?: boolean;
  }) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.metadata = metadata;
    this.isOperational = isOperational;

    // Maintains proper stack trace (only available in V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

// Props for the error boundary component
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: EnhancedErrorProps, errorInfo: React.ErrorInfo) => void;
  onReset?: () => void;
}

// Props for the error fallback component
interface ErrorFallbackProps {
  error: EnhancedErrorProps;
  resetErrorBoundary: () => void;
}

// Default fallback component to display errors
export function ErrorFallback({
  error,
  resetErrorBoundary,
}: ErrorFallbackProps) {
  const [isReporting, setIsReporting] = React.useState(false);

  // Log error to Sentry/LogRocket (would be implemented here)
  const reportError = async () => {
    setIsReporting(true);

    try {
      // This is where you would integrate with Sentry or LogRocket
      // For example:
      // await Sentry.captureException(error);
      // or
      // LogRocket.captureException(error);

      console.error("Error reported:", error);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (reportingError) {
      console.error("Failed to report error:", reportingError);
    } finally {
      setIsReporting(false);
    }
  };

  // Get a user-friendly message based on error code
  const getFriendlyMessage = (error: EnhancedErrorProps) => {
    const code = error.code as ErrorCode;
    switch (code) {
      case ErrorCode.NETWORK:
        return "We're having trouble connecting to our servers. Please check your internet connection and try again.";
      case ErrorCode.AUTHENTICATION:
        return "Your session has expired or you don't have permission to access this page. Please sign in again.";
      case ErrorCode.PERMISSION:
        return "You don't have permission to access this resource.";
      case ErrorCode.VALIDATION:
        return "There was an issue with the data you provided. Please check and try again.";
      case ErrorCode.SERVER:
        return "We're experiencing technical difficulties. Our team has been notified and is working on a fix.";
      case ErrorCode.NOT_FOUND:
        return "The resource you're looking for cannot be found.";
      case ErrorCode.TIMEOUT:
        return "The operation timed out. Please try again.";
      case ErrorCode.SSR:
        return "There was an issue loading this page. Please refresh to try again.";
      default:
        return "Something unexpected happened. We've been notified and are working to fix it.";
    }
  };

  // Report error on initial render, only once
  React.useEffect(() => {
    reportError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-6 max-w-2xl mx-auto">
      <Alert variant="destructive" className="mb-6 w-full">
        <ExclamationTriangleIcon className="h-5 w-5" />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>
          <p className="mb-4">{getFriendlyMessage(error)}</p>

          <div className="text-xs mb-4 bg-destructive/10 p-3 rounded-md overflow-auto max-h-[200px]">
            <div className="flex justify-between mb-2">
              <span className="font-semibold">Error Details</span>
              <span className="font-mono text-xs">
                {error.code || ErrorCode.UNKNOWN}
              </span>
            </div>
            <code className="font-mono whitespace-pre-wrap break-words">
              {error.message}
            </code>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              size="sm"
              onClick={resetErrorBoundary}
              className="flex items-center gap-2"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Try again
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              Refresh page
            </Button>

            <Button
              size="sm"
              variant="link"
              onClick={() => window.history.back()}
            >
              Go back
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}

// The main ErrorBoundary class component
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  { error: EnhancedErrorProps | null; hasError: boolean }
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null, hasError: false };
  }

  static getDerivedStateFromError(error: Error): {
    hasError: boolean;
    error: EnhancedErrorProps;
  } {
    // Convert to enhanced error if needed
    const enhancedError: EnhancedErrorProps = error;

    // Set default code if not present
    if (!enhancedError.code) {
      enhancedError.code = ErrorCode.UNKNOWN;
    }

    return { hasError: true, error: enhancedError };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Handle error reporting
    if (this.props.onError) {
      const enhancedError = error as EnhancedErrorProps;
      this.props.onError(enhancedError, errorInfo);
    }

    // Log the error (this would be replaced with Sentry/LogRocket in production)
    console.error("Error caught by boundary:", error, errorInfo);
  }

  resetErrorBoundary = () => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({ error: null, hasError: false });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback or default ErrorFallback
      return this.props.fallback ? (
        this.props.fallback
      ) : (
        <ErrorFallback
          error={this.state.error}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }

    return this.props.children;
  }
}

// Utility function to handle errors in SSR context
export function withErrorHandling<T extends object>(
  Component: React.ComponentType<T>,
  ErrorComponent: React.ComponentType<{ error: Error }> = ErrorFallback
) {
  return function WithErrorHandling(props: T & { error?: Error }) {
    if (props.error) {
      const enhancedError: EnhancedErrorProps = {
        ...props.error,
        code: ErrorCode.SSR,
      };
      return (
        <ErrorComponent
          error={enhancedError}
          resetErrorBoundary={() => window.location.reload()}
        />
      );
    }

    return (
      <ErrorBoundary>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// Hook to create and throw an error with specific code
export function useErrorWithCode() {
  return React.useCallback(
    (
      message: string,
      code: ErrorCode = ErrorCode.UNKNOWN,
      metadata?: Record<string, unknown>
    ) => {
      throw new AppError({ message, code, metadata });
    },
    []
  );
}
