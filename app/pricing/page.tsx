"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Check, CheckCircle, CircleX, HelpCircle } from "lucide-react";
import { useState } from "react";

// Define the feature type for our pricing plans
type Feature = {
  name: string;
  description?: string;
  included: {
    free: boolean | string;
    pro: boolean | string;
    enterprise: boolean | string;
  };
};

// Define testimonial type
type Testimonial = {
  content: string;
  author: string;
  role: string;
  company: string;
  avatarUrl?: string;
};

// Define plan prices
type PlanPricing = {
  monthly: number;
  annually: number;
};

// Define our pricing plans
const pricingPlans = {
  free: {
    name: "Free",
    description: "Perfect for individuals just starting out",
    pricing: {
      monthly: 0,
      annually: 0,
    } as PlanPricing,
    features: [
      "Basic analytics",
      "Up to 5 projects",
      "1GB storage",
      "Community support",
    ],
    cta: "Get Started",
    popular: false,
  },
  pro: {
    name: "Pro",
    description: "Ideal for growing teams and businesses",
    pricing: {
      monthly: 29,
      annually: 290, // ~20% discount for annual billing
    } as PlanPricing,
    features: [
      "Advanced analytics",
      "Up to 25 projects",
      "10GB storage",
      "Priority support",
      "API access",
      "Team collaboration",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  enterprise: {
    name: "Enterprise",
    description: "For large organizations with specific needs",
    pricing: {
      monthly: 99,
      annually: 990,
    } as PlanPricing,
    features: [
      "Custom analytics",
      "Unlimited projects",
      "Unlimited storage",
      "Dedicated support",
      "Service-level agreement",
      "Custom integrations",
      "On-premise deployment",
    ],
    cta: "Contact Sales",
    popular: false,
  },
};

// Define detailed features for comparison table
const features: Feature[] = [
  {
    name: "Projects",
    description: "Number of projects you can create",
    included: {
      free: "5 projects",
      pro: "25 projects",
      enterprise: "Unlimited",
    },
  },
  {
    name: "Storage",
    description: "Cloud storage for your files and assets",
    included: {
      free: "1GB",
      pro: "10GB",
      enterprise: "Unlimited",
    },
  },
  {
    name: "Team Members",
    description: "Number of users that can access your workspace",
    included: {
      free: "1 user",
      pro: "5 users",
      enterprise: "Unlimited",
    },
  },
  {
    name: "Basic Analytics",
    included: {
      free: true,
      pro: true,
      enterprise: true,
    },
  },
  {
    name: "Advanced Analytics",
    included: {
      free: false,
      pro: true,
      enterprise: true,
    },
  },
  {
    name: "Custom Analytics",
    included: {
      free: false,
      pro: false,
      enterprise: true,
    },
  },
  {
    name: "API Access",
    description: "Connect with third-party tools",
    included: {
      free: false,
      pro: true,
      enterprise: true,
    },
  },
  {
    name: "Email Support",
    included: {
      free: true,
      pro: true,
      enterprise: true,
    },
  },
  {
    name: "Priority Support",
    included: {
      free: false,
      pro: true,
      enterprise: true,
    },
  },
  {
    name: "24/7 Dedicated Support",
    included: {
      free: false,
      pro: false,
      enterprise: true,
    },
  },
  {
    name: "Service-Level Agreement",
    included: {
      free: false,
      pro: false,
      enterprise: true,
    },
  },
  {
    name: "Custom Integrations",
    included: {
      free: false,
      pro: false,
      enterprise: true,
    },
  },
  {
    name: "On-premise Deployment",
    description: "Deploy in your own infrastructure",
    included: {
      free: false,
      pro: false,
      enterprise: true,
    },
  },
];

// Sample testimonials
const testimonials: Testimonial[] = [
  {
    content:
      "We've been using this platform for over a year now and it has completely transformed how we handle our projects. The Pro plan offers incredible value for the features provided.",
    author: "Sarah Johnson",
    role: "Product Manager",
    company: "TechCorp Inc.",
    avatarUrl: "/avatars/sarah-johnson.jpg",
  },
  {
    content:
      "The Enterprise plan gave us the flexibility and customization options we needed for our growing team. The dedicated support is exceptional.",
    author: "Michael Chen",
    role: "CTO",
    company: "Global Innovations",
    avatarUrl: "/avatars/michael-chen.jpg",
  },
  {
    content:
      "Even the Free plan provided enough functionality for our startup during the early stages. As we grew, upgrading to Pro was a natural choice.",
    author: "Alex Rivera",
    role: "Founder",
    company: "StartUp Studio",
    avatarUrl: "/avatars/alex-rivera.jpg",
  },
];

// GDPR Compliance badges
const complianceBadges = [
  {
    name: "GDPR Compliant",
    icon: "shield",
    description: "Fully compliant with EU data protection regulations",
  },
  {
    name: "ISO 27001",
    icon: "check-circle",
    description: "Certified information security management",
  },
  {
    name: "SOC 2",
    icon: "lock",
    description: "Audited for security, availability, and confidentiality",
  },
  {
    name: "HIPAA Compliant",
    icon: "heart",
    description: "Safe for healthcare data",
  },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">(
    "monthly"
  );
  const [selectedPlan, setSelectedPlan] = useState<
    "free" | "pro" | "enterprise"
  >("pro");

  return (
    <div className="container max-w-7xl py-16 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight">
          Simple, transparent pricing
        </h1>
        <p className="text-lg text-muted-foreground">
          Choose the plan that works best for you and your team. All plans
          include a 14-day free trial.
        </p>

        {/* Annual/Monthly Toggle */}
        <div className="flex items-center justify-center gap-4 pt-6">
          <span
            className={
              billingCycle === "monthly"
                ? "font-medium"
                : "text-muted-foreground"
            }
          >
            Monthly
          </span>
          <Switch
            checked={billingCycle === "annually"}
            onCheckedChange={(checked) =>
              setBillingCycle(checked ? "annually" : "monthly")
            }
            className="data-[state=checked]:bg-primary"
          />
          <div className="flex items-center gap-2">
            <span
              className={
                billingCycle === "annually"
                  ? "font-medium"
                  : "text-muted-foreground"
              }
            >
              Annually
            </span>
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200"
            >
              Save 20%
            </Badge>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Free Plan */}
        <PricingCard
          plan="free"
          planName={pricingPlans.free.name}
          description={pricingPlans.free.description}
          price={pricingPlans.free.pricing[billingCycle]}
          billingCycle={billingCycle}
          features={pricingPlans.free.features}
          ctaText={pricingPlans.free.cta}
          popular={pricingPlans.free.popular}
          selected={selectedPlan === "free"}
          onSelect={() => setSelectedPlan("free")}
        />

        {/* Pro Plan */}
        <PricingCard
          plan="pro"
          planName={pricingPlans.pro.name}
          description={pricingPlans.pro.description}
          price={pricingPlans.pro.pricing[billingCycle]}
          billingCycle={billingCycle}
          features={pricingPlans.pro.features}
          ctaText={pricingPlans.pro.cta}
          popular={pricingPlans.pro.popular}
          selected={selectedPlan === "pro"}
          onSelect={() => setSelectedPlan("pro")}
        />

        {/* Enterprise Plan */}
        <PricingCard
          plan="enterprise"
          planName={pricingPlans.enterprise.name}
          description={pricingPlans.enterprise.description}
          price={pricingPlans.enterprise.pricing[billingCycle]}
          billingCycle={billingCycle}
          features={pricingPlans.enterprise.features}
          ctaText={pricingPlans.enterprise.cta}
          popular={pricingPlans.enterprise.popular}
          selected={selectedPlan === "enterprise"}
          onSelect={() => setSelectedPlan("enterprise")}
        />
      </div>

      {/* Feature Comparison Table */}
      <div className="pt-16">
        <h2 className="text-2xl font-bold tracking-tight text-center mb-10">
          Compare Plans
        </h2>

        <div className="overflow-x-auto">
          <Table>
            <TableCaption>All prices are in USD</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead>Free</TableHead>
                <TableHead>Pro</TableHead>
                <TableHead>Enterprise</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {features.map((feature, index) => (
                <TableRow
                  key={index}
                  className={index % 2 === 0 ? "bg-muted/50" : ""}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {feature.name}
                      {feature.description && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{feature.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <FeatureCell value={feature.included.free} />
                  </TableCell>
                  <TableCell>
                    <FeatureCell value={feature.included.pro} />
                  </TableCell>
                  <TableCell>
                    <FeatureCell value={feature.included.enterprise} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Testimonials */}
      <div className="pt-16 bg-muted/30 py-16 -mx-4 px-4 sm:px-6 rounded-lg">
        <h2 className="text-2xl font-bold tracking-tight text-center mb-10">
          What Our Customers Say
        </h2>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-card text-card-foreground">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <p className="text-muted-foreground italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-4">
                    {testimonial.avatarUrl ? (
                      <div className="h-10 w-10 rounded-full bg-secondary overflow-hidden">
                        {/* Placeholder for avatar */}
                        <div className="h-full w-full bg-primary/10"></div>
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary">
                          {testimonial.author.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}, {testimonial.company}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* GDPR & Compliance Badges */}
      <div className="pt-10">
        <h2 className="text-xl font-semibold text-center mb-8">
          Security & Compliance
        </h2>

        <div className="flex flex-wrap justify-center gap-6">
          {complianceBadges.map((badge, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full"
            >
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">{badge.name}</span>
            </div>
          ))}
        </div>

        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>
            Our platform is fully compliant with GDPR, ISO 27001, SOC 2, and
            HIPAA requirements.
          </p>
          <p className="mt-1">
            Read our{" "}
            <a href="#" className="underline">
              Privacy Policy
            </a>{" "}
            and{" "}
            <a href="#" className="underline">
              Terms of Service
            </a>
            .
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="pt-16">
        <h2 className="text-2xl font-bold tracking-tight text-center mb-8">
          Frequently Asked Questions
        </h2>

        <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Can I change my plan later?</h3>
            <p className="text-muted-foreground">
              Yes, you can upgrade or downgrade your plan at any time from your
              account settings.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">
              What happens when my trial ends?
            </h3>
            <p className="text-muted-foreground">
              After your 14-day trial, you'll automatically be moved to the free
              plan until you choose to upgrade.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Do you offer refunds?</h3>
            <p className="text-muted-foreground">
              We offer a 30-day money-back guarantee for all paid plans.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">
              Can I request custom features?
            </h3>
            <p className="text-muted-foreground">
              Enterprise plans include custom feature development and
              integrations. Contact our sales team to learn more.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="pt-10 pb-20 text-center">
        <h2 className="text-2xl font-bold tracking-tight mb-4">
          Ready to get started?
        </h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of teams that use our platform to build better
          products. Start your 14-day free trial today.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" onClick={() => setSelectedPlan("pro")}>
            Start Free Trial
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#" target="_blank" rel="noopener noreferrer">
              Book a Demo
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

// Pricing Card Component
type PricingCardProps = {
  plan: "free" | "pro" | "enterprise";
  planName: string;
  description: string;
  price: number;
  billingCycle: "monthly" | "annually";
  features: string[];
  ctaText: string;
  popular: boolean;
  selected: boolean;
  onSelect: () => void;
};

function PricingCard({
  plan,
  planName,
  description,
  price,
  billingCycle,
  features,
  ctaText,
  popular,
  selected,
  onSelect,
}: PricingCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all",
        popular && "border-primary shadow-md",
        selected && "ring-2 ring-primary"
      )}
    >
      {popular && (
        <div className="absolute top-0 right-0">
          <div className="bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
            Most Popular
          </div>
        </div>
      )}

      <CardHeader>
        <CardTitle className="text-xl">{planName}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">${price}</span>
            <span className="text-sm text-muted-foreground ml-1">
              /{billingCycle === "annually" ? "year" : "month"}
            </span>
          </div>
          {billingCycle === "annually" && price > 0 && (
            <p className="text-xs text-green-600 mt-1">
              Save 20% with annual billing
            </p>
          )}
        </div>

        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 flex-shrink-0 text-green-500" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-6">
        <Button
          onClick={onSelect}
          className="w-full"
          variant={plan === "enterprise" ? "outline" : "default"}
        >
          {ctaText}
        </Button>
      </CardFooter>
    </Card>
  );
}

// Helper component for feature comparison cells
function FeatureCell({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    if (value) {
      return <Check className="h-5 w-5 text-green-500" />;
    } else {
      return <CircleX className="h-5 w-5 text-muted-foreground/50" />;
    }
  }

  return <span>{value}</span>;
}
