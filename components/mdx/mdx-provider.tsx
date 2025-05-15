import { useMDXComponent } from "next-contentlayer/hooks";
import MDXComponents from "./mdx-components";

interface MdxProviderProps {
  code: string;
}

export function MdxProvider({ code }: MdxProviderProps) {
  const MDXContent = useMDXComponent(code);

  return (
    <div className="mdx prose dark:prose-invert prose-headings:scroll-mt-20 max-w-none">
      <MDXContent components={MDXComponents} />
    </div>
  );
}
