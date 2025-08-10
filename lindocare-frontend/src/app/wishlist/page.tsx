"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import Image from 'next/image';
import {
  fetchUserWishlist,
  toggleWishlistProduct,
  addToWishlistServer,
  removeFromWishlistServer,
  getLocalWishlist,
  saveLocalWishlist,
  isUserLoggedIn,
  syncLocalWishlistToServer,
  getAuthToken,
  getUserEmail,
  getUserIdFromToken,
  addToCartServer,
  WishlistProduct
} from '../../utils/serverStorage';

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
  delivery?: string[];
  categoryId?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

function getWishlistKey() {
  const email = getUserEmail();
  return email ? `wishlist:${email}` : 'wishlist:guest';
}

function addToCart(product: Product) {
  const email = getUserEmail();
  if (!email) {
    alert('Please log in to add items to cart');
    return;
  }

  // Check if user is logged in and has access token
  if (isUserLoggedIn() && getAuthToken()) {
    // Logged in: add to server cart
    addToCartServer({
      productId: String(product.id || product._id),
      quantity: 1,
    }).then(() => {
      alert('Added to cart!');
    }).catch((error) => {
      console.error('Error adding to server cart:', error);
      alert('Failed to add to cart. Please try again.');
    });
  } else {
    // Guest: add to localStorage
    const cartKey = `cart:${email}`;
    const cartRaw = localStorage.getItem(cartKey);
    let cart = [];
    try {
      cart = cartRaw ? JSON.parse(cartRaw) : [];
    } catch {
      cart = [];
    }

    const existingItem = cart.find((item: any) => String(item.id) === String(product.id || product._id));
    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
      cart.push({
        id: product.id || product._id,
        name: product.name,
        price: product.price,
        image: Array.isArray(product.image) ? product.image[0] : product.image,
        quantity: 1,
      });
    }

    localStorage.setItem(cartKey, JSON.stringify(cart));
    window.dispatchEvent(new StorageEvent('storage', { key: cartKey }));
    alert('Added to cart!');
  }
}

const WishlistSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
        <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
        <div className="bg-gray-200 h-4 rounded mb-2"></div>
        <div className="bg-gray-200 h-4 rounded w-3/4"></div>
      </div>
    ))}
  </div>
);

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchAllProducts() {
      try {
        const res = await fetch('https://lindo-project.onrender.com/product/getAllProduct');
        if (res.ok) {
          const data = await res.json();
          setAllProducts(data.products || []);
        } else {
          console.error('Failed to fetch products from server');
          setAllProducts([]);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setAllProducts([]);
      }
    }
    fetchAllProducts();
  }, []);

  useEffect(() => {
    async function fetchWishlist() {
      setLoading(true);
      setError('');
      
      try {
        if (isUserLoggedIn()) {
          // Logged in user: fetch from server
          const serverWishlist = await fetchUserWishlist();
          const wishlistIds = serverWishlist.map(product => String(product._id || product.id));
          setWishlist(wishlistIds);
          setWishlistProducts(serverWishlist);
        } else {
          // Guest user: use localStorage
          const localWishlist = getLocalWishlist();
          setWishlist(localWishlist);
          // Map IDs to full product details using allProducts
          const products = allProducts.filter(p => localWishlist.includes(String(p.id || p._id)));
          setWishlistProducts(products);
        }
      } catch (err) {
        console.error('Error fetching wishlist:', err);
        setError('Failed to load wishlist. Please try again.');
        // Fallback to localStorage
        const localWishlist = getLocalWishlist();
        setWishlist(localWishlist);
        const products = allProducts.filter(p => localWishlist.includes(String(p.id || p._id)));
        setWishlistProducts(products);
      } finally {
        setLoading(false);
      }
    }

    if (allProducts.length > 0) {
      fetchWishlist();
    }
  }, [allProducts]);

  // Listen for login events to sync local wishlist to server
  useEffect(() => {
    const handleLogin = async () => {
      if (isUserLoggedIn()) {
        await syncLocalWishlistToServer();
        // Reload wishlist after sync
        const serverWishlist = await fetchUserWishlist();
        const wishlistIds = serverWishlist.map(product => String(product._id || product.id));
        setWishlist(wishlistIds);
        setWishlistProducts(serverWishlist);
      }
    };

    window.addEventListener('userLogin', handleLogin);
    return () => window.removeEventListener('userLogin', handleLogin);
  }, []);

  const toggleWishlist = async (id: string, product?: Product) => {
    try {
      if (isUserLoggedIn()) {
        // Logged in: call server
        await toggleWishlistProduct(id);
        // Refetch wishlist from server
        const serverWishlist = await fetchUserWishlist();
        const wishlistIds = serverWishlist.map(product => String(product._id || product.id));
        setWishlist(wishlistIds);
        setWishlistProducts(serverWishlist);
      } else {
        // Guest: update localStorage
        const localWishlist = getLocalWishlist();
        const isInWishlist = localWishlist.includes(id);
        
        let updatedWishlist: string[];
        if (isInWishlist) {
          updatedWishlist = localWishlist.filter(itemId => itemId !== id);
        } else {
          updatedWishlist = [...localWishlist, id];
        }
        
        saveLocalWishlist(updatedWishlist);
        setWishlist(updatedWishlist);
        
        // Update wishlist products
        const products = allProducts.filter(p => updatedWishlist.includes(String(p.id || p._id)));
        setWishlistProducts(products);
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
      setError('Failed to update wishlist. Please try again.');
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
                  <Link href={`/product/${item._id || item.id}`} className="flex-1 flex flex-col">
                  <div className="relative mb-3">
                    {image && image.trim() !== '' ? (
                      <Image src={image} alt={item.name} width={300} height={160} className="w-full h-40 object-cover rounded-xl" />
                    ) : (
                      <div className="w-full h-40 flex items-center justify-center text-gray-300 text-3xl bg-gray-100 rounded-xl">?</div>
                    )}
                    <button
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100 z-10"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist(String(item.id || item._id), item);
                        }}
                      aria-label="Remove from wishlist"
                    >
                      <Heart size={20} color="#F87171" fill="#F87171" />
                    </button>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="font-bold text-blue-900 mb-1">{item.name}</div>
                    <div className="text-black font-bold text-lg mb-2">{item.price?.toFixed ? item.price.toFixed(2) : item.price} RWF</div>
                    </div>
                  </Link>
                    <button
                      onClick={() => addToCart(item)}
                    className="mt-2 rounded-full bg-blue-600 text-white font-bold py-2 text-sm shadow hover:bg-blue-700 transition"
                    >
                    Add to Cart
                    </button>
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