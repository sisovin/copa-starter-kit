# Copa Starter Kit

A modern, feature-rich starter template for building production-ready applications with Next.js 15, Tailwind CSS, and TypeScript.

![Copa Starter Kit](https://dwdwn8b5ye.ufs.sh/f/MD2AM9SEY8GucGJl7b5qyE7FjNDKYduLOG2QHWh3f5RgSi0c)

## Features

### Core Technologies

- ⚡ **Next.js 15** - The latest version with App Router
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 📘 **TypeScript** - Type-safe code
- 🔒 **Authentication** - Clerk integration with persistent authorization toggle
- 🎭 **Shadcn/ui** - Beautiful and accessible components
- 💾 **Convex DB** - Real-time database with built-in file storage and serverless functions
- 💳 **Polar.sh** - Open-source solution for managing subscriptions and payments

### Performance Optimizations

- 🚀 **Route Prefetching** - Instant page transitions for dashboard, playground, and auth pages
- 🖼️ **Optimized Images** - Eager loading for critical images
- 🌓 **Dark/Light Mode** - System-aware theme switching with custom gradients
- 📱 **Responsive Design** - Mobile-first approach
- 🔄 **Real-time Updates** - Powered by Convex DB's real-time capabilities

### Developer Experience

- 🧩 **Component Library** - Pre-built, customizable components
- 🎮 **AI Playground** - Built-in AI chat interface
- 📊 **Dashboard Template** - Ready-to-use admin interface with subscription management
- 🔍 **SEO Optimized** - Meta tags and sitemap generation

## Convex DB Integration

To set up your Convex database, visit: [https://convex.link/rasmicstarter](https://convex.link/rasmicstarter)

## Quick Start

1. Clone the repository:

```bash
git clone https://github.com/sisovin/copa-starter-kit.git
```

2. Install dependencies:

```bash
bun install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

4. Configure your environment variables:

```env
# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Convex
NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOYMENT=
CONVEX_ADMIN_KEY=

# Polar.sh
POLAR_WEBHOOK_SECRET=

# Frontend
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Optional: AI Integration
OPENAI_API_KEY=
```

5. Run the development server:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## Project Structure

```
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── provider.tsx
│   ├── robots.ts
│   ├── sitemap.ts
│   ├── (pages)/
│   │   ├── (auth)/
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   ├── sign-up/[[...sign-up]]/page.tsx
│   │   │   └── user-profile/[[...user-profile]]/page.tsx
│   │   ├── blog/
│   │   │   ├── layout.tsx
│   │   │   ├── page.mdx
│   │   │   └── _components/name.tsx
│   │   ├── cancel/page.tsx
│   │   ├── dashboard/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── _components/
│   │   │   │   ├── dashboard-side-bar.tsx
│   │   │   │   └── dashbord-top-nav.tsx
│   │   │   ├── finance/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── marketing/page.tsx
│   │   ├── playground/
│   │   │   ├── page.tsx
│   │   │   └── _components/
│   │   │       ├── playground-chat.tsx
│   │   │       └── playground-message.tsx
│   │   ├── pricing/page.tsx
│   │   └── success/page.tsx
│   └── api/
│       └── chat/route.ts
├── components/
│   ├── custom-link.tsx
│   ├── Icons.tsx
│   ├── mode-toggle.tsx
│   ├── theme-provider.tsx
│   ├── user-profile.tsx
│   ├── video-player.tsx
│   ├── homepage/
│   │   ├── accordion-component.tsx
│   │   ├── faq.tsx
│   │   ├── hero-section.tsx
│   │   ├── marketing-cards.tsx
│   │   ├── orbiting-circles.tsx
│   │   ├── pricing.tsx
│   │   └── side-by-side.tsx
│   ├── magicui/
│   │   ├── border-beam.tsx
│   │   └── orbiting-circles.tsx
│   ├── ui/
│   │   ├── accordion.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── calendar.tsx
│   │   ├── card.tsx
│   │   ├── chart.tsx
│   │   ├── checkbox.tsx
│   │   ├── command.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── navigation-menu.tsx
│   │   ├── popover.tsx
│   │   ├── progress.tsx
│   │   ├── scroll-area.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── skeleton.tsx
│   │   ├── slider.tsx
│   │   ├── sonner.tsx
│   │   ├── switch.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   └── use-toast.ts
│   └── wrapper/
│       ├── footer.tsx
│       ├── navbar.tsx
│       └── page-wrapper.tsx
├── convex/
│   ├── auth.config.ts
│   ├── http.ts
│   ├── README.md
│   ├── schema.ts
│   ├── subscriptions.ts
│   ├── tsconfig.json
│   ├── users.ts
│   └── _generated/
│       ├── api.d.ts
│       ├── api.js
│       ├── dataModel.d.ts
│       ├── server.d.ts
│       └── server.js
├── lib/
│   ├── auth.ts
│   ├── polar.ts
│   └── utils.ts
├── styles/
│   └── animations.css
└── types/
    └── react-syntax-highlighter.d.ts
```

## Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint
- `bun run format` - Format code with Prettier

## Sponsors and Supporters

Special thanks to [Convex](https://www.convex.dev/) for their sponsorship and support in making this starter kit possible. Their real-time database and file storage solutions have been instrumental in creating a powerful foundation for modern web applications.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you find this template helpful, please give it a ⭐️ on [GitHub](https://github.com/sisovin/copa-starter-kit)!. Your support helps us maintain and improve the project.
=======
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