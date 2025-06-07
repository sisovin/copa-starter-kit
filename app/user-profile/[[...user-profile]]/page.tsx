import { UserProfile } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function UserProfilePage() {
  try {
    const user = await currentUser();

    if (!user) {
      redirect("/sign-in");
    }

    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
        <div className="w-full max-w-md">
          <UserProfile
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-lg rounded-lg border border-gray-100 dark:border-gray-800",
                navbar: "hidden",
              },
            }}
            path="/user-profile"
            routing="path"
          />{" "}
        </div>
      </div>
    );
  } catch (error) {
    console.error("User profile error:", error);

    // Provide a fallback UI when there's an error
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md max-w-xl">
          <h2 className="text-2xl font-bold mb-2">Profile Unavailable</h2>
          <p className="mb-4">
            We couldn't load your profile information. This might be due to a
            temporary issue with the authentication service.
          </p>
          <div className="flex gap-2">
            <a
              href="/user-profile"
              className="px-4 py-2 bg-red-100 dark:bg-red-800/30 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-800/50"
            >
              Retry
            </a>
            <a
              href="/sign-in"
              className="px-4 py-2 bg-primary/80 text-primary-foreground rounded-md hover:bg-primary"
            >
              Sign in again
            </a>
          </div>
        </div>
      </div>
    );
  }
}
