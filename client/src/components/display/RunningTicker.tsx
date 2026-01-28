import { useEffect, useRef } from "react";

interface RunningTickerProps {
  messages: string[];
  speed?: number; // pixels per second
  className?: string;
  style?: React.CSSProperties;
}

export function RunningTicker({
  messages,
  speed = 50,
  className = "",
  style,
}: RunningTickerProps) {
  const tickerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tickerRef.current || !contentRef.current || messages.length === 0)
      return;

    const ticker = tickerRef.current;
    const content = contentRef.current;

    // Clone content for seamless loop
    const clone = content.cloneNode(true) as HTMLDivElement;
    ticker.appendChild(clone);

    // Calculate animation duration based on content width and speed
    const contentWidth = content.offsetWidth;
    const duration = contentWidth / speed;

    // Apply animation
    ticker.style.animation = `ticker ${duration}s linear infinite`;

    return () => {
      ticker.style.animation = "";
      if (clone.parentNode) {
        clone.parentNode.removeChild(clone);
      }
    };
  }, [messages, speed]);

  if (messages.length === 0) return null;

  const combinedMessage = messages.join("   •   ");

  return (
    <div
      className={`overflow-hidden whitespace-nowrap ${className}`}
      style={style}
    >
      <style>
        {`
          @keyframes ticker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}
      </style>
      <div ref={tickerRef} className="inline-flex">
        <div ref={contentRef} className="inline-flex items-center gap-8 px-4">
          <span>{combinedMessage}</span>
          <span className="mx-8">•</span>
        </div>
      </div>
    </div>
  );
}

export default RunningTicker;
