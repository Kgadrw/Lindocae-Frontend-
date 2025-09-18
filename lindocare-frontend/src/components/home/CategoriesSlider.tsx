import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { normalizeImageUrl } from '../../utils/image';

interface Category {
  _id?: string;
  name: string;
  image?: string | string[];
  description?: string;
}

interface CategoriesSliderProps {
  categories: Category[];
  catLoading: boolean;
  catError: string;
}

const CategoriesSliderSkeleton = () => (
  <section className="relative w-full mb-8 md:mb-12 animate-pulse">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-6">
      <div className="hidden lg:block lg:col-span-3 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 md:h-10 bg-gray-200 rounded-lg" />
        ))}
      </div>
      <div className="col-span-1 lg:col-span-6 flex gap-3 md:gap-4 overflow-x-auto pb-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="w-[160px] md:w-[200px] h-[200px] md:h-[240px] bg-gray-200 rounded-2xl flex-shrink-0" />
        ))}
      </div>
      <div className="hidden lg:block lg:col-span-3">
        <div className="h-[200px] md:h-[240px] bg-gray-200 rounded-2xl" />
      </div>
    </div>
  </section>
);

const CategoriesSlider: React.FC<CategoriesSliderProps> = ({
  categories,
  catLoading,
  catError,
}) => {
  const [promoIndex, setPromoIndex] = useState(0);
  const promoInterval = useRef<NodeJS.Timeout | null>(null);

  // Auto-rotate promo
  useEffect(() => {
    if (!categories || categories.length === 0) return;
    promoInterval.current = setInterval(() => {
      setPromoIndex((prev) => (prev + 1) % categories.slice(0, 5).length);
    }, 4000);
    return () => {
      if (promoInterval.current) clearInterval(promoInterval.current);
    };
  }, [categories]);

  const monthName = new Date().toLocaleString('en-US', { month: 'long' });
  const topCategories = categories.slice(0, 3);

  return (
    <section className="relative w-full mb-8 md:mb-12">
      {catLoading ? (
        <CategoriesSliderSkeleton />
      ) : catError ? (
        <div className="text-center text-red-500 py-8">{catError}</div>
      ) : categories.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No categories available</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-6">
          {/* LEFT SIDEBAR */}
          <aside className="hidden lg:flex lg:col-span-3 flex-col gap-2">
            <h3 className="font-semibold text-gray-800 mb-3">Categories for you</h3>
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat._id}
                href={`/all-products?category=${encodeURIComponent(cat.name)}`}
                className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-indigo-400 transition"
              >
                <span className="text-sm font-medium text-gray-700 truncate">{cat.name}</span>
                <span className="text-gray-400">›</span>
              </Link>
            ))}
          </aside>

          {/* CENTER SECTION */}
          <div className="col-span-1 lg:col-span-6">
            <div className="flex justify-between items-center mb-3 md:mb-4">
              <h3 className="font-semibold text-gray-800 text-lg md:text-xl">Frequently searched</h3>
              <Link
                href="/all-products"
                className="text-sm font-medium text-indigo-600 hover:underline flex-shrink-0"
              >
                View all
              </Link>
            </div>

            {/* Mobile horizontal scroll, desktop flex */}
            <div className="flex gap-3 md:gap-6 overflow-x-auto pb-2 md:pb-0 -mx-1 px-1 md:mx-0 md:px-0 smooth-scroll mobile-scroll scrollbar-hide">
              {topCategories.map((cat, idx) => {
                const img = Array.isArray(cat.image) ? cat.image[0] : cat.image;
                const image = normalizeImageUrl(img || '');
                return (
                  <Link
                    key={cat._id || idx}
                    href={`/all-products?category=${encodeURIComponent(cat.name)}`}
                    className="group bg-white border border-gray-200 hover:border-indigo-400 hover:shadow-md transition flex flex-col w-[160px] md:w-[200px] h-[200px] md:h-[240px] rounded-2xl overflow-hidden flex-shrink-0"
                  >
                    <div className="relative w-full h-[100px] md:h-[140px] bg-gray-50">
                      {image ? (
                        <div
                          className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                          style={{ backgroundImage: `url(${image})` }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-2xl md:text-3xl">
                          🖼️
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-center justify-center flex-1 px-2 md:px-3 py-2 text-center">
                      <span className="font-semibold text-gray-800 text-xs md:text-sm mb-1 truncate w-full">
                        {cat.name}
                      </span>
                      <span className="text-xs text-gray-600 line-clamp-2">
                        {cat.description}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* RIGHT PROMO BANNER */}
          <aside className="hidden lg:flex lg:col-span-3">
            <div className="relative flex flex-col justify-end p-6 rounded-2xl overflow-hidden shadow-sm w-full h-[300px] bg-gray-100">
              {/* Background slideshow */}
              {categories.slice(0, 5).map((cat, index) => {
                const img = Array.isArray(cat.image) ? cat.image[0] : cat.image;
                return (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-700 ${
                      index === promoIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{
                      backgroundImage: `url(${normalizeImageUrl(img || '')})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                );
              })}
              {/* Gradient overlay (instead of black) */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-700/40 via-blue-500/20 to-transparent rounded-2xl" />

              {/* Content */}
              <div className="relative z-10 text-white">
  <h3 className="text-lg font-semibold">
    Super {monthName} exclusives
  </h3>
  <p className="text-sm mt-1">Don’t miss out on seasonal deals!</p>
  <Link href="/all-products">
    <button className="mt-2 px-4 py-2 rounded-full bg-yellow-500 text-white text-sm font-medium  cursor-pointer  hover:bg-blue-700 transition">
      View more
    </button>
  </Link>
</div>

              {/* Dots */}
              <div className="relative z-10 flex justify-center mt-3 gap-2">
                {categories.slice(0, 5).map((_, i) => (
                  <button
                    key={i}
                    className={`w-2 h-2 rounded-full transition ${
                      i === promoIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                    onClick={() => setPromoIndex(i)}
                  />
                ))}
              </div>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
};

export default CategoriesSlider;
