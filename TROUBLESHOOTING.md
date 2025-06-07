<<<<<<< HEAD
# Copa Starter Kit - i18n Troubleshooting Guide

## Current Status

The i18n configuration has been set up with:

- Khmer (km) as the default locale
- English (en) as the secondary locale
- Locale-based routing with `[locale]` dynamic segments
- Proper middleware configuration

## To Fix the 404 Error on /km Route

### Step 1: Clear Next.js Cache

```bash
# Delete the .next directory
rm -rf .next
# or on Windows:
Remove-Item ".next" -Recurse -Force
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Start Development Server

```bash
npm run dev
```

### Step 4: Test Routes

After the server starts, test these URLs:

- `http://localhost:3000` (should redirect to `/km`)
- `http://localhost:3000/km` (Khmer version)
- `http://localhost:3000/en` (English version)

## Configuration Summary

### Middleware (middleware.ts)

- Handles i18n routing with `localePrefix: "always"`
- Bypasses authentication in development mode
- Processes locale-based requests

### App Structure

```
app/
  layout.tsx (root layout - redirects to default locale)
  page.tsx (root page - redirects to /km)
  [locale]/
    layout.tsx (locale-specific layout with NextIntlClientProvider)
    page.tsx (locale-specific home page)
    (pages)/
      ... (other pages)
```

### Environment Variables (.env.local)

- `BYPASS_AUTH=true` for development
- Polar API uses dummy tokens in development

## If Still Not Working

1. Check the development server console for errors
2. Verify the server is running on the correct port
3. Try accessing `http://localhost:3000` instead of the IP address
4. Check if there are any TypeScript compilation errors

## Next Steps After Fixing

1. Test language switching functionality
2. Verify all pages work in both locales
3. Test the production build: `npm run build`
=======
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
>>>>>>> origin/main
