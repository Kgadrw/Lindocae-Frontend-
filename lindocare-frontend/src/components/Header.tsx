"use client";
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Home, List, MapPin, Lock } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import {
  fetchUserCart,
  fetchUserWishlist,
  getLocalCart,
  getLocalWishlist,
  isUserLoggedIn
} from '../utils/serverStorage';

// Move updateUser outside so it can be called from anywhere
function updateUser(setUser: React.Dispatch<React.SetStateAction<null | { name: string; avatar?: string }>>) {
  if (typeof window !== 'undefined') {
    const email = localStorage.getItem('userEmail');
    let name = '';
    let avatar = '';
    if (email) {
      name = localStorage.getItem(`userName:${email}`) || '';
      avatar = localStorage.getItem(`userAvatar:${email}`) || '';
      // Fallback: if no userName, use email or part before @
      if (!name) {
        name = email.includes('@') ? email.split('@')[0] : email;
      }
    }
    console.log('[updateUser] email:', email, 'name:', name, 'avatar:', avatar);
    if (name && avatar) setUser({ name, avatar });
    else if (name) setUser({ name, avatar: undefined });
    else setUser(null);
  }
}

// Updated function to fetch wishlist count from server
async function fetchWishlistCountFromBackend() {
  if (typeof window === 'undefined') return 0;
  
  try {
    if (isUserLoggedIn()) {
      // Logged in: fetch from server
      const wishlist = await fetchUserWishlist();
      return wishlist.length;
    } else {
      // Guest: use localStorage
      const localWishlist = getLocalWishlist();
      return localWishlist.length;
    }
  } catch (error) {
    console.error('Error fetching wishlist count:', error);
    return 0;
  }
}

// Updated function to fetch cart count from server
async function fetchCartCountFromBackend() {
  if (typeof window === 'undefined') return 0;
  
  try {
    if (isUserLoggedIn()) {
      // Logged in: fetch from server
      const cart = await fetchUserCart();
      return cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    } else {
      // Guest: use localStorage
      const localCart = getLocalCart();
      return localCart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    }
  } catch (error) {
    console.error('Error fetching cart count:', error);
    return 0;
  }
}

interface HeaderProps {
  categories?: { _id?: string; name: string }[];
  loading?: boolean;
  onCategoryClick?: (cat: { _id?: string; name: string }) => void;
}

const Header = ({ categories: propCategories, loading, onCategoryClick }: HeaderProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<null | { name: string; avatar?: string }>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [navOpen, setNavOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<{type: 'product'|'category', id?: number|string, name:string}[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  // Add state for all products and categories
  const [allProducts, setAllProducts] = useState<{id:number, name:string}[]>([]);
  const [allCategories, setAllCategories] = useState<{_id?:string, name:string}[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  
  // Add state for category hover dropdown
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<{[key: string]: any[]}>({});
  const [loadingCategoryProducts, setLoadingCategoryProducts] = useState<{[key: string]: boolean}>({});
  const [showCategoryDropdown, setShowCategoryDropdown] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll detection
  React.useEffect(() => {
    const handleScroll = () => {
      // setIsScrolled(window.scrollY > 50); // This line was removed as per the edit hint.
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  // Listen for storage changes and custom login events
  React.useEffect(() => {
    function handleStorage() {
      updateUser(setUser);
    }
    function handleUserLogin(event: CustomEvent) {
      const { email, name, avatar } = event.detail;
      if (email && name) {
        setUser({ name, avatar });
      }
    }
    
    // Initial user update
    updateUser(setUser);
    
    window.addEventListener('storage', handleStorage);
    window.addEventListener('userLogin', handleUserLogin as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('userLogin', handleUserLogin as EventListener);
    };
  }, []);

  // Cart count effect
  useEffect(() => {
    async function updateCartCount() {
      if (typeof window !== 'undefined') {
        const count = await fetchCartCountFromBackend();
        setCartCount(count);
      }
    }
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    return () => window.removeEventListener('storage', updateCartCount);
  }, []);

  useEffect(() => {
    async function updateWishlistCount() {
      if (typeof window !== 'undefined') {
        const count = await fetchWishlistCountFromBackend();
        setWishlistCount(count);
      }
    }
    updateWishlistCount();
    const handleWishlistUpdate = () => updateWishlistCount();
    window.addEventListener('storage', handleWishlistUpdate);
    window.addEventListener('wishlist-updated', handleWishlistUpdate);
    return () => {
      window.removeEventListener('storage', handleWishlistUpdate);
      window.removeEventListener('wishlist-updated', handleWishlistUpdate);
    };
  }, []);

  // Fetch all products and categories on mount
  useEffect(() => {
    fetch('https://lindo-project.onrender.com/product/getAllProduct')
      .then(res => res.json())
      .then(data => {
        let prods = [];
        if (Array.isArray(data)) prods = data;
        else if (data && Array.isArray(data.products)) prods = data.products;
        setAllProducts(prods.map((p:any) => ({ id: p.id || p._id, name: p.name })));
      });
    fetch('https://lindo-project.onrender.com/category/getAllCategories')
      .then(res => res.json())
      .then(data => {
        let cats = [];
        if (Array.isArray(data)) cats = data;
        else if (data && Array.isArray(data.categories)) cats = data.categories;
        setAllCategories(cats.map((c:any) => ({ _id: c._id, name: c.name })));
      });
  }, []);

  // Simulate user info after login/register
  const handleLoginSuccess = async (name: string, avatar?: string, email?: string) => {
    setUser({ name, avatar });
    if (email) localStorage.setItem('userEmail', email);
    if (email && name) localStorage.setItem(`userName:${email}`, name);
    if (email && avatar) localStorage.setItem(`userAvatar:${email}`, avatar);
    
    // Update cart and wishlist counts after login
    setTimeout(async () => {
      const cartCount = await fetchCartCountFromBackend();
      const wishlistCount = await fetchWishlistCountFromBackend();
      setCartCount(cartCount);
      setWishlistCount(wishlistCount);
    }, 100);
  };

  // Helper to close dropdown and perform an action
  const handleSignOut = () => {
    const email = localStorage.getItem('userEmail');
    console.log('[handleSignOut] Signing out user:', email);
    setUser(null);
    setDropdownOpen(false);
    localStorage.removeItem('userEmail');
    if (email) {
      localStorage.removeItem(`userName:${email}`);
      localStorage.removeItem(`userAvatar:${email}`);
      localStorage.removeItem(`cart:${email}`);
      localStorage.removeItem(`wishlist_${email}`);
    }
    window.dispatchEvent(new StorageEvent('storage', { key: 'userEmail' }));
    router.push('/');
  };



  const handleSearch = (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (search.trim()) {
      // If matches a category, go to all-products page filtered by that category
      const cat = allCategories.find(c => c.name.toLowerCase() === search.trim().toLowerCase());
      if (cat) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('selectedCategoryId', cat._id || '');
        }
        router.push('/all-products');
        setSearch('');
        setShowSuggestions(false);
        return;
      }
      // Otherwise, search products
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    if (value.trim()) {
      // Search both products and categories
      const prodMatches = allProducts.filter(p => p.name.toLowerCase().includes(value.toLowerCase())).map(p => ({ type: 'product' as const, id: p.id, name: p.name }));
      const catMatches = allCategories.filter(c => c.name.toLowerCase().includes(value.toLowerCase())).map(c => ({ type: 'category' as const, id: c._id, name: c.name }));
      const filtered = [...catMatches, ...prodMatches].slice(0, 7);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (name: string, type: 'product'|'category') => {
    setSearch(name);
    setShowSuggestions(false);
    if (type === 'category') {
      router.push(`/category/${encodeURIComponent(name)}`);
    } else {
      router.push(`/search?q=${encodeURIComponent(name)}`);
    }
  };

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 100); // Delay to allow click
  };

  // Restore highlight logic for active category
  let selectedCategoryId = '';
  let highlightActive = false;
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    highlightActive = path.startsWith('/all-products') || path.startsWith('/category');
    selectedCategoryId = highlightActive ? (localStorage.getItem('selectedCategoryId') || '') : '';
  }

  // Fetch products for a specific category
  const fetchCategoryProducts = async (categoryId: string) => {
    if (categoryProducts[categoryId]) return; // Already loaded
    
    setLoadingCategoryProducts(prev => ({ ...prev, [categoryId]: true }));
    try {
      const res = await fetch(`https://lindo-project.onrender.com/product/getProductsByCategory/${categoryId}`);
      if (res.ok) {
        const data = await res.json();
        let prods = [];
        if (Array.isArray(data)) prods = data;
        else if (data && Array.isArray(data.products)) prods = data.products;
        setCategoryProducts(prev => ({ ...prev, [categoryId]: prods.slice(0, 8) })); // Limit to 8 products
      } else {
        setCategoryProducts(prev => ({ ...prev, [categoryId]: [] }));
      }
    } catch {
      setCategoryProducts(prev => ({ ...prev, [categoryId]: [] }));
    } finally {
      setLoadingCategoryProducts(prev => ({ ...prev, [categoryId]: false }));
    }
  };

  // Handle category hover
  const handleCategoryHover = (categoryId: string) => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Set a small delay before showing the dropdown
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(categoryId);
      setShowCategoryDropdown(categoryId);
      if (!categoryProducts[categoryId] && !loadingCategoryProducts[categoryId]) {
        fetchCategoryProducts(categoryId);
      }
    }, 200); // 200ms delay
  };

  const handleCategoryLeave = () => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Add a small delay before hiding to allow moving mouse to dropdown
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
      setShowCategoryDropdown(null);
    }, 100);
  };

  // Handle dropdown hover to keep it open
  const handleDropdownHover = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const handleDropdownLeave = () => {
    setHoveredCategory(null);
    setShowCategoryDropdown(null);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <header className="w-full bg-white shadow-md sticky top-0 z-50">
      {/* Top Promo Bar */}
      {/* Mobile Header with Hamburger Menu */}
      <div className="block md:hidden px-4 py-1 pb-0 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image src="/lindo.png" alt="Lindo Logo" width={60} height={24} priority className="focus:outline-none" style={{ width: 'auto', height: 'auto' }} />
          </Link>
          
          {/* Mobile Icons */}
          <div className="flex items-center gap-2">
            {/* Wishlist */}
            <Link href="/wishlist">
              <button className="relative p-1.5 hover:text-[#FFE600] transition-colors">
                <Heart size={18} className="stroke-black" strokeWidth={2.5} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[16px] text-center border-2 border-white shadow">
                    {wishlistCount}
                  </span>
                )}
              </button>
            </Link>
            
            {/* Cart */}
            <Link href="/cart">
              <button className="relative p-1.5 hover:text-[#FFE600] transition-colors">
                <ShoppingCart size={18} className="stroke-black" strokeWidth={2.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[16px] text-center border-2 border-white shadow">
                    {cartCount}
                  </span>
                )}
              </button>
            </Link>
            
            {/* User */}
            {user ? (
              <button
                onClick={() => setDropdownOpen(v => !v)}
                className="p-1.5 hover:text-[#FFE600] transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold border border-gray-200">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </button>
            ) : (
              <Link href="/login">
                <button className="px-2.5 py-1 rounded-md bg-[#FFE600] text-[#2056A7] text-xs font-semibold hover:shadow transition">
                  Sign In
                </button>
              </Link>
            )}
            
            {/* Hamburger Menu */}
            <button
              onClick={() => setNavOpen(true)}
              className="p-1.5 hover:text-blue-600 transition-colors"
              aria-label="Open navigation menu"
            >
              <svg width="18" height="18" fill="none" stroke="#3B82F6" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Search Bar */}
      <div className="block md:hidden px-4 py-1 pt-0 bg-white border-b border-gray-100">
        <div className="relative">
          <form onSubmit={handleSearch} autoComplete="off">
            <input
              type="text"
              value={search}
              onChange={handleInputChange}
              onFocus={() => { if (search) setShowSuggestions(true); }}
              onBlur={handleBlur}
              ref={searchInputRef}
              placeholder="Find babycare essentials..."
              className="w-full rounded-full border text-gray-900 border-[#FFE600] px-3 py-1.5 pr-8 focus:outline-none focus:ring-2 focus:ring-[#FFE600] text-sm shadow placeholder:text-[#2056A7]"
              onKeyDown={e => { if (e.key === 'Enter') handleSearch(e); }}
            />
            <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-[#FFE600] text-white p-1 rounded-full cursor-pointer" aria-label="Search">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </button>
          </form>
          {showSuggestions && (
            <ul className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
              {suggestions.map(s => (
                <li
                  key={s.type + '-' + s.id + '-' + s.name}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-gray-900 flex items-center gap-2"
                  onMouseDown={() => handleSuggestionClick(s.name, s.type)}
                >
                  <span className="inline-block w-2 h-2 rounded-full" style={{ background: s.type === 'category' ? '#F4E029' : '#3B82F6' }}></span>
                  <span>{s.name}</span>
                  <span className="text-xs text-gray-400 ml-auto">{s.type === 'category' ? 'Category' : 'Product'}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {/* Main Nav (logo, icons, search for desktop) */}
      <div className="hidden md:flex items-center justify-between px-2 py-1 gap-2 md:px-4 md:py-1">
        {/* Logo */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Link href="/">
            <Image src="/lindo.png" alt="Lindo Logo" width={110} height={44} priority className="focus:outline-none" style={{ width: 'auto', height: 'auto' }} />
          </Link>
        </div>
        {/* Category Navigation */}
        {propCategories && propCategories.length > 0 && (
          <nav className="flex gap-2 ml-4 relative">
            {(propCategories.length > 4
              ? [
                  ...propCategories.slice(0, 4).map(cat => (
                    <div key={cat._id || cat.name} className="relative">
                      <button
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer ${highlightActive && selectedCategoryId === cat._id ? 'text-yellow-600 underline' : 'text-gray-700 hover:text-blue-700'}`}
                        onClick={() => onCategoryClick && onCategoryClick(cat)}
                        onMouseEnter={() => cat._id && handleCategoryHover(cat._id)}
                        onMouseLeave={handleCategoryLeave}
                        type="button"
                      >
                        {cat.name}
                      </button>
                      {/* Category Products Dropdown */}
                      {showCategoryDropdown === (cat._id || '') && (
                        <div 
                          className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 w-80 p-4 animate-in fade-in-0 slide-in-from-top-1 duration-200"
                          onMouseEnter={handleDropdownHover}
                          onMouseLeave={handleDropdownLeave}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 text-sm">{cat.name} Products</h3>
                            <button
                              onClick={() => cat._id && router.push(`/all-products?category=${encodeURIComponent(cat.name)}`)}
                              className="text-blue-600 text-xs hover:underline"
                            >
                              View All
                            </button>
                          </div>
                          {loadingCategoryProducts[cat._id || ''] ? (
                            <div className="grid grid-cols-2 gap-2">
                              {[...Array(4)].map((_, i) => (
                                <div key={i} className="animate-pulse">
                                  <div className="bg-gray-200 h-16 rounded-lg mb-2"></div>
                                  <div className="bg-gray-200 h-3 rounded w-3/4"></div>
                                </div>
                              ))}
                            </div>
                          ) : categoryProducts[cat._id || '']?.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2">
                              {categoryProducts[cat._id || ''].map((product: any) => (
                                <div key={product._id} className="group cursor-pointer hover:bg-gray-50 rounded-lg p-1 transition-colors" onClick={() => router.push(`/product/${product._id}`)}>
                                  <div className="relative">
                                    <img 
                                      src={product.image} 
                                      alt={product.name}
                                      className="w-full h-16 object-cover rounded-lg border border-gray-200 group-hover:border-blue-300 transition-colors"
                                    />
                                    {product.tags && product.tags.length > 0 && (
                                      <span className="absolute top-1 left-1 px-1 py-0.5 bg-white border border-gray-300 text-gray-600 text-xs rounded">
                                        {product.tags[0]}
                                      </span>
                                    )}
                                  </div>
                                  <div className="mt-1">
                                    <div className="text-xs font-medium text-gray-900 truncate">{product.name}</div>
                                    <div className="text-xs text-gray-600">RWF {product.price?.toLocaleString()}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center text-gray-500 text-sm py-4">
                              No products found in this category
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )),
                  <button
                    key="more"
                    className="px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer text-gray-700 hover:text-blue-700"
                    onClick={() => {
                      router.push('/all-products');
                    }}
                    type="button"
                  >
                    More &gt;
                  </button>
                ]
              : propCategories.map(cat => (
                  <div key={cat._id || cat.name} className="relative">
                    <button
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer ${highlightActive && selectedCategoryId === cat._id ? 'text-yellow-600 underline' : 'text-gray-700 hover:text-blue-700'}`}
                      onClick={() => onCategoryClick && onCategoryClick(cat)}
                      onMouseEnter={() => cat._id && handleCategoryHover(cat._id)}
                      onMouseLeave={handleCategoryLeave}
                      type="button"
                    >
                      {cat.name}
                    </button>
                    {/* Category Products Dropdown */}
                    {showCategoryDropdown === (cat._id || '') && (
                      <div 
                        className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 w-80 p-4 animate-in fade-in-0 slide-in-from-top-1 duration-200"
                        onMouseEnter={handleDropdownHover}
                        onMouseLeave={handleDropdownLeave}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-gray-900 text-sm">{cat.name} Products</h3>
                          <button
                            onClick={() => cat._id && router.push(`/all-products?category=${encodeURIComponent(cat.name)}`)}
                            className="text-blue-600 text-xs hover:underline"
                          >
                            View All
                          </button>
                        </div>
                        {loadingCategoryProducts[cat._id || ''] ? (
                          <div className="grid grid-cols-2 gap-2">
                            {[...Array(4)].map((_, i) => (
                              <div key={i} className="animate-pulse">
                                <div className="bg-gray-200 h-16 rounded-lg mb-2"></div>
                                <div className="bg-gray-200 h-3 rounded w-3/4"></div>
                              </div>
                            ))}
                          </div>
                        ) : categoryProducts[cat._id || '']?.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2">
                            {categoryProducts[cat._id || ''].map((product: any) => (
                              <div key={product._id} className="group cursor-pointer hover:bg-gray-50 rounded-lg p-1 transition-colors" onClick={() => router.push(`/product/${product._id}`)}>
                                <div className="relative">
                                  <img 
                                    src={product.image} 
                                    alt={product.name}
                                    className="w-full h-16 object-cover rounded-lg border border-gray-200 group-hover:border-blue-300 transition-colors"
                                  />
                                  {product.tags && product.tags.length > 0 && (
                                    <span className="absolute top-1 left-1 px-1 py-0.5 bg-white border border-gray-300 text-gray-600 text-xs rounded">
                                      {product.tags[0]}
                                    </span>
                                  )}
                                </div>
                                <div className="mt-1">
                                  <div className="text-xs font-medium text-gray-900 truncate">{product.name}</div>
                                  <div className="text-xs text-gray-600">RWF {product.price?.toLocaleString()}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-gray-500 text-sm py-4">
                            No products found in this category
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
            )}
          </nav>
        )}
        {/* Search Bar (desktop only) */}
        <div className="hidden md:flex flex-1 justify-center max-w-xl w-full">
          <div className="relative w-full">
            <form onSubmit={handleSearch} autoComplete="off">
              <input
                type="text"
                value={search}
                onChange={handleInputChange}
                onFocus={() => { if (search) setShowSuggestions(true); }}
                onBlur={handleBlur}
                ref={searchInputRef}
                placeholder="Find babycare essentials..."
                className="w-full rounded-full border text-blue-700 border-gray-700 px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-black text-base placeholder:text-gray-900"
                onKeyDown={e => { if (e.key === 'Enter') handleSearch(e); }}
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-700 text-white p-1 rounded-full cursor-pointer" aria-label="Search">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              </button>
            </form>
            {showSuggestions && (
              <ul className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                {suggestions.map(s => (
                  <li
                    key={s.type + '-' + s.id + '-' + s.name}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-gray-900 flex items-center gap-2"
                    onMouseDown={() => handleSuggestionClick(s.name, s.type)}
                  >
                    <span className="inline-block w-2 h-2 rounded-full" style={{ background: s.type === 'category' ? '#F4E029' : '#3B82F6' }}></span>
                    <span>{s.name}</span>
                    <span className="text-xs text-gray-400 ml-auto">{s.type === 'category' ? 'Category' : 'Product'}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {/* Icons (desktop only) */}
        <div className="hidden md:flex items-center gap-2 text-xl px-4 relative">
          {/* Location */}
          <div className="flex items-center gap-1 text-black text-sm font-medium">
            <MapPin size={16} color="#000000" className="cursor-pointer" />
            <span>Rwanda</span>
          </div>
          {/* Currency */}
          <div className="text-black text-sm font-medium">
            RWF
          </div>
          {/* Wishlist */}
          <Link href="/wishlist">
            <button
              aria-label="Wishlist"
              className={`hover:text-[#FFE600] focus:text-[#FFE600] rounded-full p-2 transition-colors flex flex-col items-center relative cursor-pointer`}
            >
              <Heart size={22} className="stroke-black group-hover:stroke-[#FFE600] group-focus:stroke-[#FFE600] fill-none group-hover:fill-[#FFE600] group-focus:fill-[#FFE600] cursor-pointer" strokeWidth={2.5} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center border-2 border-white shadow">
                  {wishlistCount}
                </span>
              )}
              {pathname === '/wishlist' && (
                <span className="block h-0.5 bg-black w-6 rounded-full mt-1" />
              )}
            </button>
          </Link>
          {/* Cart */}
          <Link href="/cart">
            <button
              className={`hover:text-[#FFE600] focus:text-[#FFE600] rounded-full p-2 transition-colors flex flex-col items-center relative cursor-pointer`}
            >
              <ShoppingCart size={22} className="stroke-black group-hover:stroke-[#FFE600] group-focus:stroke-[#FFE600] fill-none group-hover:fill-[#FFE600] group-focus:fill-[#FFE600] cursor-pointer" strokeWidth={2.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center border-2 border-white shadow">
                  {cartCount}
                </span>
              )}
              {pathname === '/cart' && (
                <span className="block h-0.5 bg-black w-6 rounded-full mt-1" />
              )}
            </button>
          </Link>
          {/* Checkout */}
          <Link href="/checkout">
            <button
              aria-label="Checkout"
              className={`hover:text-[#FFE600] focus:text-[#FFE600] rounded-full p-2 transition-colors flex flex-col items-center cursor-pointer`}
            >
              <Lock size={22} className="stroke-black group-hover:stroke-[#FFE600] group-focus:stroke-[#FFE600] fill-none group-hover:fill-[#FFE600] group-focus:fill-[#FFE600] cursor-pointer" strokeWidth={2.5} />
              {pathname === '/checkout' && (
              <span className="block h-0.5 bg-black w-6 rounded-full mt-1" />
              )}
            </button>
          </Link>
          {/* User */}
          <div className="relative">
            {user ? (
              <button
                aria-label="User"
                className={`hover:text-[#FFE600] focus:text-[#FFE600] rounded-full p-2 transition-colors flex flex-col items-center cursor-pointer`}
                onClick={() => setDropdownOpen(v => !v)}
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold border-2 border-gray-200">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                {pathname === '/account' && (
                  <span className="block h-0.5 bg-black w-6 rounded-full mt-1" />
                )}
              </button>
            ) : (
              <div className="flex gap-1">
                <Link href="/login">
                  <button
                    className="px-2 py-1 rounded-md bg-black text-white text-xs font-semibold hover:shadow transition cursor-pointer"
                    style={{ minWidth: 0 }}
                  >
                    Create Account
                  </button>
                </Link>
                <Link href="/login">
                  <button
                    className="px-2 py-1 rounded-md bg-[#FFE600] text-[#2056A7] hover:shadow text-xs font-semibold transition cursor-pointer"
                    style={{ minWidth: 0 }}
                  >
                    Sign In
                  </button>
                </Link>
              </div>
            )}
          </div>
          {/* User Dropdown/Tooltip Modal (image UI) */}
          {dropdownOpen && user && (
            <div ref={dropdownRef} className="absolute right-0 top-14 z-50 bg-white rounded-2xl shadow-2xl p-0 w-72 flex flex-col border border-gray-200 animate-fade-in" style={{ minWidth: 260 }}>
              <div className="flex flex-col items-center pt-6 pb-2 px-6 border-b border-gray-100">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold border-2 border-gray-200 mb-2">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-gray-900 text-base mb-1">Welcome back, {user.name}</span>
                {/* Remove Sign Out button, keep only Logout below */}
              </div>
              <div className="flex flex-col gap-1 py-2 px-2">
                <div className="border-t border-gray-100 my-2" />
                <button onMouseDown={handleSignOut} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-50 text-red-600 text-sm font-medium w-full text-left">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16,17 21,12 16,7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Mobile Nav Drawer */}
      <div className={`fixed inset-0 z-40 bg-black bg-opacity-30 transition-opacity duration-200 ${navOpen ? 'block md:hidden' : 'hidden'}`} onClick={() => setNavOpen(false)} />
      <nav className={`fixed top-0 left-0 h-full w-80 bg-white shadow-lg z-50 transform transition-transform duration-200 ${navOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <Link href="/" onClick={() => setNavOpen(false)}>
            <Image src="/lindo.png" alt="Lindo Logo" width={80} height={32} priority className="focus:outline-none" style={{ width: 'auto', height: 'auto' }} />
          </Link>
          <button className="p-2 hover:text-[#FFE600] transition-colors" onClick={() => setNavOpen(false)} aria-label="Close navigation">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="flex flex-col h-full">
          {/* User Section */}
          <div className="p-4 border-b border-gray-100">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold border border-gray-200">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Welcome back, {user.name}</div>
                  <button 
                    onClick={() => { handleSignOut(); setNavOpen(false); }}
                    className="text-red-600 text-sm hover:text-red-700"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/login" onClick={() => setNavOpen(false)}>
                  <button className="px-4 py-2 rounded-md bg-[#FFE600] text-[#2056A7] text-sm font-semibold hover:shadow transition w-full">
                    Sign In
                  </button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="space-y-1">
                <Link href="/" onClick={() => setNavOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-900 font-medium">
                  <Home size={20} />
                  <span>Home</span>
                </Link>
                
                <Link href="/all-products" onClick={() => setNavOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-900 font-medium">
                  <List size={20} />
                  <span>All Products</span>
                </Link>
                
                <Link href="/cart" onClick={() => setNavOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-900 font-medium">
                  <ShoppingCart size={20} />
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span className="ml-auto bg-yellow-400 text-white text-xs font-bold rounded-full px-2 py-1 min-w-[20px] text-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
                
                <Link href="/wishlist" onClick={() => setNavOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-900 font-medium">
                  <Heart size={20} />
                  <span>Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="ml-auto bg-yellow-400 text-white text-xs font-bold rounded-full px-2 py-1 min-w-[20px] text-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                
                <Link href="/checkout" onClick={() => setNavOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-900 font-medium">
                  <Lock size={20} />
                  <span>Checkout</span>
                </Link>
              </div>
            </div>
            
            {/* Categories Section */}
            <div className="border-t border-gray-100">
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
                {loading ? (
                  <div className="space-y-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : (propCategories && propCategories.length > 0) ? (
                  <div className="space-y-1">
                    {propCategories.map(cat => (
                      <Link 
                        key={cat._id || cat.name} 
                        href={cat._id ? `/all-products?category=${encodeURIComponent(cat.name)}` : `/all-products`} 
                        onClick={() => setNavOpen(false)}
                        className="block px-4 py-2 rounded-lg hover:bg-gray-50 text-gray-700 text-sm"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">No categories available</div>
                )}
              </div>
            </div>
            
            {/* Footer Links Section */}
            <div className="border-t border-gray-100">
              <div className="p-4 space-y-4">
                {/* Customer Service */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Customer Service</h3>
                  <div className="space-y-1">
                    <Link href="/returns-exchanges" onClick={() => setNavOpen(false)} className="block px-4 py-2 rounded-lg hover:bg-gray-50 text-gray-700 text-sm">
                      Returns & Exchanges
                    </Link>
                    <Link href="/faqs" onClick={() => setNavOpen(false)} className="block px-4 py-2 rounded-lg hover:bg-gray-50 text-gray-700 text-sm">
                      FAQs
                    </Link>
                  </div>
                </div>
                
                {/* Company */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Company</h3>
                  <div className="space-y-1">
                    <Link href="/about-us" onClick={() => setNavOpen(false)} className="block px-4 py-2 rounded-lg hover:bg-gray-50 text-gray-700 text-sm">
                      About Us
                    </Link>
                    <Link href="/careers" onClick={() => setNavOpen(false)} className="block px-4 py-2 rounded-lg hover:bg-gray-50 text-gray-700 text-sm">
                      Careers
                    </Link>
                    <Link href="/sustainability" onClick={() => setNavOpen(false)} className="block px-4 py-2 rounded-lg hover:bg-gray-50 text-gray-700 text-sm">
                      Sustainability
                    </Link>
                  </div>
                </div>
                
                {/* Social Media */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Follow Us</h3>
                  <div className="flex gap-3 px-4">
                    <a href="https://www.instagram.com/lindocare/" className="text-gray-600 hover:text-[#FFE600] transition-colors">
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                      </svg>
                    </a>
                    <a href="https://www.facebook.com/lindocare/" className="text-gray-600 hover:text-[#FFE600] transition-colors">
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                      </svg>
                    </a>
                    <a href="https://www.youtube.com/lindocare/" className="text-gray-600 hover:text-[#FFE600] transition-colors">
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-1.94C19.56 4 12 4 12 4s-7.56 0-9.6.48a2.78 2.78 0 0 0-1.94 1.94A29 29 0 0 0 0 12.25a29 29 0 0 0 .46 5.77A2.78 2.78 0 0 0 2.4 19.9c2.04.48 9.6.48 9.6.48s7.56 0 9.6-.48a2.78 2.78 0 0 0 1.94-1.94 29 29 0 0 0 .46-5.77 29 29 0 0 0-.46-5.77z"/>
                        <polygon points="10,15 15,12 10,9"/>
                      </svg>
                    </a>
                  </div>
                </div>
                
                {/* Contact Info */}
                <div className="px-4">
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex gap-2">
                      <span>📞</span>
                      <a href="tel:+250785064255" className="hover:underline">+250 785 064 255</a>
                    </div>
                    <div className="flex gap-2">
                      <span>📧</span>
                      <a href="mailto:hello@lindocare.com" className="hover:underline">hello@lindocare.com</a>
                    </div>
                    <div className="flex gap-2">
                      <span>📍</span>
                      <span>Unify Buildings, Behind T 2000 Hotel<br />Kigali, Rwanda</span>
                    </div>
                  </div>
                </div>
                
                {/* Legal Links */}
                <div className="px-4 pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>© 2025 Lindocare. All rights reserved.</div>
                    <div className="flex gap-2">
                      <Link href="/terms-of-use" onClick={() => setNavOpen(false)} className="hover:underline">Privacy Policy</Link>
                      <span>|</span>
                      <Link href="/terms-of-use" onClick={() => setNavOpen(false)} className="hover:underline">Terms of Use</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      {/* Bottom Navigation Bar for Mobile */}
      {/* This section is removed as per the edit hint. */}
    </header>
  );
};

export default Header;

// Helper to get current user email
export function getCurrentUserEmail() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('userEmail') || '';
  }
  return '';
} 