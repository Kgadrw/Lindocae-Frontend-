import React from "react";

const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow animate-pulse flex flex-col h-[320px]">
      {/* Image Skeleton */}
      <div className="bg-gray-200 w-full h-36 rounded-t-lg flex-shrink-0" />
      
      {/* Content Skeleton */}
      <div className="p-3 flex-1 flex flex-col">
        {/* Product Name Skeleton */}
        <div className="bg-gray-200 h-4 w-3/4 mb-2 rounded" />
        
        {/* Price Skeleton */}
        <div className="bg-gray-200 h-5 w-1/3 mb-2 rounded" />
        
        {/* Rating Skeleton */}
        <div className="bg-gray-200 h-3 w-1/2 mb-3 rounded" />
        
        {/* Button Skeleton */}
        <div className="bg-gray-200 h-9 w-full mt-auto rounded" />
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
