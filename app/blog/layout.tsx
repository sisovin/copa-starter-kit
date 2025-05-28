import { Metadata } from "next";
import ClientLayout from "./layout-client";

export const metadata: Metadata = {
  title: {
    default: "Blog",
    template: "%s | Blog",
  },
  description: "Explore our latest articles and insights",
};

interface BlogLayoutProps {
  children: React.ReactNode;
}

export default function BlogLayout({ children }: BlogLayoutProps) {
  return <ClientLayout>{children}</ClientLayout>;
}
