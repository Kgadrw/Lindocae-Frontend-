import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';

interface VideoSectionProps {
  videos?: Array<{
    id: string;
    title: string;
    description?: string;
  }>;
}

const SCROLL_SPEED = 0.5; // pixels per frame (same as categories)

const VideoSkeleton = () => (
  <section className="relative w-full mb-8 p-0 animate-pulse">
    <div className="w-full overflow-hidden select-none">
      <div className="flex flex-row gap-4 pb-2 w-max">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <div className="bg-gray-200 rounded-xl w-[90vw] max-w-xs md:w-80 h-[280px]" />
            <div className="flex flex-col items-start mt-3 w-full max-w-xs md:w-80">
              <div className="bg-gray-200 h-5 w-1/2 mb-1 rounded" />
              <div className="bg-gray-200 h-3 w-2/3 rounded" />
            </div>
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

  // Default videos if none provided
  const defaultVideos = [
    {
      id: '78xk0slS4Ls',
      title: 'Baby Care Tips & Tricks',
      description: 'Essential tips for new parents'
    },
    {
      id: 'm1Xim3MATgo',
      title: 'Nursery Setup Guide',
      description: 'How to create the perfect nursery'
    },
    {
      id: '78xk0slS4Ls',
      title: 'Baby Product Reviews',
      description: 'Honest reviews of baby products'
    },
    {
      id: 'rbqVvDx0BKY',
      title: 'Parenting Hacks',
      description: 'Life-changing parenting tips'
    },
    {
      id: 'cBrvaalVMfM',
      title: 'Baby Development Milestones',
      description: 'Tracking your baby\'s growth'
    },
    {
      id: '78xk0slS4Ls',
      title: 'Feeding Guide for Babies',
      description: 'Nutrition tips for your little one'
    },
    {
      id: 'm1Xim3MATgo',
      title: 'Sleep Training Methods',
      description: 'Help your baby sleep better'
    },
    {
      id: 'rbqVvDx0BKY',
      title: 'Baby Safety Essentials',
      description: 'Keeping your baby safe at home'
    }
  ];

  const videoList = videos || defaultVideos;

  // Duplicate videos 3 times for seamless infinite scroll
  const displayVideos = [...videoList, ...videoList, ...videoList];
  const originalLength = videoList.length;

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize rowWidth and translateX when videos are loaded
  useLayoutEffect(() => {
    if (!rowRef.current || videoList.length === 0 || !mounted) return;
    
    // Longer delay to ensure iframes are loaded
    const timer = setTimeout(() => {
      if (rowRef.current) {
        const width = rowRef.current.scrollWidth / 3; // width of one set
        setRowWidth(width);
        setTranslateX(-width); // Start at the first full set for seamless loop
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [videoList, mounted]);

  // Intersection Observer to detect if slider is in view
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

  // Animation effect: only run when in view and not hovered
  useEffect(() => {
    if (!rowRef.current || videoList.length === 0 || !isInView || isHovered || rowWidth === 0 || !mounted) return;
    
    let frameId: number;
    let x = translateX;
    let isMounted = true;
    
    const animate = () => {
      if (!isMounted) return;
      x += SCROLL_SPEED; // Move right (opposite to categories)
      if (x >= 0) {
        // If we've scrolled past the first set, reset to the start of the second set
        x = -rowWidth;
      }
      setTranslateX(x);
      frameId = requestAnimationFrame(animate);
    };
    
    frameId = requestAnimationFrame(animate);
    animationRef.current = frameId;
    
    return () => {
      isMounted = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [rowWidth, videoList, isInView, isHovered, mounted, translateX]);

  const handleViewMore = () => {
    setLoading(true);
    // Simulate loading for demo purposes
    setTimeout(() => {
      setLoading(false);
      // In a real app, this would load more videos
    }, 1000);
  };

  return (
    <section ref={containerRef} className="relative w-full mb-8 p-0">
      {/* Section Header */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-extrabold text-blue-700 mb-2">
          Baby Care Tips & Vlogs
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Watch helpful videos from our parenting experts and discover tips, tricks, and product reviews
        </p>
      </div>

      {/* Video Slider */}
      {loading ? (
        <VideoSkeleton />
      ) : videoList.length === 0 ? (
        <div className="text-center text-gray-500 py-8"></div>
      ) : (
        <div
          className="w-full overflow-hidden select-none"
          style={{ pointerEvents: 'auto' }}
        >
          <div
            ref={rowRef}
            className="flex flex-row gap-4 pb-2 w-max"
            style={{
              width: 'max-content',
              minWidth: '100vw',
              transform: `translateX(${translateX}px)`,
              transition: 'none',
              willChange: 'transform',
            }}
          >
            {displayVideos.map((video, idx) => {
              // Edge-to-edge: Remove left margin for first, right margin for last
              const isFirstVisible = idx === originalLength;
              const isLastVisible = idx === originalLength * 2 - 1;
              return (
                <div
                  key={`${video.id}-${idx}`}
                  className="flex flex-col items-center"
                  style={{ marginLeft: isFirstVisible ? 0 : undefined, marginRight: isLastVisible ? 0 : undefined }}
                >
                  <div
                    className="bg-gray-50 border border-gray-200 hover:border-gray-400 transition flex flex-col h-[280px] overflow-hidden flex-shrink-0 cursor-pointer pointer-events-auto w-[90vw] max-w-xs md:w-80"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    tabIndex={0}
                  >
                    <div className="relative w-full h-full overflow-hidden">
                      <iframe
                        src={`https://www.youtube.com/embed/${video.id}?rel=0&modestbranding=1&controls=1&showinfo=1&autoplay=0&enablejsapi=1`}
                        title={video.title}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-start mt-3 w-full max-w-xs md:w-80">
                    <span className="font-bold text-blue-700 text-base mb-1 text-left">{video.title}</span>
                    <span className="text-xs text-blue-700 text-left line-clamp-2">{video.description}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View More Button */}
      <div className="text-center mt-8">
        <button
          onClick={handleViewMore}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 disabled:transform-none flex items-center gap-2 mx-auto"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </>
          ) : (
            'View More Videos'
          )}
        </button>
      </div>
    </section>
  );
};

export default VideoSection; 