import type { Meta, StoryObj } from "@storybook/react";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "../button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
      ],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
    },
    isLoading: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
    leftIcon: {
      control: { disable: true },
    },
    rightIcon: {
      control: { disable: true },
    },
    asChild: {
      control: { disable: true },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// Base Button story
export const Default: Story = {
  args: {
    children: "Button",
    variant: "default",
    size: "default",
  },
};

// Size variants
export const Small: Story = {
  args: {
    children: "Small Button",
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    children: "Large Button",
    size: "lg",
  },
};

export const IconOnly: Story = {
  args: {
    size: "icon",
    children: <Mail />,
    "aria-label": "Send email",
  },
};

// Style variants
export const Destructive: Story = {
  args: {
    children: "Delete",
    variant: "destructive",
  },
};

export const Outline: Story = {
  args: {
    children: "Outline",
    variant: "outline",
  },
};

export const Secondary: Story = {
  args: {
    children: "Secondary",
    variant: "secondary",
  },
};

export const Ghost: Story = {
  args: {
    children: "Ghost",
    variant: "ghost",
  },
};

export const Link: Story = {
  args: {
    children: "Link Button",
    variant: "link",
  },
};

// State variants
export const Loading: Story = {
  args: {
    children: "Loading",
    isLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: "Disabled",
    disabled: true,
  },
};

// With icons
export const WithLeftIcon: Story = {
  args: {
    children: "Email",
    leftIcon: <Mail className="size-4" />,
  },
};

export const WithRightIcon: Story = {
  args: {
    children: "Next",
    rightIcon: <ArrowRight className="size-4" />,
  },
};

export const WithBothIcons: Story = {
  args: {
    children: "Send Email",
    leftIcon: <Mail className="size-4" />,
    rightIcon: <ArrowRight className="size-4" />,
  },
};
