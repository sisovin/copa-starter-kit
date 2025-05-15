import { ButtonUsageExample } from "@/components/examples/button-usage-example";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof ButtonUsageExample> = {
  title: "Examples/ButtonUsageExample",
  component: ButtonUsageExample,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ButtonUsageExample>;

export const Default: Story = {};
