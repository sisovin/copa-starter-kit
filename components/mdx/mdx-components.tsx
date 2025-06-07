import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { HTMLAttributes } from "react";

interface MDXComponentsProps {
  [key: string]: React.ComponentType<any>;
}

interface CustomLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

interface CustomImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

interface CustomHeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  id?: string;
}

const CustomLink = ({ href, children, ...props }: CustomLinkProps) => {
  const isInternalLink = href && (href.startsWith("/") || href.startsWith("#"));

  if (isInternalLink) {
    return (
      <Link href={href}>
        <a {...props}>{children}</a>
      </Link>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  );
};

const CustomImage = ({
  src,
  alt,
  width,
  height,
  ...props
}: CustomImageProps) => {
  return (
    <div className="my-8 rounded-md overflow-hidden">
      <Image
        src={src}
        alt={alt}
        width={width || 800}
        height={height || 450}
        className="object-cover"
        {...props}
      />
    </div>
  );
};

const CustomHeading = ({ id, children, ...props }: CustomHeadingProps) => {
  return (
    <h2 id={id} className="group flex whitespace-pre-wrap" {...props}>
      {children}
      {id && (
        <a
          href={`#${id}`}
          className="ml-2 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Link to this section"
        >
          #
        </a>
      )}
    </h2>
  );
};

// Code block with syntax highlighting is handled by rehype-pretty-code
const CustomCode = ({ className, ...props }: HTMLAttributes<HTMLElement>) => (
  <code
    className={cn(
      "relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm",
      className
    )}
    {...props}
  />
);

const CustomPre = ({ className, ...props }: HTMLAttributes<HTMLPreElement>) => (
  <pre
    className={cn(
      "mt-4 mb-6 overflow-x-auto rounded-lg bg-slate-950 p-4 dark:bg-slate-900",
      className
    )}
    {...props}
  />
);

// Table component with responsive styling
const CustomTable = ({
  className,
  ...props
}: HTMLAttributes<HTMLTableElement>) => (
  <div className="my-6 w-full overflow-y-auto">
    <table className={cn("w-full", className)} {...props} />
  </div>
);

// Callout component for important notes
const Callout = ({
  children,
  type = "default",
  ...props
}: {
  children: React.ReactNode;
  type?: "default" | "warning" | "info";
}) => {
  const bgColorMap = {
    default: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
    warning:
      "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800",
    info: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
  };

  return (
    <div
      className={cn("p-4 rounded-md border-l-4 my-6", bgColorMap[type])}
      {...props}
    >
      {children}
    </div>
  );
};

export const MDXComponents: MDXComponentsProps = {
  // Override HTML elements with custom components
  a: CustomLink,
  img: CustomImage,
  h2: (props: CustomHeadingProps) => <CustomHeading as="h2" {...props} />,
  h3: (props: CustomHeadingProps) => <CustomHeading as="h3" {...props} />,
  code: CustomCode,
  pre: CustomPre,
  table: CustomTable,

  // Custom components
  Callout,

  // You can add more custom components here
};

export default MDXComponents;
