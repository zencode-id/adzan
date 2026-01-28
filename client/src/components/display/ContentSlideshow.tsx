import { useState, useEffect, useCallback } from "react";
import type { DisplayContent } from "../../lib/api";

interface ContentSlideshowProps {
  contents: DisplayContent[];
  onContentChange?: (content: DisplayContent) => void;
  className?: string;
}

export function ContentSlideshow({
  contents,
  onContentChange,
  className = "",
}: ContentSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const activeContents = contents.filter(
    (c) =>
      c.is_active && (c.content_type === "image" || c.content_type === "video"),
  );

  const goToNext = useCallback(() => {
    if (activeContents.length <= 1) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % activeContents.length);
      setIsTransitioning(false);
    }, 500); // Transition duration
  }, [activeContents.length]);

  useEffect(() => {
    if (activeContents.length === 0) return;

    const currentContent = activeContents[currentIndex];
    if (!currentContent) return;

    onContentChange?.(currentContent);

    // Set timer based on duration_seconds
    const duration = (currentContent.duration_seconds || 10) * 1000;
    const timer = setTimeout(goToNext, duration);

    return () => clearTimeout(timer);
  }, [currentIndex, activeContents, goToNext, onContentChange]);

  if (activeContents.length === 0) {
    return null;
  }

  const currentContent = activeContents[currentIndex];

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        {currentContent.content_type === "image" &&
          currentContent.media_url && (
            <img
              src={currentContent.media_url}
              alt={currentContent.title}
              className="w-full h-full object-cover"
            />
          )}
        {currentContent.content_type === "video" &&
          currentContent.media_url && (
            <video
              src={currentContent.media_url}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          )}
      </div>

      {/* Optional: Title overlay */}
      {currentContent.title && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <p className="text-white font-semibold text-sm">
            {currentContent.title}
          </p>
        </div>
      )}

      {/* Dots indicator */}
      {activeContents.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {activeContents.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? "bg-white w-4" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ContentSlideshow;
