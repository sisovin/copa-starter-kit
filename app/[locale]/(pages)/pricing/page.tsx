import { AccordionComponent } from "@/components/homepage/accordion-component";
import Pricing from "@/components/homepage/pricing";
import PageWrapper from "@/components/wrapper/page-wrapper";
import { mockProducts, polar } from "@/lib/polar";
import { Check, DollarSign } from "lucide-react";

// Force dynamic rendering for development
export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const features = [
    "Authentication & Authorization",
    "Payment Processing",
    "SEO Optimization",
    "TypeScript Support",
    "Database Integration",
    "Dark Mode Support",
    "Responsive Design",
    "API Integration",
  ];

  // Try to fetch products, but handle errors gracefully
  let productData: {
    result: {
      items: any[];
      pagination: {
        totalCount: number;
        maxPage: number;
      };
    };
  } = {
    result: {
      items: [],
      pagination: {
        totalCount: 0,
        maxPage: 0,
      },
    },
  };

  try {
    // Check if we're in development and have no valid token
    const isDevelopment = process.env.NODE_ENV === "development";
    const hasValidToken =
      process.env.POLAR_ACCESS_TOKEN &&
      process.env.POLAR_ACCESS_TOKEN.length > 10 &&
      !process.env.POLAR_ACCESS_TOKEN.includes("dummy");

    if (isDevelopment && !hasValidToken) {
      // Use mock data in development if no valid token
      console.log("Using mock Polar products data for development");
      productData = {
        result: {
          items: mockProducts,
          pagination: {
            totalCount: mockProducts.length,
            maxPage: 1,
          },
        },
      };
    } else {
      // Try to get real data from the API
      const polarResponse = await polar.products.list({
        organizationId: process.env.POLAR_ORGANIZATION_ID || "default_org_id",
      });

      if (polarResponse) {
        // Get all products from the response
        const products = [];

        // If it's an async iterator, collect all results
        if (typeof polarResponse[Symbol.asyncIterator] === "function") {
          for await (const item of polarResponse) {
            if (item) products.push(item);
          }
        } else if (Array.isArray(polarResponse)) {
          // If it's already an array
          products.push(...polarResponse);
        } else if (
          polarResponse.result &&
          Array.isArray(polarResponse.result)
        ) {
          // If it has a result property that's an array
          products.push(...polarResponse.result);
        } else if (typeof polarResponse === "object") {
          // Fallback - treat as a single product
          products.push(polarResponse);
        }

        productData = {
          result: {
            items: products,
            pagination: {
              totalCount: products.length,
              maxPage: 1,
            },
          },
        };
      }
    }
  } catch (error) {
    console.error("Failed to fetch Polar products:", error);

    // Use mock data as fallback on error
    productData = {
      result: {
        items: mockProducts,
        pagination: {
          totalCount: mockProducts.length,
          maxPage: 1,
        },
      },
    };
  }

  return (
    <PageWrapper>
      <div className="container mx-auto px-4">
        <section className="relative flex flex-col items-center justify-center py-20">
          {/* Background gradient */}
          <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
            <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 dark:bg-blue-500 opacity-20 blur-[100px]"></div>
          </div>

          <div className="space-y-6 text-center">
            {/* Pill badge */}
            <div className="mx-auto w-fit rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/30 px-4 py-1 mb-6">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-900 dark:text-blue-200">
                <DollarSign className="h-4 w-4" />
                <span>Simple, Transparent Pricing</span>
              </div>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 dark:from-white dark:via-blue-300 dark:to-white animate-gradient-x pb-2">
              Choose Your Perfect Plan
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Get started with our powerful Next.js starter kit and build your
              next big idea faster than ever
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 dark:from-white dark:via-blue-300 dark:to-white">
                Everything You Need
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Our starter kit comes packed with all the essential features you
                need to build modern web applications. No more wasting time on
                repetitive setups.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
                >
                  <Check className="h-5 w-5 flex-shrink-0 text-blue-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>{" "}
          <div className="py-8">
            <Pricing result={productData.result} />
          </div>
        </section>

        <section className="pb-20">
          <AccordionComponent />
        </section>
      </div>
    </PageWrapper>
  );
}
