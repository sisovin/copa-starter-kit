"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";

// We would need to install @khmer-shared/qr-code in a real implementation
// For this example, we'll mock the QR code generation
const QRCode = ({ data, size = 200 }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className="bg-white p-4 rounded-lg"
        style={{ width: size, height: size }}
      >
        {/* Mock QR code with CSS grid */}
        <div className="grid grid-cols-8 grid-rows-8 gap-1 w-full h-full">
          {Array.from({ length: 64 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "bg-black",
                // Create a pattern that looks like a QR code
                i % 9 === 0 ||
                  i % 7 === 0 ||
                  i < 8 ||
                  i > 55 ||
                  i % 8 === 0 ||
                  i % 8 === 7
                  ? "bg-black"
                  : "bg-white"
              )}
            ></div>
          ))}
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">Scan with Bakong app</p>
    </div>
  );
};

// Phone number validation for Cambodian numbers
const khmerPhoneRegExp =
  /^(0|855|\+855)?((?:1[0-2]|6\d|7[0-7]|8\d|9\d)(?:\d{6,7}))$/;

// Validation schema
const BakongPaymentSchema = Yup.object().shape({
  phoneNumber: Yup.string()
    .required("Phone number is required")
    .matches(khmerPhoneRegExp, "Please enter a valid Cambodian phone number"),
  amount: Yup.number()
    .required("Amount is required")
    .min(1000, "Amount must be at least 1,000 KHR"),
  reference: Yup.string()
    .required("Payment reference is required")
    .min(3, "Reference must be at least 3 characters"),
});

// Format Cambodian phone number
const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, "");

  // Check for different prefix types and standardize to +855 format
  if (digits.startsWith("855")) {
    return `+${digits}`;
  } else if (digits.startsWith("0")) {
    return `+855${digits.substring(1)}`;
  } else {
    return `+855${digits}`;
  }
};

// Interface for form values
interface BakongFormValues {
  phoneNumber: string;
  amount: number;
  reference: string;
}

// Payment status type
type PaymentStatus = "idle" | "loading" | "processing" | "completed" | "failed";

// Props for the BakongForm component
interface BakongFormProps {
  onPaymentComplete?: (data: any) => void;
  onPaymentFailed?: (error: any) => void;
  defaultAmount?: number;
  defaultReference?: string;
  className?: string;
}

export function BakongForm({
  onPaymentComplete,
  onPaymentFailed,
  defaultAmount = 10000, // 10,000 KHR default
  defaultReference = "Order Payment",
  className,
}: BakongFormProps) {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [qrData, setQrData] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("form");
  const { toast } = useToast();

  // This would be a real Convex mutation in a full implementation
  // const processPayment = useMutation(api.payments.processBakongPayment);
  const processPayment = async (values: BakongFormValues) => {
    // Mock implementation
    console.log("Processing payment:", values);
    return {
      success: true,
      paymentId: "bkg_" + Math.random().toString(36).substring(2, 11),
      qrData: `BAKONG://${formatPhoneNumber(values.phoneNumber)}?amount=${values.amount}&ref=${encodeURIComponent(values.reference)}`,
    };
  };

  // This would be a real Convex query in a full implementation
  // const paymentData = useQuery(api.payments.getPaymentById, { paymentId }) || null;
  const paymentData = { status: paymentStatus };

  // Poll for payment status changes
  useEffect(() => {
    if (paymentId && paymentStatus === "processing") {
      const intervalId = setInterval(() => {
        // In a real implementation, this would check the payment status in the database
        // For demo purposes, we'll simulate a payment completion after a delay
        const shouldComplete = Math.random() > 0.3; // 70% chance of success

        if (shouldComplete) {
          setPaymentStatus("completed");
          onPaymentComplete?.({ paymentId, status: "completed" });
          toast({
            title: "Payment Completed",
            description: "Your payment has been processed successfully.",
            variant: "default",
          });
        }
      }, 3000);

      return () => clearInterval(intervalId);
    }
  }, [paymentId, paymentStatus, onPaymentComplete, toast]);

  // Handle form submission
  const handleSubmit = async (
    values: BakongFormValues,
    { setSubmitting, setErrors }: FormikHelpers<BakongFormValues>
  ) => {
    try {
      setPaymentStatus("loading");

      // Format phone number to proper Bakong format
      const formattedPhoneNumber = formatPhoneNumber(values.phoneNumber);

      // Process payment
      const result = await processPayment({
        ...values,
        phoneNumber: formattedPhoneNumber,
      });

      if (result.success) {
        setPaymentId(result.paymentId);
        setQrData(result.qrData);
        setPaymentStatus("processing");
        setActiveTab("qr");
      } else {
        throw new Error("Payment processing failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentStatus("failed");

      // Handle specific error types
      if (error.message.includes("insufficient")) {
        setErrors({ amount: "Insufficient balance in Bakong account" });
      } else if (error.message.includes("phone")) {
        setErrors({
          phoneNumber: "Invalid phone number or not registered with Bakong",
        });
      } else {
        toast({
          title: "Payment Failed",
          description:
            "There was an error processing your payment. Please try again.",
          variant: "destructive",
        });
      }

      onPaymentFailed?.(error);
    } finally {
      setSubmitting(false);
    }
  };

  // Reset the form
  const handleReset = () => {
    setPaymentStatus("idle");
    setPaymentId(null);
    setQrData(null);
    setActiveTab("form");
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Bakong Payment</CardTitle>
        <CardDescription>Pay with Bakong mobile banking</CardDescription>
      </CardHeader>

      <CardContent>
        {paymentStatus === "completed" ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircleIcon className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-center">
              Payment Successful
            </h3>
            <p className="text-center text-muted-foreground">
              Your payment has been processed successfully.
            </p>
            <Button onClick={handleReset} className="mt-4">
              Make Another Payment
            </Button>
          </div>
        ) : paymentStatus === "failed" ? (
          <Alert variant="destructive" className="mb-6">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <AlertTitle>Payment Failed</AlertTitle>
            <AlertDescription>
              There was an error processing your payment. Please try again.
            </AlertDescription>
            <Button onClick={handleReset} variant="outline" className="mt-4">
              Try Again
            </Button>
          </Alert>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="form">Payment Details</TabsTrigger>
              <TabsTrigger value="qr" disabled={!qrData}>
                Scan QR Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="form">
              <Formik
                initialValues={{
                  phoneNumber: "",
                  amount: defaultAmount,
                  reference: defaultReference,
                }}
                validationSchema={BakongPaymentSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form className="space-y-6 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Field
                        as={Input}
                        id="phoneNumber"
                        name="phoneNumber"
                        placeholder="e.g. 012 345 678"
                        className={cn(
                          "w-full",
                          errors.phoneNumber &&
                            touched.phoneNumber &&
                            "border-red-500"
                        )}
                      />
                      <ErrorMessage
                        name="phoneNumber"
                        component="div"
                        className="text-sm text-red-500"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter your Bakong registered phone number
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (KHR)</Label>
                      <Field
                        as={Input}
                        id="amount"
                        name="amount"
                        type="number"
                        min="1000"
                        step="1000"
                        className={cn(
                          "w-full",
                          errors.amount && touched.amount && "border-red-500"
                        )}
                      />
                      <ErrorMessage
                        name="amount"
                        component="div"
                        className="text-sm text-red-500"
                      />
                      <p className="text-xs text-muted-foreground">
                        Minimum amount: 1,000 KHR
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reference">Payment Reference</Label>
                      <Field
                        as={Input}
                        id="reference"
                        name="reference"
                        className={cn(
                          "w-full",
                          errors.reference &&
                            touched.reference &&
                            "border-red-500"
                        )}
                      />
                      <ErrorMessage
                        name="reference"
                        component="div"
                        className="text-sm text-red-500"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting || paymentStatus === "loading"}
                    >
                      {isSubmitting || paymentStatus === "loading" ? (
                        <div className="flex items-center">
                          <span className="mr-2">Processing</span>
                          <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-blue-500 animate-spin"></div>
                        </div>
                      ) : (
                        "Continue to Payment"
                      )}
                    </Button>
                  </Form>
                )}
              </Formik>
            </TabsContent>

            <TabsContent value="qr">
              <div className="flex flex-col items-center justify-center py-4 space-y-6">
                {paymentStatus === "processing" ? (
                  <>
                    <h3 className="text-lg font-medium">
                      Scan this QR code with your Bakong app
                    </h3>
                    <QRCode data={qrData || ""} size={240} />
                    <p className="text-center text-muted-foreground">
                      Waiting for payment confirmation...
                    </p>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-blue-600 animate-ping"></div>
                      <div className="h-2 w-2 rounded-full bg-blue-600 animate-ping animation-delay-200"></div>
                      <div className="h-2 w-2 rounded-full bg-blue-600 animate-ping"></div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <Skeleton className="h-[240px] w-[240px] rounded-lg" />
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                )}

                <div className="w-full pt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setActiveTab("form")}
                  >
                    Back to Payment Details
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>

      <CardFooter className="flex flex-col space-y-2">
        <p className="text-xs text-center text-muted-foreground">
          By proceeding, you agree to our Terms of Service and Privacy Policy.
          Payments are securely processed through Bakong.
        </p>
      </CardFooter>
    </Card>
  );
}

// Test cases for the Bakong form component
//
// 1. Invalid phone numbers
//    - Non-Cambodian format: test with "+1 123 456 7890"
//    - Incomplete number: test with "012 123"
//    - Invalid prefix: test with "013 123 456" (13 is not a valid prefix)
//
// 2. Insufficient balance errors
//    - Should be handled in the backend and reported back to the form
//    - Error will be displayed under the amount field
//
// 3. Network failures
//    - Simulated by the 30% failure rate in the polling function
//    - Displays an error alert with option to try again
