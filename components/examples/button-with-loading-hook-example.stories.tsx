import { ButtonWithLoadingHookExample } from "@/components/examples/button-with-loading-hook-example";
import type { Meta, StoryObj } from "@storybook/react";
import { Toaster } from "sonner";

const meta: Meta<typeof ButtonWithLoadingHookExample> = {
  title: "Examples/ButtonWithLoadingHookExample",
  component: ButtonWithLoadingHookExample,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div>
        <Story />
        <Toaster position="bottom-right" />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ButtonWithLoadingHookExample>;

export const Default: Story = {};
