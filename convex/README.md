<<<<<<< HEAD
# Welcome to your Convex functions directory!

Write your Convex functions here.
See https://docs.convex.dev/functions for more.

A query function that takes two arguments looks like:

```ts
// functions.js
import { query } from "./_generated/server";
import { v } from "convex/values";

export const myQueryFunction = query({
  // Validators for arguments.
  args: {
    first: v.number(),
    second: v.string(),
  },

  // Function implementation.
  handler: async (ctx, args) => {
    // Read the database as many times as you need here.
    // See https://docs.convex.dev/database/reading-data.
    const documents = await ctx.db.query("tablename").collect();

    // Arguments passed from the client are properties of the args object.
    console.log(args.first, args.second);

    // Write arbitrary JavaScript here: filter, aggregate, build derived data,
    // remove non-public properties, or create new objects.
    return documents;
  },
});
```

Using this query function in a React component looks like:

```ts
const data = useQuery(api.functions.myQueryFunction, {
  first: 10,
  second: "hello",
});
```

A mutation function looks like:

```ts
// functions.js
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const myMutationFunction = mutation({
  // Validators for arguments.
  args: {
    first: v.string(),
    second: v.string(),
  },

  // Function implementation.
  handler: async (ctx, args) => {
    // Insert or modify documents in the database here.
    // Mutations can also read from the database like queries.
    // See https://docs.convex.dev/database/writing-data.
    const message = { body: args.first, author: args.second };
    const id = await ctx.db.insert("messages", message);

    // Optionally, return a value from your mutation.
    return await ctx.db.get(id);
  },
});
```

Using this mutation function in a React component looks like:

```ts
const mutation = useMutation(api.functions.myMutationFunction);
function handleButtonPress() {
  // fire and forget, the most common way to use mutations
  mutation({ first: "Hello!", second: "me" });
  // OR
  // use the result once the mutation has completed
  mutation({ first: "Hello!", second: "me" }).then((result) =>
    console.log(result),
  );
}
```

Use the Convex CLI to push your functions to a deployment. See everything
the Convex CLI can do by running `npx convex -h` in your project root
directory. To learn more, launch the docs with `npx convex docs`.
=======
# Convex Schema Documentation

This document provides an overview of the Convex schema design and available API endpoints.

## Schema Structure

### User Profiles with Clerk Integration

- **users**: User profiles integrated with Clerk authentication
  - `clerkId`: Clerk user identifier
  - `firstName`, `lastName`, `email`, `imageUrl`: Basic user information
  - `bio`, `location`, `website`: Extended profile data
  - `role`: User role (admin, editor, author, reader)
  - Usage statistics: `lastActive`, `totalSessions`
- **userConnections**: Tracks follower/following relationships
  - `followerId`: User who follows
  - `followingId`: User being followed

### Blog Posts with Draft/Published States

- **blogPosts**: Core blog post content
  - `title`, `slug`, `content`, `excerpt`: Core content
  - `status`: "draft", "published", or "archived"
  - `publishedAt`, `createdAt`, `updatedAt`: Timestamps
  - `tags`, `categories`: Taxonomies
  - `viewCount`, `likeCount`, `commentCount`: Analytics
- **blogPostRevisions**: Version history for blog posts
  - `postId`: Reference to the edited post
  - `title`, `content`: Saved previous content
- **blogComments**: User comments on blog posts
  - `postId`: Associated blog post
  - `authorId`: Comment author
  - `content`: Comment text
  - `parentCommentId`: For nested comments
- **blogReactions**: User reactions to content
  - `postId`: Associated blog post
  - `userId`: User who reacted
  - `type`: "like", "bookmark", "share"

### File Uploads Storage

- **fileUploads**: Track uploaded files
  - `filename`, `mimeType`, `size`: File information
  - `storageId`, `url`: Storage references
  - `title`, `description`, `alt`: Metadata
  - Organization: `isPublic`, `folder`, `tags`
- **fileFolders**: Organize files in folders
  - `name`: Folder name
  - `parentFolderId`: Parent folder for nesting
  - `ownerId`: User who created the folder

### API Usage Analytics

- **activities**: Track user activities
  - `userId`, `action`, `resourceType`: What happened
  - `timestamp`: When it happened
  - `metadata`: Additional context
- **apiUsage**: Track API endpoint usage
  - `endpoint`, `method`, `statusCode`: API call details
  - `latencyMs`, `requestSize`, `responseSize`: Performance metrics
- **stats**: Aggregated statistics
  - `title`, `value`, `description`, `trend`: Presentable stats
- **userQuotas**: Track usage limits
  - `quotaType`, `limit`, `used`: Quota tracking
  - `resetAt`: When quota resets

### System Tables

- **systemSettings**: Global configuration
  - `key`, `value`: Key-value pairs
- **auditLogs**: Security audit trail
  - `userId`, `action`, `resourceType`: What happened
  - `previousState`, `newState`: What changed

## API Endpoints

### User Management

- `createOrUpdateUser`: Create or update user from Clerk data
- `getUserByClerkId`: Get user by Clerk ID

### Blog Posts

- `listPublishedPosts`: Get published blog posts with pagination
- `getBlogPost`: Get a single blog post by ID or slug
- `createBlogPost`: Create a new blog post
- `updateBlogPost`: Update an existing blog post
- `deleteBlogPost`: Delete or archive a blog post

### File Management

- `generateUploadUrl`: Get a URL for file upload
- `createFile`: Create a file record after upload
- `listFiles`: List files for the current user
- `updateFile`: Update file metadata
- `deleteFile`: Delete a file
- `createFolder`: Create a folder for files
- `listFolders`: List folders

### Analytics

- `trackApiUsage`: Log API call for analytics
- `getApiUsageStats`: Get API usage statistics (admin)
- `getUserActivityStats`: Get user activity analytics (admin)
- `getDashboardStats`: Get dashboard stats for current user

## Usage Examples

### Creating a Blog Post

```typescript
// Client-side code
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export function CreateBlogPostForm() {
  const createPost = useMutation(api.blog.createBlogPost);

  const handleSubmit = async (formData) => {
    await createPost({
      title: formData.title,
      content: formData.content,
      excerpt: formData.excerpt,
      tags: formData.tags,
      status: "draft", // or "published"
    });
  };

  // ...form implementation
}
```

### Uploading a File

```typescript
// Client-side code
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export function FileUploader() {
  const getUploadUrl = useMutation(api.files.generateUploadUrl);
  const createFile = useMutation(api.files.createFile);

  const handleFileUpload = async (file) => {
    // Step 1: Get an upload URL
    const { storageId } = await getUploadUrl({
      filename: file.name,
      mimeType: file.type,
    });

    // Step 2: Upload the file directly to storage
    await fetch(storageId, {
      method: "POST",
      body: file,
      headers: { "Content-Type": file.type },
    });

    // Step 3: Create the file record in the database
    await createFile({
      storageId,
      filename: file.name,
      mimeType: file.type,
      size: file.size,
      metadata: {
        title: file.name,
        alt: file.name,
      },
      isPublic: true,
    });
  };

  // ...upload UI implementation
}
```

### Fetching Blog Posts

```typescript
// Client-side code
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export function BlogList() {
  const [cursor, setCursor] = useState(undefined);
  const blogPosts = useQuery(api.blog.listPublishedPosts, {
    pagination: { limit: 10, cursor },
    tag: "javascript", // optional filtering
  });

  // ...rendering logic
}
```

## Type Safety

The schema is fully type-safe, providing:

- Type-safe query builders
- Validation for inputs and outputs
- TypeScript interfaces for all data structures
- Auto-generated types via Convex's code generation
>>>>>>> origin/main
