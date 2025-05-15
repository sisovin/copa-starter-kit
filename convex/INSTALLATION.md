# Installing the Enhanced Convex Schema

This guide will help you implement the enhanced Convex schema with Clerk integration, blog posts, file uploads, and analytics.

## Prerequisites

1. A Convex account (sign up at [convex.dev](https://convex.dev))
2. A Clerk account (sign up at [clerk.dev](https://clerk.dev))
3. Node.js 18+ installed

## Installation Steps

### 1. Apply the New Schema

Replace your existing `schema.ts` file with the new schema:

```bash
# Backup existing schema
mv convex/schema.ts convex/schema.ts.backup

# Copy new schema
cp convex/schema.ts.new convex/schema.ts
```

### 2. Add New API Files

Copy the newly created API files to your Convex directory:

```bash
# Make sure these files are in the convex directory
ls convex/queries.ts
ls convex/blog.ts
ls convex/files.ts
ls convex/analytics.ts
ls convex/lib/utils.ts
ls convex/lib/validators.ts
```

### 3. Update Environment Variables

Make sure your environment variables are set properly for Clerk integration. Add to your `.env.local` file:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud
```

### 4. Push the Schema to Convex

Run the Convex development server to push the schema:

```bash
npx convex dev
```

### 5. Create Initial Admin User

Create your first admin user by signing up with Clerk and then running this mutation in the Convex Dashboard:

```javascript
// In the Convex Dashboard Console
async function createAdminUser(ctx) {
  const adminUser = await ctx.db
    .query("users")
    .filter((q) => q.eq(q.field("clerkId"), "YOUR_CLERK_USER_ID"))
    .first();

  if (adminUser) {
    await ctx.db.patch(adminUser._id, { role: "admin" });
    return "Admin user updated";
  } else {
    return "User not found";
  }
}
```

### 6. Test the New Functionality

You can test the functionality by using the Convex Dashboard to run queries. For example:

```javascript
// Query to list all users
await ctx.db.query("users").collect();

// Add a test statistic
await ctx.db.insert("stats", {
  title: "New Users",
  value: "42",
  description: "New users in the last 7 days",
  icon: "user",
  trend: "up",
  updatedAt: Date.now(),
});
```

## Troubleshooting

### Schema Migration Issues

If you encounter issues with the schema migration:

1. Check your Convex dashboard for error messages
2. Make sure all required fields are being set when inserting records
3. Try clearing existing data for testing: `npx convex clear`

### Authentication Issues

If you have issues with Clerk authentication:

1. Verify your environment variables are set correctly
2. Check the Clerk dashboard for user information
3. Validate the User webhook is configured properly

### File Upload Issues

For file upload issues:

1. Check that your storage permissions are set correctly in Convex
2. Verify file size limits are not being exceeded
3. Confirm the proper content types are being set

## What's Next

After installation, you can:

1. Create your first blog post using the API
2. Upload files and use them as featured images
3. Build UI components for the blog and file management
4. Explore the analytics data

For more information, refer to the [Convex Documentation](https://docs.convex.dev) and [Clerk Documentation](https://clerk.dev/docs).
