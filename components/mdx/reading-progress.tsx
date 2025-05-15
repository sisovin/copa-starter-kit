"use client";

import { useEffect, useState } from "react";

export default function ReadingProgressBar() {
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    const updateReadingProgress = () => {
      const currentProgress = window.scrollY;
      const scrollHeight = document.body.scrollHeight - window.innerHeight;
      if (scrollHeight) {
        setReadingProgress(
          Number((currentProgress / scrollHeight).toFixed(2)) * 100
        );
      }
    };

    window.addEventListener("scroll", updateReadingProgress);

    return () => {
      window.removeEventListener("scroll", updateReadingProgress);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50">
      <div
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${readingProgress}%` }}
      />
    </div>
  );
}
