"use client";
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, User, Globe, Menu, Home, List, ChevronDown, MessageCircle, CreditCard, Tag, Settings, HelpCircle, Accessibility, LogIn, Coins } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import LoginModal from './LoginModal';

const iconColor = "#222";
const activeColor = "#F4E029";

// Template categories for header (replace with API data later)
const headerCategories = [
  'Cribs',
  'Changing Tables',
  'Rocking Chairs',
  'Baby Dressers',
  'Playpens & Playards',
  'Baby Furniture',
  'Nursery',
  'Apparel',
  'Toys',
  'Bath & Skincare',
  'Safety',
  'Maternity',
  'Gifts',
];

// Add template products for suggestions
const productsData = [
  { id: 1, name: 'Sorelle Natural Pinewood Crib' },
  { id: 2, name: 'Premium Changing Table' },
  { id: 3, name: 'Comfort Rocking Chair' },
  { id: 4, name: 'Baby Dresser & Changer' },
  { id: 5, name: 'Portable Baby Playpen' },
  { id: 6, name: 'Organic Crib Mattress' },
];

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [loginOpen, setLoginOpen] = useState(false);
  const [user, setUser] = useState<null | { name: string; avatar?: string }>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [navOpen, setNavOpen] = useState(false);
  const [languageModalOpen, setLanguageModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const globeRef = useRef<HTMLButtonElement>(null);
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<{id:number, name:string}[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [cartCount, setCartCount] = useState(0);

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
    function updateUser() {
      if (typeof window !== 'undefined') {
        const email = localStorage.getItem('userEmail');
        let name = '';
        let avatar = '';
        if (email) {
          name = localStorage.getItem(`userName:${email}`) || '';
          avatar = localStorage.getItem(`userAvatar:${email}`) || '';
        }
        if (name && avatar) setUser({ name, avatar });
        else if (name) setUser({ name, avatar: undefined });
        else setUser(null);
      }
    }
    updateUser();
    window.addEventListener('storage', updateUser);
    return () => window.removeEventListener('storage', updateUser);
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
  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('userEmail');
  };

  const handleSearch = (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    if (value.trim()) {
      const filtered = productsData.filter(p => p.name.toLowerCase().includes(value.toLowerCase())).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (name: string) => {
    setSearch(name);
    router.push(`/search?q=${encodeURIComponent(name)}`);
    setShowSuggestions(false);
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
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-yellow-500 p-1" aria-label="Search">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </button>
          </form>
          {showSuggestions && (
            <ul className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
              {suggestions.map(s => (
                <li
                  key={s.id}
                  className="px-4 py-2 cursor-pointer hover:bg-blue-50 text-blue-900"
                  onMouseDown={() => handleSuggestionClick(s.name)}
                >
                  {s.name}
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
            <Image src="/lindo.png" alt="Lindo Logo" width={110} height={44} priority className="focus:outline-none" />
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
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-yellow-500 p-1" aria-label="Search">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              </button>
            </form>
            {showSuggestions && (
              <ul className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                {suggestions.map(s => (
                  <li
                    key={s.id}
                    className="px-4 py-2 cursor-pointer hover:bg-blue-50 text-blue-900"
                    onMouseDown={() => handleSuggestionClick(s.name)}
                  >
                    {s.name}
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
              className={`hover:bg-gray-100 active:bg-gray-200 rounded-full p-2 transition-colors flex flex-col items-center ${pathname === '/wishlist' ? 'underline decoration-yellow-400' : ''}`}
              style={{ color: pathname === '/wishlist' ? activeColor : iconColor }}
            >
              <Heart size={22} color={pathname === '/wishlist' ? activeColor : iconColor} strokeWidth={2.5} fill={pathname === '/wishlist' ? activeColor : iconColor} />
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
          <button
            aria-label="User"
            className={`hover:bg-gray-100 active:bg-gray-200 rounded-full p-2 transition-colors flex flex-col items-center ${pathname === '/account' ? 'underline decoration-yellow-400' : ''}`}
            style={{ color: pathname === '/account' ? activeColor : iconColor }}
            onClick={() => user ? setDropdownOpen(v => !v) : setLoginOpen(true)}
          >
            {user && user.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover border-2 border-yellow-400" />
            ) : (
              <User size={22} color={pathname === '/account' ? activeColor : iconColor} strokeWidth={2.5} fill={pathname === '/account' ? activeColor : iconColor} />
            )}
          </button>
          {/* User Dropdown/Tooltip Modal (image UI) */}
          {dropdownOpen && user && (
            <div ref={dropdownRef} className="absolute right-0 top-14 z-50 bg-white rounded-2xl shadow-2xl p-0 w-72 flex flex-col border border-yellow-200 animate-fade-in" style={{ minWidth: 260 }}>
              <div className="flex flex-col items-center pt-6 pb-2 px-6 border-b border-gray-100">
                <img src={user.avatar} alt="avatar" className="w-12 h-12 rounded-full object-cover border-2 border-yellow-400 mb-2" />
                <span className="font-semibold text-blue-900 text-base mb-1">Welcome back, {user.name}</span>
                <button onClick={handleSignOut} className="text-blue-600 font-semibold text-sm hover:underline mb-2">Sign Out</button>
              </div>
              <div className="flex flex-col gap-1 py-2 px-2">
                <Link href="/orders" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 text-blue-900 text-sm font-medium"><List size={18} color="#F4E029" /> My Orders</Link>
                <Link href="/coins" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 text-blue-900 text-sm font-medium"><Coins size={18} color="#F4E029" /> My Coins</Link>
                <Link href="/messages" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 text-blue-900 text-sm font-medium"><MessageCircle size={18} color="#F4E029" /> Message Center</Link>
                <Link href="/payments" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 text-blue-900 text-sm font-medium"><CreditCard size={18} color="#F4E029" /> Payments</Link>
                <Link href="/wishlist" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 text-blue-900 text-sm font-medium"><Heart size={18} color="#F4E029" /> Wish list</Link>
                <Link href="/coupons" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 text-blue-900 text-sm font-medium"><Tag size={18} color="#F4E029" /> My coupon</Link>
                <div className="border-t border-gray-100 my-2" />
                <Link href="/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 text-blue-900 text-sm font-medium"><Settings size={18} color="#F4E029" /> Settings</Link>
                <Link href="/help" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 text-blue-900 text-sm font-medium"><HelpCircle size={18} color="#F4E029" /> Help center</Link>
                <Link href="/accessibility" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 text-blue-900 text-sm font-medium"><Accessibility size={18} color="#F4E029" /> Accessibility</Link>
                <Link href="/seller-login" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 text-blue-900 text-sm font-medium"><LogIn size={18} color="#F4E029" /> Seller Login</Link>
              </div>
            </div>
          )}
          {/* Globe/Flag (desktop only) */}
          <button
            ref={globeRef}
            aria-label="Language"
            className={`hover:bg-gray-100 active:bg-gray-200 rounded-full p-2 transition-colors flex flex-col items-center relative ${pathname === '/language' ? 'underline decoration-yellow-400' : ''}`}
            style={{ color: pathname === '/language' ? activeColor : iconColor }}
            onClick={() => setLanguageModalOpen(true)}
          >
            <span className="flex items-center gap-1">
              {selectedLanguage === 'en' && (
                <img src="https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg" alt="English" width={22} height={22} className="rounded-full" />
              )}
              {selectedLanguage === 'fr' && (
                <img src="https://upload.wikimedia.org/wikipedia/en/c/c3/Flag_of_France.svg" alt="French" width={22} height={22} className="rounded-full" />
              )}
              {selectedLanguage === 'rw' && (
                <img src="https://upload.wikimedia.org/wikipedia/commons/1/17/Flag_of_Rwanda.svg" alt="Kinyarwanda" width={22} height={22} className="rounded-full" />
              )}
              <ChevronDown size={16} className="text-gray-400" />
            </span>
          </button>
          {/* Language Modal (desktop only, popover near globe) */}
          {languageModalOpen && (
            <div className="absolute right-0 top-12 z-50">
              <div className="relative bg-white rounded-2xl shadow-2xl p-4 w-56 flex flex-col items-center border border-yellow-200">
                <button onClick={() => setLanguageModalOpen(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700">
                  <span className="text-2xl">×</span>
                </button>
                <h3 className="text-lg font-bold mb-4 text-blue-700">Select Language</h3>
                <div className="flex flex-col gap-3 w-full">
                  <button
                    className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg border ${selectedLanguage === 'en' ? 'border-blue-400 bg-blue-50' : 'border-gray-200'} hover:bg-blue-100 transition`}
                    onClick={() => { setSelectedLanguage('en'); setLanguageModalOpen(false); }}
                  >
                    <img src="https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg" alt="English" width={24} height={24} />
                    <span className="font-medium text-gray-700">English</span>
                  </button>
                  <button
                    className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg border ${selectedLanguage === 'fr' ? 'border-blue-400 bg-blue-50' : 'border-gray-200'} hover:bg-blue-100 transition`}
                    onClick={() => { setSelectedLanguage('fr'); setLanguageModalOpen(false); }}
                  >
                    <img src="https://upload.wikimedia.org/wikipedia/en/c/c3/Flag_of_France.svg" alt="French" width={24} height={24} />
                    <span className="font-medium text-gray-700">Français</span>
                  </button>
                  <button
                    className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg border ${selectedLanguage === 'rw' ? 'border-blue-400 bg-blue-50' : 'border-gray-200'} hover:bg-blue-100 transition`}
                    onClick={() => { setSelectedLanguage('rw'); setLanguageModalOpen(false); }}
                  >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/1/17/Flag_of_Rwanda.svg" alt="Kinyarwanda" width={24} height={24} />
                    <span className="font-medium text-gray-700">Kinyarwanda</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Desktop Navigation Links */}
      <nav className="hidden md:flex flex-wrap border-t border-gray-300 justify-center gap-4 py-2 text-gray-700 text-sm font-medium">
        {headerCategories.map(cat => (
          <Link key={cat} href={`/category/${encodeURIComponent(cat)}`} className="hover:text-yellow-500">
            {cat}
          </Link>
        ))}
      </nav>
      {/* Mobile Nav Drawer */}
      <div className={`fixed inset-0 z-40 bg-black bg-opacity-30 transition-opacity duration-200 ${navOpen ? 'block md:hidden' : 'hidden'}`} onClick={() => setNavOpen(false)} />
      <nav className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-200 ${navOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden`}>
        <button className="absolute top-4 right-4 p-2" onClick={() => setNavOpen(false)} aria-label="Close navigation">✕</button>
        <div className="flex flex-col mt-12">
          {headerCategories.map(cat => (
            <Link key={cat} href={`/category/${encodeURIComponent(cat)}`} className="block hover:text-yellow-500 px-4 py-3 text-[#3B82F6] text-base font-medium border-b border-gray-100 last:border-b-0" onClick={() => setNavOpen(false)}>
              {cat}
            </Link>
          ))}
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
          <button className="flex flex-col items-center text-gray-700 hover:text-yellow-500 focus:text-yellow-500">
            <Heart size={24} />
            <span className="text-xs">Wishlist</span>
          </button>
        </Link>
        <button onClick={() => user ? setDropdownOpen(v => !v) : setLoginOpen(true)} className="flex flex-col items-center text-gray-700 hover:text-yellow-500 focus:text-yellow-500">
          {user && user.avatar ? (
            <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover border-2 border-yellow-400" />
          ) : (
            <User size={24} />
          )}
          <span className="text-xs">Account</span>
        </button>
        {/* User Dropdown/Tooltip Modal (mobile, absolute to bottom) */}
        {dropdownOpen && user && (
          <div ref={dropdownRef} className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 bg-white rounded-2xl shadow-2xl p-0 w-64 flex flex-col border border-yellow-200 animate-fade-in md:hidden" style={{ minWidth: 200 }}>
            <div className="flex flex-col items-start pt-4 pb-1 px-4 border-b border-gray-100">
              <img src={user.avatar} alt="avatar" className="w-9 h-9 rounded-full object-cover border-2 border-yellow-400 mb-1" />
              <span className="font-semibold text-blue-900 text-sm mb-1">Welcome back, {user.name}</span>
              <button onClick={handleSignOut} className="text-blue-600 font-semibold text-xs hover:underline mb-1">Sign Out</button>
            </div>
            <div className="flex flex-col gap-0.5 py-1 px-1">
              <Link href="/orders" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-blue-50 text-blue-900 text-xs font-medium"><List size={15} color="#F4E029" /> My Orders</Link>
              <Link href="/coins" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-blue-50 text-blue-900 text-xs font-medium"><Coins size={15} color="#F4E029" /> My Coins</Link>
              <Link href="/messages" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-blue-50 text-blue-900 text-xs font-medium"><MessageCircle size={15} color="#F4E029" /> Message Center</Link>
              <Link href="/payments" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-blue-50 text-blue-900 text-xs font-medium"><CreditCard size={15} color="#F4E029" /> Payments</Link>
              <Link href="/wishlist" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-blue-50 text-blue-900 text-xs font-medium"><Heart size={15} color="#F4E029" /> Wish list</Link>
              <Link href="/coupons" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-blue-50 text-blue-900 text-xs font-medium"><Tag size={15} color="#F4E029" /> My coupon</Link>
              <div className="border-t border-gray-100 my-1" />
              <Link href="/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-blue-50 text-blue-900 text-xs font-medium"><Settings size={15} color="#F4E029" /> Settings</Link>
              <Link href="/help" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-blue-50 text-blue-900 text-xs font-medium"><HelpCircle size={15} color="#F4E029" /> Help center</Link>
              <Link href="/accessibility" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-blue-50 text-blue-900 text-xs font-medium"><Accessibility size={15} color="#F4E029" /> Accessibility</Link>
              <Link href="/seller-login" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-blue-50 text-blue-900 text-xs font-medium"><LogIn size={15} color="#F4E029" /> Seller Login</Link>
            </div>
          </div>
        )}
      </div>
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onLoginSuccess={handleLoginSuccess} />
    </header>
  );
};

export default Header;

// Add icon components for Message, CreditCard, Coupon, Settings, HelpCircle, Accessibility
function MessageIcon({ className = "" }) { return <svg width="18" height="18" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24" className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>; }
function CreditCardIcon({ className = "" }) { return <svg width="18" height="18" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24" className={className}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>; }
function CouponIcon({ className = "" }) { return <svg width="18" height="18" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24" className={className}><rect x="3" y="7" width="18" height="10" rx="2"/><path d="M7 7v10M17 7v10"/></svg>; }
function SettingsIcon({ className = "" }) { return <svg width="18" height="18" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24" className={className}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>; }
function HelpCircleIcon({ className = "" }) { return <svg width="18" height="18" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24" className={className}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 1 1 5.82 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12" y2="17"/></svg>; }
function AccessibilityIcon({ className = "" }) { return <svg width="18" height="18" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24" className={className}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/></svg>; }

// Helper to get current user email
export function getCurrentUserEmail() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('userEmail') || '';
  }
  return '';
} 