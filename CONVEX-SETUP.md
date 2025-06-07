# Dashboard Setup with Convex

This dashboard uses Convex for real-time data management. Follow these steps to set up your Convex database:

## Setup Instructions

1. Install Convex CLI:

```bash
npm install -g convex
```

2. Login to Convex:

```bash
npx convex login
```

3. Initialize Convex for your project:

```bash
npx convex init
```

4. Deploy your Convex functions:

```bash
npx convex push
```

5. Start the development server:

```bash
npm run dev
```

6. After loading the dashboard, click the "Initialize Demo Data" button in the Convex Database card to seed sample data.

## Troubleshooting

### Missing \_generated Folder

If you see errors about missing `@/convex/_generated/api`, it means the Convex development server hasn't generated the necessary API files yet:

1. Make sure the Convex development server is running:

```bash
npx convex dev
```

2. The server will watch for file changes and auto-generate the API files in the `convex/_generated` directory.

3. Wait until you see "Connected to deployment: [your-deployment]" in the terminal.

4. Refresh your browser and the errors should be resolved.

### TypeScript Errors

If you encounter TypeScript errors related to Convex types:

1. Generate TypeScript types for your Convex schema:

```bash
npx convex codegen
```

2. Restart your development server.

## Features

- **Real-time Dashboard**: Shows live statistics with auto-updates when data changes
- **Optimistic UI**: Immediate feedback with background updates
- **Responsive Layout**: Works on mobile, tablet, and desktop views
- **Dark/Light Mode**: Full support for both themes
- **Error Boundaries**: Graceful error handling throughout the application
- **Loading States**: Skeleton loaders for improved UX during data fetching

## Environment Variables

Make sure you have the following environment variables set in your `.env.local`:

```
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
```

You can find your Convex deployment URL in the Convex dashboard after initializing your project.

## Running the Complete Setup

For a fresh setup from scratch:

```bash
# Install dependencies
npm install

# Setup Convex
npx convex login
npx convex init
npx convex dev

# In a separate terminal
npm run dev
```

Then navigate to your dashboard and click "Initialize Demo Data" to populate your Convex database with sample statistics.
