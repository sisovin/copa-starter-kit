# Copa Starter Kit - Next.js with Clerk Authentication

This ## Project Structure

- `/app/sign-in/[[...sign-in]]/page.tsx` - Sign-in page with dynamic routing
- `/app/sign-up/[[...sign-up]]/page.tsx` - Sign-up page with dynamic routing
- `/app/user-profile/[[...user-profile]]/page.tsx` - User profile management
- `/app/dashboard/page.tsx` - Protected dashboard page example
- `/middleware.ts` - Clerk authentication middleware for route protection
- `/types/clerk.ts` - TypeScript types for Clerk user session data
- `/components/auth/auth-nav.tsx` - Navigation component with auth state

## Authentication Features

- **Protected Routes**: Routes are protected using Clerk middleware
- **User Sessions**: Manage user sessions and authentication state
- **Social Logins**: Easily add Google, GitHub, and other OAuth providers
- **User Profiles**: Built-in user profile management
- **TypeScript Support**: Full type safety for authentication data

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Deployment

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new).

1. Push your code to a Git repository (GitHub, GitLab, BitBucket)
2. Import your repository to Vercel
3. Add your Clerk environment variables in the Vercel project settings
4. Deploy!(https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) that includes a complete authentication system using [Clerk](https://clerk.com/).

## Features

- 🔐 **Complete Authentication System**: Sign-up, Sign-in, Password Reset, and Session Management
- 🌐 **Social Login Providers**: Google and GitHub integration
- 🛡️ **Protected Routes**: Using Clerk middleware
- 👤 **User Profile Management**: Profile editing and account settings
- 📱 **Responsive UI**: Works on all device sizes
- 📝 **TypeScript Integration**: Type safety for user session data

## Authentication Setup

### Step 1: Create a Clerk Account

1. Sign up for a free account at [clerk.com](https://clerk.com)
2. Create a new application from the Clerk dashboard
3. Configure your social login providers (Google, GitHub) in the Clerk dashboard

### Step 2: Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```bash
# Clerk Authentication Keys (Get these from your Clerk Dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key

# Clerk Routes
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Social OAuth Providers (Optional - Add if using social logins)
NEXT_PUBLIC_CLERK_GITHUB_CLIENT_ID=your_github_client_id
NEXT_PUBLIC_CLERK_GITHUB_CLIENT_SECRET=your_github_client_secret
NEXT_PUBLIC_CLERK_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_CLERK_GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Step 3: Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Troubleshooting

If you encounter any issues with authentication, such as "Publishable key not valid", check the [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) guide for solutions.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
