"use client";

import { Button } from "@/components/ui/button";
import {
  Facebook,
  Linkedin,
  Link as LinkIcon,
  Mail,
  Twitter,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ShareButtonsProps {
  title: string;
  url: string;
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  // Ensure we have the full URL
  const fullUrl = url.startsWith("http")
    ? url
    : `${process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com"}${url}`;

  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(fullUrl);

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  const mailUrl = `mailto:?subject=${encodedTitle}&body=${encodedUrl}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullUrl).then(
      () => {
        setCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      },
      () => {
        toast.error("Failed to copy link");
      }
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      <p className="text-sm text-muted-foreground mr-2 self-center">Share:</p>
      <Button
        variant="outline"
        size="icon"
        onClick={() => window.open(twitterUrl, "_blank")}
        aria-label="Share on Twitter"
      >
        <Twitter className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => window.open(facebookUrl, "_blank")}
        aria-label="Share on Facebook"
      >
        <Facebook className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => window.open(linkedinUrl, "_blank")}
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => window.open(mailUrl, "_blank")}
        aria-label="Share via Email"
      >
        <Mail className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={copyToClipboard}
        aria-label="Copy link"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}
