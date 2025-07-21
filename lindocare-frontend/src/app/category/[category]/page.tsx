'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Heart } from 'lucide-react';
import { getCurrentUserEmail } from '../../../components/Header';
import LoginModal from '../../../components/LoginModal';
import Head from 'next/head';
import Image from 'next/image';

interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string | string[];
}

interface Product {
  _id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  reviews: number;
  rating: number;
  tags: string[];
  delivery: string[];
}

function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
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

const colors = ['#fff', '#e5e7eb', '#f87171', '#60a5fa', '#fbbf24', '#34d399'];

const CategoryPage = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginMsg, setLoginMsg] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => { setIsClient(true); }, []);

  const params = useParams();
  const categoryId = Array.isArray(params.id) ? params.id[0] : params.id;

  // Fetch category details
  useEffect(() => {
    if (!categoryId) return;
    setLoading(true);
    setError('');
    const fetchCategory = async () => {
      try {
        console.log('Fetching category with ID:', categoryId);
        const res = await fetch(`https://lindo-project.onrender.com/category/getCategoryById/${categoryId}`);
        const contentType = res.headers.get('content-type');
        if (!res.ok || !contentType || !contentType.includes('application/json')) {
          throw new Error('Category not found or invalid response.');
        }
        const data = await res.json();
        console.log('Fetched category data:', data);
        if (!data || !data._id) throw new Error('Category not found');
        setCategory(data);
      } catch (err) {
        setError('Category not found or invalid.');
        setCategory(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [categoryId]);

  // Fetch products for this category
  useEffect(() => {
    if (!categoryId) return;
    const fetchProducts = async () => {
      try {
        // Fetch all products, then filter by categoryId on the client
        const res = await fetch(`https://lindo-project.onrender.com/product/getAllProduct`);
        const data = await res.json();
        let prods = Array.isArray(data) ? data : (data.products || []);
        // Filter products by categoryId === category._id
        if (category) {
          prods = prods.filter((p: any) => p.categoryId === category._id);
        }
        setProducts(prods);
      } catch {
        setProducts([]);
      }
    };
    fetchProducts();
  }, [categoryId, category]);

  // Filtering logic
  useEffect(() => {
    let filtered = [...products];
    if (selectedDelivery.length > 0) {
      filtered = filtered.filter(p => selectedDelivery.some(d => p.delivery && p.delivery.includes(d)));
    }
    setFilteredProducts(filtered);
  }, [products, selectedDelivery]);

  // Wishlist logic (same as before)
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
          if (!res.ok) throw new Error('Failed to fetch wishlist');
          const data = await res.json();
          setWishlist((data.products || []).map((p: any) => String(p._id || p.id)));
        } catch {
          setWishlist([]);
        }
      } else {
        const email = getCurrentUserEmail();
        const key = email ? `wishlist_${email}` : 'wishlist';
        const saved = localStorage.getItem(key);
        const ids = saved ? JSON.parse(saved).map((id: any) => String(id)) : [];
        setWishlist(ids);
      }
    }
    fetchWishlist();
  }, []);

  async function toggleWishlist(id: string) {
    const token = getAuthToken();
    const userId = getUserIdFromToken();
    if (token && userId) {
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
        if (!res.ok) return;
        const wishlistRes = await fetch(`https://lindo-project.onrender.com/wishlist/getUserWishlistProducts/${userId}`, {
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const wishlistData = await wishlistRes.json();
        setWishlist((wishlistData.products || []).map((p: any) => String(p._id || p.id)));
      } catch (err) {}
    } else {
      const email = getCurrentUserEmail();
      const key = email ? `wishlist_${email}` : 'wishlist';
      setWishlist((prev) => {
        const updated = prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id];
        localStorage.setItem(key, JSON.stringify(updated));
        setTimeout(() => window.dispatchEvent(new StorageEvent('storage', { key })), 0);
        return updated;
      });
    }
  }

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const handleDeliveryChange = (option: string) => {
    setSelectedDelivery(prev => prev.includes(option) ? prev.filter(d => d !== option) : [...prev, option]);
  };

  const handleAddToCart = (product: Product) => {
    const email = getCurrentUserEmail();
    if (!email) {
      setLoginMsg('Please log in or create an account to add products to your cart.');
      setLoginOpen(true);
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
    const idx = cart.findIndex((item: { _id: string }) => item._id === product._id);
    if (idx > -1) {
      cart[idx].quantity = (cart[idx].quantity || 1) + 1;
    } else {
      cart.push({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      });
    }
    localStorage.setItem(cartKey, JSON.stringify(cart));
    setTimeout(() => window.dispatchEvent(new StorageEvent('storage', { key: cartKey })), 0);
    setTimeout(() => window.dispatchEvent(new StorageEvent('storage', { key: 'cart' })), 0);
    setToastMsg(`${product.name} added to cart!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1200);
  };

  if (!isClient) return null;

  return (
    <>
      <Head>
        <title>{category ? `${category.name} | Lindo Shop` : 'Category | Lindo Shop'}</title>
        <meta name="description" content={category?.description || 'Browse products by category.'} />
      </Head>
    <div className="min-h-screen bg-white pb-16">
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} message={loginMsg} />
      {showToast && (
        <>
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-full flex justify-center md:hidden pointer-events-none">
            <div className="bg-black text-white px-4 py-2 rounded-full shadow-lg font-semibold animate-fade-in text-center max-w-xs w-full">
              {toastMsg}
            </div>
          </div>
          <div className="hidden md:flex fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full justify-center pointer-events-none">
            <div className="bg-black text-white px-6 py-2 rounded-full shadow-lg font-semibold animate-fade-in text-center max-w-xs w-full">
              {toastMsg}
            </div>
          </div>
        </>
      )}
      <div className="max-w-7xl mx-auto px-2 pt-4 md:pt-6 pb-12">
        <div className="text-sm text-black mb-4 pt-14 md:pt-0">
            <Link href="/">Home</Link> / <span className="text-black font-medium">{category?.name || 'Category'}</span>
          </div>
          {loading ? (
            <div className="text-center text-gray-500 py-12">Loading category...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-12">{error} <br/> <span className='text-xs'>Check if the category ID in the URL is valid.</span></div>
          ) : category && (
            <>
              {/* Category Banner */}
              <div className="mb-8 flex flex-col items-center">
                <Image
                  src={Array.isArray(category.image) ? (category.image[0] || '/lindo.png') : (category.image || '/lindo.png')}
                  alt={category.name}
                  width={600}
                  height={224}
                  className="w-full max-w-2xl h-56 object-cover rounded-2xl border border-black mb-4"
                  style={{ background: '#f5f5f5' }}
                />
                <h1 className="text-3xl font-bold text-black mb-2 text-center">{category.name}</h1>
                {category.description && <p className="text-gray-700 text-center max-w-2xl">{category.description}</p>}
                <div className="text-black text-base font-normal mt-2">{products.length} products</div>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters (collapsible on mobile) */}
          <aside className="w-full md:w-64 bg-white border border-black shadow p-6 mb-6 md:mb-0 md:block">
            <button className="md:hidden mb-4 text-black font-semibold" onClick={() => setShowFilters(v => !v)}>
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-black text-lg">Filters</span>
                <button className="text-blue-600 text-sm font-medium hover:underline" onClick={() => {}}>Clear All</button>
              </div>
                    {/* Delivery and price filters */}
              <div className="mb-4">
                      <div className="font-semibold text-black mb-2">Delivery</div>
                <ul className="space-y-2">
                        {['Fast Delivery', 'Pickup Nearby'].map(option => (
                          <li key={option} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="accent-blue-600"
                              checked={selectedDelivery.includes(option)}
                              onChange={() => handleDeliveryChange(option)}
                            />
                            <span className="text-black text-sm cursor-pointer">{option}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mb-4">
                <div className="font-semibold text-black mb-2">Color</div>
                <div className="flex gap-2">
                  {colors.map((color, i) => (
                    <span key={i} className="w-6 h-6 border border-black" style={{ background: color }}></span>
                  ))}
                </div>
              </div>
            </div>
          </aside>
          {/* Main Content */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-black">Products</h2>
              <div className="flex items-center gap-2">
                <span className="text-black text-sm">Sort by:</span>
                <select className="rounded-lg border border-black px-2 py-1 text-sm text-black focus:border-blue-600 focus:ring-blue-600" value="popular" onChange={e => {}}>
                  <option value="popular">Popular</option>
                  <option value="priceLow">Price: Low to High</option>
                  <option value="priceHigh">Price: High to Low</option>
                  <option value="newest">Newest</option>
                </select>
                <button
                  className={`ml-2 p-2 rounded border border-blue-600 hover:bg-blue-600 hover:text-white ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-blue-600'}`}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >
                  <svg width="20" height="20" fill="none" stroke={viewMode === 'grid' ? '#fff' : '#000'} strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                    <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                    <rect x="14" y="14" width="7" height="7" rx="1.5"/>
                    <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                  </svg>
                </button>
                <button
                  className={`p-2 rounded border border-blue-600 hover:bg-blue-600 hover:text-white ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-blue-600'}`}
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
                  <svg width="20" height="20" fill="none" stroke={viewMode === 'list' ? '#fff' : '#000'} strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="7" rx="1.5"/>
                    <rect x="3" y="14" width="18" height="7" rx="1.5"/>
                  </svg>
                </button>
              </div>
            </div>
                  {filteredProducts.length === 0 ? (
                    <div className="text-center text-gray-500 py-12 text-lg font-semibold">No products found in this category.</div>
                  ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'flex flex-col gap-6'}>
              {filteredProducts.map(product => (
                <div key={product._id} className="bg-white border border-black rounded-2xl shadow p-4 flex flex-col">
                  <div className="relative mb-3">
                    <Link href={`/product/${product._id}`}>
                      <Image src={product.image} alt={product.name} width={600} height={224} className="w-full h-40 object-cover rounded-xl border border-black" />
                      <div className="font-bold text-black mb-1">{product.name}</div>
                    </Link>
                    {product.tags.map(tag => (
                      <span key={tag} className="absolute top-2 left-2 px-2 py-1 border border-black text-black bg-white rounded text-xs font-bold">{tag}</span>
                    ))}
                    <button
                      className="absolute top-2 right-2 bg-white border border-black rounded-full p-1 shadow hover:bg-blue-600 hover:text-white"
                              onClick={() => toggleWishlist(String(product._id))}
                      aria-label="Add to wishlist"
                    >
                      <Heart
                        size={20}
                                color={wishlist.includes(String(product._id)) ? '#2563eb' : '#000'}
                                fill={wishlist.includes(String(product._id)) ? '#2563eb' : 'none'}
                        strokeWidth={2.2}
                      />
                    </button>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-black">★</span>
                      <span className="text-sm font-semibold text-black">{product.rating}</span>
                      <span className="text-xs text-black">({product.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-bold text-black">${product.price.toFixed(2)}</span>
                      {product.oldPrice && <span className="text-sm line-through text-black">${product.oldPrice}</span>}
                    </div>
                    <button className="mt-auto rounded-full bg-blue-600 text-white font-bold py-2 text-sm shadow hover:bg-blue-700 transition" onClick={() => handleAddToCart(product)}>Add to Cart</button>
                  </div>
                </div>
              ))}
            </div>
                  )}
          </main>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CategoryPage; 