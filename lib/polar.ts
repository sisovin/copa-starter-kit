import { Polar } from "@polar-sh/sdk";

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';
const accessToken = process.env.POLAR_ACCESS_TOKEN;

// Configure Polar SDK with sandbox server and the access token
export const polar = new Polar({
  server: "sandbox",
  accessToken: accessToken || '',
});

// Mock product data for development if no valid token is provided
export const mockProducts = [
  {
    id: "mock-product-1",
    name: "Basic Plan",
    description: "For individuals and small projects",
    prices: [
      {
        id: "price-monthly-basic",
        priceAmount: 999,
        priceCurrency: "usd",
        recurringInterval: "month",
      },
      {
        id: "price-yearly-basic",
        priceAmount: 9990,
        priceCurrency: "usd",
        recurringInterval: "year",
      }
    ],
    benefits: [
      { description: "Access to all basic features" },
      { description: "Up to 3 projects" },
      { description: "Community support" }
    ]
  },
  {
    id: "mock-product-2",
    name: "Pro Plan",
    description: "For professionals and growing teams",
    prices: [
      {
        id: "price-monthly-pro",
        priceAmount: 2999,
        priceCurrency: "usd",
        recurringInterval: "month",
      },
      {
        id: "price-yearly-pro",
        priceAmount: 29990,
        priceCurrency: "usd",
        recurringInterval: "year",
      }
    ],
    benefits: [
      { description: "Everything in Basic" },
      { description: "Unlimited projects" },
      { description: "Priority support" },
      { description: "Advanced analytics" }
    ]
  }
];
