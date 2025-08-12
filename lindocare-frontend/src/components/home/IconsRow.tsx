import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import OfflineError from '../OfflineError';

interface Icon {
  _id?: string;
  title: string;
  image: string[] | string;
}

interface IconsRowProps {
  icons: Icon[] | undefined;
  iconsLoading: boolean;
  iconsError: unknown;
}

const IconsRowSkeleton = () => (
  <section className="w-full mb-8 animate-pulse">
    <div className="flex gap-5 pb-4">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div key={idx} className="flex flex-col items-center min-w-[100px]">
          <div className="w-20 h-20 mb-3 rounded-full bg-gray-200" />
          <div className="h-4 w-16 bg-gray-200 rounded mb-1" />
        </div>
      ))}
    </div>
  </section>
);

const IconsRow: React.FC<IconsRowProps> = ({ icons, iconsLoading, iconsError }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleIconsCount, setVisibleIconsCount] = useState(6);
  const [showDots, setShowDots] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const maxIndex = Math.max(0, (icons?.length || 0) - visibleIconsCount);

  // Array of random border colors
  const borderColors = [
    'border-red-300',
    'border-blue-300', 
    'border-green-300',
    'border-yellow-300',
    'border-purple-300',
    'border-pink-300',
    'border-indigo-300',
    'border-teal-300',
    'border-orange-300',
    'border-cyan-300',
    'border-emerald-300',
    'border-violet-300'
  ];

  // Generate random border colors for each icon
  const getRandomBorderColor = (index: number) => {
    return borderColors[index % borderColors.length];
  };

  // Calculate visible icons count based on screen width
  const calculateVisibleIcons = () => {
    if (typeof window === 'undefined') return 6;
    
    const screenWidth = window.innerWidth;
    const iconWidth = 100; // min-w-[100px]
    const gap = 20; // gap-5 = 20px
    
    // Calculate how many icons can fit in the visible area
    const containerWidth = screenWidth - 32; // Account for padding/margins
    const iconsThatFit = Math.floor(containerWidth / (iconWidth + gap));
    
    return Math.max(1, Math.min(iconsThatFit, icons?.length || 6));
  };

  // Update visible icons count on window resize
  useEffect(() => {
    const updateVisibleIcons = () => {
      const newVisibleCount = calculateVisibleIcons();
      setVisibleIconsCount(newVisibleCount);
      
      // Show dots only if there are more icons than can fit on screen
      setShowDots((icons?.length || 0) > newVisibleCount);
    };

    updateVisibleIcons();
    
    window.addEventListener('resize', updateVisibleIcons);
    return () => window.removeEventListener('resize', updateVisibleIcons);
  }, [icons?.length]);

  useEffect(() => {
    if (!icons || icons.length <= visibleIconsCount) return;

    const slideInterval = setInterval(() => {
      if (!isPaused) {
        setCurrentIndex((prevIndex) => {
          if (prevIndex >= maxIndex) {
            return 0; // Reset to beginning
          }
          return prevIndex + 1;
        });
      }
    }, 500); // Reduced from 1000ms to 500ms for faster sliding

    const pauseInterval = setInterval(() => {
      setIsPaused((prevPaused) => !prevPaused);
    }, 1000); // Reduced from 2000ms to 1000ms for faster pause cycle

    return () => {
      clearInterval(slideInterval);
      clearInterval(pauseInterval);
    };
  }, [icons, maxIndex, isPaused, visibleIconsCount]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const scrollAmount = currentIndex * 105; // 100px (min-w-[100px]) + 5px (gap)
      scrollContainerRef.current.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  }, [currentIndex]);

  return (
    <section className="w-full mb-8 mt-6">
      {iconsLoading ? (
        <IconsRowSkeleton />
      ) : iconsError ? (
        <OfflineError message={typeof iconsError === 'string' ? iconsError : (iconsError as Error)?.message || String(iconsError)} />
      ) : icons?.length === 0 ? (
        <div className="text-center text-gray-500 py-8"></div>
      ) : (
        <div className="w-full">
          {/* Auto-sliding container */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-5 pb-4 justify-center flex-wrap"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {icons?.map((icon: Icon, idx: number) => {
              let image = '';
              if (Array.isArray(icon.image) && icon.image.length > 0) image = icon.image[0];
              else if (typeof icon.image === 'string') image = icon.image;
              
              return (
                <Link
                  key={icon._id || idx}
                  href="/all-products"
                  className="flex flex-col items-center min-w-[100px] group cursor-pointer"
                  onClick={async e => {
                    if (typeof window !== 'undefined' && icon._id) {
                      e.preventDefault();
                      try {
                        const res = await fetch(`https://lindo-project.onrender.com/icons/getCategoryByIconId/${icon._id}`);
                        if (res.ok) {
                          const data = await res.json();
                          const catName = data?.name || data?.category?.name;
                          if (catName) {
                            // Navigate to all-products with category filtering using URL parameters
                            window.location.href = `/all-products?category=${encodeURIComponent(catName)}`;
                          } else {
                            window.location.href = '/all-products';
                          }
                        } else {
                          window.location.href = '/all-products';
                        }
                      } catch {
                        window.location.href = '/all-products';
                      }
                    }
                  }}
                >
                  {/* Icon container with soft blob background */}
                  <div className="relative w-20 h-20 mb-3 group-hover:scale-105 transition-transform duration-300">
                    {/* Soft blob background with random border */}
                    <div className={`absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-100 rounded-full shadow-sm group-hover:shadow-md transition-shadow duration-300 border-4 ${getRandomBorderColor(idx)}`} />
                    
                    {/* Icon image */}
                    <div className="absolute inset-2 rounded-full overflow-hidden bg-white">
                      {image ? (
                        <Image
                          src={image}
                          alt={icon.title}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <span className="text-2xl text-gray-400">🛍️</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Category label with arrow */}
                  <div className="text-center">
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300 flex items-center justify-center gap-1">
                      {icon.title}
                      <span className="text-xs opacity-60 group-hover:opacity-100 transition-opacity duration-300">→</span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
          
          {/* Auto-slide indicator - only show when there are hidden icons */}
          {showDots && icons && icons.length > visibleIconsCount && (
            <div className="flex justify-center mt-4">
              <div className="flex space-x-2">
                {Array.from({ length: Math.ceil(icons.length / visibleIconsCount) }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      Math.floor(currentIndex / visibleIconsCount) === idx ? 'bg-orange-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default IconsRow; 