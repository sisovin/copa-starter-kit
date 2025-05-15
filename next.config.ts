import type { NextConfig } from "next";
import { withContentlayer } from "next-contentlayer";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["192.168.50.131", "localhost"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Configure pageExtensions to include md and mdx
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  // Disable image optimization for local development
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};

// Wrap the Next.js config with ContentLayer
export default withContentlayer(nextConfig);
