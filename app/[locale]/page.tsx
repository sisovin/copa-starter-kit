// filepath: d:\GithubWorkspace\copa-starter-kit\app\page.tsx
import { AccordionComponent } from "@/components/homepage/accordion-component";
import HeroSection from "@/components/homepage/hero-section";
import MarketingCards from "@/components/homepage/marketing-cards";
import Pricing from "@/components/homepage/pricing";
import SideBySide from "@/components/homepage/side-by-side";
import PageWrapper from "@/components/wrapper/page-wrapper";
import { mockProducts, polar } from "@/lib/polar";

// Force dynamic rendering for development
export const dynamic = "force-dynamic";

export default async function Home() {
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
    // Check if we`re in development and have no valid token
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

        // If it`s an async iterator, collect all results
        if (typeof polarResponse[Symbol.asyncIterator] === "function") {
          for await (const item of polarResponse) {
            if (item) products.push(item);
          }
        } else if (Array.isArray(polarResponse)) {
          // If it`s already an array
          products.push(...polarResponse);
        } else if (
          polarResponse.result &&
          Array.isArray(polarResponse.result)
        ) {
          // If it has a result property that`s an array
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
      <div className="flex flex-col justify-center items-center w-full mt-[1rem] p-3">
        <HeroSection />
      </div>
      <SideBySide />
      <MarketingCards />
      <Pricing result={productData.result} />
      <AccordionComponent />
    </PageWrapper>
  );
}
