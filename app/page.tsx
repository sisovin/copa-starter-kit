import { AuthNav } from "@/components/auth/auth-nav";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <AuthNav />
      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-8 sm:p-20">
        <main className="flex flex-col gap-[32px] items-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-center">
            Welcome to Copa Starter Kit
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-300 text-center max-w-2xl">
            A fully-featured authentication system using Clerk with Next.js 15.
            Sign in to access your personalized dashboard.
          </p>

          <Image
            className="dark:invert my-8"
            src="/next.svg"
            alt="Next.js logo"
            width={180}
            height={38}
            priority
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
            <FeatureCard
              title="Authentication"
              description="Complete authentication system with social logins, email verification, and more."
            />
            <FeatureCard
              title="Protected Routes"
              description="Middleware-based route protection and redirection for unauthenticated users."
            />
            <FeatureCard
              title="User Profiles"
              description="Customizable user profiles with avatar uploads and account management."
            />
          </div>
          <div className="flex gap-4 items-center flex-col sm:flex-row mt-8">
            <Link
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
              href="/sign-in"
            >
              Get Started
            </Link>
            <Link
              className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto"
              href="/dashboard"
            >
              View Dashboard
            </Link>
          </div>
        </main>
        <footer className="mt-16 flex gap-[24px] flex-wrap items-center justify-center">
          <Link
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://nextjs.org/learn"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/file.svg"
              alt="File icon"
              width={16}
              height={16}
            />
            Next.js Learn
          </Link>
          <Link
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://clerk.com/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/window.svg"
              alt="Window icon"
              width={16}
              height={16}
            />
            Clerk Docs
          </Link>
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}
