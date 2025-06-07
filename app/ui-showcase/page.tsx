import { ButtonInDialogExample } from "@/components/examples/button-in-dialog-example";
import { ButtonUsageExample } from "@/components/examples/button-usage-example";
import { ButtonWithLoadingHookExample } from "@/components/examples/button-with-loading-hook-example";
import { Metadata } from "next";
import Link from "next/link";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "UI Component Showcase",
  description:
    "A showcase of customizable UI components with various styles and states",
};

export default function ButtonShowcase() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="mb-4 text-4xl font-bold">UI Components</h1>
          <p className="text-lg text-muted-foreground">
            A showcase of our customizable UI components with different
            variants, sizes, and states.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/ui-showcase/data-table-demo"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              Data Table Demo
            </Link>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <ButtonUsageExample />
        </div>

        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <h3 className="mb-4 text-xl font-medium">Button in Dialog</h3>
          <p className="mb-6 text-muted-foreground">
            Example of the Button component used inside a dialog with loading
            state simulation.
          </p>{" "}
          <div className="flex items-center justify-center">
            <ButtonInDialogExample />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <ButtonWithLoadingHookExample />
        </div>

        {/* Toast notifications for button actions */}
        <Toaster position="bottom-right" />

        <div className="space-y-4 rounded-lg border bg-card p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">Component Features</h2>
          <ul className="ml-6 list-disc space-y-2">
            <li>Multiple style variants (primary, secondary, ghost, etc.)</li>
            <li>Different size options (small, medium, large, icon)</li>
            <li>Loading state with spinner and accessibility support</li>
            <li>Support for icons on either side of the text</li>
            <li>Full TypeScript prop types</li>
            <li>Accessible with proper ARIA attributes</li>
            <li>Responsive and adaptive to theme changes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
