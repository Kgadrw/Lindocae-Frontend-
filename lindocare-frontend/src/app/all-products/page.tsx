"use client";
import { useEffect, useState, Suspense } from "react";
import { Heart } from "lucide-react";
import Image from "next/image";
import IconsRow from '../../components/home/IconsRow'; // using the provided sliding/animated version
import Link from 'next/link'; // Added for Next.js Link
import { useSearchParams } from 'next/navigation';
import OfflineError from '../../components/OfflineError';
import {
  addToCartServer,
  toggleWishlistProduct,
  fetchUserWishlist,
  getLocalWishlist,
  saveLocalWishlist,
  isUserLoggedIn,
  syncLocalWishlistToServer
} from '../../utils/serverStorage';

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
  return email ? `wishlist:${email}` : 'wishlist:guest';
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

function AllProductsContent() {
  const searchParams = useSearchParams();
  const categoryQuery = searchParams.get('category');
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
  const [sortBy, setSortBy] = useState('latest');

  // Fetch categories and set initial category selection
  useEffect(() => {
    setLoading(true);
    setError("");
    
    fetch("https://lindo-project.onrender.com/category/getAllCategories")
      .then(res => res.json())
      .then(catData => {
        const cats: Category[] = Array.isArray(catData) ? catData : catData.categories || [];
        setCategories(cats);
        
        // Determine the selected category
        let categoryToUse = '';
        
        if (categoryQuery && cats.length > 0) {
          // Find the category by name (case-insensitive)
          const match = cats.find(cat => cat.name.toLowerCase() === categoryQuery.toLowerCase());
          if (match) {
            setSelectedCategory(match.name);
            setSelectedCategoryId(match._id);
            categoryToUse = match._id;
          } else {
            setSelectedCategory('All');
            setSelectedCategoryId('');
          }
        } else if (cats.length > 0) {
          // Check localStorage for selected category if no URL query
          const storedCategoryId = localStorage.getItem('selectedCategoryId');
          const storedCategoryName = localStorage.getItem('selectedCategoryName');
          if (storedCategoryId) {
            const match = cats.find(cat => cat._id === storedCategoryId);
            if (match) {
              setSelectedCategory(match.name);
              setSelectedCategoryId(storedCategoryId);
              categoryToUse = storedCategoryId;
            } else {
              setSelectedCategory('All');
              setSelectedCategoryId('');
              localStorage.removeItem('selectedCategoryId');
              localStorage.removeItem('selectedCategoryName');
            }
          } else {
            setSelectedCategory('All');
            setSelectedCategoryId('');
          }
        }
        
        // Store the category to use for initial product fetch
        if (categoryToUse) {
          localStorage.setItem('initialCategoryId', categoryToUse);
        }
      })
      .catch(() => setError("Network error. Please check your connection."))
      .finally(() => setLoading(false));
  }, [categoryQuery]); // Run when categoryQuery changes

  // Fetch products based on selected category
  useEffect(() => {
    // Skip if we don't have categories yet
    if (categories.length === 0) return;
    
    setLoading(true);
    setError("");
    
    // Determine which category to use
    let categoryToUse = selectedCategoryId;
    
    // If no selectedCategoryId but we have an initial category from localStorage, use that
    if (!categoryToUse) {
      const initialCategoryId = localStorage.getItem('initialCategoryId');
      if (initialCategoryId) {
        categoryToUse = initialCategoryId;
      }
    }
    
    const productsUrl = categoryToUse
      ? `https://lindo-project.onrender.com/product/getProductsByCategory/${categoryToUse}`
      : "https://lindo-project.onrender.com/product/getAllProduct";
    
    fetch(productsUrl)
      .then(res => res.json())
      .then(prodData => {
        let prods: Product[] = Array.isArray(prodData) ? prodData : prodData.products || [];
        // Filter out products without a valid _id
        prods = prods.filter(p => p._id && typeof p._id === 'string' && p._id.length > 0);
        setProducts(prods);
        setValidProductIds(prods.map(p => p._id));
        
        // Clear the initial category after first load
        if (localStorage.getItem('initialCategoryId')) {
          localStorage.removeItem('initialCategoryId');
        }
      })
      .catch(() => setError("Network error. Please check your connection."))
      .finally(() => setLoading(false));
  }, [selectedCategoryId, categories.length]);

  // Fetch wishlist
  useEffect(() => {
    async function fetchWishlist() {
      try {
        if (isUserLoggedIn()) {
          // Logged in: fetch from server
          const serverWishlist = await fetchUserWishlist();
          const wishlistIds = serverWishlist.map(product => String(product._id || product.id));
          setWishlist(wishlistIds);
        } else {
          // Guest: use localStorage
          const localWishlist = getLocalWishlist();
          setWishlist(localWishlist);
        }
      } catch (err) {
        console.error('Error fetching wishlist:', err);
        setWishlist([]);
      }
    }
    fetchWishlist();
  }, []);

  // Listen for login events to sync local wishlist to server
  useEffect(() => {
    const handleLogin = async () => {
      if (isUserLoggedIn()) {
        await syncLocalWishlistToServer();
        // Reload wishlist after sync
        const serverWishlist = await fetchUserWishlist();
        const wishlistIds = serverWishlist.map(product => String(product._id || product.id));
        setWishlist(wishlistIds);
      }
    };

    window.addEventListener('userLogin', handleLogin);
    return () => window.removeEventListener('userLogin', handleLogin);
  }, []);

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
      .catch(() => setIconsError('Network error. Please check your connection.'))
      .finally(() => setIconsLoading(false));
  }, []);

  // Enhanced toggleWishlist for guests: store full product object
  const toggleWishlist = async (id: number | string, product?: Product) => {
    try {
      const strId = String(id);
      const wasIn = wishlist.includes(strId);
      // Optimistic update
      setWishlist(prev => wasIn ? prev.filter(x => x !== strId) : [...prev, strId]);
      if (typeof window !== 'undefined') {
        try { window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: { type: wasIn ? 'remove' : 'add', productId: strId } })); } catch {}
      }
      if (isUserLoggedIn()) {
        await toggleWishlistProduct(strId);
      } else {
        const localWishlist = getLocalWishlist();
        const isInWishlist = localWishlist.includes(strId);
        const updated = isInWishlist ? localWishlist.filter(itemId => itemId !== strId) : [...localWishlist, strId];
        saveLocalWishlist(updated);
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
      // revert optimistic
      const strId2 = String(id);
      setWishlist(prev => prev.includes(strId2) ? prev.filter(x => x !== strId2) : [...prev, strId2]);
    }
  };

  // Add to cart handler
  const handleAddToCart = async (product: Product) => {
    try {
      if (isUserLoggedIn()) {
        // Logged in: add to server cart
        await addToCartServer({
          productId: String(product._id || product.id),
          quantity: 1,
        });
      } else {
        // Guest: add to localStorage
        const email = getUserEmail();
        if (!email) {
          // Show login prompt or handle guest cart
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
        
        const existingItem = cart.find((item: any) => String(item.id) === String(product._id || product.id));
        if (existingItem) {
          existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
          cart.push({
            id: product._id || product.id,
            name: product.name,
            price: product.price,
            image: Array.isArray(product.image) ? product.image[0] : product.image,
            quantity: 1,
          });
        }
        
        localStorage.setItem(cartKey, JSON.stringify(cart));
        window.dispatchEvent(new StorageEvent('storage', { key: cartKey }));
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  // Clear localStorage when user manually changes category filter
  useEffect(() => {
    if (selectedCategoryId === '' && typeof window !== 'undefined') {
      localStorage.removeItem('selectedCategoryId');
      localStorage.removeItem('selectedCategoryName');
    }
  }, [selectedCategoryId]);



  if (loading) return (
    <div className="min-h-screen bg-white pb-16 px-2 md:px-4 lg:px-8 font-sans flex items-center justify-center">
      <div className="max-w-7xl w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-10">
        {Array.from({ length: 8 }).map((_, idx) => <ProductSkeleton key={idx} />)}
      </div>
    </div>
  );
  if (error) return <OfflineError message={error} onRetry={() => window.location.reload()} />;

  // Sort and filter products
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        // Sort by _id (assuming newer products have higher IDs) or by creation date
        return String(b._id).localeCompare(String(a._id));
      case 'oldest':
        return String(a._id).localeCompare(String(b._id));
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const filteredProducts = sortedProducts;

  return (
    <div className="min-h-screen bg-white p-2 font-sans">
      <div className="max-w-7xl mx-auto pt-10 pb-16">
        {/* Icons Row at the top */}
 
        {/* Category filter row with 'More >' if many categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-8 justify-between items-center">
            {/* Categories on the left */}
            <div className="flex flex-wrap gap-3">
              <button
                key="all"
                className={`px-5 py-2 rounded-full font-bold transition-colors ${selectedCategoryId === '' ? 'bg-yellow-400 text-blue-900' : 'text-white bg-blue-600 hover:bg-blue-700'}`}
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedCategoryId('');
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('selectedCategoryId');
                    localStorage.removeItem('selectedCategoryName');
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
                            localStorage.setItem('selectedCategoryName', cat.name);
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
                          localStorage.removeItem('selectedCategoryName');
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
                          localStorage.setItem('selectedCategoryName', cat.name);
                        }
                      }}
                    >
                      {cat.name}
                    </button>
                  ))}
            </div>
            
            {/* Sort dropdown on the right */}
            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-sm font-semibold text-gray-700">Sort by:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
              >
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
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

export default function AllProductsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AllProductsContent />
    </Suspense>
  );
} 