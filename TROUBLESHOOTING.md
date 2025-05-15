# Troubleshooting Guide

## Authentication Issues

### "Publishable key not valid" Error

If you encounter the following error:

```
Error: Publishable key not valid.
```

This occurs when Clerk cannot find a valid API key. Here's how to fix it:

1. **Check your environment variables**: Make sure you've properly set up the `.env.local` file with valid Clerk API keys:

   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
   CLERK_SECRET_KEY=sk_test_your_actual_key_here
   ```

2. **Verify the keys are correct**: Double-check that you've copied the keys correctly from your Clerk dashboard.

3. **Restart the development server**: After updating the environment variables, restart your Next.js server:

   ```bash
   npm run dev
   ```

4. **Enable debug mode**: Add this to your `.env.local` file to get more detailed error information:

   ```
   CLERK_MIDDLEWARE_DEBUG=1
   ```

5. **Check key format**: Ensure your keys start with `pk_test_` (for publishable keys) and `sk_test_` (for secret keys).

### Other Authentication Issues

If you're experiencing other issues with Clerk authentication:

1. **Check Clerk's documentation**: Visit [Clerk's official documentation](https://clerk.com/docs) for up-to-date integration information.

2. **Verify middleware configuration**: Check that your `middleware.ts` file is properly configured.

3. **Look for API version mismatches**: Make sure you're using compatible versions of Next.js and Clerk packages.

4. **Clear browser cookies**: Sometimes authentication issues can be resolved by clearing cookies and browser cache.

## Development Environment Issues

### Next.js Build Errors

If you encounter build errors:

1. **Clear the Next.js cache**:

   ```bash
   rm -rf .next
   ```

2. **Reinstall dependencies**:

   ```bash
   npm install
   ```

3. **Check for TypeScript errors**:
   ```bash
   npm run type-check
   ```

### Environment Variable Loading

If environment variables aren't being loaded properly:

1. **Verify file name**: Ensure your file is named exactly `.env.local`

2. **Check for syntax errors**: Make sure your environment variables don't have spaces around the equals sign:

   ```
   # Correct
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key

   # Incorrect
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = your_key
   ```

3. **Restart after changes**: Always restart your development server after changing environment variables.
