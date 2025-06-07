import { Button } from "@/components/ui/button";
import { useLoadingAction } from "@/hooks/ui/use-loading-action";
import { Download, RefreshCw, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ButtonWithLoadingHookExample() {
  const [downloadCount, setDownloadCount] = useState(0);

  // Mock file download action
  const downloadFile = async () => {
    // Simulate API call or file download
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setDownloadCount((prev) => prev + 1);
    return { success: true, fileName: "example-file.pdf" };
  };

  // Using our custom hook
  const { isLoading: isDownloading, handleAction: handleDownload } =
    useLoadingAction(downloadFile, {
      onSuccess: () => toast.success("File downloaded successfully!"),
      onError: (error) => toast.error(`Download failed: ${error.message}`),
    });

  // Using the hook with mocked responses
  const { isLoading: isRefreshing, handleAction: handleRefresh } =
    useLoadingAction(async () => {}, {
      loadingTime: 1500,
      mockSuccess: true,
      onSuccess: () => toast.success("Data refreshed successfully!"),
    });

  const { isLoading: isErroring, handleAction: simulateError } =
    useLoadingAction(async () => {}, {
      loadingTime: 1500,
      mockError: true,
      onError: () =>
        toast.error("An error occurred while processing your request"),
    });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-lg font-medium">Button with Loading Hook</h3>
        <p className="mb-4 text-muted-foreground">
          Using the useLoadingAction hook to manage button states
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <Button
          variant="default"
          leftIcon={isDownloading ? undefined : <Download />}
          isLoading={isDownloading}
          loadingText="Downloading..."
          onClick={() => handleDownload()}
        >
          Download File{downloadCount > 0 ? ` (${downloadCount})` : ""}
        </Button>

        <Button
          variant="outline"
          leftIcon={isRefreshing ? undefined : <RefreshCw />}
          isLoading={isRefreshing}
          loadingText="Refreshing..."
          onClick={() => handleRefresh()}
        >
          Refresh Data
        </Button>

        <Button
          variant="destructive"
          leftIcon={isErroring ? undefined : <X />}
          isLoading={isErroring}
          loadingText="Processing..."
          onClick={() => simulateError()}
        >
          Simulate Error
        </Button>
      </div>

      <div className="rounded-md bg-muted p-3 text-sm">
        <p>
          <span className="font-semibold">Tip:</span> The useLoadingAction hook
          manages the loading state and provides error handling and success
          callbacks automatically.
        </p>
      </div>
    </div>
  );
}
