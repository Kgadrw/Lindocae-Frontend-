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
  <div className="bg-gray-200 animate-pulse rounded-2xl shadow-lg flex flex-col h-[340px]">
    <div className="bg-gray-300 rounded-t-2xl w-full h-48 mb-3" />
    <div className="p-4 flex-1 flex flex-col">
      <div className="bg-gray-300 h-4 w-1/2 mb-2 rounded" />
      <div className="bg-gray-300 h-3 w-2/3 mb-1 rounded" />
      <div className="bg-gray-300 h-6 w-1/3 mb-2 rounded" />
      <div className="bg-gray-300 h-8 w-full mt-auto rounded" />
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
    <section className="mb-8">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-3xl lg:text-5xl font-extrabold text-blue-700 mb-1">New Arrivals</h2>
        <p className="text-gray-700 text-base lg:text-lg max-w-2xl mx-auto">
          Check out the latest baby care products that our customers love.
        </p>
      </div>

      {iconsRow && <div className="mb-4 flex justify-center">{iconsRow}</div>}

      {/* View All Button above grid */}
      <div className="flex justify-end mb-4">
        <Link
          href="/all-products"
          className=" text-blue-700 px-4 py-2 rounded-full font-semibold  transition hover:underline"
        >
         View more
        </Link>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {prodLoading
          ? Array.from({ length: productsPerPage }).map((_, idx) => <SkeletonCard key={idx} />)
          : prodError
          ? <div className="text-center text-red-500 py-8">{prodError}</div>
          : currentProducts.map((prod, idx) => (
              <Link
                key={prod._id || prod.id || idx}
                href={`/product/${prod._id || prod.id}`}
                className="bg-white rounded-2xl shadow-lg flex flex-col h-[340px] hover:shadow-xl transition-shadow relative"
              >
                <div className="relative">
                  {prod.image && (
                    <Image
                      src={normalizeImageUrl(Array.isArray(prod.image) ? prod.image[0] : prod.image)}
                      alt={prod.name}
                      width={256}
                      height={192}
                      className="w-full h-48 object-cover rounded-t-2xl"
                    />
                  )}
                  <button
                    className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition z-10"
                    onClick={e => { e.preventDefault(); toggleWishlist(String(prod.id || prod._id)); }}
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
                <div className="p-4 flex-1 flex flex-col">
                  <div className="text-sm font-semibold text-blue-900 mb-1 line-clamp-2">{prod.name}</div>
                  <div className="text-lg font-bold text-blue-900 mb-2">{formatRWF(prod.price)} RWF</div>
                  <button
                    onClick={e => { e.preventDefault(); handleAdd(prod); }}
                    className="mt-auto rounded-full bg-blue-700 text-white font-bold py-2 text-sm shadow hover:bg-blue-900 transition"
                  >
                    Add to Cart
                  </button>
                </div>
              </Link>
            ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-6 gap-2">
        <button
          onClick={() => setPage(p => Math.max(p - 1, 0))}
          className={`px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded ${page === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={page === 0}
        >
          Prev
        </button>
        <span className="text-blue-700 font-semibold">{page + 1} / {totalPages || 1}</span>
        <button
          onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))}
          className={`px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded ${page === totalPages - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={page === totalPages - 1}
        >
          Next
        </button>
      </div>

      {/* Center-bottom Toast */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-4 animate-fade-in">
          <span>{toastMsg}</span>
        </div>
      )}
    </section>
  );
};

export default NewArrivalsSection;
