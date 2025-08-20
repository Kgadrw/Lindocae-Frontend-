"use client";

import React, { useEffect, useRef, useState } from "react";

type Direction = "up" | "down" | "left" | "right" | "fade";

interface RevealProps {
  children: React.ReactNode;
  direction?: Direction;
  delayMs?: number;
  durationMs?: number;
  distancePx?: number;
  once?: boolean;
  className?: string;
}

/**
 * Lightweight on-scroll reveal wrapper using IntersectionObserver
 * Adds subtle translate + fade animation when the element enters the viewport
 */
const Reveal: React.FC<RevealProps> = ({
  children,
  direction = "up",
  delayMs = 60,
  durationMs = 600,
  distancePx = 24,
  once = true,
  className = "",
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const element = ref.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            setHasRevealed(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setIsInView(false);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [once]);

  const initialTransform = (() => {
    switch (direction) {
      case "up":
        return `translateY(${distancePx}px) scale(0.98)`;
      case "down":
        return `translateY(-${distancePx}px) scale(0.98)`;
      case "left":
        return `translateX(${distancePx}px) scale(0.98)`;
      case "right":
        return `translateX(-${distancePx}px) scale(0.98)`;
      case "fade":
      default:
        return "none";
    }
  })();

  const style: React.CSSProperties = {
    opacity: isInView ? 1 : 0,
    transform: isInView ? "none" : initialTransform,
    transitionProperty: "opacity, transform",
    transitionDuration: `${durationMs}ms`,
    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
    transitionDelay: `${delayMs}ms`,
    willChange: "opacity, transform",
  };

  // Avoid hiding content forever if once=true and already revealed
  const shouldRenderVisible = once && hasRevealed;

  return (
    <div ref={ref} className={className} style={shouldRenderVisible ? { opacity: 1, transform: "none" } : style}>
      {children}
    </div>
  );
};

export default Reveal;


