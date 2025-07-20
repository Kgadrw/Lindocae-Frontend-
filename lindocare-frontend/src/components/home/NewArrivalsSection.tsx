import React, { useState, useEffect, useRef } from 'react';
import { Heart, ChevronRight, ChevronLeft, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

interface Product {
  _id?: string;
  id?: string | number;
  name: string;
  price: number;
  oldPrice?: number;
  image?: string[] | string;
  rating?: number;
  reviews?: number;
  tags?: string[];
  description?: string;
}

interface NewArrivalsSectionProps {
  filteredProducts: Product[];
  prodLoading: boolean;
  prodError: string;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  handleAddToCart: (product: Product) => void;
  priceMin: string;
  setPriceMin: (v: string) => void;
  priceMax: string;
  setPriceMax: (v: string) => void;
  sort: string;
  setSort: (v: string) => void;
  sortOptions: { value: string; label: string }[];
  handleClearAll: () => void;
  iconsRow?: ReactNode;
}

const features = [
  { icon: '/icons/reddot.svg', label: 'Red Dot Winner' },
  { icon: '/icons/sustainable.svg', label: 'Global Sustainable Sourcing' },
  { icon: '/icons/medical.svg', label: 'Medical-Grade Manufactured' },
  { icon: '/icons/pediatrician.svg', label: 'Pediatrician Co-developed' },
];

const NewArrivalsSection: React.FC<NewArrivalsSectionProps> = ({
  filteredProducts,
  prodLoading,
  prodError,
  wishlist,
  toggleWishlist,
  handleAddToCart,
  priceMin,
  setPriceMin,
  priceMax,
  setPriceMax,
  sort,
  setSort,
  sortOptions,
  handleClearAll,
  iconsRow,
}) => {
  const [scrollIndex, setScrollIndex] = useState(0);
  const products = filteredProducts;
  const productsPerRow = 4;
  const rowsPerView = 2; // Number of rows visible at once
  const totalRows = Math.ceil(products.length / productsPerRow);
  const maxScrollIndex = Math.max(0, totalRows - rowsPerView);

  const nextPage = () => {
    setScrollIndex((prev) => (prev + 1) % Math.max(1, totalRows));
  };

  const prevPage = () => {
    setScrollIndex((prev) => (prev - 1 + Math.max(1, totalRows)) % Math.max(1, totalRows));
  };

  // Get products for current view (2 rows)
  const startIndex = scrollIndex * productsPerRow;
  const endIndex = startIndex + (rowsPerView * productsPerRow);
  const currentProducts = products.slice(startIndex, endIndex);

  // Split products into rows
  const rows = [];
  for (let i = 0; i < currentProducts.length; i += productsPerRow) {
    rows.push(currentProducts.slice(i, i + productsPerRow));
  }

  return (
    <section className="mb-8">
      {/* Section Title and Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-center flex-1">
          <h2 className="text-2xl lg:text-5xl font-extrabold text-blue-500 mb-2">Shop The Must Haves</h2>
          <p className="text-gray-600">Discover our latest arrivals and trending products</p>
        </div>
        
        {/* Navigation Controls */}
        <div className="flex items-center gap-4">
          <Link
            href="/all-products"
            className="text-blue-500 text-sm font-semibold hover:underline focus:outline-none flex items-center gap-1"
            style={{ minWidth: 70 }}
          >
            See more <ChevronRight size={16} />
          </Link>
          

        </div>
      </div>

      {iconsRow && <div className="mb-4 flex justify-center">{iconsRow}</div>}

      {/* Right-aligned Chevron Navigation above product rows */}
      <div className="flex justify-end items-center mb-2 gap-2">
        <button
          onClick={prevPage}
          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white shadow transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
          aria-label="Previous page"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={nextPage}
          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white shadow transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
          aria-label="Next page"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {prodLoading ? (
        <div className="text-center text-gray-500 py-8"></div>
      ) : prodError ? (
        <div className="text-center text-red-500 py-8">{prodError}</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center text-gray-500 py-8"></div>
      ) : (
        <div className="space-y-6">
          {/* Product Rows */}
          {rows.map((row, rowIdx) => (
            <div 
              key={`${scrollIndex}-${rowIdx}`} 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-700 ease-in-out transform animate-fade-in"
            >
              {row.map((prod, idx) => (
                <div key={prod._id || prod.id || idx} className="bg-white shadow-lg">
                  <div className="relative">
                    {prod.image && (Array.isArray(prod.image) ? (
                      <img src={prod.image[0]} alt={prod.name} className="w-full h-48 object-cover" />
                    ) : (
                      <img src={prod.image} alt={prod.name} className="w-full h-48 object-cover" />
                    ))}
                    <button
                      className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition"
                      onClick={() => toggleWishlist(String(prod.id || prod._id))}
                      aria-label="Add to wishlist"
                    >
                      <Heart
                        size={18}
                        color={wishlist.includes(String(prod.id || prod._id)) ? '#F87171' : '#6B7280'}
                        fill={wishlist.includes(String(prod.id || prod._id)) ? '#F87171' : 'none'}
                        strokeWidth={2}
                      />
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-sm ${i < (prod.rating || 5) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                      ))}
                    </div>
                    <div className="text-sm font-semibold text-blue-900 mb-1 line-clamp-2">{prod.name}</div>
                    {prod.description && (
                      <div className="text-xs text-gray-500 mb-1 line-clamp-2">{prod.description}</div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-blue-900">${prod.price?.toFixed ? prod.price.toFixed(2) : prod.price}</div>
                      <button
                        onClick={() => handleAddToCart(prod)}
                        className="flex items-center gap-1 bg-yellow-500 text-white px-3 py-1 text-sm font-medium hover:bg-yellow-600 transition-colors"
                        aria-label="Add to cart"
                      >
                        <ShoppingCart size={14} />
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Page Indicators */}
          {totalRows > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex space-x-2">
                {Array.from({ length: totalRows }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setScrollIndex(idx)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      scrollIndex === idx ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    aria-label={`Go to page ${idx + 1}`}
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

export default NewArrivalsSection;

export function RedesignForLoveSection({ banners }: { banners: string[] }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) setVisible(true);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <section
      ref={ref}
      className={`w-full flex flex-col md:flex-row items-center justify-between gap-8 px-4 py-10 md:py-14 max-w-5xl mx-auto rounded-2xl mt-10 bg-white shadow-sm transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ minHeight: 220 }}
    >
      <div className="flex-1 flex flex-col items-start justify-center max-w-lg">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Redesign for Love</h2>
        <p className="text-gray-700 text-base md:text-lg mb-4">With a focus on innovation and excellence, we aim to enhance every aspect of motherhood.</p>
        <a href="#" className="text-blue-700 text-sm font-medium underline underline-offset-2 hover:text-blue-900 transition mb-2">Learn More &gt;</a>
      </div>
      <div className="flex-1 flex flex-row items-center justify-center gap-6 md:gap-10 w-full">
        {[0,1,2,3].map(i => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white flex items-center justify-center shadow border border-gray-200 mb-2 overflow-hidden">
              {banners && banners[i] ? (
                <img src={banners[i]} alt={`Feature ${i+1}`} className="w-12 h-12 md:w-16 md:h-16 object-cover" />
              ) : (
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-full" />
              )}
            </div>
            <span className="text-xs md:text-sm text-gray-800 text-center font-medium max-w-[90px]">{features[i]?.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
} 