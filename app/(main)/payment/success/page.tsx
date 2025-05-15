"use client";

import { ErrorBoundary } from "@/components/error-boundary";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { sendAnalyticsEvent } from "@/lib/analytics";
import { useUser } from "@clerk/nextjs";
import confetti from "canvas-confetti";
import { useQuery } from "convex/react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Download,
  Share2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// Import React PDF components
import {
  Document,
  Page,
  PDFDownloadLink,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

// PDF Document Component
const TransactionReceipt = ({
  transaction,
  userName,
}: {
  transaction: any;
  userName: string;
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment Receipt</Text>
        <Text style={styles.subtitle}>Thank you for your payment</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transaction Details</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Transaction ID:</Text>
          <Text style={styles.value}>{transaction.transactionId}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>
            {new Date(
              transaction.completedAt || transaction.createdAt
            ).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Payment Method:</Text>
          <Text style={styles.value}>
            {transaction.paymentMethod === "payway" ? "PayWay" : "Bakong"}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <Text style={styles.value}>{transaction.status}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Details</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Amount:</Text>
          <Text style={styles.value}>
            {transaction.currency === "USD" ? "$" : ""}
            {transaction.currency === "USD"
              ? (transaction.amount / 100).toFixed(2)
              : transaction.amount.toLocaleString()}
            {transaction.currency === "KHR" ? " KHR" : ""}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Customer:</Text>
          <Text style={styles.value}>{userName}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{transaction.customerEmail}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>Thank you for your business!</Text>
        <Text style={styles.footerText}>
          Generated on {new Date().toLocaleDateString()}
        </Text>
      </View>
    </Page>
  </Document>
);

// Styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 30,
    padding: 10,
    borderBottom: 1,
    borderBottomColor: "#cccccc",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: "#666666",
  },
  section: {
    marginBottom: 20,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
  },
  label: {
    width: "40%",
    fontSize: 12,
  },
  value: {
    width: "60%",
    fontSize: 12,
  },
  footer: {
    marginTop: 30,
    padding: 10,
    borderTop: 1,
    borderTopColor: "#cccccc",
    fontSize: 10,
    color: "#666666",
    textAlign: "center",
  },
  footerText: {
    marginTop: 5,
  },
});

// Loading Component
const TransactionLoading = () => (
  <div className="space-y-6">
    <div className="flex justify-center">
      <Skeleton className="h-20 w-20 rounded-full" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4 mx-auto" />
    </div>
    <div className="border-t pt-4 space-y-2">
      <Skeleton className="h-10 w-full" />
      <div className="flex gap-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-10 w-1/2" />
      </div>
    </div>
  </div>
);

// Error Component
const InvalidTransaction = () => (
  <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
    <div className="h-20 w-20 rounded-full bg-yellow-100 flex items-center justify-center">
      <AlertCircle className="h-10 w-10 text-yellow-600" />
    </div>
    <div>
      <h2 className="text-2xl font-bold">Transaction Not Found</h2>
      <p className="text-muted-foreground mt-2">
        We couldn't find the payment you're looking for.
      </p>
    </div>
    <Button asChild>
      <Link href="/payment">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Return to Payments
      </Link>
    </Button>
  </div>
);

// Share options
interface ShareOption {
  name: string;
  icon: string;
  color: string;
  shareUrl: (text: string, url: string) => string;
}

const shareOptions: ShareOption[] = [
  {
    name: "WhatsApp",
    icon: "/whatsapp.svg",
    color: "#25D366",
    shareUrl: (text, url) =>
      `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  },
  {
    name: "Telegram",
    icon: "/telegram.svg",
    color: "#0088cc",
    shareUrl: (text, url) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
];

export default function PaymentSuccessPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const searchParams = useSearchParams();

  const transactionId = searchParams.get("id");
  const gateway = searchParams.get("gateway") || "payway";
  const isPending = searchParams.get("pending") === "true";

  const [isConfettiShown, setIsConfettiShown] = useState<boolean>(false);
  const [pollingCount, setPollingCount] = useState<number>(0);

  // Get transaction details from Convex
  const transaction = useQuery(
    api.payments.getPaymentStatus,
    transactionId ? { transactionId } : "skip"
  );

  const isLoading = (!transaction && transactionId) || !isLoaded;
  const isFound = transaction?.found;

  // Handle confetti effect on successful payment
  useEffect(() => {
    if (
      !isLoading &&
      isFound &&
      transaction.status === "completed" &&
      !isConfettiShown
    ) {
      // Trigger confetti effect
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      setIsConfettiShown(true);

      // Track success page view
      sendAnalyticsEvent("payment_success_view", {
        gateway,
        transactionId,
        userId: user?.id || "anonymous",
      });
    }
  }, [
    isLoading,
    isFound,
    transaction,
    isConfettiShown,
    gateway,
    transactionId,
    user?.id,
  ]);

  // Handle polling for payment status if pending
  useEffect(() => {
    if (isPending && transactionId && pollingCount < 20) {
      const intervalId = setInterval(() => {
        setPollingCount((prev) => prev + 1);
        // The query will automatically refetch
      }, 3000);

      return () => clearInterval(intervalId);
    }
  }, [isPending, transactionId, pollingCount]);

  // Share functionality
  const shareTransaction = (option: ShareOption) => {
    const text = `I just made a payment via ${gateway === "payway" ? "PayWay" : "Bakong"}!`;
    const url = window.location.href;

    window.open(option.shareUrl(text, url), "_blank");

    // Track sharing
    sendAnalyticsEvent("payment_receipt_shared", {
      platform: option.name,
      gateway,
      transactionId,
      userId: user?.id || "anonymous",
    });
  };

  // Track PDF download
  const trackPdfDownload = () => {
    sendAnalyticsEvent("payment_receipt_download", {
      format: "pdf",
      gateway,
      transactionId,
      userId: user?.id || "anonymous",
    });
  };

  return (
    <div className="container py-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Payment Status</h1>

        <ErrorBoundary>
          <Card>
            <CardContent className="pt-6 pb-4">
              {isLoading ? (
                <TransactionLoading />
              ) : !isFound ? (
                <InvalidTransaction />
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col items-center text-center">
                    {transaction.status === "completed" ? (
                      <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                      </div>
                    ) : transaction.status === "failed" ? (
                      <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
                        <AlertCircle className="h-10 w-10 text-red-600" />
                      </div>
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                        <div className="h-10 w-10 flex items-center justify-center">
                          <div className="h-6 w-6 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      </div>
                    )}

                    <h2 className="text-2xl font-bold">
                      {transaction.status === "completed"
                        ? "Payment Successful!"
                        : transaction.status === "failed"
                          ? "Payment Failed"
                          : "Processing Payment..."}
                    </h2>

                    <p className="text-muted-foreground mt-2">
                      {transaction.status === "completed"
                        ? "Your payment has been successfully processed."
                        : transaction.status === "failed"
                          ? "We couldn't process your payment. Please try again."
                          : "Your payment is being processed. This may take a moment..."}
                    </p>
                  </div>

                  <div className="bg-muted/40 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Payment Method:
                      </span>
                      <div className="flex items-center">
                        {gateway === "payway" ? (
                          <>
                            <Image
                              src="/payway-logo.png"
                              alt="PayWay"
                              width={24}
                              height={24}
                              className="mr-1"
                            />
                            <span>PayWay</span>
                          </>
                        ) : (
                          <>
                            <Image
                              src="/bakong-logo.png"
                              alt="Bakong"
                              width={24}
                              height={24}
                              className="mr-1"
                            />
                            <span>Bakong</span>
                          </>
                        )}
                      </div>
                    </div>

                    {transaction.status === "completed" && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Amount:</span>
                        <span className="text-sm font-bold">
                          {transaction.currency === "USD" ? "$" : ""}
                          {transaction.currency === "USD"
                            ? (transaction.amount / 100).toFixed(2)
                            : transaction.amount.toLocaleString()}
                          {transaction.currency === "KHR" ? " KHR" : ""}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Transaction ID:
                      </span>
                      <span className="text-sm font-mono text-xs">
                        {transaction.transactionId}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Date:</span>
                      <span className="text-sm">
                        {new Date(transaction.updatedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {transaction.status === "completed" && (
                    <div className="space-y-4 pt-4">
                      <div className="flex flex-col md:flex-row gap-4">
                        <PDFDownloadLink
                          document={
                            <TransactionReceipt
                              transaction={transaction}
                              userName={user?.fullName || "Customer"}
                            />
                          }
                          fileName={`receipt-${transaction.transactionId}.pdf`}
                          className="w-full"
                        >
                          {({ loading }) => (
                            <Button
                              variant="outline"
                              className="w-full"
                              disabled={loading}
                              onClick={trackPdfDownload}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              {loading ? "Generating..." : "Download Receipt"}
                            </Button>
                          )}
                        </PDFDownloadLink>

                        <Button variant="outline" className="w-full" asChild>
                          <Link href="/payment">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            New Payment
                          </Link>
                        </Button>
                      </div>

                      <div>
                        <p className="text-sm text-center mb-2">
                          Share Receipt:
                        </p>
                        <div className="flex justify-center space-x-4">
                          {shareOptions.map((option) => (
                            <Button
                              key={option.name}
                              variant="outline"
                              size="icon"
                              className="h-10 w-10 rounded-full"
                              onClick={() => shareTransaction(option)}
                            >
                              <Image
                                src={option.icon}
                                alt={option.name}
                                width={20}
                                height={20}
                              />
                            </Button>
                          ))}
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-full"
                            onClick={() => {
                              if (navigator.share) {
                                navigator.share({
                                  title: "Payment Receipt",
                                  text: `I just made a payment via ${gateway === "payway" ? "PayWay" : "Bakong"}!`,
                                  url: window.location.href,
                                });

                                // Track native sharing
                                sendAnalyticsEvent("payment_receipt_shared", {
                                  platform: "native",
                                  gateway,
                                  transactionId,
                                  userId: user?.id || "anonymous",
                                });
                              }
                            }}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {transaction.status === "failed" && (
                    <Button className="w-full" asChild>
                      <Link href="/payment">Try Again</Link>
                    </Button>
                  )}

                  {transaction.status === "pending" && (
                    <div className="flex justify-center">
                      <Button
                        variant="ghost"
                        onClick={() => window.location.reload()}
                      >
                        Check Status
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </ErrorBoundary>
      </div>
    </div>
  );
}
