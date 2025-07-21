import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Icon {
  _id?: string;
  title: string;
  image: string[] | string;
}

interface IconsRowProps {
  icons: Icon[] | undefined;
  iconsLoading: boolean;
  iconsError: any;
}

const IconsRow: React.FC<IconsRowProps> = ({ icons, iconsLoading, iconsError }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const maxIndex = Math.max(0, (icons?.length || 0) - 6); // Show 6 icons at a time

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

  useEffect(() => {
    if (!icons || icons.length <= 6) return;

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
  }, [icons, maxIndex, isPaused]);

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
    <section className="w-full mb-8">
      {iconsLoading ? (
        <div className="text-center text-gray-500 py-8">Loading icons...</div>
      ) : iconsError ? (
        <div className="text-center text-red-500 py-8">{typeof iconsError === 'string' ? iconsError : iconsError?.message || String(iconsError)}</div>
      ) : icons?.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No icons found.</div>
      ) : (
        <div className="w-full">
          {/* Auto-sliding container */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-5 overflow-x-hidden pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {icons?.map((icon: Icon, idx: number) => {
              let image = '';
              if (Array.isArray(icon.image) && icon.image.length > 0) image = icon.image[0];
              else if (typeof icon.image === 'string') image = icon.image;
              
              return (
                <Link
                  key={icon._id || idx}
                  href={`/category/${encodeURIComponent(icon.title)}`}
                  className="flex flex-col items-center min-w-[100px] group cursor-pointer"
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
          
          {/* Auto-slide indicator */}
          {icons && icons.length > 6 && (
            <div className="flex justify-center mt-4">
              <div className="flex space-x-2">
                {Array.from({ length: Math.ceil(icons.length / 6) }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      Math.floor(currentIndex / 6) === idx ? 'bg-orange-500' : 'bg-gray-300'
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