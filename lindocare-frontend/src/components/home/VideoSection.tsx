"use client";
import React, { useState, useRef, useEffect, useLayoutEffect } from "react";

interface VideoSectionProps {
  videos?: string[];
}

const SCROLL_SPEED = 0.3; // slower for smoothness

const VideoSkeleton = () => (
  <section className="relative w-full mb-8 p-0 animate-pulse">
    <div className="w-full overflow-hidden select-none">
      <div className="flex flex-row gap-4 pb-2 w-max">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <div className="bg-gray-200 rounded-xl w-[90vw] max-w-xs md:w-80 h-[450px]" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

const VideoSection: React.FC<VideoSectionProps> = ({ videos }) => {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);
  const [translateX, setTranslateX] = useState(0);
  const animationRef = useRef<number | null>(null);
  const [rowWidth, setRowWidth] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const defaultVideos = [
    "https://www.instagram.com/reel/DNQYNBHIgya/",
    "https://www.instagram.com/reel/DNC7nm9sUXO/",
    "https://www.instagram.com/reel/DM-DLHetOhw/",
    "https://www.instagram.com/reel/DLVIessNYiN/",
    "https://www.instagram.com/reel/DKzp-qbtEZ4/",
  ];

  const videoList = videos || defaultVideos;
  const displayVideos = [...videoList, ...videoList, ...videoList];
  const originalLength = videoList.length;

  // Load IG script once
  useEffect(() => {
    setMounted(true);
    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Measure row width
  useLayoutEffect(() => {
    if (!rowRef.current || videoList.length === 0 || !mounted) return;
    const timer = setTimeout(() => {
      if (rowRef.current) {
        const width = rowRef.current.scrollWidth / 3;
        setRowWidth(width);
        setTranslateX(-width);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [videoList, mounted]);

  // Observe visibility
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (!rowRef.current || !isInView || isHovered || rowWidth === 0 || !mounted)
      return;

    let x = translateX;
    let isMounted = true;

    const animate = () => {
      if (!isMounted) return;
      x += SCROLL_SPEED;
      if (x >= 0) {
        // reset instantly without transition
        x = -rowWidth;
        rowRef.current!.style.transition = "none";
        setTranslateX(x);
        requestAnimationFrame(() => {
          rowRef.current!.style.transition =
            "transform 0.3s linear"; // restore smooth
        });
      } else {
        setTranslateX(x);
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      isMounted = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [rowWidth, isInView, isHovered, mounted, translateX]);

  return (
    <section ref={containerRef} className="relative w-full mb-8 p-0">
      <div className="text-center mb-4">
        <h2 className="text-4xl font-extrabold text-blue-700 mb-2">
          Baby Care Reels from Our Instagram
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Watch short, helpful videos directly from our Instagram handle.
        </p>
      </div>

      {loading ? (
        <VideoSkeleton />
      ) : (
        <div className="w-full overflow-hidden select-none">
          <div
            ref={rowRef}
            className="flex flex-row gap-4 pb-2 w-max transition-transform duration-300 ease-linear"
            style={{
              transform: `translateX(${translateX}px)`,
              willChange: "transform",
            }}
          >
            {displayVideos.map((video, idx) => {
              const isFirstVisible = idx === originalLength;
              const isLastVisible = idx === originalLength * 2 - 1;
              return (
                <div
                  key={`${video}-${idx}`}
                  className="flex flex-col items-center"
                  style={{
                    marginLeft: isFirstVisible ? 0 : undefined,
                    marginRight: isLastVisible ? 0 : undefined,
                  }}
                >
                  <div
                    className="bg-gray-50 border border-gray-200 hover:border-gray-400 transition flex flex-col h-[450px] overflow-hidden flex-shrink-0 cursor-pointer w-[90vw] max-w-xs md:w-80"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    <blockquote
                      className="instagram-media w-full h-full"
                      data-instgrm-permalink={video}
                      data-instgrm-version="14"
                      style={{ background: "#fff", minHeight: "100%" }}
                    ></blockquote>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="text-center mt-6">
        <a
          href="https://www.instagram.com/lindocare/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 inline-block"
        >
          View More Videos
        </a>
      </div>
    </section>
  );
};

export default VideoSection;
