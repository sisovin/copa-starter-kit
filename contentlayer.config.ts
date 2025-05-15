import { defineDocumentType, makeSource } from 'contentlayer/source-files';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkGfm from 'remark-gfm';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-validation-error';

// Define the frontmatter schema using Zod for type-safety
const PostFrontmatterSchema = z.object({
  title: z.string(),
  date: z.string(),
  author: z.string(),
  description: z.string().optional(),
  image: z.string().optional(),
  tags: z.array(z.string()).optional(),
  draft: z.boolean().optional().default(false),
});

export const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: `posts/**/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: {
      type: 'string',
      required: true,
      description: 'The title of the post',
    },
    date: {
      type: 'date',
      required: true,
      description: 'The date of the post',
    },
    author: {
      type: 'string',
      required: true,
      description: 'The author of the post',
    },
    description: {
      type: 'string',
      description: 'The description of the post',
    },
    image: {
      type: 'string',
      description: 'The cover image of the post',
    },
    tags: {
      type: 'list',
      of: { type: 'string' },
      description: 'Tags for the post',
    },
    draft: {
      type: 'boolean',
      default: false,
      description: 'Whether the post is in draft state',
    },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (post) => post._raw.flattenedPath.replace(/^posts\//, ''),
    },
    readingTime: {
      type: 'number',
      resolve: (post) => {
        const content = post.body.raw;
        const wordsPerMinute = 200;
        const numberOfWords = content.split(/\s/g).length;
        return Math.ceil(numberOfWords / wordsPerMinute);
      },
    },
    structuredData: {
      type: 'json',
      resolve: (post) => {
        return {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          datePublished: post.date,
          author: {
            '@type': 'Person',
            name: post.author,
          },
          description: post.description,
        };
      },
    },
  },
}));

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [Post],
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypePrettyCode,
        {
          theme: 'github-dark',
          onVisitLine(node) {
            // Prevent lines from collapsing in `display: grid` mode, and
            // allow empty lines to be copy/pasted
            if (node.children.length === 0) {
              node.children = [{ type: 'text', value: ' ' }];
            }
          },
          onVisitHighlightedLine(node) {
            node.properties.className.push('highlighted');
          },
          onVisitHighlightedWord(node) {
            node.properties.className = ['word'];
          },
        },
      ],
      [
        rehypeAutolinkHeadings,
        {
          properties: {
            className: ['anchor'],
            ariaLabel: 'Link to section',
          },
        },
      ],
    ],
  },
});

// Export the Zod schema for use in form validation or API routes
export { PostFrontmatterSchema };
