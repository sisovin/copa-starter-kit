<<<<<<< HEAD
/** @type {import('next').NextConfig} */
import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "seo-heist.s3.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "dwdwn8b5ye.ufs.sh",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ansubkhan.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
        port: "",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    reactCompiler: true,
  },
  pageExtensions: ["ts", "tsx", "mdx"],
};

const withMDX = createMDX({});

export default withNextIntl(withMDX(nextConfig));
=======
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
  // Handle Storybook integration
  transpilePackages: ["storybook", "@storybook"],

  // Next.js 15 uses turbopack by default, configure it here
  experimental: {
    // Optimize package imports
    optimizePackageImports: ["@storybook"],
  },

  // Turbopack specific configuration (now stable and moved out of experimental)
  turbopack: {
    // Rules for files to ignore in Turbopack
    resolveExtensions: [
      // Skip Storybook related files
      ".js", ".jsx", ".ts", ".tsx",
    ]
  },
};

// Wrap the Next.js config with ContentLayer
export default withContentlayer(nextConfig);
>>>>>>> origin/main
