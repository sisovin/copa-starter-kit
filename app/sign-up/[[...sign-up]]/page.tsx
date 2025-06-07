import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg rounded-lg border border-gray-100 dark:border-gray-800",
          },
        }}
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
        redirectUrl="/"
        socialButtonsVariant="iconButton"
        localization={{
          socialButtonsBlockButton: "Continue with {{provider}}",
        }}
      />
    </div>
  );
}
