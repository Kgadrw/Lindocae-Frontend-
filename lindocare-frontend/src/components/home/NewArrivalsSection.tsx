"use client";

import React, { useState } from "react";
import Link from "next/link";
import ProductCard from "../shared/ProductCard";
import ProductCardSkeleton from "../shared/ProductCardSkeleton";

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

// Format price function for ProductCard
const formatPrice = (amount: number) => `RWF ${formatRWF(amount)}`;

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
          ? Array.from({ length: productsPerPage }).map((_, idx) => <ProductCardSkeleton key={idx} />)
          : prodError
          ? <div className="col-span-full text-center text-red-500 py-8">{prodError}</div>
          : currentProducts.map((prod, idx) => (
              <ProductCard
                key={prod._id || prod.id || idx}
                product={prod}
                wishlist={wishlist}
                onToggleWishlist={(id) => toggleWishlist(id)}
                onAddToCart={handleAdd}
                formatPrice={formatPrice}
              />
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
