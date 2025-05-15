import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg rounded-lg border border-gray-100 dark:border-gray-800",
          },
        }}
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        redirectUrl="/"
        socialButtonsVariant="iconButton"
        localization={{
          socialButtonsBlockButton: "Continue with {{provider}}",
        }}
      />
    </div>
  );
}
