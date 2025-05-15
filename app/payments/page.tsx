"use client";

import { BakongForm } from "@/components/payment/bakong-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
// For full implementation, uncomment these imports
// import { useMutation } from "convex/react";
// import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useState } from "react";

export default function PaymentDemo() {
  const [amount, setAmount] = useState(10);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const { toast } = useToast();

  // For a full implementation, uncomment this
  // const processPayWayPayment = useMutation(api.payments.processPayWayPayment);
  // For demo purposes, we'll use a placeholder function
  const processPayWayPayment = async (data: {
    amount: number;
    currency: string;
    customerEmail: string;
    returnUrl: string;
  }) => {
    // Mock implementation
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    return {
      success: true,
      checkoutUrl: `https://checkout-sandbox.payway.com.kh/checkout-demo?amount=${data.amount}`,
    };
  };

  const handlePayWaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      const result = await processPayWayPayment({
        amount: amount * 100, // Convert to cents
        currency: "USD",
        customerEmail: email,
        returnUrl: window.location.href,
      });

      if (result.success) {
        setCheckoutUrl(result.checkoutUrl);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: "There was an error processing your payment.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Payment Gateway Demo</h1>

      <Tabs defaultValue="payway" className="max-w-3xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="payway">PayWay Payment</TabsTrigger>
          <TabsTrigger value="bakong">Bakong QR</TabsTrigger>
        </TabsList>

        <TabsContent value="payway">
          <Card>
            <CardHeader>
              <CardTitle>PayWay Payment</CardTitle>{" "}
              <CardDescription>
                Process payments via PayWay - Cambodia&apos;s leading payment
                gateway
              </CardDescription>
            </CardHeader>

            {!checkoutUrl ? (
              <form onSubmit={handlePayWaySubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (USD)</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="1"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      placeholder="10.00"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </CardContent>

                <CardFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Processing..." : "Pay Now"}
                  </Button>
                </CardFooter>
              </form>
            ) : (
              <CardContent className="space-y-4">
                <div className="border rounded-md p-4 bg-muted/50 text-center">
                  <p className="mb-4">
                    Your PayWay checkout is ready. Click the button to proceed.
                  </p>
                  <Button
                    onClick={() => window.open(checkoutUrl, "_blank")}
                    className="w-full md:w-auto"
                  >
                    Continue to PayWay
                  </Button>
                </div>
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setCheckoutUrl("")}
                    size="sm"
                  >
                    Cancel & Start Over
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="bakong">
          <BakongForm
            defaultAmount={20000}
            defaultReference="COPA Kit Demo"
            onPaymentComplete={(data) => {
              console.log("Payment complete:", data);
              toast({
                title: "Payment Successful",
                description:
                  "Your Bakong payment has been processed successfully.",
                variant: "default",
              });
            }}
            onPaymentFailed={(error) => {
              console.error("Payment failed:", error);
              toast({
                title: "Payment Failed",
                description:
                  error.message || "There was an error with your payment.",
                variant: "destructive",
              });
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Webhook Documentation Link */}
      <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
        <p className="mb-2">
          This demo implements webhook handlers for both payment providers.
        </p>
        <p>
          For integration details, see the{" "}
          <Link
            href="/docs/WEBHOOK_HANDLERS.md"
            className="text-blue-600 hover:underline"
          >
            Webhook Documentation
          </Link>
        </p>
      </div>
    </div>
  );
}
