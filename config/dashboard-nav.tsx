// filepath: d:\GithubWorkspace\copa-starter-kit\config\dashboard-nav.tsx
import type { NavSection } from "@/types/navigation";

// Using icon names as strings instead of component references
export const dashboardNav: NavSection[] = [
  {
    title: "UI Components",
    id: "ui-components-section",
    description: "Showcase of UI components and design system",
    collapsible: true,
    items: [
      {
        title: "Button Component",
        href: "/ui-showcase",
        icon: "Pointer",
        description: "Interactive Button component with variants and states",
        ariaLabel: "Button component showcase",
      },
    ],
  },
  {
    title: "Overview",
    id: "overview-section",
    description: "Main dashboard views and reports",
    collapsible: true,
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: "LayoutDashboard",
        description: "Main dashboard overview with key metrics",
        ariaLabel: "Dashboard overview",
      },
      {
        title: "Analytics",
        href: "/dashboard/analytics",
        icon: "BarChart3",
        description: "Detailed analytics and statistics",
        ariaLabel: "Analytics dashboard",
      },
      {
        title: "Reports",
        href: "/dashboard/reports",
        icon: "FileText",
        description: "Generated reports and summaries",
        ariaLabel: "View reports",
      },
      {
        title: "Blog",
        href: "/blog",
        icon: "BookOpen",
        description: "Read our latest articles and insights",
        ariaLabel: "Visit the blog",
      },
    ],
  },
  {
    title: "Account",
    id: "account-section",
    description: "User account settings and management",
    collapsible: true,
    items: [
      {
        title: "Profile",
        href: "/user-profile",
        icon: "User",
        description: "Your user profile information",
        ariaLabel: "User profile settings",
      },
      {
        title: "Billing",
        href: "/dashboard/billing",
        icon: "CreditCard",
        description: "Subscription and billing information",
        ariaLabel: "Billing and payments",
      },
      {
        title: "Notifications",
        href: "/dashboard/notifications",
        icon: "Bell",
        label: "3",
        description: "Notification settings and history",
        ariaLabel: "Notifications with 3 unread",
      },
      {
        title: "Settings",
        href: "/dashboard/settings",
        icon: "Settings",
        description: "Account and application settings",
        ariaLabel: "Account settings",
      },
    ],
  },
  {
    title: "Resources",
    id: "resources-section",
    description: "Additional resources and tools",
    collapsible: true,
    items: [
      {
        title: "Team",
        href: "/dashboard/team",
        icon: "Users",
        description: "Manage team members and permissions",
        ariaLabel: "Team management",
      },
      {
        title: "Messages",
        href: "/dashboard/messages",
        icon: "MessageSquare",
        label: "New",
        description: "Message center and communications",
        ariaLabel: "Messages with new notifications",
      },
      {
        title: "Products",
        href: "/dashboard/products",
        icon: "ShoppingCart",
        description: "Browse and manage products",
        ariaLabel: "Product catalog",
      },
      {
        title: "AI Assistant",
        href: "/openai-example",
        icon: "Bot",
        label: "Enhanced",
        description: "Chat, generate code, and use AI templates",
        ariaLabel: "OpenAI powered AI assistant features",
      },
      {
        title: "Help & Support",
        href: "/dashboard/support",
        icon: "HelpCircle",
        description: "Get help and support resources",
        ariaLabel: "Help and support center",
      },
    ],
  },
];
