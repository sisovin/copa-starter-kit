# GitHub Actions Workflows

This project uses GitHub Actions for continuous integration and deployment. Here's an overview of the available workflows:

## TypeScript Type Checking

- **File**: `.github/workflows/typescript.yml`
- **Trigger**: Push to `main` or pull requests that modify TypeScript files
- **Purpose**: Ensures all TypeScript code compiles without type errors
- **Command**: `npm run build || npx tsc --noEmit`

## ESLint & Prettier Validation

- **File**: `.github/workflows/lint.yml`
- **Trigger**: Push to `main` or pull requests that modify JS/TS/CSS files
- **Purpose**: Enforces code quality and consistent formatting
- **Commands**:
  - `npx eslint --max-warnings=0 .`
  - `npx prettier --check .`

## Playwright E2E Tests

- **File**: `.github/workflows/e2e.yml`
- **Trigger**: Push to `main` or pull requests that modify code files
- **Purpose**: Runs end-to-end tests using Playwright
- **Command**: `npx playwright test`
- **Artifacts**: Test reports are uploaded as artifacts

## Vercel Preview Deployment

- **File**: `.github/workflows/preview.yml`
- **Trigger**: Pull requests to `main` and pushes to non-main branches
- **Purpose**: Creates a preview deployment on Vercel for testing
- **Requirements**:
  - Set `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` secrets in your GitHub repository

## Convex Schema Validation

- **File**: `.github/workflows/convex.yml`
- **Trigger**: Push to `main` or pull requests that modify Convex schema files
- **Purpose**: Validates Convex schema for syntax and common issues
- **Requirements**:
  - Set `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` secrets for full validation

## Bundle Size Analysis

- **File**: `.github/workflows/bundle-analysis.yml`
- **Trigger**: Push to `main` or pull requests that modify code files
- **Purpose**: Analyzes JavaScript bundle size to prevent performance regressions
- **Artifacts**: Bundle analysis reports are uploaded as artifacts

## Setting Up GitHub Secrets

For these workflows to function properly, you'll need to add the following secrets to your GitHub repository:

1. `VERCEL_TOKEN`: Personal access token from Vercel
2. `VERCEL_ORG_ID`: Your Vercel organization ID
3. `VERCEL_PROJECT_ID`: Your Vercel project ID
4. `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key (optional)
5. `CLERK_SECRET_KEY`: Your Clerk secret key (optional)
6. `CONVEX_DEPLOYMENT`: Your Convex deployment ID (optional)
7. `NEXT_PUBLIC_CONVEX_URL`: Your Convex URL (optional)

To add secrets to your repository:

1. Go to your repository on GitHub
2. Click on "Settings"
3. Navigate to "Secrets and variables" → "Actions"
4. Click on "New repository secret" and add each of the above secrets
