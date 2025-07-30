import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface Category {
  _id?: string;
  name: string;
  image?: string;
  description?: string;
}

interface CategoriesSliderProps {
  categories: Category[];
  catLoading: boolean;
  catError: string;
}

const SCROLL_SPEED = 0.5; // pixels per frame (adjust for slower/faster)

const CategoriesSliderSkeleton = () => (
  <section className="relative w-full mb-8 p-0 animate-pulse">
    <div className="w-full overflow-hidden select-none">
      <div className="flex flex-row gap-4 pb-2 w-max">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <div className="bg-gray-200 rounded-xl w-[90vw] max-w-[200px] h-[200px]" />
            <div className="flex flex-col items-center mt-3 w-full max-w-[200px] text-center">
              <div className="bg-gray-200 h-4 w-1/2 mb-1 rounded" />
              <div className="bg-gray-200 h-3 w-2/3 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const CategoriesSlider: React.FC<CategoriesSliderProps> = ({
  categories,
  catLoading,
  catError,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);
  const [translateX, setTranslateX] = useState(0);
  const animationRef = useRef<number | null>(null);
  const [rowWidth, setRowWidth] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Duplicate categories 3 times for seamless infinite scroll
  const displayCategories = [...categories, ...categories, ...categories];
  const originalLength = categories.length;

  useEffect(() => {
    if (!rowRef.current || categories.length === 0) return;
    setRowWidth(rowRef.current.scrollWidth / 3); // width of one set
    setTranslateX(-rowWidth); // Start at the first full set for seamless loop
  }, [categories]);

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
    if (!rowRef.current || categories.length === 0 || !isInView || isHovered) return;
    let frameId: number;
    let x = translateX;
    let isMounted = true;
    const animate = () => {
      if (!isMounted) return;
      x -= SCROLL_SPEED; // Move left
      if (Math.abs(x) >= rowWidth * 2) {
        // If we've scrolled past the second set, reset to the start of the first set
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
  }, [rowWidth, categories, isInView, isHovered, translateX]);

  return (
    <section ref={containerRef} className="relative w-full mb-8 p-0">
      {/* Section Title */}
      {catLoading ? (
        <CategoriesSliderSkeleton />
      ) : catError ? (
        <div className="text-center text-red-500 py-8">{catError}</div>
      ) : categories.length === 0 ? (
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
            {displayCategories.map((cat, idx) => {
              let image = '';
              if (Array.isArray(cat.image) && cat.image.length > 0) image = cat.image[0];
              else if (typeof cat.image === 'string') image = cat.image;
              // Edge-to-edge: Remove left margin for first, right margin for last
              const isFirstVisible = idx === originalLength;
              const isLastVisible = idx === originalLength * 2 - 1;
              return (
                <div
                  key={cat._id ? `${cat._id}-${idx}` : idx}
                  className="flex flex-col items-center"
                  style={{ marginLeft: isFirstVisible ? 0 : undefined, marginRight: isLastVisible ? 0 : undefined }}
                >
                  <Link
                    href="/all-products"
                    className="bg-gray-50 border border-gray-200 hover:border-gray-400 transition flex flex-col h-[200px] w-[200px] overflow-hidden flex-shrink-0 cursor-pointer pointer-events-auto rounded-xl relative group"
                    onClick={e => {
                      if (typeof window !== 'undefined' && cat._id) {
                        e.preventDefault();
                        // Navigate to all-products with category filtering using URL parameters
                        window.location.href = `/all-products?category=${encodeURIComponent(cat.name)}`;
                      }
                    }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    tabIndex={0}
                  >
                    <div className="relative w-full h-full overflow-hidden rounded-xl">
                      {image ? (
                        <Image
                          src={image}
                          alt={cat.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          style={{ objectFit: 'cover', objectPosition: 'center' }}
                          className="rounded-xl"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-4xl rounded-xl">🖼️</div>
                      )}
                    </div>
                  </Link>
                  <div className="flex flex-col items-center mt-3 w-full max-w-[200px] text-center">
                    <span className="font-bold text-blue-700 text-sm mb-1">{cat.name}</span>
                    <span className="text-xs text-gray-600 line-clamp-2">{cat.description}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default CategoriesSlider;
