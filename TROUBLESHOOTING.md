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
