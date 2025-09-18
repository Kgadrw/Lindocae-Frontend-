"use client";
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Home, List, MapPin, Lock } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import {
  fetchUserCart,
  fetchUserWishlist,
  fetchUserWishlistWithFallback,
  getLocalCart,
  getLocalWishlist,
  isUserLoggedIn
} from '../utils/serverStorage';
import { normalizeImageUrl } from '../utils/image';




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
// Safe helpers for user info
function getLoggedInUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("userId") || null;
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token") || null;
}

// Fixed wishlist fetch function
async function fetchWishlistCountFromBackend() {
  if (typeof window === "undefined") return 0;

  try {
    if (isUserLoggedIn()) {
      const userId = getLoggedInUserId();
      if (!userId) return 0;

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!baseUrl) {
        console.error("❌ API base URL is missing. Set NEXT_PUBLIC_API_BASE_URL in .env.local");
        return 0;
      }

      const token = getAuthToken();

      const response = await fetch(
        `${baseUrl}/wishlist/getUserWishlistProducts/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}), // add auth only if token exists
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch wishlist: ${response.status}`);
      }

      const wishlist = await response.json();
      return Array.isArray(wishlist) ? wishlist.length : 0;
    } else {
      // Guest: from localStorage
      const localWishlist = getLocalWishlist();
      return localWishlist.length;
    }
  } catch (error) {
    console.error("Error fetching wishlist count:", error);

    // Fallback for logged-in users
    if (isUserLoggedIn()) {
      try {
        const localWishlist = getLocalWishlist();
        console.log("⚠️ Falling back to local wishlist storage");
        return localWishlist.length;
      } catch (localError) {
        console.error("Local wishlist fallback also failed:", localError);
        return 0;
      }
    }

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
  
  // Mobile scroll behavior states
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [hideNavbar, setHideNavbar] = useState(false);

  // Professional mobile scroll detection - simpler and cleaner
  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Basic scroll state
      setIsScrolled(currentScrollY > 10);
      
      // Professional header behavior - always show search when scrolled
      if (currentScrollY > 80) {
        setShowMobileSearch(true);
      } else {
        setShowMobileSearch(false);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

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

  // Cart count effect - schedule after first paint for faster TTI
  useEffect(() => {
    async function updateCartCount() {
      if (typeof window !== 'undefined') {
        const count = await fetchCartCountFromBackend();
        setCartCount(count);
      }
    }
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(updateCartCount, { timeout: 1000 });
    } else {
      setTimeout(updateCartCount, 150);
    }
    const handleCartUpdated = (evt: Event) => {
      // Optimistic update for snappy UX
      try {
        const e = evt as CustomEvent;
        const detail: any = e.detail || {};
        if (detail?.type === 'add' || detail?.type === 'increase') {
          const delta = Number(detail?.quantity || 1);
          setCartCount(prev => Math.max(0, prev + (isFinite(delta) ? delta : 1)));
        } else if (detail?.type === 'decrease') {
          const delta = Number(detail?.quantity || 1);
          setCartCount(prev => Math.max(0, prev - (isFinite(delta) ? delta : 1)));
        } else if (detail?.type === 'remove' || detail?.type === 'clear') {
          // We don't know exact delta; fall through to fetch
        }
      } catch {}
      // Reconcile with backend shortly after
      setTimeout(() => { updateCartCount(); }, 100);
    };
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cart-updated', handleCartUpdated as EventListener);
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cart-updated', handleCartUpdated as EventListener);
    };
  }, []);

  useEffect(() => {
    async function updateWishlistCount() {
      if (typeof window !== 'undefined') {
        try {
        const count = await fetchWishlistCountFromBackend();
        setWishlistCount(count);
        } catch (error) {
          console.error('Error updating wishlist count:', error);
          // Set wishlist count to 0 on error to prevent UI issues
          setWishlistCount(0);
        }
      }
    }
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(updateWishlistCount, { timeout: 1000 });
    } else {
      setTimeout(updateWishlistCount, 150);
    }
    const handleWishlistUpdate = () => updateWishlistCount();
    window.addEventListener('storage', handleWishlistUpdate);
    window.addEventListener('wishlist-updated', handleWishlistUpdate);
    return () => {
      window.removeEventListener('storage', handleWishlistUpdate);
      window.removeEventListener('wishlist-updated', handleWishlistUpdate);
    };
  }, []);

  // Fetch all products and categories lazily to avoid blocking initial render
  useEffect(() => {
    const lazyFetch = () => {
      fetch('https://lindo-project.onrender.com/product/getAllProduct')
        .then(res => res.json())
        .then(data => {
          let prods = [];
          if (Array.isArray(data)) prods = data;
          else if (data && Array.isArray(data.products)) prods = data.products;
          setAllProducts(prods.map((p:any) => ({ id: p.id || p._id, name: p.name })));
        }).catch(() => {});
      fetch('https://lindo-project.onrender.com/category/getAllCategories')
        .then(res => res.json())
        .then(data => {
          let cats = [];
          if (Array.isArray(data)) cats = data;
          else if (data && Array.isArray(data.categories)) cats = data.categories;
          setAllCategories(cats.map((c:any) => ({ _id: c._id, name: c.name })));
        }).catch(() => {});
    };
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(lazyFetch, { timeout: 1500 });
    } else {
      setTimeout(lazyFetch, 300);
    }
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
      const cat = allCategories.find(
        c => c.name.toLowerCase() === search.trim().toLowerCase()
      );
      if (cat) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('selectedCategoryId', cat._id || '');
        }
        // Pass categoryId in URL so all-products can filter
        router.push(`/all-products?category=${encodeURIComponent(cat._id || '')}`);
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
      const prodMatches = allProducts
        .filter(p => p.name.toLowerCase().includes(value.toLowerCase()))
        .map(p => ({
          type: 'product' as const,
          id: p.id,
          name: p.name
        }));
  
      const catMatches = allCategories
        .filter(c => c.name.toLowerCase().includes(value.toLowerCase()))
        .map(c => ({
          type: 'category' as const,
          id: c._id,
          name: c.name
        }));
  
      const filtered = [...catMatches, ...prodMatches].slice(0, 7);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };
  
  const handleSuggestionClick = (
    name: string,
    type: 'product' | 'category',
    id: string
  ) => {
    setSearch(name);
    setShowSuggestions(false);
    if (type === 'category') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedCategoryId', id || '');
      }
      router.push(`/all-products?category=${encodeURIComponent(id || '')}`);
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
    highlightActive =
      path.startsWith('/all-products') || path.startsWith('/category');
    selectedCategoryId = highlightActive
      ? localStorage.getItem('selectedCategoryId') || ''
      : '';
  }
  
  // Fetch products for a specific category (kept same)
  const fetchCategoryProducts = async (categoryId: string) => {
    if (categoryProducts[categoryId]) return; // Already loaded
  
    setLoadingCategoryProducts(prev => ({ ...prev, [categoryId]: true }));
    try {
      const res = await fetch(
        `https://lindo-project.onrender.com/product/getProductsByCategory/${categoryId}`
      );
      if (res.ok) {
        const data = await res.json();
        let prods = [];
        if (Array.isArray(data)) prods = data;
        else if (data && Array.isArray(data.products)) prods = data.products;
        setCategoryProducts(prev => ({
          ...prev,
          [categoryId]: prods.slice(0, 8)
        })); // Limit to 8 products
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
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(categoryId);
      setShowCategoryDropdown(categoryId);
      if (!categoryProducts[categoryId] && !loadingCategoryProducts[categoryId]) {
        fetchCategoryProducts(categoryId);
      }
    }, 200);
  };
  
  
  const handleCategoryLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
      setShowCategoryDropdown(null);
    }, 100);
  };
  
  const handleDropdownHover = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };
  
  const handleDropdownLeave = () => {
    setHoveredCategory(null);
    setShowCategoryDropdown(null);
  };

  
  
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);
  

  return (
    <header className="w-full bg-white border-b px-2  border-gray-200 sticky top-0 z-50">
      {/* Top Promo Bar */}
      {/* Simple Modern Mobile Header - Fixed */}
      <div className="block md:hidden bg-white border-b border-gray-100">
        {/* Main Header Row */}
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/lindo.png"
              alt="Lindo Logo"
              width={100}
              height={40}
              className="focus:outline-none hover:opacity-80 transition-opacity"
              style={{ width: 'auto', height: 'auto' }}
            />
          </Link>
          
          {/* Action Icons */}
          <div className="flex items-center gap-2">
            {/* Wishlist */}
            <Link href="/wishlist">
              <button className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <Heart size={22} className="stroke-gray-600" strokeWidth={2} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </button>
            </Link>
            
            {/* Cart */}
            <Link href="/cart">
              <button className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <ShoppingCart size={22} className="stroke-gray-600" strokeWidth={2} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
            </Link>
            
            {/* User */}
            {user ? (
              <button
                onClick={() => setDropdownOpen(v => !v)}
                className="p-1 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </button>
            ) : (
              <Link href="/login">
                <button className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                  Login
                </button>
              </Link>
            )}
            
            {/* Menu */}
            <button
              onClick={() => setNavOpen(true)}
              className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
              aria-label="Menu"
            >
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-600">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Fixed Search Bar */}
        <div className="px-4 pb-3">
          <form onSubmit={handleSearch} autoComplete="off">
            <div className="relative flex items-center bg-gray-50 rounded-xl border border-gray-200 focus-within:border-blue-500 focus-within:bg-white transition-all">
              <input
                type="text"
                value={search}
                onChange={handleInputChange}
                onFocus={() => { if (search) setShowSuggestions(true); }}
                onBlur={handleBlur}
                ref={searchInputRef}
                placeholder="Search for baby products..."
                className="w-full bg-transparent text-gray-900 px-4 py-3 pr-12 focus:outline-none text-sm placeholder:text-gray-500 rounded-xl"
                onKeyDown={e => { if (e.key === 'Enter') handleSearch(e); }}
              />
              <button 
                type="submit" 
                className="absolute right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                aria-label="Search"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
              </button>
            </div>
          </form>

          {showSuggestions && (
            <ul className="absolute left-4 right-4 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
              {suggestions.map(s => (
                <li
                  key={s.type + '-' + s.id + '-' + s.name}
                  className="px-4 py-3 cursor-pointer hover:bg-gray-50 text-gray-900 flex items-center gap-3 border-b border-gray-50 last:border-b-0"
                  onMouseDown={() => handleSuggestionClick(s.name, s.type, String(s.id || ''))}
                >
                  <div className={`w-2 h-2 rounded-full ${s.type === 'category' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                  <div className="flex-1">
                    <span className="text-sm font-medium">{s.name}</span>
                    <div className="text-xs text-gray-400">{s.type === 'category' ? 'Category' : 'Product'}</div>
                  </div>
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
                        className={`px-3 py-2 rounded-md text-sm font-medium  transition-colors duration-200 cursor-pointer ${highlightActive && selectedCategoryId === cat._id ? 'text-yellow-600 underline' : 'text-gray-700 hover:text-blue-700'}`}
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
                                      src={normalizeImageUrl(product.image)} 
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
                                    src={normalizeImageUrl(product.image)}
                                    loading="lazy"
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
            <form onSubmit={handleSearch} autoComplete="off" className="relative">
  {/* Gradient border: blue shades */}
  <div className="p-[1px] rounded-full bg-gradient-to-r from-blue-500 via-blue-700 to-blue-500">
    <div className="relative flex items-center bg-white rounded-full">
      <input
        type="text"
        value={search}
        onChange={handleInputChange}
        onFocus={() => { if (search) setShowSuggestions(true); }}
        onBlur={handleBlur}
        ref={searchInputRef}
        placeholder="Find babycare essentials..."
        className="w-full rounded-full bg-white text-blue-700 px-4 py-2 pr-28 focus:outline-none text-base
                   placeholder:text-gray-500 bg-clip-text"
        style={{
          backgroundImage: 'linear-gradient(to right, #3B82F6, #1D4ED8, #3B82F6)' // blue-500 → blue-700 → blue-500
        }}
        onKeyDown={e => { if (e.key === 'Enter') handleSearch(e); }}
      />

      <button
        type="submit"
        className="absolute right-1 top-1/2 -translate-y-1/2 bg-blue-700 text-white px-3 py-1 rounded-full cursor-pointer flex items-center space-x-1 transition-all duration-300 overflow-hidden max-w-[40px] hover:max-w-[120px]"
        aria-label="Search"
      >
        <svg
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          className="flex-shrink-0"
        >
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </svg>
        <span className="opacity-0 hover:opacity-100 whitespace-nowrap transition-opacity duration-300">
          Search
        </span>
      </button>
    </div>
  </div>
</form>

            {showSuggestions && (
              <ul className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                {suggestions.map(s => (
                  <li
                    key={s.type + '-' + s.id + '-' + s.name}
                    className="px-4 py-2 cursor-pointer hover:bg-yellow-600 text-gray-900 flex items-center gap-2"
                    onMouseDown={() => handleSuggestionClick(s.name, s.type, String(s.id || ''))}
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
          <div className="flex items-center gap-1 text-sm font-medium text-black group cursor-pointer">
  <MapPin
    size={16}
    className="stroke-white fill-blue-600 transition-colors group-hover:stroke-white group-hover:fill-blue-800"
  />
  <span className="transition-colors cursor-pointer">Rwanda</span>
</div>

{/* Currency */}
<div className="text-black text-sm font-medium">RWF</div>

          {/* Wishlist */}
          {/* Wishlist */}
<Link href="/wishlist">
  <button
    aria-label="Wishlist"
    className="rounded-full p-2 transition-colors flex flex-col items-center relative cursor-pointer group"
  >
    <Heart
      size={22}
      strokeWidth={2.5}
      className={`cursor-pointer transition-colors ${
        pathname === '/wishlist'
          ? 'stroke-blue-600 fill-blue-600'
          : 'stroke-black fill-none group-hover:stroke-blue-600 group-hover:fill-blue-600'
      }`}
    />
    {wishlistCount > 0 && (
      <span className="absolute -top-1 -right-1 bg-yellow-400 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center border-2 border-white shadow">
        {wishlistCount}
      </span>
    )}
  </button>
</Link>

{/* Cart */}
<Link href="/cart">
  <button
    aria-label="Cart"
    className="rounded-full p-2 transition-colors flex flex-col items-center relative cursor-pointer group"
  >
    <ShoppingCart
      size={22}
      strokeWidth={2.5}
      className={`cursor-pointer transition-colors ${
        pathname === '/cart'
          ? 'stroke-blue-600 fill-blue-600'
          : 'stroke-black fill-none group-hover:stroke-blue-600 group-hover:fill-blue-600'
      }`}
    />
    {cartCount > 0 && (
      <span className="absolute -top-1 -right-1 bg-yellow-400 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center border-2 border-white shadow">
        {cartCount}
      </span>
    )}
  </button>
</Link>

{/* Checkout */}
<Link href="/checkout">
  <button
    aria-label="Checkout"
    className="rounded-full p-2 transition-colors flex flex-col items-center cursor-pointer group"
  >
    <Lock
      size={22}
      strokeWidth={2.5}
      className={`cursor-pointer transition-colors ${
        pathname === '/checkout'
          ? 'stroke-blue-600 fill-blue-600'
          : 'stroke-black fill-none group-hover:stroke-blue-600 group-hover:fill-blue-600'
      }`}
    />
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
            
            
          </div>
          </div>
   

                
              </nav>
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

