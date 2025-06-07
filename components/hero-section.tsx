"use client";

import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { ArrowRight, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface HeroSectionProps {
  title: string;
  typewriterTexts?: string[];
  description: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  videoSrc?: string;
  videoThumbnail?: string;
  className?: string;
}

export function HeroSection({
  title,
  typewriterTexts = ["products", "experiences", "businesses", "applications"],
  description,
  ctaText,
  ctaLink,
  secondaryCtaText,
  secondaryCtaLink,
  videoSrc,
  videoThumbnail,
  className,
}: HeroSectionProps) {
  const [currentTypewriterIndex, setCurrentTypewriterIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Animation timing variables
  const typingSpeed = 100; // milliseconds per character
  const deleteSpeed = 50; // faster deletion
  const pauseBeforeDelete = 2000; // pause before starting delete animation
  const pauseBeforeNextWord = 500; // pause before typing next word
  // Handle typewriter effect with optimized rendering
  useEffect(() => {
    if (typewriterTexts.length === 0) return;

    const currentWord = typewriterTexts[currentTypewriterIndex];

    let animationId: number;
    let lastTime = 0;

    // Use requestAnimationFrame for smoother animation and better performance
    const animate = (currentTime: number) => {
      if (!lastTime) lastTime = currentTime;

      const deltaTime = currentTime - lastTime;
      const timeThreshold = isDeleting ? deleteSpeed : typingSpeed;

      if (deltaTime >= timeThreshold) {
        lastTime = currentTime;

        if (!isDeleting) {
          // Typing mode
          if (displayText.length < currentWord.length) {
            setDisplayText(currentWord.substring(0, displayText.length + 1));
          } else {
            // Word is complete, pause before deleting
            setTimeout(() => {
              setIsDeleting(true);
            }, pauseBeforeDelete);
            return; // Stop animation loop during pause
          }
        } else {
          // Deleting mode
          if (displayText.length > 0) {
            setDisplayText(currentWord.substring(0, displayText.length - 1));
          } else {
            // Word is fully deleted, move to next word
            setIsDeleting(false);
            setCurrentTypewriterIndex(
              (prevIndex) => (prevIndex + 1) % typewriterTexts.length
            );
            setTimeout(() => {
              animationId = requestAnimationFrame(animate);
            }, pauseBeforeNextWord);
            return; // Stop animation loop during pause
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [
    currentTypewriterIndex,
    displayText,
    isDeleting,
    typewriterTexts,
    typingSpeed,
    deleteSpeed,
    pauseBeforeDelete,
    pauseBeforeNextWord,
  ]);

  // Video player handler
  const handleVideoPlay = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-gradient-background" />
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      </div>

      {/* Content container */}
      <div className="container relative z-10 mx-auto px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Left column: Text content */}
          <div className="max-w-3xl">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              {title}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 inline-block min-w-[120px] min-h-[40px]">
                {displayText}
                <span className="animate-blink">|</span>
              </span>
            </h1>
            <p className="mt-6 text-xl text-muted-foreground">{description}</p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="group relative overflow-hidden shadow-lg"
                onClick={() => (window.location.href = ctaLink)}
              >
                <span className="relative z-10">{ctaText}</span>
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90 group-hover:opacity-100 transition-opacity" />
                <span className="absolute right-4 group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="h-5 w-5" />
                </span>
              </Button>

              {secondaryCtaText && (
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-background/80 backdrop-blur-sm hover:bg-background/90 transition-colors"
                  onClick={() =>
                    (window.location.href = secondaryCtaLink || "#")
                  }
                >
                  {secondaryCtaText}
                </Button>
              )}
            </div>

            {/* Optional stats or social proof could go here */}
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4 text-sm">
              {[
                "Used by 10,000+ teams",
                "Enterprise ready",
                "99.9% uptime",
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>{" "}
          {/* Right column: Video/image */}
          {videoSrc && (
            <div className={cn("lg:relative", isMobile && "hidden sm:block")}>
              <div className="relative mx-auto max-w-lg lg:max-w-none lg:mx-0">
                {/* Video container with floating animation */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl animate-float-slow">
                  {/* Video overlay to add depth */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-black/20 to-black/5 pointer-events-none z-10" />

                  {/* Video thumbnail and player */}
                  <div className="relative aspect-video w-full">
                    <video
                      ref={videoRef}
                      poster={videoThumbnail || "/images/video-thumbnail.jpg"}
                      className="w-full h-full object-cover"
                      src={videoSrc}
                      muted
                      playsInline
                      loop
                      loading="lazy"
                      preload="none"
                      aria-label="Demo video"
                    />

                    {/* Play button overlay */}
                    <button
                      onClick={handleVideoPlay}
                      aria-label={isVideoPlaying ? "Pause video" : "Play video"}
                      className={cn(
                        "absolute inset-0 flex items-center justify-center transition-opacity",
                        isVideoPlaying
                          ? "opacity-0 pointer-events-none"
                          : "opacity-100"
                      )}
                    >
                      <div className="rounded-full bg-primary/90 p-4 text-primary-foreground hover:bg-primary transition-colors">
                        <Play className="h-8 w-8" />
                      </div>
                    </button>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-8 -right-8 h-48 w-48 rounded-full bg-blue-600/20 blur-3xl" />
                <div className="absolute -bottom-12 -left-12 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Example usage:
export default function HeroSectionExample() {
  return (
    <HeroSection
      title="Build amazing"
      typewriterTexts={["products", "experiences", "solutions", "applications"]}
      description="Our platform helps you create stunning digital experiences that convert visitors into customers, with powerful tools for design, development, and optimization."
      ctaText="Get Started"
      ctaLink="/sign-up"
      secondaryCtaText="See Demo"
      secondaryCtaLink="#demo"
      videoSrc="https://www.example.com/demo-video.mp4"
      videoThumbnail="/public/globe.svg" // Using an existing image from the project
      className="py-12 md:py-24"
    />
  );
}
