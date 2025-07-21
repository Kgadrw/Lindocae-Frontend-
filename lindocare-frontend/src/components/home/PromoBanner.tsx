import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface PromoBannerProps {
  categories: any[];
  catLoading: boolean;
}

const PromoBanner: React.FC<PromoBannerProps> = ({ categories, catLoading }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Use actual category images for rotation
  const categoryImages = categories
    .filter(cat => cat.image && (Array.isArray(cat.image) ? cat.image[0] : cat.image))
    .slice(0, 5)
    .map(cat => ({
      image: Array.isArray(cat.image) ? cat.image[0] : cat.image,
      title: cat.name,
      description: cat.description || 'Discover amazing products'
    }));

  // Auto-rotate images every 4 seconds
  useEffect(() => {
    if (catLoading || categoryImages.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % categoryImages.length);
        setIsTransitioning(false);
      }, 300); // Transition duration
    }, 4000);

    return () => clearInterval(interval);
  }, [catLoading, categoryImages.length]);

  const handleDotClick = (index: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex(index);
      setIsTransitioning(false);
    }, 300);
  };

  if (catLoading) {
    return null; // Don't show while categories are loading
  }

  return (
    <section className="w-full mb-8">
      <div className="bg-white  border  overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[80px] lg:min-h-[100px]">
          {/* Left side - Rotating image */}
          <div className="relative bg-gray-100">
            <div className="relative w-full h-full">
              {categoryImages.map((category, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    index === currentImageIndex && !isTransitioning
                      ? 'opacity-100'
                      : 'opacity-0'
                  }`}
                >
                  <div 
                    className="w-full h-full"
                    style={{
                      backgroundImage: `url(${category.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                </div>
              ))}
              
              {/* Progress indicator dots - hidden on mobile */}
              {categoryImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 hidden lg:flex space-x-2">
                  {categoryImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleDotClick(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentImageIndex
                          ? 'bg-white shadow-lg'
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                      aria-label={`Go to ${categoryImages[index].title}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right side - Content */}
          <div className="flex flex-col justify-center p-4 lg:p-6">
            <div className="max-w-md mx-auto lg:mx-0 space-y-4">
              <div className="space-y-3">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 leading-tight">
                  Stay Organized with a Wish List
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Easily curate and save your list of must-have items with just a few clicks. Perfect for planning your baby&apos;s nursery or shopping for gifts.
                </p>
              </div>

              <div className="space-y-3">
                <Link
                  href="/wishlist"
                  className="inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300/50 shadow-lg"
                >
                  Get Started
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Free to use
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Share with family
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner; 