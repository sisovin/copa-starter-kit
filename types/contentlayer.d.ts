// contentlayer.d.ts
declare module "contentlayer/generated" {
  import { Simplify } from "contentlayer/core";

  export type Post = {
    /** File path relative to content directory */
    _id: string;
    _raw: {
      /** File path relative to content directory */
      flattenedPath: string;
      /** File path relative to the contentDirPath */
      sourceFilePath: string;
      /** File name without extension */
      sourceFileName: string;
      /** Raw source contents of the content file */
      sourceFileContent: string;
      contentType: "mdx";
    };
    type: "Post";
    title: string;
    date: string;
    author: string;
    description?: string;
    image?: string;
    tags?: string[];
    draft?: boolean;
    slug: string;
    readingTime: number;
    structuredData: {
      "@context": string;
      "@type": string;
      headline: string;
      datePublished: string;
      author: {
        "@type": string;
        name: string;
      };
      description?: string;
    };
    body: {
      /** Raw MDX contents */
      raw: string;
      /** HTML compiled from MDX */
      html: string;
      /** Generated table of contents */
      toc: Array<{
        id: string;
        level: number;
        text: string;
      }>;
      /** MDX compiled to code for use with components */
      code: string;
    };
  };

  export type DocumentTypes = Post;

  export type AllTypes = DocumentTypes;
  export type AllTypeNames = "Post";
  export const allDocumentTypesMap: Record<AllTypeNames, Array<string>> = {
    Post: ["posts"],
  };

  export const allPosts: Array<Post> = [];
}
