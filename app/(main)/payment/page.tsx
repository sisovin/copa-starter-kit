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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/convex/_generated/api";
import { sendAnalyticsEvent } from "@/lib/analytics";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CreditCard,
  DollarSign,
  HistoryIcon,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Exchange rate service - would be replaced with real API
const fetchExchangeRate = async () => {
  // Mock exchange rate - in production, fetch from an API
  return 4100; // 1 USD = 4100 KHR
};

// Transaction type
type Transaction = {
  _id: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  createdAt: number;
};

export default function PaymentPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  // Payment form state
  const [paymentGateway, setPaymentGateway] = useState<string>("payway");
  const [amount, setAmount] = useState<number>(10);
  const [currency, setCurrency] = useState<string>("USD");
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string>("");

  // Currency conversion state
  const [exchangeRate, setExchangeRate] = useState<number>(4100);
  const [isRateLoading, setIsRateLoading] = useState<boolean>(true);
  const [convertedAmount, setConvertedAmount] = useState<number>(0);

  // Transactions
  const recentTransactions = useQuery(api.payments.getRecentPayments, {
    userId: user?.id,
    limit: 5,
  });

  // Convex mutations (commented out, would be implemented in a real app)
  // const processPayWayPayment = useMutation(api.payments.processPayWayPayment);

  useEffect(() => {
    // Load user email if available
    if (isLoaded && isSignedIn && user?.emailAddresses) {
      const primaryEmail = user.emailAddresses.find(
        (email) => email.id === user.primaryEmailAddressId
      );
      if (primaryEmail) {
        setEmail(primaryEmail.emailAddress);
      }
    }

    // Load exchange rate
    const loadRate = async () => {
      try {
        const rate = await fetchExchangeRate();
        setExchangeRate(rate);
        updateConvertedAmount(amount, currency, rate);
      } catch (error) {
        console.error("Failed to load exchange rate:", error);
      } finally {
        setIsRateLoading(false);
      }
    };

    loadRate();

    // Track page view
    sendAnalyticsEvent("page_view", {
      page: "payment",
      userId: user?.id || "anonymous",
    });
  }, [isLoaded, isSignedIn, user]);

  // Update converted amount when inputs change
  useEffect(() => {
    updateConvertedAmount(amount, currency, exchangeRate);
  }, [amount, currency, exchangeRate]);

  // Handle gateway change
  const handleGatewayChange = (value: string) => {
    setPaymentGateway(value);
    setCheckoutUrl("");

    // Track analytics
    sendAnalyticsEvent("payment_gateway_selected", {
      gateway: value,
      userId: user?.id || "anonymous",
    });
  };

  // Handle currency change
  const handleCurrencyChange = (value: string) => {
    setCurrency(value);

    // Track analytics
    sendAnalyticsEvent("currency_changed", {
      from: currency,
      to: value,
      userId: user?.id || "anonymous",
    });
  };

  // Calculate converted amount
  const updateConvertedAmount = (
    amount: number,
    currency: string,
    rate: number
  ) => {
    try {
      if (currency === "USD") {
        setConvertedAmount(amount * rate);
      } else {
        setConvertedAmount(amount / rate);
      }

      // Track conversion
      sendAnalyticsEvent("amount_converted", {
        fromCurrency: currency,
        toCurrency: currency === "USD" ? "KHR" : "USD",
        amount: amount,
        convertedAmount: convertedAmount,
        userId: user?.id || "anonymous",
      });
    } catch (error) {
      console.error("Conversion error:", error);
    }
  };

  // Process PayWay payment
  const handlePayWaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      // In a real app, this would call the Convex mutation
      // const result = await processPayWayPayment({
      //   amount: currency === "USD" ? amount * 100 : Math.round(amount), // Convert to cents if USD
      //   currency,
      //   customerEmail: email,
      //   customerId: user?.id,
      //   returnUrl: `${window.location.origin}/payment/success`,
      // });

      // Mock implementation for demo
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockResult = {
        success: true,
        transactionId: `tx_${Date.now()}`,
        checkoutUrl: `https://checkout-sandbox.payway.com.kh/checkout-demo?amount=${amount}&currency=${currency}`,
      };

      if (mockResult.success) {
        setCheckoutUrl(mockResult.checkoutUrl);

        // Track successful payment initiation
        sendAnalyticsEvent("payment_initiated", {
          gateway: "payway",
          amount: amount,
          currency: currency,
          transactionId: mockResult.transactionId,
          userId: user?.id || "anonymous",
        });
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

  // Handle Bakong payment completion
  const handleBakongComplete = (data: any) => {
    // Track successful payment
    sendAnalyticsEvent("payment_completed", {
      gateway: "bakong",
      transactionId: data.paymentId,
      userId: user?.id || "anonymous",
    });

    // Redirect to success page
    router.push(`/payment/success?id=${data.paymentId}&gateway=bakong`);
  };

  // Handle Bakong payment failure
  const handleBakongFailed = (error: any) => {
    // Track payment failure
    sendAnalyticsEvent("payment_failed", {
      gateway: "bakong",
      error: error.message,
      userId: user?.id || "anonymous",
    });
  };

  // Redirect to PayWay checkout
  const handleContinueToPayWay = () => {
    // Open PayWay checkout in a new tab
    window.open(checkoutUrl, "_blank");

    // Navigate to a pending payment page that will poll for status
    const searchParams = new URLSearchParams({
      pending: "true",
      gateway: "payway",
    });
    router.push(`/payment/success?${searchParams.toString()}`);
  };

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // If authentication is not yet loaded, show a loading state
  if (!isLoaded) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Payment</h1>
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      </div>
    );
  }

  // If not signed in, show a message and sign-in button
  if (!isSignedIn) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Payment</h1>
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please sign in to access the payment system.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <Link href="/sign-in">
                Sign In <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold">Payment</h1>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <HistoryIcon className="mr-1 h-4 w-4" /> Transaction History
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Tabs
            value={paymentGateway}
            onValueChange={handleGatewayChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="payway" data-testid="payway-tab">
                <CreditCard className="mr-2 h-4 w-4" />
                PayWay (Card/ABA)
              </TabsTrigger>
              <TabsTrigger value="bakong" data-testid="bakong-tab">
                <DollarSign className="mr-2 h-4 w-4" />
                Bakong QR
              </TabsTrigger>
            </TabsList>

            <TabsContent value="payway">
              <Card>
                <CardHeader>
                  <CardTitle>PayWay Payment</CardTitle>
                  <CardDescription>
                    Pay with credit card or ABA bank account
                  </CardDescription>
                </CardHeader>

                {!checkoutUrl ? (
                  <form onSubmit={handlePayWaySubmit}>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="amount">Amount</Label>
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
                          <Label htmlFor="currency">Currency</Label>
                          <Select
                            value={currency}
                            onValueChange={handleCurrencyChange}
                          >
                            <SelectTrigger id="currency">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">USD ($)</SelectItem>
                              <SelectItem value="KHR">KHR (៛)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
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
                        <p className="text-xs text-muted-foreground">
                          Receipt will be sent to this email address
                        </p>
                      </div>

                      {/* Currency conversion display */}
                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Conversion Rate:
                          </span>
                          <div className="flex items-center">
                            <span className="text-sm">
                              {isRateLoading
                                ? "Loading..."
                                : `1 USD = ${exchangeRate.toLocaleString()} KHR`}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 ml-1"
                              onClick={() => {
                                setIsRateLoading(true);
                                fetchExchangeRate().then((rate) => {
                                  setExchangeRate(rate);
                                  setIsRateLoading(false);
                                });
                              }}
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm font-medium">
                            {currency === "USD"
                              ? "Amount in KHR:"
                              : "Amount in USD:"}
                          </span>
                          <span className="text-sm">
                            {currency === "USD"
                              ? `${convertedAmount.toLocaleString()} KHR`
                              : `$${convertedAmount.toFixed(2)} USD`}
                          </span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading
                          ? "Processing..."
                          : `Pay ${currency === "USD" ? "$" : ""}${amount}${currency === "KHR" ? " KHR" : ""}`}
                      </Button>
                    </CardFooter>
                  </form>
                ) : (
                  <CardContent className="space-y-4">
                    <div className="border rounded-md p-4 bg-muted/50 text-center">
                      <p className="mb-4">
                        Your PayWay checkout is ready. Click the button to
                        proceed.
                      </p>
                      <Button
                        onClick={handleContinueToPayWay}
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
                defaultAmount={
                  currency === "USD"
                    ? Math.round(amount * exchangeRate)
                    : amount
                }
                defaultReference={`Payment from ${user?.firstName || "User"}`}
                onPaymentComplete={handleBakongComplete}
                onPaymentFailed={handleBakongFailed}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentTransactions ? (
                recentTransactions.length > 0 ? (
                  <div className="space-y-4">
                    {recentTransactions.map((transaction: Transaction) => (
                      <div
                        key={transaction._id}
                        className="flex items-center justify-between border-b pb-2"
                      >
                        <div>
                          <p className="font-medium">
                            {transaction.paymentMethod === "payway"
                              ? "PayWay"
                              : "Bakong"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(transaction.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-medium ${transaction.status === "completed" ? "text-green-600" : transaction.status === "failed" ? "text-red-600" : "text-yellow-600"}`}
                          >
                            {transaction.currency === "USD" ? "$" : ""}
                            {transaction.amount /
                              (transaction.currency === "USD" ? 100 : 1)}
                            {transaction.currency === "KHR" ? " KHR" : ""}
                          </p>
                          <p className="text-xs capitalize text-muted-foreground">
                            {transaction.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>No transactions yet</p>
                  </div>
                )
              ) : (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/dashboard">View All Transactions</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="mr-2 h-4 w-4" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                If you encounter any issues with your payment, please contact
                our support team.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/support">Contact Support</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
