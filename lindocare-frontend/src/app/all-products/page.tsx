"use client";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import Image from "next/image";
import IconsRow from '../../components/home/IconsRow'; // using the provided sliding/animated version
import { useSWR } from 'swr';
import Link from 'next/link'; // Added for Next.js Link

interface Category {
  _id: string;
  name: string;
  image?: string | string[];
  description?: string;
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
  category?: string;
  description?: string;
  quantity?: number; // Added for cart
}

// Helper functions for wishlist (from wishlist page)
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
function getWishlistKey() {
  const email = getUserEmail();
  return email ? `wishlist_${email}` : 'wishlist';
}

// Helper to format RWF with thousands separator
function formatRWF(amount: number) {
  return amount.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

const ProductSkeleton = () => (
  <div className="bg-white rounded-2xl shadow p-4 flex flex-col animate-pulse">
    <div className="relative mb-3 w-full h-40 bg-gray-200 rounded-xl" />
    <div className="flex-1 flex flex-col">
      <div className="h-4 w-2/3 bg-gray-200 rounded mb-2" />
      <div className="h-3 w-1/2 bg-gray-200 rounded mb-1" />
      <div className="h-3 w-1/3 bg-gray-200 rounded mb-2" />
      <div className="h-8 w-full bg-gray-200 rounded mt-auto" />
    </div>
  </div>
);

export default function AllProductsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [validProductIds, setValidProductIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wishlist, setWishlist] = useState<(number | string)[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [icons, setIcons] = useState<any[]>([]);
  const [iconsLoading, setIconsLoading] = useState(true);
  const [iconsError, setIconsError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem('selectedCategoryId') || '';
      setSelectedCategoryId(storedId);
      // If we have categories loaded, set selectedCategory to the matching name
      if (storedId && categories.length > 0) {
        const match = categories.find(cat => cat._id === storedId);
        if (match) setSelectedCategory(match.name);
      }
    }
  }, [categories]);

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch("https://lindo-project.onrender.com/category/getAllCategories")
      .then(res => res.json())
      .then(catData => {
        const cats: Category[] = Array.isArray(catData) ? catData : catData.categories || [];
        setCategories(cats);
        // Fetch products by category if selected, else all products
        const productsUrl = selectedCategoryId
          ? `https://lindo-project.onrender.com/product/getProductsByCategory/${selectedCategoryId}`
          : "https://lindo-project.onrender.com/product/getAllProduct";
        return fetch(productsUrl).then(res => res.json());
      })
      .then(prodData => {
        let prods: Product[] = Array.isArray(prodData) ? prodData : prodData.products || [];
        // Filter out products without a valid _id
        prods = prods.filter(p => p._id && typeof p._id === 'string' && p._id.length > 0);
        setProducts(prods);
        setValidProductIds(prods.map(p => p._id));
      })
      .catch(() => setError("Failed to fetch products or categories."))
      .finally(() => setLoading(false));
  }, [selectedCategoryId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Migration: convert old wishlist (array of IDs) to array of product objects
    const key = getWishlistKey();
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr) && arr.length > 0 && typeof arr[0] !== 'object') {
          // It's an array of IDs, convert to array of product objects
          const migrated = arr.map((id: string) => products.find(p => String(p.id || p._id) === String(id))).filter(Boolean);
          localStorage.setItem(key, JSON.stringify(migrated));
        }
      } catch {}
    }
    // Fetch wishlist for both logged-in and guest users
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
          if (!res.ok) {
            setWishlist([]);
            return;
          }
          const data = await res.json();
          setWishlist((data.products || []).map((p: Product) => String(p._id || p.id)));
        } catch {
          setWishlist([]);
        }
      } else {
        // Guest: fallback to localStorage
        const key = getWishlistKey();
        const saved = localStorage.getItem(key);
        let arr: string[] = [];
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.length > 0 && typeof parsed[0] === 'object') {
              arr = parsed.map((p: Product) => String(p.id));
            } else {
              arr = parsed.map((id: string) => String(id));
            }
          } catch {
            arr = [];
          }
        }
        setWishlist(arr);
      }
    }
    fetchWishlist();
  }, [products]);

  useEffect(() => {
    setIconsLoading(true);
    setIconsError(null);
    fetch('https://lindo-project.onrender.com/icons/getIcons')
      .then(res => res.json())
      .then(data => {
        let iconsArr = [];
        if (Array.isArray(data)) iconsArr = data;
        else if (data && Array.isArray(data.icons)) iconsArr = data.icons;
        setIcons(iconsArr);
      })
      .catch(() => setIconsError('Failed to fetch icons.'))
      .finally(() => setIconsLoading(false));
  }, []);

  // Enhanced toggleWishlist for guests: store full product object
  const toggleWishlist = (id: number | string, product?: Product) => {
    const key = getWishlistKey();
    setWishlist((prev) => {
      let updated: string[] = [];
      let products: Product[] = [];
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const arr = JSON.parse(saved);
          if (arr.length > 0 && typeof arr[0] === 'object') {
            products = arr;
          } else {
            products = [];
          }
        } catch {
          products = [];
        }
      }
      if (prev.includes(String(id))) {
        // Remove from wishlist
        products = products.filter((p) => String(p.id) !== String(id));
      } else if (product) {
        // Add to wishlist
        products = [...products, product];
      }
      updated = products.map((p) => String(p.id));
      localStorage.setItem(key, JSON.stringify(products));
      setTimeout(() => window.dispatchEvent(new StorageEvent('storage', { key })), 0);
      return updated;
    });
  };

  // In the Add to Cart button, implement logic to add the product to cart in localStorage
  const handleAddToCart = (product: Product) => {
    const email = getUserEmail();
    if (!email) return; // Optionally show login modal
    const cartKey = `cart:${email}`;
    const cartRaw = localStorage.getItem(cartKey);
    let cart: Product[] = [];
    try {
      cart = cartRaw ? JSON.parse(cartRaw) : [];
    } catch {
      cart = [];
    }
    const idx = cart.findIndex((item: Product) => String(item._id || item.id) === String(product._id || product.id));
    // Always store image as a string URL
    let image = '';
    if (Array.isArray(product.image) && product.image.length > 0) image = product.image[0];
    else if (typeof product.image === 'string') image = product.image;
    if (idx > -1) {
      cart[idx].quantity = (cart[idx].quantity || 1) + 1;
    } else {
      cart.push({ ...product, image, quantity: 1 });
    }
    localStorage.setItem(cartKey, JSON.stringify(cart));
    setTimeout(() => window.dispatchEvent(new StorageEvent('storage', { key: cartKey })), 0);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 pb-16 px-2 md:px-4 lg:px-8 font-sans flex items-center justify-center">
      <div className="max-w-7xl w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-10">
        {Array.from({ length: 8 }).map((_, idx) => <ProductSkeleton key={idx} />)}
      </div>
    </div>
  );
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 text-xl">{error}</div>;

  // Products are already filtered by backend if selectedCategoryId is set
  const filteredProducts = products;

  return (
    <div className="min-h-screen bg-gray-50 pb-16 px-2 md:px-4 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto pt-10 pb-16">
        {/* Icons Row at the top */}
 
        {/* Category filter row with 'More >' if many categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-8 justify-center">
            <button
              key="all"
              className={`px-5 py-2 rounded-full font-bold transition-colors ${selectedCategoryId === '' ? 'bg-yellow-400 text-blue-900' : 'text-white bg-blue-600 hover:bg-blue-700'}`}
              onClick={() => {
                setSelectedCategory('All');
                setSelectedCategoryId('');
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('selectedCategoryId');
                }
              }}
            >
              All
            </button>
            {categories.length > 7
              ? ([
                  ...categories.slice(0, 6).map(cat => (
                    <button
                      key={cat._id}
                      className={`px-5 py-2 rounded-full font-bold transition-colors ${cat._id === selectedCategoryId ? 'bg-yellow-400 text-blue-900' : 'text-white bg-blue-600 hover:bg-blue-700'}`}
                      onClick={() => {
                        setSelectedCategory(cat.name);
                        setSelectedCategoryId(cat._id);
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('selectedCategoryId', cat._id);
                        }
                      }}
                    >
                      {cat.name}
                    </button>
                  )),
                  <button
                    key="more"
                    className="px-5 py-2 rounded-full font-bold transition-colors text-white bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      setSelectedCategory('All');
                      setSelectedCategoryId('');
                      if (typeof window !== 'undefined') {
                        localStorage.removeItem('selectedCategoryId');
                      }
                      window.location.href = '/all-products';
                    }}
                  >
                    More &gt;
                  </button>
                ])
              : categories.map(cat => (
                  <button
                    key={cat._id}
                    className={`px-5 py-2 rounded-full font-bold transition-colors ${cat._id === selectedCategoryId ? 'bg-yellow-400 text-blue-900' : 'text-white bg-blue-600 hover:bg-blue-700'}`}
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      setSelectedCategoryId(cat._id);
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('selectedCategoryId', cat._id);
                      }
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
          </div>
        )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.filter(prod => validProductIds.includes(prod._id)).map((prod, idx) => {
                  let image = '';
                  if (Array.isArray(prod.image) && prod.image.length > 0) image = prod.image[0];
                  else if (typeof prod.image === 'string') image = prod.image;
                  return (
                    <Link
                      key={prod._id || prod.id || idx}
                      href={`/product/${prod._id}`}
                      className="bg-white rounded-2xl shadow p-4 flex flex-col hover:shadow-xl transition-shadow"
                    >
                      <div className="relative mb-3">
                        {image && (
                          <Image src={image} alt={prod.name} width={300} height={160} className="w-full h-40 object-cover rounded-xl" />
                        )}
                        {prod.tags && Array.isArray(prod.tags) && prod.tags.map((tag: string) => (
                          <span key={tag} className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold ${tag === 'Sale' ? 'bg-red-100 text-red-500' : tag === 'New' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>{tag}</span>
                        ))}
                        <button
                          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                          onClick={e => { e.preventDefault(); toggleWishlist(String(prod._id), prod); }}
                          aria-label="Add to wishlist"
                        >
                          <Heart
                            size={20}
                            color={wishlist.includes(String(prod._id)) ? '#F87171' : '#2563eb'}
                            fill={wishlist.includes(String(prod._id)) ? '#F87171' : 'none'}
                            strokeWidth={2.2}
                          />
                        </button>
                      </div>
                      <div className="flex-1 flex flex-col">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-yellow-300">★</span>
                          <span className="text-sm font-semibold text-blue-900">{prod.rating || 4.7}</span>
                          <span className="text-xs text-blue-500">({prod.reviews || 12} reviews)</span>
                        </div>
                        <div className="font-bold text-blue-900 mb-1">{prod.name}</div>
                        <div className="text-sm text-blue-700 mb-1 line-clamp-2">{prod.description}</div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg font-bold text-blue-900">{formatRWF(prod.price)} RWF</span>
                          {prod.oldPrice && <span className="text-sm line-through text-blue-200">{formatRWF(prod.oldPrice)} RWF</span>}
                        </div>
                        <button
                          className="mt-auto rounded-full bg-blue-600 text-white font-bold py-2 text-sm shadow hover:bg-blue-700 transition"
                          onClick={e => { e.preventDefault(); handleAddToCart(prod); }}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </Link>
                  );
                })}
              </div>
        {/* If no products at all */}
        {filteredProducts.length === 0 && (
          <div className="text-center text-gray-500 py-8">No products found.</div>
        )}
      </div>
    </div>
  );
} 