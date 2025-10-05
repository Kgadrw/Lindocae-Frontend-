"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  description?: string;
  category?: string;
  createdAt?: string;
  views?: number;
}

interface ProductShowcaseProps {
  wishlist: string[];
  onToggleWishlist: (id: string, product?: Product) => void;
  onAddToCart: (product: Product) => void;
}

function formatRWF(amount: number) {
  return amount.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

const formatPrice = (amount: number) => `RF ${formatRWF(amount)}`;

const ProductShowcase: React.FC<ProductShowcaseProps> = ({
  wishlist,
  onToggleWishlist,
  onAddToCart,
}) => {
  const [topRankingProducts, setTopRankingProducts] = useState<Product[]>([]);
  const [newArrivalsProducts, setNewArrivalsProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newArrivalsPage, setNewArrivalsPage] = useState(0);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch all products
        const response = await fetch("https://lindo-project.onrender.com/product/getAllProduct");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        const allProducts: Product[] = Array.isArray(data) ? data : data.products || [];

        // Sort products by views/rating for top ranking (simulate ranking)
        const topRanking = [...allProducts]
          .sort((a, b) => {
            // Sort by views if available, otherwise by rating, otherwise by reviews
            const aScore = (a.views || 0) + (a.rating || 0) * 10 + (a.reviews || 0);
            const bScore = (b.views || 0) + (b.rating || 0) * 10 + (b.reviews || 0);
            return bScore - aScore;
          })
          .slice(0, 3);

        // Sort products by creation date for new arrivals (simulate new arrivals)
        const newArrivals = [...allProducts]
          .sort((a, b) => {
            const aDate = new Date(a.createdAt || "2024-01-01");
            const bDate = new Date(b.createdAt || "2024-01-01");
            return bDate.getTime() - aDate.getTime();
          })
          .slice(0, 6); // Show 6 products in carousel

        setTopRankingProducts(topRanking);
        setNewArrivalsProducts(newArrivals);
      } catch (err) {
        setError("Failed to load products");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getProductId = (product: Product): string => {
    return String(product._id || product.id || '');
  };

  const getProductImage = (product: Product): string => {
    if (Array.isArray(product.image) && product.image.length > 0) {
      return product.image[0];
    }
    return typeof product.image === 'string' ? product.image : '';
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlist.includes(productId);
  };

  const handleNewArrivalsNavigation = (direction: 'prev' | 'next') => {
    const maxPage = Math.max(0, Math.ceil(newArrivalsProducts.length / 3) - 1);
    if (direction === 'prev') {
      setNewArrivalsPage(prev => Math.max(0, prev - 1));
    } else {
      setNewArrivalsPage(prev => Math.min(maxPage, prev + 1));
    }
  };

  const getCurrentNewArrivals = () => {
    const startIndex = newArrivalsPage * 3;
    return newArrivalsProducts.slice(startIndex, startIndex + 3);
  };

  if (loading) {
    return (
      <div className="bg-gray-50 py-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-48 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-96 mx-auto mb-8"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 py-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-16 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Top Ranking Section */}
        <div className="mb-16">
          {/* Section Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Top Ranking</h2>
              <p className="text-gray-600">Navigate trends with data-driven rankings</p>
            </div>
            <Link
              href="/all-products"
              className="text-gray-900 hover:text-gray-700 font-medium transition-colors"
            >
              View more &gt;
            </Link>
          </div>

          {/* Top Ranking Products */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topRankingProducts.map((product, index) => {
              const productId = getProductId(product);
              const imageUrl = getProductImage(product);
              
              return (
                <div key={productId} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                  <Link href={`/product/${productId}`} className="block">
                    <div className="relative h-48 overflow-hidden">
                      {imageUrl && (
                        <Image
                          src={normalizeImageUrl(imageUrl)}
                          alt={product.name}
                          width={300}
                          height={200}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      )}
                      
                      {/* TOP Badge */}
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                        <div className="bg-amber-600 text-white px-3 py-1 rounded-md text-sm font-bold">
                          TOP
                        </div>
                      </div>

                      {/* Wishlist Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onToggleWishlist(productId, product);
                        }}
                        className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-all z-10"
                      >
                        <svg
                          className={`w-4 h-4 ${
                            isInWishlist(productId)
                              ? 'text-red-500 fill-red-500'
                              : 'text-gray-500 hover:text-red-500'
                          } transition-colors`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                  </Link>
                  
                  <div className="p-4">
                    <Link href={`/product/${productId}`}>
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500 mb-2">Hot selling</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onAddToCart(product);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* New Arrivals Section */}
        <div>
          {/* Section Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">New Arrivals</h2>
              <p className="text-gray-600">Stay ahead with the latest offerings</p>
            </div>
            <Link
              href="/all-products"
              className="text-gray-900 hover:text-gray-700 font-medium transition-colors"
            >
              View more &gt;
            </Link>
          </div>

          {/* New Arrivals Carousel */}
          <div className="relative">
            {/* Navigation Arrows */}
            {newArrivalsProducts.length > 3 && (
              <>
                <button
                  onClick={() => handleNewArrivalsNavigation('prev')}
                  disabled={newArrivalsPage === 0}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed z-10"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => handleNewArrivalsNavigation('next')}
                  disabled={newArrivalsPage >= Math.ceil(newArrivalsProducts.length / 3) - 1}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed z-10"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {getCurrentNewArrivals().map((product) => {
                const productId = getProductId(product);
                const imageUrl = getProductImage(product);
                
                return (
                  <div key={productId} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                    <Link href={`/product/${productId}`} className="block">
                      <div className="relative h-48 overflow-hidden">
                        {imageUrl && (
                          <Image
                            src={normalizeImageUrl(imageUrl)}
                            alt={product.name}
                            width={300}
                            height={200}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        )}
                        
                        {/* New Arrival Badge */}
                        <div className="absolute top-2 left-2">
                          <div className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
                            Listed in last 60 days
                          </div>
                        </div>

                        {/* Wishlist Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onToggleWishlist(productId, product);
                          }}
                          className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-all z-10"
                        >
                          <svg
                            className={`w-4 h-4 ${
                              isInWishlist(productId)
                                ? 'text-red-500 fill-red-500'
                                : 'text-gray-500 hover:text-red-500'
                            } transition-colors`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div>
                    </Link>
                    
                    <div className="p-4">
                      <Link href={`/product/${productId}`}>
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-900">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          MOQ: 1
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onAddToCart(product);
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductShowcase;
