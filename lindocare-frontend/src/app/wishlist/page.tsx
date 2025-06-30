"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

// Template products (should match those in category page)
const productsData = [
  {
    id: 1,
    name: "Sorelle Natural Pinewood Crib",
    price: 526.63,
    oldPrice: 567.05,
    image: "https://images.pexels.com/photos/459225/pexels-photo-459225.jpeg",
    reviews: 22,
    rating: 4.8,
    tags: ["Sale"],
    delivery: ["Fast Delivery"],
  },
  {
    id: 2,
    name: "Premium Changing Table",
    price: 289.99,
    image: "https://images.pexels.com/photos/3933276/pexels-photo-3933276.jpeg",
    reviews: 15,
    rating: 4.5,
    tags: [],
    delivery: ["Pickup Nearby"],
  },
  {
    id: 3,
    name: "Comfort Rocking Chair",
    price: 459.0,
    image: "https://images.pexels.com/photos/3933275/pexels-photo-3933275.jpeg",
    reviews: 45,
    rating: 4.7,
    tags: ["Featured"],
    delivery: ["Fast Delivery"],
  },
  {
    id: 4,
    name: "Baby Dresser & Changer",
    price: 399.99,
    image: "https://images.pexels.com/photos/3933277/pexels-photo-3933277.jpeg",
    reviews: 28,
    rating: 4.6,
    tags: [],
    delivery: ["Pickup Nearby"],
  },
  {
    id: 5,
    name: "Portable Baby Playpen",
    price: 179.99,
    image: "https://images.pexels.com/photos/3933278/pexels-photo-3933278.jpeg",
    reviews: 12,
    rating: 4.4,
    tags: ["New"],
    delivery: ["Fast Delivery"],
  },
  {
    id: 6,
    name: "Organic Crib Mattress",
    price: 299.99,
    image: "https://images.pexels.com/photos/3933279/pexels-photo-3933279.jpeg",
    reviews: 67,
    rating: 4.9,
    tags: [],
    delivery: ["Pickup Nearby"],
  },
];

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<typeof productsData>([]);

  useEffect(() => {
    const saved = localStorage.getItem("wishlist");
    const ids = saved ? JSON.parse(saved) : [];
    setWishlist(ids);
    setWishlistProducts(productsData.filter((p) => ids.includes(p.id)));
  }, []);

  const toggleWishlist = (id: number) => {
    setWishlist((prev) => {
      const updated = prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id];
      localStorage.setItem("wishlist", JSON.stringify(updated));
      setWishlistProducts(productsData.filter((p) => updated.includes(p.id)));
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-7xl mx-auto px-2 pt-4 md:pt-6 pb-12">
        <div className="text-sm text-blue-700 mb-4 pt-14 md:pt-0">
          <Link href="/">Home</Link> / <span className="text-blue-900 font-medium">Wishlist</span>
        </div>
        <h1 className="text-2xl font-bold text-blue-900 mb-6">My Wishlist</h1>
        {wishlistProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Heart size={48} color="#F87171" fill="#F87171" />
            <p className="mt-4 text-blue-900 text-lg font-semibold">No products in your wishlist yet.</p>
            <p className="text-blue-500">Click the heart icon on a product to save it here.</p>
            <Link href="/" className="mt-6 px-6 py-2 rounded-full bg-blue-600 text-white font-bold shadow hover:bg-blue-700 transition">Continue Shopping</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow p-4 flex flex-col">
                <div className="relative mb-3">
                  <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded-xl" />
                  {product.tags.map((tag) => (
                    <span key={tag} className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold ${tag === 'Sale' ? 'bg-red-100 text-red-500' : tag === 'New' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>{tag}</span>
                  ))}
                  <button
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                    onClick={() => toggleWishlist(product.id)}
                    aria-label="Remove from wishlist"
                  >
                    <Heart
                      size={20}
                      color={wishlist.includes(product.id) ? '#F87171' : '#3B82F6'}
                      fill={wishlist.includes(product.id) ? '#F87171' : 'none'}
                      strokeWidth={2.2}
                    />
                  </button>
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-yellow-400">★</span>
                    <span className="text-sm font-semibold text-blue-900">{product.rating}</span>
                    <span className="text-xs text-blue-500">({product.reviews} reviews)</span>
                  </div>
                  <div className="font-bold text-blue-900 mb-1">{product.name}</div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-blue-900">${product.price.toFixed(2)}</span>
                    {product.oldPrice && <span className="text-sm line-through text-blue-400">${product.oldPrice}</span>}
                  </div>
                  <button className="mt-auto rounded-full bg-blue-600 text-white font-bold py-2 text-sm shadow hover:bg-blue-700 transition">Add to Cart</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage; 