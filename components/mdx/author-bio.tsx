import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

interface AuthorProps {
  name: string;
  avatar?: string;
  bio?: string;
  website?: string;
}

interface AuthorRegistry {
  [key: string]: AuthorProps;
}

// This is a mock author registry. In a real app, you might fetch this from a database or API
const authorRegistry: AuthorRegistry = {
  "GitHub Copilot": {
    name: "GitHub Copilot",
    avatar: "https://github.com/github-copilot.png",
    bio: "AI-powered code completion tool trained on billions of lines of code.",
    website: "https://github.com/features/copilot",
  },
  "John Doe": {
    name: "John Doe",
    avatar: "",
    bio: "Senior developer and technical writer with a passion for clean code and clear documentation.",
    website: "https://example.com",
  },
  // Add more authors as needed
};

export default function AuthorBio({ author }: { author: string }) {
  // Get author info from registry or use defaults
  const authorInfo = authorRegistry[author] || {
    name: author,
    avatar: "",
    bio: "Contributing writer.",
    website: "",
  };

  // Get initials for avatar fallback
  const initials = authorInfo.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-6 rounded-lg border bg-card text-card-foreground">
      <Avatar className="h-16 w-16">
        {authorInfo.avatar && (
          <AvatarImage src={authorInfo.avatar} alt={authorInfo.name} />
        )}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="text-center sm:text-left">
        <h3 className="text-lg font-semibold">{authorInfo.name}</h3>
        {authorInfo.bio && (
          <p className="text-sm text-muted-foreground mt-1">{authorInfo.bio}</p>
        )}
        {authorInfo.website && (
          <Link
            href={authorInfo.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline mt-2 inline-block"
          >
            Website
          </Link>
        )}
      </div>
    </div>
  );
}
