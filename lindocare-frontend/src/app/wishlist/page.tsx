"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import Image from 'next/image';

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

// For guests, store the full product object in localStorage when toggling wishlist
function getWishlistKey() {
  const email = getUserEmail();
  return email ? `wishlist_${email}` : 'wishlist';
}

// Add to cart functionality
function addToCart(product: Product) {
  const email = getUserEmail();
  const cartKey = email ? `cart:${email}` : 'cart';
  
  const existingCart = localStorage.getItem(cartKey);
  let cart: CartItem[] = existingCart ? JSON.parse(existingCart) : [];
  
  // Add product to cart (as a separate line item)
  cart.push({
    ...product,
    quantity: 1
  });
  
  localStorage.setItem(cartKey, JSON.stringify(cart));
  
  // Dispatch storage event to update other components
  setTimeout(() => {
    window.dispatchEvent(new StorageEvent('storage', { key: cartKey }));
  }, 0);
  
  // Show success message
  alert(`${product.name} added to cart!`);
}

// Add a skeleton loader for wishlist
const WishlistSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-10">
    {Array.from({ length: 8 }).map((_, idx) => (
      <div key={idx} className="bg-white rounded-2xl shadow p-4 flex flex-col animate-pulse">
        <div className="relative mb-3 w-full h-40 bg-gray-200 rounded-xl" />
        <div className="flex-1 flex flex-col">
          <div className="h-4 w-2/3 bg-gray-200 rounded mb-2" />
          <div className="h-3 w-1/2 bg-gray-200 rounded mb-1" />
          <div className="h-3 w-1/3 bg-gray-200 rounded mb-2" />
          <div className="h-8 w-full bg-gray-200 rounded mt-auto" />
        </div>
      </div>
    ))}
  </div>
);

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState<string[]>([]); // use string[] for product IDs
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Always fetch all products for mapping wishlist IDs to product details
    async function fetchAllProducts() {
      try {
        const res = await fetch('https://lindo-project.onrender.com/product/getAllProduct');
        const data = await res.json();
        let prods: Product[] = Array.isArray(data) ? data : data.products || [];
        setAllProducts(prods);
      } catch {
        setAllProducts([]);
      }
    }
    fetchAllProducts();
  }, []);

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
          setWishlist((data.products || []).map((p: Product) => String(p._id || p.id)));
          setWishlistProducts(data.products || []);
        } catch (e: unknown) {
          setError('Network error. Please try again.');
          setWishlist([]);
          setWishlistProducts([]);
        }
      } else {
        // Guest: fallback to localStorage, store only IDs
        const key = getWishlistKey();
        const saved = localStorage.getItem(key);
        let ids: string[] = [];
        if (saved) {
          try {
            const arr = JSON.parse(saved);
            ids = Array.isArray(arr) ? arr.map(String) : [];
          } catch {
            ids = [];
          }
        }
        setWishlist(ids);
        // Map IDs to full product details using allProducts
        const products = allProducts.filter(p => ids.includes(String(p.id || p._id)));
        setWishlistProducts(products);
      }
      setLoading(false);
    }
    fetchWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allProducts]);

  // Updated toggleWishlist for guests: store full product object
  const toggleWishlist = async (id: string, product?: Product) => {
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
        // Always refetch wishlist from backend after toggling
        const wishlistRes = await fetch(`https://lindo-project.onrender.com/wishlist/getUserWishlistProducts/${userId}`, {
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const wishlistData = await wishlistRes.json();
        setWishlist((wishlistData.products || []).map((p: Product) => p._id || p.id));
        setWishlistProducts(wishlistData.products || []);
      } catch (err: unknown) {
        alert('Network error. Please try again.');
      }
    } else {
      // Guest: fallback to localStorage
      const key = getWishlistKey();
      setWishlist((prev) => {
        let updated: string[] = [];
        const saved = localStorage.getItem(key);
        let ids: string[] = [];
        if (saved) {
          try {
            const arr = JSON.parse(saved);
            ids = Array.isArray(arr) ? arr.map(String) : [];
          } catch {
            ids = [];
          }
        }
        if (prev.includes(id)) {
          // Remove from wishlist
          ids = ids.filter(wid => wid !== id);
        } else if (product) {
          // Add to wishlist
          ids = [...ids, id];
        }
        updated = ids;
        localStorage.setItem(key, JSON.stringify(updated));
        // Map IDs to full product details using allProducts
        setWishlistProducts(allProducts.filter(p => updated.includes(String(p.id || p._id))));
        setTimeout(() => window.dispatchEvent(new StorageEvent('storage', { key })), 0);
        return updated;
      });
    }
  };

  // Debug output
  useEffect(() => {
    console.log('[Wishlist Debug] IDs:', wishlist);
    console.log('[Wishlist Debug] Products:', wishlistProducts);
  }, [wishlist, wishlistProducts]);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-7xl mx-auto px-2 pt-4 md:pt-6 pb-12">
        <div className="text-sm text-gray-600 mb-4 pt-14 md:pt-0">
          <Link href="/">Home</Link> / <span className="text-black font-medium">Wishlist</span>
        </div>
        <h1 className="text-2xl font-bold text-black mb-6">My Wishlist</h1>
        {loading ? (
          <WishlistSkeleton />
        ) : wishlistProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistProducts.map((item, idx) => {
              let image = '';
              if (Array.isArray(item.image) && item.image.length > 0) image = item.image[0];
              else if (typeof item.image === 'string') image = item.image;
              return (
                <div key={item.id || item._id || idx} className="bg-white rounded-2xl shadow p-4 flex flex-col hover:shadow-xl transition-shadow">
                  <div className="relative mb-3">
                    {image && image.trim() !== '' ? (
                      <Image src={image} alt={item.name} width={300} height={160} className="w-full h-40 object-cover rounded-xl" />
                    ) : (
                      <div className="w-full h-40 flex items-center justify-center text-gray-300 text-3xl bg-gray-100 rounded-xl">?</div>
                    )}
                    <button
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                      onClick={() => toggleWishlist(String(item.id || item._id), item)}
                      aria-label="Remove from wishlist"
                    >
                      <Heart size={20} color="#F87171" fill="#F87171" />
                    </button>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="font-bold text-blue-900 mb-1">{item.name}</div>
                    <div className="text-black font-bold text-lg mb-2">{item.price?.toFixed ? item.price.toFixed(2) : item.price} RWF</div>
                    <button
                      onClick={() => addToCart(item)}
                      className="mt-auto rounded-full bg-blue-600 text-white font-bold py-2 text-sm shadow hover:bg-blue-700 transition"
                    >
                      Move to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24">
            <Heart size={48} color="#2563eb" fill="#2563eb" />
            <p className="mt-4 text-black text-lg font-semibold">No products in your wishlist yet.</p>
            <p className="text-gray-500">Click the heart icon on a product to save it here.</p>
            <Link href="/" className="mt-6 px-6 py-2 rounded-full bg-blue-700 text-white font-bold shadow hover:bg-blue-800 transition">Continue Shopping</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage; 