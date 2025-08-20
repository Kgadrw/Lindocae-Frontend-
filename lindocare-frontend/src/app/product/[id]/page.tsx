"use client";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Heart, Star } from 'lucide-react';
import Image from 'next/image';
import { getCurrentUserEmail } from '../../../components/Header';
import Link from 'next/link';
import OfflineError from '../../../components/OfflineError';
import {
  addToCartServer,
  toggleWishlistProduct,
  fetchUserWishlist,
  getLocalWishlist,
  saveLocalWishlist,
  isUserLoggedIn,
  syncLocalWishlistToServer
} from '../../../utils/serverStorage';

// Helper to get auth token
function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

// Helper to get user ID from token
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

// Helper to format RWF with thousands separator
function formatRWF(amount: number) {
  return amount.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

interface Product {
  _id: string;
  id?: number;
  name: string;
  price: number;
  oldPrice?: number;
  image: string | string[];
  reviews?: number;
  rating?: number;
  tags?: string[];
  category?: string | { name: string };
  description?: string;
  stockType?: string;
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mainImageIdx, setMainImageIdx] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError("");
    fetch(`https://lindo-project.onrender.com/product/getProductById/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then(data => {
        if (!data || !data.product) throw new Error("Product not found");
        setProduct(data.product || data);
        setLoading(false);
      })
      .catch(() => {
        setError("Product not found");
        setLoading(false);
      });
    // Fetch all categories
    fetch('https://lindo-project.onrender.com/category/getAllCategories')
      .then(res => res.json())
      .then(data => {
        let cats = Array.isArray(data) ? data : data.categories || [];
        setCategories(cats);
      });
    // Fetch all products
    fetch('https://lindo-project.onrender.com/product/getAllProduct')
      .then(res => res.json())
      .then(data => {
        let prods = Array.isArray(data) ? data : data.products || [];
        setAllProducts(prods);
      });
  }, [id]);

  // Fetch wishlist
  useEffect(() => {
    async function fetchWishlist() {
      const token = getAuthToken();
      const userId = getUserIdFromToken();
      if (token && userId) {
        try {
          const res = await fetch(`https://lindo-project.onrender.com/wishlist/getUserWishlistProducts/${userId}`, {
            headers: {
              'accept': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
          if (!res.ok) throw new Error('Network error. Please check your connection.');
          const data = await res.json();
          setWishlist((data.products || []).map((p: any) => p._id || p.id));
        } catch {
          setWishlist([]);
        }
      } else {
        // Guest: fallback to unified localStorage key via helper
        const localIds = getLocalWishlist();
        setWishlist(localIds);
      }
    }
    fetchWishlist();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"></div>;
  }
  if (error) {
    return <OfflineError message={error} onRetry={() => window.location.reload()} />;
  }
  if (!product) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500 text-xl">Product not found.</div>;
  }

  // Toggle wishlist handler
  const toggleWishlist = async (id: string) => {
    try {
      const wasIn = wishlist.includes(id);
      // Optimistic
      setWishlist(prev => wasIn ? prev.filter(x => x !== id) : [...prev, id]);
      if (typeof window !== 'undefined') {
        try { window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: { type: wasIn ? 'remove' : 'add', productId: id } })); } catch {}
      }

      if (isUserLoggedIn()) {
        await toggleWishlistProduct(id);
      } else {
        const localWishlist = getLocalWishlist();
        const isInWishlist = localWishlist.includes(id);
        const updated = isInWishlist ? localWishlist.filter(itemId => itemId !== id) : [...localWishlist, id];
        saveLocalWishlist(updated);
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
      setToastMsg('Failed to update wishlist. Please try again.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1200);
      // revert optimistic
      setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    }
  };

  // Add to cart handler
  const handleAddToCart = async (product: Product) => {
    const email = getCurrentUserEmail();
    
    // Ensure image is always a string URL
    let imageUrl = '/lindo.png';
    if (Array.isArray(product.image) && product.image.length > 0) {
      imageUrl = product.image[0];
    } else if (typeof product.image === 'string' && product.image.trim().length > 0) {
      imageUrl = product.image;
    }
    
    try {
      if (isUserLoggedIn()) {
        // Logged in: add to server cart
        await addToCartServer({
          productId: String(product.id || product._id),
          quantity: quantity,
        });
        setToastMsg(`${product.name} added to cart!`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 1200);
      } else {
        // Guest: add to localStorage
        if (!email) {
          setToastMsg('Please log in to add items to cart');
          setShowToast(true);
          setTimeout(() => setShowToast(false), 1200);
          return;
        }
        
        const cartKey = `cart:${email}`;
        const cartRaw = localStorage.getItem(cartKey);
        let cart = [];
        try {
          cart = cartRaw ? JSON.parse(cartRaw) : [];
        } catch {
          cart = [];
        }
        
        // Check if product already exists in cart
        const existingIndex = cart.findIndex((item: any) => String(item.id || item._id) === String(product.id || product._id));
        if (existingIndex > -1) {
          cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + quantity;
        } else {
          cart.push({
            id: String(product.id || product._id),
            name: product.name,
            price: product.price,
            image: imageUrl,
            quantity: quantity,
          });
        }
        
        localStorage.setItem(cartKey, JSON.stringify(cart));
        window.dispatchEvent(new StorageEvent('storage', { key: cartKey }));
        setToastMsg(`${product.name} added to cart!`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 1200);
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      setToastMsg('Failed to add to cart. Please try again.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1200);
    }
  };

  // Map images as in NewArrivalsSection
  let images: string[] = [];
  if (Array.isArray(product.image) && product.image.length > 0) {
    images = product.image.filter(img => img && typeof img === 'string' && img.trim() !== '');
  } else if (typeof product.image === 'string' && product.image.trim() !== '') {
    images = [product.image];
  } else {
    images = ['/lindo.png'];
  }
  const mainImage = images[mainImageIdx] || images[0];

  return (
    <div className="bg-white pt-16 min-h-screen font-montserrat pb-12">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg">
          {toastMsg}
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-6 rounded-lg p-4 max-w-5xl mx-auto">
        {/* Left: Images */}
        <div className="flex-1 flex flex-col items-center">
          <div className="w-full flex justify-center mb-4">
            {mainImage && typeof mainImage === 'string' && mainImage.trim() !== '' ? (
              <Image src={mainImage} alt={product.name} width={400} height={400} className="rounded-xl object-cover bg-gray-100 max-h-[350px]" />
            ) : (
              <div className="w-[400px] h-[400px] rounded-xl bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
            )}
          </div>
          <div className="flex gap-2 mt-2">
            {images.map((img, idx) => (
              <button key={idx} onClick={() => setMainImageIdx(idx)} className={`rounded-xl border-2 ${mainImageIdx === idx ? 'border-blue-500' : 'border-gray-200'} p-0.5`}>
                {img && typeof img === 'string' && img.trim() !== '' ? (
                  <Image src={img} alt="" width={64} height={64} className="w-16 h-16 object-cover rounded-xl" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
                )}
              </button>
            ))}
          </div>
        </div>
        {/* Right: Info */}
        <div className="flex-1 flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-500 text-lg">★</span>
            <span className="font-semibold">{product.rating || 4.5}</span>
            <span className="text-green-600 font-medium ml-2">Verified</span>
          </div>
          {/* Stock type and category row */}
          <div className="flex flex-wrap gap-4 mb-2 text-sm text-blue-700">
            <div>
              <span className="font-semibold">Stock :</span>
              <span className="ml-2">{product.stockType || 'N/A'}</span>
            </div>
            <div>
              <span className="font-semibold">Category:</span>
              <span className="ml-2">{typeof product.category === 'object' && product.category !== null ? product.category.name : String(product.category || 'N/A')}</span>
            </div>
          </div>
          <div className="text-2xl font-semibold text-gray-900 mb-2"> Price: <span className="text-2xl font-bold text-blue-900">{formatRWF(product.price)} RWF</span>
            {product.oldPrice && <span className="text-lg line-through text-gray-400 ml-2">{formatRWF(product.oldPrice)} RWF</span>}
          </div>
          {/* Quantity Selector */}
          <div className="flex items-center gap-3 mb-4">
            <button
              className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xl font-bold flex items-center justify-center hover:bg-blue-200 border border-blue-500"
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
            >-</button>
            <span className="text-lg font-bold w-8 text-center text-blue-700">{quantity}</span>
            <button
              className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xl font-bold flex items-center justify-center hover:bg-blue-200 border border-blue-500"
              onClick={() => setQuantity(q => q + 1)}
              aria-label="Increase quantity"
            >+</button>
          </div>
          {/* Total Price Display */}
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-700">Total Price:</span>
              <span className="text-2xl font-bold text-blue-900">{formatRWF(product.price * quantity)} RWF</span>
            </div>
            {product.oldPrice && (
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-gray-500">Original Total:</span>
                <span className="text-lg line-through text-gray-400">{formatRWF(product.oldPrice * quantity)} RWF</span>
              </div>
            )}
          </div>
          <div className="text-gray-700 mb-4 whitespace-pre-line">{product.description}</div>
          {/* Add to cart and wishlist buttons */}
          <div className="flex flex-col gap-3 mt-0">
            <div className="flex gap-3">
              <button 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-lg transition"
                onClick={() => handleAddToCart(product)}
              >
                Add to cart
              </button>
              <button
                className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-3 px-4 rounded-lg transition flex items-center justify-center"
                onClick={() => toggleWishlist(product._id)}
                aria-label="Add to wishlist"
              >
                <Heart
                  size={24}
                  color={wishlist.includes(product._id) ? '#F87171' : '#2563eb'}
                  fill={wishlist.includes(product._id) ? '#F87171' : 'none'}
                  strokeWidth={2.2}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* You may also like section */}
      {allProducts && product.category && (
        <div className="mt-12 flex flex-col items-center justify-center">
          <h2 className="text-xl font-bold text-blue-700 mb-6 text-center font-montserrat">You may also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-5xl mx-auto">
            {allProducts.filter(p => (typeof p.category === 'object' ? p.category.name : p.category) === (typeof product.category === 'object' ? product.category.name : product.category) && p._id !== product._id).slice(0, 8).map((p, idx) => {
              let img = '';
              if (Array.isArray(p.image) && p.image.length > 0) img = p.image[0];
              else if (typeof p.image === 'string') img = p.image;
              return (
                <Link
                  key={p._id || p.id || idx}
                  href={`/product/${p._id || p.id}`}
                  className="flex flex-col items-center bg-white rounded-2xl shadow p-4 font-montserrat hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="relative w-full h-40 mb-3 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                    {img ? (
                      <Image src={img} alt={p.name} width={256} height={160} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No Image</div>
                    )}
                    {/* Wishlist Icon */}
                    <button
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleWishlist(p._id);
                      }}
                      aria-label="Add to wishlist"
                    >
                      <Heart
                        size={20}
                        color={wishlist.includes(p._id) ? '#F87171' : '#2563eb'}
                        fill={wishlist.includes(p._id) ? '#F87171' : 'none'}
                        strokeWidth={2.2}
                      />
                    </button>
                  </div>
                  <div className="font-semibold text-blue-900 text-sm text-left line-clamp-2 mb-1">{p.name}</div>
                  <div className="text-blue-700 font-bold text-base mb-2 text-left">{formatRWF(p.price)} RWF</div>
                  <button
                    className="mt-auto rounded-full bg-blue-600 text-white font-bold py-2 text-sm shadow hover:bg-blue-700 transition w-full"
                    onClick={() => handleAddToCart(p)}
                  >Add to Cart</button>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 