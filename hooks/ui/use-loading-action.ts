import { useState } from "react";

interface UseLoadingActionOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  loadingTime?: number;
  mockSuccess?: boolean;
  mockError?: boolean;
}

/**
 * A hook to handle loading states for buttons and other interactive elements
 *
 * @param action The async function to execute
 * @param options Configuration options
 * @returns An object with loading state and action handler
 */
export function useLoadingAction<T extends (...args: any[]) => Promise<any>>(
  action: T,
  options: UseLoadingActionOptions = {}
) {
  const {
    onSuccess,
    onError,
    loadingTime = 0,
    mockSuccess = false,
    mockError = false,
  } = options;

  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (
    ...args: Parameters<T>
  ): Promise<ReturnType<T> | undefined> => {
    setIsLoading(true);

    // Add artificial delay if loadingTime is set
    if (loadingTime > 0) {
      await new Promise((resolve) => setTimeout(resolve, loadingTime));
    }

    try {
      // For mocking purposes
      if (mockError) {
        throw new Error("Mock error");
      }

      if (mockSuccess) {
        setIsLoading(false);
        onSuccess?.();
        return undefined as ReturnType<T>;
      }

      // Execute the real action
      const result = await action(...args);
      onSuccess?.();
      return result;
    } catch (error) {
      onError?.(error as Error);
      return undefined as ReturnType<T>;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, handleAction };
}
