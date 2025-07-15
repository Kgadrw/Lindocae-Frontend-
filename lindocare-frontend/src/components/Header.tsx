"use client";
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, User, Home, List, ChevronDown, MessageCircle, CreditCard, Tag, Settings, HelpCircle, Accessibility, LogIn, Coins } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import LoginModal from './LoginModal';
import GuideTooltip from './GuideTooltip';

const iconColor = "#222";
const activeColor = "#F4E029";

// Add template products for suggestions
// Remove template productsData

// Move updateUser outside so it can be called from anywhere
function updateUser(setUser: React.Dispatch<React.SetStateAction<null | { name: string; avatar?: string }>>) {
  if (typeof window !== 'undefined') {
    const email = localStorage.getItem('userEmail');
    let name = '';
    let avatar = '';
    if (email) {
      name = localStorage.getItem(`userName:${email}`) || '';
      avatar = localStorage.getItem(`userAvatar:${email}`) || '';
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

// 1. Accept categories as a prop
const Header = ({ categories: propCategories, loading }: { categories?: { _id?: string; name: string }[], loading?: boolean }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [loginOpen, setLoginOpen] = useState(false);
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
  React.useEffect(() => {
    function handleStorage() {
      updateUser(setUser);
    }
    updateUser(setUser);
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
    setLoginOpen(false);
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
  const handleDropdownAction = (action: () => void) => {
    setDropdownOpen(false);
    action();
  };

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
    updateUser(setUser);
    router.push('/');
  };

  const handleSearch = (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (search.trim()) {
      // If matches a category, go to category page
      const cat = allCategories.find(c => c.name.toLowerCase() === search.trim().toLowerCase());
      if (cat) {
        router.push(`/category/${encodeURIComponent(cat.name)}`);
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
      const prodMatches = allProducts.filter(p => p.name.toLowerCase().includes(value.toLowerCase())).map(p => ({ type: 'product', id: p.id, name: p.name }));
      const catMatches = allCategories.filter(c => c.name.toLowerCase().includes(value.toLowerCase())).map(c => ({ type: 'category', id: c._id, name: c.name }));
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

  return (
    <header className="w-full bg-white shadow-md sticky top-0 z-50">
      {/* Top Promo Bar */}
      <div className="w-full bg-yellow-400 text-blue-900 text-center text-xs py-1 font-medium">
        On orders over $49.99 <a href="#" className="underline ml-1">Learn More</a>
      </div>
      {/* Mobile Search Bar (top, only on small screens) */}
      <div className="block md:hidden px-2 pt-2 pb-4 bg-white sticky top-0 z-50">
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
              className="w-full rounded-full border text-blue-900 border-yellow-300 px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-yellow-300 text-sm shadow"
              onKeyDown={e => { if (e.key === 'Enter') handleSearch(e); }}
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-yellow-500 p-1" aria-label="Search">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </button>
          </form>
          {showSuggestions && (
            <ul className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
              {suggestions.map(s => (
                <li
                  key={s.type + '-' + s.id + '-' + s.name}
                  className="px-4 py-2 cursor-pointer hover:bg-blue-50 text-blue-900 flex items-center gap-2"
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
      <div className="hidden md:flex items-center justify-between px-2 py-2 gap-2 md:px-4 md:py-2">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href="/">
            <Image src="/lindo.png" alt="Lindo Logo" width={110} height={44} priority className="focus:outline-none" style={{ width: 110, height: 'auto' }} />
          </Link>
        </div>
        {/* Search Bar (desktop only) */}
        <div className="hidden md:flex flex-1 justify-center max-w-xl w-full md:mx-4">
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
                className="w-full rounded-full border text-blue-900 border-yellow-300 px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-yellow-300 text-base"
                onKeyDown={e => { if (e.key === 'Enter') handleSearch(e); }}
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-yellow-500 p-1" aria-label="Search">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              </button>
            </form>
            {showSuggestions && (
              <ul className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                {suggestions.map(s => (
                  <li
                    key={s.type + '-' + s.id + '-' + s.name}
                    className="px-4 py-2 cursor-pointer hover:bg-blue-50 text-blue-900 flex items-center gap-2"
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
          {/* Wishlist */}
          <Link href="/wishlist">
            <button
              aria-label="Wishlist"
              className={`hover:bg-gray-100 active:bg-gray-200 rounded-full p-2 transition-colors flex flex-col items-center relative ${pathname === '/wishlist' ? 'underline decoration-yellow-400' : ''}`}
              style={{ color: pathname === '/wishlist' ? activeColor : iconColor }}
            >
              <Heart size={22} color={pathname === '/wishlist' ? activeColor : iconColor} strokeWidth={2.5} fill={pathname === '/wishlist' ? activeColor : iconColor} />
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
              className={`hover:bg-gray-100 active:bg-gray-200 rounded-full p-2 transition-colors flex flex-col items-center relative ${pathname === '/cart' ? 'underline decoration-yellow-400' : ''}`}
              style={{ color: pathname === '/cart' ? activeColor : iconColor }}
            >
              <ShoppingCart size={22} color={pathname === '/cart' ? activeColor : iconColor} strokeWidth={2.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center border-2 border-white shadow">
                  {cartCount}
                </span>
              )}
            </button>
          </Link>
          {/* User */}
          <div className="relative">
            <button
              aria-label="User"
              className={`hover:bg-gray-100 active:bg-gray-200 rounded-full p-2 transition-colors flex flex-col items-center ${pathname === '/account' ? 'underline decoration-yellow-400' : ''}`}
              style={{ color: pathname === '/account' ? activeColor : iconColor }}
              onClick={() => user ? setDropdownOpen(v => !v) : setLoginOpen(true)}
            >
              {user ? (
                <Image src={user.avatar || "/lindo.png"} alt="avatar" className="w-8 h-8 rounded-full object-cover border-2 border-yellow-400" width={32} height={32} style={{ width: 32, height: 'auto' }} />
              ) : (
                <User size={22} color={pathname === '/account' ? activeColor : iconColor} strokeWidth={2.5} fill={pathname === '/account' ? activeColor : iconColor} />
              )}
            </button>
            <GuideTooltip />
          </div>
          {/* User Dropdown/Tooltip Modal (image UI) */}
          {dropdownOpen && user && (
            <div ref={dropdownRef} className="absolute right-0 top-14 z-50 bg-white rounded-2xl shadow-2xl p-0 w-72 flex flex-col border border-yellow-200 animate-fade-in" style={{ minWidth: 260 }}>
              <div className="flex flex-col items-center pt-6 pb-2 px-6 border-b border-gray-100">
                <Image src={user.avatar || "/lindo.png"} alt="avatar" className="w-12 h-12 rounded-full object-cover border-2 border-yellow-400 mb-2" width={48} height={48} style={{ width: 48, height: 'auto' }} />
                <span className="font-semibold text-blue-900 text-base mb-1">Welcome back, {user.name}</span>
                <button onMouseDown={handleSignOut} className="text-blue-600 font-semibold text-sm hover:underline mb-2">Sign Out</button>
              </div>
              <div className="flex flex-col gap-1 py-2 px-2">
                <Link href="/orders" onMouseDown={e => { e.preventDefault(); handleDropdownAction(() => router.push('/orders')); }} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 text-blue-900 text-sm font-medium"><List size={18} color="#F4E029" /> My Orders</Link>
                <Link href="/coins" onMouseDown={e => { e.preventDefault(); handleDropdownAction(() => router.push('/coins')); }} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 text-blue-900 text-sm font-medium"><Coins size={18} color="#F4E029" /> My Coins</Link>
                <Link href="/messages" onMouseDown={e => { e.preventDefault(); handleDropdownAction(() => router.push('/messages')); }} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 text-blue-900 text-sm font-medium"><MessageCircle size={18} color="#F4E029" /> Message Center</Link>
                <Link href="/payments" onMouseDown={e => { e.preventDefault(); handleDropdownAction(() => router.push('/payments')); }} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 text-blue-900 text-sm font-medium"><CreditCard size={18} color="#F4E029" /> Payments</Link>
                <Link href="/wishlist" onMouseDown={e => { e.preventDefault(); handleDropdownAction(() => router.push('/wishlist')); }} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 text-blue-900 text-sm font-medium"><Heart size={18} color="#F4E029" /> Wish list</Link>
                <Link href="/coupons" onMouseDown={e => { e.preventDefault(); handleDropdownAction(() => router.push('/coupons')); }} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 text-blue-900 text-sm font-medium"><Tag size={18} color="#F4E029" /> My coupon</Link>
                <div className="border-t border-gray-100 my-2" />
                <Link
                  href="/settings"
                  onMouseDown={e => {
                    e.preventDefault();
                    handleDropdownAction(() => router.push('/settings'));
                  }}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 text-blue-900 text-sm font-medium"
                >
                  <Settings size={18} color="#F4E029" /> Settings
                </Link>
                <Link href="/help" onMouseDown={e => { e.preventDefault(); handleDropdownAction(() => router.push('/help')); }} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 text-blue-900 text-sm font-medium"><HelpCircle size={18} color="#F4E029" /> Help center</Link>
                <Link href="/accessibility" onMouseDown={e => { e.preventDefault(); handleDropdownAction(() => router.push('/accessibility')); }} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 text-blue-900 text-sm font-medium"><Accessibility size={18} color="#F4E029" /> Accessibility</Link>
                <Link href="/seller-login" onMouseDown={e => { e.preventDefault(); handleDropdownAction(() => router.push('/seller-login')); }} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 text-blue-900 text-sm font-medium"><LogIn size={18} color="#F4E029" /> Seller Login</Link>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Desktop Navigation Links */}
      <nav className="hidden md:flex flex-wrap border-t border-gray-300 justify-center gap-4 py-2 text-gray-700 text-sm font-semibold">
        {loading ? (
          <span className="text-blue-400 animate-pulse">Loading categories...</span>
        ) : (propCategories && propCategories.length > 0) ? propCategories.map(cat => (
          <Link key={cat._id || cat.name} href={`/category/${encodeURIComponent(cat.name)}`} className="hover:text-yellow-500 font-semibold">
            {cat.name}
          </Link>
        )) : null}
      </nav>
      {/* Mobile Nav Drawer */}
      <div className={`fixed inset-0 z-40 bg-black bg-opacity-30 transition-opacity duration-200 ${navOpen ? 'block md:hidden' : 'hidden'}`} onClick={() => setNavOpen(false)} />
      <nav className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-200 ${navOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden`}>
        <button className="absolute top-4 right-4 p-2" onClick={() => setNavOpen(false)} aria-label="Close navigation">✕</button>
        <div className="flex flex-col mt-12">
          {loading ? (
            <span className="text-blue-400 animate-pulse px-4 py-3">Loading categories...</span>
          ) : (propCategories && propCategories.length > 0) ? propCategories.map(cat => (
            <Link key={cat._id || cat.name} href={`/category/${encodeURIComponent(cat.name)}`} className="block hover:text-yellow-500 px-4 py-3 text-[#3B82F6] text-base font-semibold border-b border-gray-100 last:border-b-0" onClick={() => setNavOpen(false)}>
              {cat.name}
            </Link>
          )) : null}
        </div>
      </nav>
      {/* Bottom Navigation Bar for Mobile */}
      <div className="fixed bottom-0 left-0 w-full bg-white shadow-t z-50 md:hidden flex justify-evenly items-center py-2 border-t border-gray-200 px-0.5">
        <Link href="/">
          <button className="flex flex-col items-center text-gray-700 hover:text-yellow-500 focus:text-yellow-500">
            <Home size={24} />
            <span className="text-xs">Home</span>
          </button>
        </Link>
        <button onClick={() => setNavOpen(true)} className="flex flex-col items-center text-gray-700 hover:text-yellow-500 focus:text-yellow-500">
          <List size={24} />
          <span className="text-xs">Categories</span>
        </button>
        <Link href="/cart">
          <button className="flex flex-col items-center text-gray-700 hover:text-yellow-500 focus:text-yellow-500 relative">
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-yellow-400 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center border-2 border-white shadow">
                {cartCount}
              </span>
            )}
            <span className="text-xs">Cart</span>
          </button>
        </Link>
        <Link href="/wishlist">
          <button className="flex flex-col items-center text-gray-700 hover:text-yellow-500 focus:text-yellow-500 relative">
            <Heart size={24} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-yellow-400 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center border-2 border-white shadow">
                {wishlistCount}
              </span>
            )}
            <span className="text-xs">Wishlist</span>
          </button>
        </Link>
        <button onClick={() => user ? setDropdownOpen(v => !v) : setLoginOpen(true)} className="flex flex-col items-center text-gray-700 hover:text-yellow-500 focus:text-yellow-500">
          {user ? (
            <Image src={user.avatar || "/lindo.png"} alt="avatar" className="w-8 h-8 rounded-full object-cover border-2 border-yellow-400" width={32} height={32} style={{ width: 32, height: 'auto' }} />
          ) : (
            <User size={24} />
          )}
          <span className="text-xs">Account</span>
        </button>
        {/* User Dropdown/Tooltip Modal (mobile, absolute to bottom) */}
        {dropdownOpen && user && (
          <div ref={dropdownRef} className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 bg-white rounded-2xl shadow-2xl p-0 w-64 flex flex-col border border-yellow-200 animate-fade-in md:hidden" style={{ minWidth: 200 }}>
            <div className="flex flex-col items-start pt-4 pb-1 px-4 border-b border-gray-100">
              <Image src={user.avatar || "/lindo.png"} alt="avatar" className="w-9 h-9 rounded-full object-cover border-2 border-yellow-400 mb-1" width={36} height={36} style={{ width: 36, height: 'auto' }} />
              <span className="font-semibold text-blue-900 text-sm mb-1">Welcome back, {user.name}</span>
              <button onMouseDown={handleSignOut} className="text-blue-600 font-semibold text-xs hover:underline mb-1">Sign Out</button>
            </div>
            <div className="flex flex-col gap-0.5 py-1 px-1">
              <Link href="/orders" onMouseDown={e => { e.preventDefault(); handleDropdownAction(() => router.push('/orders')); }} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-blue-50 text-blue-900 text-xs font-medium"><List size={15} color="#F4E029" /> My Orders</Link>
              <Link href="/coins" onMouseDown={e => { e.preventDefault(); handleDropdownAction(() => router.push('/coins')); }} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-blue-50 text-blue-900 text-xs font-medium"><Coins size={15} color="#F4E029" /> My Coins</Link>
              <Link href="/messages" onMouseDown={e => { e.preventDefault(); handleDropdownAction(() => router.push('/messages')); }} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-blue-50 text-blue-900 text-xs font-medium"><MessageCircle size={15} color="#F4E029" /> Message Center</Link>
              <Link href="/payments" onMouseDown={e => { e.preventDefault(); handleDropdownAction(() => router.push('/payments')); }} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-blue-50 text-blue-900 text-xs font-medium"><CreditCard size={15} color="#F4E029" /> Payments</Link>
              <Link href="/wishlist" onMouseDown={e => { e.preventDefault(); handleDropdownAction(() => router.push('/wishlist')); }} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-blue-50 text-blue-900 text-xs font-medium"><Heart size={15} color="#F4E029" /> Wish list</Link>
              <Link href="/coupons" onMouseDown={e => { e.preventDefault(); handleDropdownAction(() => router.push('/coupons')); }} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-blue-50 text-blue-900 text-xs font-medium"><Tag size={15} color="#F4E029" /> My coupon</Link>
              <Link href="/help" onMouseDown={e => { e.preventDefault(); handleDropdownAction(() => router.push('/help')); }} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-blue-50 text-blue-900 text-xs font-medium"><HelpCircle size={15} color="#F4E029" /> Help center</Link>
              <Link href="/accessibility" onMouseDown={e => { e.preventDefault(); handleDropdownAction(() => router.push('/accessibility')); }} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-blue-50 text-blue-900 text-xs font-medium"><Accessibility size={15} color="#F4E029" /> Accessibility</Link>
              <Link href="/seller-login" onMouseDown={e => { e.preventDefault(); handleDropdownAction(() => router.push('/seller-login')); }} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-blue-50 text-blue-900 text-xs font-medium"><LogIn size={15} color="#F4E029" /> Seller Login</Link>
            </div>
          </div>
        )}
      </div>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onLoginSuccess={handleLoginSuccess} />
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