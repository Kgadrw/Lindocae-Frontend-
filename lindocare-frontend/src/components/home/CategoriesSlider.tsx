import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';

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

const CategoriesSlider: React.FC<CategoriesSliderProps> = ({
  categories,
  catLoading,
  catError,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [translateX, setTranslateX] = useState(0);
  const animationRef = useRef<number | null>(null);
  const [rowWidth, setRowWidth] = useState(0);

  // Duplicate categories for seamless infinite scroll
  const displayCategories = [...categories, ...categories];

  useEffect(() => {
    if (!rowRef.current || categories.length === 0) return;
    setRowWidth(rowRef.current.scrollWidth / 2); // width of one set
    setTranslateX(0);
  }, [categories]);

  useEffect(() => {
    if (!rowRef.current || categories.length === 0) return;
    let frameId: number;
    let x = translateX;
    let isMounted = true;
    const animate = () => {
      if (!isMounted) return;
      x += SCROLL_SPEED;
      if (x >= rowWidth) {
        x = 0;
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
    // eslint-disable-next-line
  }, [rowWidth, categories]);

  return (
    <section className="relative w-full mb-8 p-0">
      <div className="flex flex-col items-center mb-2">
        <h2 className="text-xl font-bold text-blue-900 text-center mb-6">Categories</h2>
      </div>
      {catLoading ? (
        <div className="text-center text-gray-500 py-8">Loading categories...</div>
      ) : catError ? (
        <div className="text-center text-red-500 py-8">{catError}</div>
      ) : categories.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No categories found.</div>
      ) : (
        <div
          className="w-full overflow-hidden select-none"
          style={{ pointerEvents: 'none' }}
        >
          <div
            ref={rowRef}
            className="flex flex-row gap-4 pb-2 w-max -mx-4"
            style={{
              width: 'max-content',
              minWidth: '100%',
              transform: `translateX(${translateX}px)`,
              transition: 'none',
              willChange: 'transform',
            }}
          >
            {displayCategories.map((cat, idx) => {
              let image = '';
              if (Array.isArray(cat.image) && cat.image.length > 0) image = cat.image[0];
              else if (typeof cat.image === 'string') image = cat.image;
              return (
                <Link
                  key={cat._id ? `${cat._id}-${idx}` : idx}
                  href={`/category/${encodeURIComponent(cat.name)}`}
                  className="bg-gray-50 border transition flex flex-col h-[340px] overflow-hidden flex-shrink-0 rounded-2xl shadow hover:shadow-lg cursor-pointer pointer-events-auto w-[85vw] max-w-xs md:w-72"
                  style={{ marginLeft: 0, marginRight: 0 }}
                >
                  <div className="w-full h-64 overflow-hidden">
                    {image ? (
                      <img
                        src={image}
                        alt={cat.name}
                        className="w-full h-full object-cover object-center block"
                        style={{ display: 'block', width: '100%', height: '100%' }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-4xl">🖼️</div>
                    )}
                  </div>
                  <div className="flex flex-row items-center justify-between px-2 pt-2 pb-1 w-full">
                    <div className="flex flex-col items-start">
                      <span className="font-bold text-blue-700 text-base mb-1 truncate w-full">{cat.name}</span>
                      <span className="text-xs text-blue-700 text-left line-clamp-2">{cat.description}</span>
                    </div>
                    <span className="ml-2 text-blue-700 text-xl flex-shrink-0">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default CategoriesSlider; 