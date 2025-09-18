"use client";

import React, { useState } from "react";
import { Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { normalizeImageUrl } from "../../utils/image";

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
}

interface NewArrivalsSectionProps {
  filteredProducts: Product[];
  prodLoading: boolean;
  prodError: string;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  handleAddToCart: (product: Product) => void;
  iconsRow?: React.ReactNode;
}

const productsPerPage = 8;

function formatRWF(amount: number) {
  return amount.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

const SkeletonCard = () => (
  <div className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow animate-pulse flex flex-col h-[320px]">
    <div className="bg-gray-200 w-full h-36 rounded-t-lg flex-shrink-0" />
    <div className="p-3 flex-1 flex flex-col">
      <div className="bg-gray-200 h-4 w-3/4 mb-2 rounded" />
      <div className="bg-gray-200 h-5 w-1/3 mb-2 rounded" />
      <div className="bg-gray-200 h-3 w-1/2 mb-3 rounded" />
      <div className="bg-gray-200 h-9 w-full mt-auto rounded" />
    </div>
  </div>
);

const NewArrivalsSection: React.FC<NewArrivalsSectionProps> = ({
  filteredProducts,
  prodLoading,
  prodError,
  wishlist,
  toggleWishlist,
  handleAddToCart,
  iconsRow,
}) => {
  const [page, setPage] = useState(0);
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const startIdx = page * productsPerPage;
  const currentProducts = filteredProducts.slice(startIdx, startIdx + productsPerPage);

  const handleAdd = (prod: Product) => {
    handleAddToCart(prod);
    setToastMsg("Added to cart!");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <section className="mb-8 px-4 md:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-700 mb-3">
          New Arrivals
        </h2>
        <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
          Discover the latest baby care products trusted by parents
        </p>
      </div>

      {iconsRow && <div className="mb-6 flex justify-center">{iconsRow}</div>}

      {/* View All Button */}
      <div className="flex justify-end mb-6">
        <Link
          href="/all-products"
          className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline transition-colors"
        >
          View all products →
        </Link>
      </div>

      {/* Product Grid - E-commerce Style */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {prodLoading
          ? Array.from({ length: productsPerPage }).map((_, idx) => <SkeletonCard key={idx} />)
          : prodError
          ? <div className="col-span-full text-center text-red-500 py-8">{prodError}</div>
          : currentProducts.map((prod, idx) => (
              <div
                key={prod._id || prod.id || idx}
                className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 group cursor-pointer overflow-hidden flex flex-col h-[320px]"
              >
                {/* Product Image */}
                <Link href={`/product/${prod._id || prod.id}`} className="block relative flex-shrink-0">
                  <div className="relative h-36 overflow-hidden bg-gray-50">
                    {prod.image && (
                      <Image
                        src={normalizeImageUrl(Array.isArray(prod.image) ? prod.image[0] : prod.image)}
                        alt={prod.name}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    
                    {/* Wishlist Heart */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(String(prod.id || prod._id));
                      }}
                      className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-all z-10"
                      aria-label="Add to wishlist"
                    >
                      <Heart
                        size={16}
                        className={`${
                          wishlist.includes(String(prod.id || prod._id))
                            ? 'text-red-500 fill-red-500'
                            : 'text-gray-500 hover:text-red-500'
                        } transition-colors`}
                        strokeWidth={1.5}
                      />
                    </button>

                    {/* Discount Badge */}
                    {prod.oldPrice && prod.oldPrice > prod.price && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        {Math.round(((prod.oldPrice - prod.price) / prod.oldPrice) * 100)}% OFF
                      </div>
                    )}

                    {/* Tags */}
                    {prod.tags && prod.tags[0] && (
                      <div className="absolute bottom-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                        {prod.tags[0]}
                      </div>
                    )}
                  </div>
                </Link>
                
                {/* Product Info */}
                <div className="p-3 flex-1 flex flex-col">
                  <Link href={`/product/${prod._id || prod.id}`} className="block">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 min-h-[40px] leading-tight">
                      {prod.name}
                    </h3>
                  </Link>
                  
                  {/* Price Section */}
                  <div className="mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-gray-900">
                        RWF {formatRWF(prod.price)}
                      </span>
                      {prod.oldPrice && prod.oldPrice > prod.price && (
                        <span className="text-xs text-gray-400 line-through">
                          RWF {formatRWF(prod.oldPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rating Section */}
                  <div className="flex items-center gap-1 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(prod.rating || 4.5) ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-1">
                      ({prod.reviews || Math.floor(Math.random() * 100) + 50})
                    </span>
                  </div>
                  
                  {/* Add to Cart Button - Push to bottom */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAdd(prod);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors duration-200 active:bg-blue-800 mt-auto"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
      </div>

      {/* Pagination - Improved mobile design */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 gap-3">
          <button
            onClick={() => setPage(p => Math.max(p - 1, 0))}
            className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 ${
              page === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md active:scale-95'
            }`}
            disabled={page === 0}
          >
            ← Previous
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-blue-700 font-semibold px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
              {page + 1} of {totalPages}
            </span>
          </div>
          
          <button
            onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))}
            className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 ${
              page === totalPages - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md active:scale-95'
            }`}
            disabled={page === totalPages - 1}
          >
            Next →
          </button>
        </div>
      )}

      {/* Enhanced Toast with better mobile positioning */}
      {showToast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-blue-700 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 animate-fade-in backdrop-blur-sm">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="font-medium">{toastMsg}</span>
        </div>
      )}
    </section>
  );
};

export default NewArrivalsSection;
