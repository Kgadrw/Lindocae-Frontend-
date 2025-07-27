"use client";
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Home, List, MapPin, Lock } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

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



async function fetchWishlistCountFromBackend() {
  if (typeof window === 'undefined') return 0;
  const token = localStorage.getItem('token');
  if (!token) return 0;
  try {
    // Use the correct endpoint for user wishlist
    const userId = (() => {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId || payload.id || payload._id || payload.user || null;
      } catch {
        return null;
      }
    })();
    if (!userId) return 0;
    const res = await fetch(`https://lindo-project.onrender.com/wishlist/getUserWishlistProducts/${userId}`, {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (res.status === 401) return 0;
    if (!res.ok) return 0;
    const data = await res.json();
    if (data && Array.isArray(data.products)) return data.products.length;
    return 0;
  } catch {
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

  // On mount, restore user from localStorage if available
  useEffect(() => {
    function handleStorage() {
      updateUser(setUser);
    }
    updateUser(setUser); // Only call here, not in render
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Cart count effect
  useEffect(() => {
    function updateCartCount() {
      if (typeof window !== 'undefined') {
        const email = localStorage.getItem('userEmail');
        if (!email) {
          setCartCount(0);
          return;
        }
        const cartRaw = localStorage.getItem(`cart:${email}`);
        try {
          const cart = cartRaw ? JSON.parse(cartRaw) : [];
          setCartCount(Array.isArray(cart) ? cart.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0);
        } catch {
          setCartCount(0);
        }
      }
    }
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    return () => window.removeEventListener('storage', updateCartCount);
  }, []);

  useEffect(() => {
    async function updateWishlistCount() {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          const count = await fetchWishlistCountFromBackend();
          setWishlistCount(count);
          return;
        }
        const email = localStorage.getItem('userEmail');
        const wishlistRaw = localStorage.getItem(email ? `wishlist_${email}` : 'wishlist');
        try {
          const wishlist = wishlistRaw ? JSON.parse(wishlistRaw) : [];
          setWishlistCount(Array.isArray(wishlist) ? wishlist.length : 0);
        } catch {
          setWishlistCount(0);
        }
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
  const handleLoginSuccess = (name: string, avatar?: string, email?: string) => {
    setUser({ name, avatar });
    if (email) localStorage.setItem('userEmail', email);
    if (email && name) localStorage.setItem(`userName:${email}`, name);
    if (email && avatar) localStorage.setItem(`userAvatar:${email}`, avatar);
    // Update cart count after login
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        const cartRaw = localStorage.getItem(`cart:${email}`);
        try {
          const cart = cartRaw ? JSON.parse(cartRaw) : [];
          setCartCount(Array.isArray(cart) ? cart.reduce((sum, item) => sum + (item.quantity || 1), 0) : 0);
        } catch {
          setCartCount(0);
        }
      }
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

  return (
    <header className="w-full bg-white shadow-md sticky top-0 z-50">
      {/* Top Promo Bar */}
      {/* Mobile Search Bar (top, only on small screens) */}
      <div className="block md:hidden px-2 pt-1 pb-2 bg-white sticky top-0 z-50">
        {/* Location Display */}
        <div className="flex items-center justify-center gap-2 text-black text-xs font-medium mb-2">
          <div className="flex items-center gap-1">
            <MapPin size={14} color="#000000" />
            <span>Rwanda</span>
          </div>
          <span>RWF</span>
        </div>
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
              className="w-full rounded-full border text-gray-900 border-[#FFE600] px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-[#FFE600] text-sm shadow placeholder:text-[#2056A7]"
              onKeyDown={e => { if (e.key === 'Enter') handleSearch(e); }}
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#FFE600] text-white p-1 rounded-full cursor-pointer" aria-label="Search">
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
          <nav className="flex gap-2 ml-4">
            {(propCategories.length > 4
              ? [
                  ...propCategories.slice(0, 4).map(cat => (
                    <button
                      key={cat._id || cat.name}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer ${highlightActive && selectedCategoryId === cat._id ? 'text-yellow-600 underline' : 'text-gray-700 hover:text-blue-700'}`}
                      onClick={() => onCategoryClick && onCategoryClick(cat)}
                      type="button"
                    >
                      {cat.name}
                    </button>
                  )),
                  <button
                    key="more"
                    className="px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer text-gray-700 hover:text-blue-700"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        localStorage.removeItem('selectedCategoryId');
                      }
                      window.location.href = '/all-products';
                    }}
                    type="button"
                  >
                    More &gt;
                  </button>
                ]
              : propCategories.map(cat => (
                  <button
                    key={cat._id || cat.name}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer ${highlightActive && selectedCategoryId === cat._id ? 'text-yellow-600 underline' : 'text-gray-700 hover:text-blue-700'}`}
                    onClick={() => onCategoryClick && onCategoryClick(cat)}
                    type="button"
                  >
                    {cat.name}
                  </button>
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
      <nav className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-200 ${navOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden`}>
        <button className="absolute top-4 right-4 p-2" onClick={() => setNavOpen(false)} aria-label="Close navigation">✕</button>
        <div className="flex flex-col mt-12">
          {loading ? (
            <span className="text-gray-400 animate-pulse px-4 py-3">Loading categories...</span>
          ) : (propCategories && propCategories.length > 0) ? propCategories.map(cat => (
            <Link key={cat._id || cat.name} href={`/category/${encodeURIComponent(cat.name)}`} className="block hover:text-gray-200 px-4 py-3 text-black text-base font-semibold border-b border-gray-100 last:border-b-0" onClick={() => setNavOpen(false)}>
              {cat.name}
            </Link>
          )) : null}
        </div>
      </nav>
      {/* Bottom Navigation Bar for Mobile */}
      <div className="fixed bottom-0 left-0 w-full bg-white shadow-t z-50 md:hidden flex justify-evenly items-center py-2 border-t border-gray-200 px-0.5">
        <Link href="/">
          <button className="flex flex-col items-center bg-[#2056A7] text-white hover:bg-[#FFE600] hover:text-[#2056A7] focus:bg-[#FFE600] focus:text-[#2056A7] rounded-full p-2 transition-colors">
            <Home size={24} color="#000000" strokeWidth={2.5} />
            <span className="text-xs">Home</span>
          </button>
        </Link>
        <button onClick={() => setNavOpen(true)} className="flex flex-col items-center bg-[#2056A7] text-white hover:bg-[#FFE600] hover:text-[#2056A7] focus:bg-[#FFE600] focus:text-[#2056A7] rounded-full p-2 transition-colors cursor-pointer">
          <List size={24} color="#000000" strokeWidth={2.5} className="cursor-pointer" />
          <span className="text-xs">Categories</span>
        </button>
        <Link href="/cart">
          <button className="flex flex-col items-center bg-[#FFE600] text-[#2056A7] hover:bg-[#2056A7] hover:text-white focus:bg-[#2056A7] focus:text-white rounded-full p-2 transition-colors relative cursor-pointer">
            <ShoppingCart size={24} color="#000000" strokeWidth={2.5} className="cursor-pointer" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-yellow-400 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center border-2 border-white shadow">
                {cartCount}
              </span>
            )}
            <span className="text-xs">Cart</span>
          </button>
        </Link>
        <Link href="/checkout">
          <button className="flex flex-col items-center bg-[#2056A7] text-white hover:bg-[#FFE600] hover:text-white rounded-full p-2 transition-colors cursor-pointer">
            <Lock size={24} color="#000000" strokeWidth={2.5} className="cursor-pointer" />
            <span className="ml-2 text-xs">Checkout</span>
          </button>
        </Link>
        <Link href="/wishlist">
          <button className="flex flex-col items-center bg-[#FFE600] text-[#2056A7] hover:bg-[#2056A7] hover:text-white focus:bg-[#2056A7] focus:text-white rounded-full p-2 transition-colors relative cursor-pointer">
            <Heart size={24} color="#000000" strokeWidth={2.5} className="cursor-pointer" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-yellow-400 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center border-2 border-white shadow">
                {wishlistCount}
              </span>
            )}
            <span className="text-xs">Wishlist</span>
          </button>
        </Link>
          {user ? (
          <button onClick={() => setDropdownOpen(v => !v)} className="flex flex-col items-center bg-[#FFE600] text-[#2056A7] hover:bg-[#2056A7] hover:text-white focus:bg-[#2056A7] focus:text-white rounded-full p-2 transition-colors">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold border-2 border-gray-200">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs">Account</span>
          </button>
          ) : (
            <div className="flex flex-col items-center gap-0.5">
              <button
                className="px-2 py-0.5 rounded bg-[#2056A7] text-white text-[11px] font-semibold shadow hover:bg-[#FFE600] hover:text-[#2056A7] transition w-16"
                onClick={e => { e.stopPropagation(); setLoginMode('register'); setLoginOpen(true); }}
              >
                Create
              </button>
              <button
                className="px-2 py-0.5 rounded bg-[#FFE600] text-[#2056A7] text-[11px] font-semibold shadow hover:bg-[#2056A7] hover:text-white transition w-16"
                onClick={e => { e.stopPropagation(); setLoginMode('login'); setLoginOpen(true); }}
              >
                Sign In
              </button>
            <span className="text-xs">Account</span>
            </div>
          )}
        {/* User Dropdown/Tooltip Modal (mobile, absolute to bottom) */}
        {dropdownOpen && user && (
          <div ref={dropdownRef} className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 bg-white rounded-2xl shadow-2xl p-0 w-64 flex flex-col border border-gray-200 animate-fade-in md:hidden" style={{ minWidth: 200 }}>
            <div className="flex flex-col items-start pt-4 pb-1 px-4 border-b border-gray-100">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold border-2 border-gray-200 mb-1">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-semibold text-gray-900 text-sm mb-1">Welcome back, {user.name}</span>
              {/* Remove Sign Out button, keep only Logout below */}
            </div>
            <div className="flex flex-col gap-0.5 py-1 px-1">
              <div className="border-t border-gray-100 my-1" />
              <button onMouseDown={handleSignOut} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-red-50 text-red-600 text-xs font-medium w-full text-left">
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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