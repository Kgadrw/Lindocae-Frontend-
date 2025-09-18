"use client";

import React from "react";
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
  description?: string;
}

interface ProductCardProps {
  product: Product;
  wishlist: (string | number)[];
  onToggleWishlist: (id: string, product?: Product) => void;
  onAddToCart: (product: Product) => void;
  formatPrice: (amount: number) => string;
}

// Helper function to get the product ID
const getProductId = (product: Product): string => {
  return String(product._id || product.id || '');
};

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  formatPrice,
}) => {
  const productId = getProductId(product);
  const isInWishlist = wishlist.includes(productId);
  
  // Get the first image
  const getProductImage = () => {
    if (Array.isArray(product.image) && product.image.length > 0) {
      return product.image[0];
    }
    return typeof product.image === 'string' ? product.image : '';
  };

  const imageUrl = getProductImage();

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 group cursor-pointer overflow-hidden flex flex-col h-[320px]">
      {/* Product Image */}
      <Link href={`/product/${productId}`} className="block relative flex-shrink-0">
        <div className="relative h-36 overflow-hidden bg-gray-50">
          {imageUrl && (
            <Image
              src={normalizeImageUrl(imageUrl)}
              alt={product.name}
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
              onToggleWishlist(productId, product);
            }}
            className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-all z-10"
            aria-label="Add to wishlist"
          >
            <Heart
              size={16}
              className={`${
                isInWishlist
                  ? 'text-red-500 fill-red-500'
                  : 'text-gray-500 hover:text-red-500'
              } transition-colors`}
              strokeWidth={1.5}
            />
          </button>

          {/* Discount Badge */}
          {product.oldPrice && product.oldPrice > product.price && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
              {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% OFF
            </div>
          )}

          {/* Tags */}
          {product.tags && product.tags[0] && (
            <div className="absolute bottom-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
              {product.tags[0]}
            </div>
          )}
        </div>
      </Link>
      
      {/* Product Info */}
      <div className="p-3 flex-1 flex flex-col">
        <Link href={`/product/${productId}`} className="block">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 min-h-[40px] leading-tight">
            {product.name}
          </h3>
        </Link>
        
        {/* Price Section */}
        <div className="mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.oldPrice)}
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
                  i < Math.floor(product.rating || 4.5) ? 'text-yellow-400' : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">
            ({product.reviews || Math.floor(Math.random() * 100) + 50})
          </span>
        </div>
        
        {/* Add to Cart Button - Push to bottom */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToCart(product);
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors duration-200 active:bg-blue-800 mt-auto"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
