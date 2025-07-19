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

// Add a function to get the token from localStorage
function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

function getUserEmail() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('userEmail') || '';
  }
  return '';
}

// Add a function to get the userId from token (JWT) if available
function getUserIdFromToken() {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || payload.id || payload._id || payload.user || null;
  } catch {
    return null;
  }
}

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState<string[]>([]); // use string[] for product IDs
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function fetchWishlist() {
      setLoading(true);
      setError('');
      const token = getAuthToken();
      const userId = getUserIdFromToken();
      if (token && userId) {
        // Logged in: fetch from backend
        try {
          const res = await fetch(`https://lindo-project.onrender.com/wishlist/getUserWishlistProducts/${userId}`, {
            headers: {
              'accept': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setError(data.message || 'Failed to fetch wishlist from server.');
            setWishlist([]);
            setWishlistProducts([]);
            setLoading(false);
            return;
          }
          const data = await res.json();
          console.log('[Wishlist Debug] Backend response:', data);
          if (!Array.isArray(data.products)) {
            setError('Unexpected response from server.');
            setWishlist([]);
            setWishlistProducts([]);
            setLoading(false);
            return;
          }
          setWishlist((data.products || []).map((p: any) => String(p._id || p.id)));
          setWishlistProducts(data.products || []);
        } catch (e: any) {
          setError('Network error. Please try again.');
          setWishlist([]);
          setWishlistProducts([]);
        }
      } else {
        // Guest: fallback to localStorage
        const email = getUserEmail();
        const key = email ? `wishlist_${email}` : 'wishlist';
        const saved = localStorage.getItem(key);
        // When reading from localStorage, convert IDs to strings
        const ids = saved ? JSON.parse(saved).map((id: any) => String(id)) : [];
        setWishlist(ids);
        setWishlistProducts(productsData.filter((p) => ids.includes(String(p.id))));
      }
      setLoading(false);
    }
    fetchWishlist();
  }, []);

  const toggleWishlist = async (id: string) => {
    const token = getAuthToken();
    const userId = getUserIdFromToken();
    if (token && userId) {
      // Logged in: call backend
      try {
        const res = await fetch('https://lindo-project.onrender.com/wishlist/toggleWishlistProduct', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ productId: id }),
        });
        if (!res.ok) {
          const data = await res.json();
          alert(data.message || 'Failed to update wishlist.');
          return;
        }
        // Refetch wishlist from backend
        const wishlistRes = await fetch(`https://lindo-project.onrender.com/wishlist/getUserWishlistProducts/${userId}`, {
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const wishlistData = await wishlistRes.json();
        setWishlist((wishlistData.products || []).map((p: any) => p._id || p.id));
        setWishlistProducts(wishlistData.products || []);
      } catch (err) {
        alert('Network error. Please try again.');
      }
    } else {
      // Guest: fallback to localStorage
      const email = getUserEmail();
      const key = email ? `wishlist_${email}` : 'wishlist';
      setWishlist((prev) => {
        const updated = prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id];
        localStorage.setItem(key, JSON.stringify(updated));
        setWishlistProducts(productsData.filter((p) => updated.includes(String(p.id))));
        window.dispatchEvent(new StorageEvent('storage', { key }));
        return updated;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-7xl mx-auto px-2 pt-4 md:pt-6 pb-12">
        <div className="text-sm text-gray-600 mb-4 pt-14 md:pt-0">
          <Link href="/">Home</Link> / <span className="text-black font-medium">Wishlist</span>
        </div>
        <h1 className="text-2xl font-bold text-black mb-6">My Wishlist</h1>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-600 text-lg">Loading wishlist...</div>
        ) : error && (
          <div className="flex flex-col items-center justify-center py-8 text-red-600 text-lg font-semibold">{error}</div>
        )}
        {wishlistProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Heart size={48} color="#888" fill="#888" />
            <p className="mt-4 text-black text-lg font-semibold">No products in your wishlist yet.</p>
            <p className="text-gray-500">Click the heart icon on a product to save it here.</p>
            <Link href="/" className="mt-6 px-6 py-2 rounded-full bg-black text-white font-bold shadow hover:bg-gray-800 transition">Continue Shopping</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow p-4 flex flex-col">
                <div className="relative mb-3">
                  {product.image && (
                    <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded-xl" />
                  )}
                  {(product.tags || []).map((tag: string) => (
                    <span key={tag} className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-600`}>{tag}</span>
                  ))}
                  <button
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                    onClick={() => toggleWishlist(String(product.id))}
                    aria-label="Add to wishlist"
                  >
                    <Heart
                      size={20}
                      color={wishlist.includes(String(product.id)) ? '#111' : '#888'}
                      fill={wishlist.includes(String(product.id)) ? '#111' : 'none'}
                      strokeWidth={2.2}
                    />
                  </button>
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-gray-400">★</span>
                    <span className="text-sm font-semibold text-black">{product.rating}</span>
                    <span className="text-xs text-gray-500">({product.reviews} reviews)</span>
                  </div>
                  <div className="font-bold text-black mb-1">{product.name}</div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base font-bold text-black">${product.price}</span>
                    {product.oldPrice && (
                      <span className="text-sm line-through text-gray-400">${product.oldPrice}</span>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap mb-2">
                    {(product.delivery || []).map((d: string) => (
                      <span key={d} className="bg-gray-100 text-gray-600 rounded px-2 py-1 text-xs">{d}</span>
                    ))}
                  </div>
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