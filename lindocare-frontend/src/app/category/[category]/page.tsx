'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Heart } from 'lucide-react';
import { getCurrentUserEmail } from '../../../components/Header';
import LoginModal from '../../../components/LoginModal';

// Template categories (replace with API data later)
const categories = [
  { name: 'Cribs', count: 128 },
  { name: 'Changing Tables', count: 140 },
  { name: 'Rocking Chairs', count: 95 },
  { name: 'Baby Dressers', count: 87 },
  { name: 'Playpens &amp; Playards', count: 77 },
];

// Template products (replace with API data later)
const productsData = [
  {
    id: 1,
    name: 'Sorelle Natural Pinewood Crib',
    price: 526.63,
    oldPrice: 567.05,
    image: 'https://images.pexels.com/photos/459225/pexels-photo-459225.jpeg',
    reviews: 22,
    rating: 4.8,
    tags: ['Sale'],
    delivery: ['Fast Delivery'],
  },
  {
    id: 2,
    name: 'Premium Changing Table',
    price: 289.99,
    image: 'https://images.pexels.com/photos/3933276/pexels-photo-3933276.jpeg',
    reviews: 15,
    rating: 4.5,
    tags: [],
    delivery: ['Pickup Nearby'],
  },
  {
    id: 3,
    name: 'Comfort Rocking Chair',
    price: 459.0,
    image: 'https://images.pexels.com/photos/3933275/pexels-photo-3933275.jpeg',
    reviews: 45,
    rating: 4.7,
    tags: ['Featured'],
    delivery: ['Fast Delivery'],
  },
  {
    id: 4,
    name: 'Baby Dresser & Changer',
    price: 399.99,
    image: 'https://images.pexels.com/photos/3933277/pexels-photo-3933277.jpeg',
    reviews: 28,
    rating: 4.6,
    tags: [],
    delivery: ['Pickup Nearby'],
  },
  {
    id: 5,
    name: 'Portable Baby Playpen',
    price: 179.99,
    image: 'https://images.pexels.com/photos/3933278/pexels-photo-3933278.jpeg',
    reviews: 12,
    rating: 4.4,
    tags: ['New'],
    delivery: ['Fast Delivery'],
  },
  {
    id: 6,
    name: 'Organic Crib Mattress',
    price: 299.99,
    image: 'https://images.pexels.com/photos/3933279/pexels-photo-3933279.jpeg',
    reviews: 67,
    rating: 4.9,
    tags: [],
    delivery: ['Pickup Nearby'],
  },
];

const colors = ['#fff', '#e5e7eb', '#f87171', '#60a5fa', '#fbbf24', '#34d399'];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sortOptions = [
  { value: 'popular', label: 'Popular' },
  { value: 'priceLow', label: 'Price: Low to High' },
  { value: 'priceHigh', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
];

// Define Product type
interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  reviews: number;
  rating: number;
  tags: string[];
  delivery: string[];
}

const CategoryPage = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sort, setSort] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [priceMin, setPriceMin] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [priceMax, setPriceMax] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginMsg, setLoginMsg] = useState('');
  const [allCategories, setAllCategories] = useState<{ name: string; count?: number }[]>([]);
  useEffect(() => { setIsClient(true); }, []);

  // Wishlist state
  const [wishlist, setWishlist] = useState<number[]>([]);
  useEffect(() => {
    if (!isClient) return;
    const saved = localStorage.getItem('wishlist');
    setWishlist(saved ? JSON.parse(saved) : []);
  }, [isClient]);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('https://lindo-project.onrender.com/category/getAllCategories');
        const data = await res.json();
        if (Array.isArray(data)) setAllCategories(data);
        else if (data && Array.isArray(data.categories)) setAllCategories(data.categories);
        else setAllCategories([]);
      } catch {
        setAllCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const params = useParams();
  const categoryParam = params.category;
  const categoryName = decodeURIComponent(Array.isArray(categoryParam) ? categoryParam[0] : categoryParam || 'Baby Furniture');

  useEffect(() => {
    // Fetch real products for this category
    const fetchProducts = async () => {
      try {
        const res = await fetch(`https://lindo-project.onrender.com/product/getProductsByCategory?category=${encodeURIComponent(categoryName)}`);
        const data = await res.json();
        if (Array.isArray(data)) setProducts(data);
        else if (data && Array.isArray(data.products)) setProducts(data.products);
        else setProducts([]);
      } catch {
        setProducts([]);
      }
    };
    fetchProducts();
  }, [categoryName]);

  // Filtering logic
  React.useEffect(() => {
    let filtered = [...products];
    // Delivery filter
    if (selectedDelivery.length > 0) {
      filtered = filtered.filter(p => selectedDelivery.some(d => p.delivery && p.delivery.includes(d)));
    }
    // Price filter
    if (priceMin) filtered = filtered.filter(p => p.price >= parseFloat(priceMin));
    if (priceMax) filtered = filtered.filter(p => p.price <= parseFloat(priceMax));
    // Sorting
    if (sort === 'priceLow') filtered.sort((a, b) => a.price - b.price);
    else if (sort === 'priceHigh') filtered.sort((a, b) => b.price - a.price);
    else if (sort === 'newest') filtered = filtered.slice().reverse();
    // (Popular: default order)
    setFilteredProducts(filtered);
  }, [products, selectedDelivery, sort, priceMin, priceMax]);

  React.useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const handleDeliveryChange = (option: string) => {
    setSelectedDelivery(prev => prev.includes(option) ? prev.filter(d => d !== option) : [...prev, option]);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleClearAll = () => {
    setSelectedDelivery([]);
    setSort('popular');
    setViewMode('grid');
    setPriceMin('');
    setPriceMax('');
  };

  const toggleWishlist = (id: number) => {
    if (!isClient) return;
    setWishlist((prev) => {
      const updated = prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id];
      localStorage.setItem('wishlist', JSON.stringify(updated));
      window.dispatchEvent(new StorageEvent('storage', { key: 'wishlist' }));
      return updated;
    });
  };

  // Add to cart handler
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
    const idx = cart.findIndex((item: { id: number }) => item.id === product.id);
    if (idx > -1) {
      cart[idx].quantity = (cart[idx].quantity || 1) + 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      });
    }
    localStorage.setItem(cartKey, JSON.stringify(cart));
    // Manually dispatch storage event for same-tab update
    window.dispatchEvent(new StorageEvent('storage', { key: cartKey }));
    window.dispatchEvent(new StorageEvent('storage', { key: 'cart' })); // for header badge update
    setToastMsg(`${product.name} added to cart!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1200);
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-white pb-16">
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} message={loginMsg} />
      {showToast && (
        <>
          {/* Mobile: bottom above nav bar */}
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-full flex justify-center md:hidden pointer-events-none">
            <div className="bg-black text-white px-4 py-2 rounded-full shadow-lg font-semibold animate-fade-in text-center max-w-xs w-full">
              {toastMsg}
            </div>
          </div>
          {/* Desktop: top center */}
          <div className="hidden md:flex fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full justify-center pointer-events-none">
            <div className="bg-black text-white px-6 py-2 rounded-full shadow-lg font-semibold animate-fade-in text-center max-w-xs w-full">
              {toastMsg}
            </div>
          </div>
        </>
      )}
      <div className="max-w-7xl mx-auto px-2 pt-4 md:pt-6 pb-12">
        {/* Breadcrumb */}
        <div className="text-sm text-black mb-4 pt-14 md:pt-0">
          <Link href="/">Home</Link> / <span className="text-black font-medium">{categoryName}</span>
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
                <button className="text-blue-600 text-sm font-medium hover:underline" onClick={handleClearAll}>Clear All</button>
              </div>
              <div className="mb-4">
                <div className="font-semibold text-black mb-2">Categories</div>
                <ul className="space-y-2">
                  {allCategories.map(cat => (
                    <li key={cat.name} className="flex items-center gap-2">
                      <input type="checkbox" className="accent-blue-600" />
                      <span className="text-black text-sm hover:text-blue-600 transition-colors cursor-pointer">{cat.name}</span>
                      {cat.count !== undefined && <span className="text-black text-sm"> ({cat.count})</span>}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Remove Delivery filter section */}
           
              <div className="mb-4">
                <div className="font-semibold text-black mb-2">Color</div>
                <div className="flex gap-2">
                  {colors.map((color, i) => (
                    <span key={i} className="w-6 h-6 border border-black" style={{ background: color }}></span>
                  ))}
                </div>
              </div>
              <div>
                <div className="font-semibold text-black mb-2">Price Range</div>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" className="w-1/2 rounded-lg border border-black px-2 py-1 text-sm text-black placeholder-gray-400" value={priceMin} onChange={e => setPriceMin(e.target.value)} />
                  <input type="number" placeholder="Max" className="w-1/2 rounded-lg border border-black px-2 py-1 text-sm text-black placeholder-gray-400" value={priceMax} onChange={e => setPriceMax(e.target.value)} />
                </div>
              </div>
            </div>
          </aside>
          {/* Main Content */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-black">{categoryName} <span className="text-black text-base font-normal">({products.length} products)</span></h1>
              <div className="flex items-center gap-2">
                <span className="text-black text-sm">Sort by:</span>
                <select className="rounded-lg border border-black px-2 py-1 text-sm text-black focus:border-blue-600 focus:ring-blue-600" value={sort} onChange={e => setSort(e.target.value)}>
                  {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
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
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'flex flex-col gap-6'}>
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white border border-black rounded-2xl shadow p-4 flex flex-col">
                  <div className="relative mb-3">
                    <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded-xl border border-black" />
                    {product.tags.map(tag => (
                      <span key={tag} className="absolute top-2 left-2 px-2 py-1 border border-black text-black bg-white rounded text-xs font-bold">{tag}</span>
                    ))}
                    <button
                      className="absolute top-2 right-2 bg-white border border-black rounded-full p-1 shadow hover:bg-blue-600 hover:text-white"
                      onClick={() => toggleWishlist(product.id)}
                      aria-label="Add to wishlist"
                    >
                      <Heart
                        size={20}
                        color={wishlist.includes(product.id) ? '#2563eb' : '#000'}
                        fill={wishlist.includes(product.id) ? '#2563eb' : 'none'}
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
                    <div className="font-bold text-black mb-1">{product.name}</div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-bold text-black">${product.price.toFixed(2)}</span>
                      {product.oldPrice && <span className="text-sm line-through text-black">${product.oldPrice}</span>}
                    </div>
                    <button className="mt-auto rounded-full bg-blue-600 text-white font-bold py-2 text-sm shadow hover:bg-blue-700 transition" onClick={() => handleAddToCart(product)}>Add to Cart</button>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage; 