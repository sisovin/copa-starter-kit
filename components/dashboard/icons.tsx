import {
  BarChart3,
  Bell,
  CreditCard,
  FileText,
  HelpCircle,
  LayoutDashboard,
  MessageSquare,
  Settings,
  ShoppingCart,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

// Map of icon names to icon components
export const iconMap: Record<string, LucideIcon> = {
  BarChart3,
  Bell,
  CreditCard,
  FileText,
  HelpCircle,
  LayoutDashboard,
  MessageSquare,
  Settings,
  ShoppingCart,
  User,
  Users,
};

// A component that renders the appropriate icon based on its name
export function IconComponent({
  name,
  size,
  ...props
}: {
  name: string;
  size?: number;
  // Use React's JSX.IntrinsicAttributes instead of any
  [key: string]: unknown;
}) {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in icon map`);
    return null;
  }

  return <IconComponent size={size} {...props} />;
}
