"use client";
import { useEffect, useState } from 'react';
import LoginModal from '../components/LoginModal';
import { getCurrentUserEmail } from '../components/Header';
import { Heart } from 'lucide-react';
import Header from '../components/Header';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import useSWR from 'swr';
import BannersSection from '../components/home/BannersSection';
import CategoriesSlider from '../components/home/CategoriesSlider';
import PromoBanner from '../components/home/PromoBanner';
import EmailSignupBanner from '../components/home/EmailSignupBanner';
import AdsSection from '../components/home/AdsSection';
import IconsRow from '../components/home/IconsRow';
import NewArrivalsSection from '../components/home/NewArrivalsSection';
import { RedesignForLoveSection } from '../components/home/NewArrivalsSection';
import SocialShareBar from '../components/SocialShareBar';

// Add helpers for wishlist backend logic
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

// Utility: add to cart on server
async function addToCartOnServer(token: string, productId: string, quantity: number) {
  const res = await fetch('https://lindo-project.onrender.com/cart/addToCart', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, quantity }),
  });
  if (!res.ok) throw new Error('Failed to add to server cart');
  return res.json();
}

// Utility: fetch cart from server
async function fetchUserCartFromServer(token: string) {
  const res = await fetch('https://lindo-project.onrender.com/cart/getCartByUserId', {
    headers: {
      'accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch server cart');
  return res.json();
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

const safeFetcher = async (url: string, fallback: any) => {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Not OK');
    return await res.json();
  } catch (e) {
    return fallback;
  }
};

export default function Home() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [prodLoading, setProdLoading] = useState(true);
  const [catError, setCatError] = useState('');
  const [prodError, setProdError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginMsg, setLoginMsg] = useState('');
  // Wishlist state as string[] for product IDs
  const [wishlist, setWishlist] = useState<string[]>([]);
  const { data: banners, error: bannerError, isLoading: bannerLoading } = useSWR('https://lindo-project.onrender.com/banner/getAllBanners', fetcher);
  // Update ads fetch to use the correct endpoint and handle as array
  const { data: ads, error: adsError, isLoading: adsLoading } = useSWR('https://lindo-project.onrender.com/adds/getAds', fetcher);
  // Update icons fetch to use the correct endpoint and handle as array
  const { data: icons, error: iconsError, isLoading: iconsLoading } = useSWR('https://lindo-project.onrender.com/icons/getIcons', fetcher);

  // Add a single loading state for all data
  const allLoading = catLoading || prodLoading || bannerLoading || adsLoading || iconsLoading;

  // Add state for category slider
  const [catSlide, setCatSlide] = useState(0);
  const catsPerSlide = 4;
  const totalCatSlides = Math.ceil(categories.length / catsPerSlide);
  const handlePrevCat = () => setCatSlide(s => Math.max(0, s - 1));
  const handleNextCat = () => setCatSlide(s => Math.min(totalCatSlides - 1, s + 1));

  // Add state for toggling all products
  // Remove showAllProducts state and toggle logic

  // Add filter/sort state for arrivals
  const [sort, setSort] = useState('popular');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState<string[]>([]);
  const sortOptions = [
    { value: 'popular', label: 'Popular' },
    { value: 'priceLow', label: 'Price: Low to High' },
    { value: 'priceHigh', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest' },
  ];
  const handleDeliveryChange = (option: string) => {
    setSelectedDelivery(prev => prev.includes(option) ? prev.filter(d => d !== option) : [...prev, option]);
  };
  const handleClearAll = () => {
    setSelectedDelivery([]);
    setSort('popular');
    setPriceMin('');
    setPriceMax('');
  };
  // Filter and sort products for display
  const filteredProducts = (() => {
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
    return filtered;
  })();

  // WhatsApp support modal and button visibility
  const [showWhatsappBtn, setShowWhatsappBtn] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleScroll = () => {
        // Hide WhatsApp button on hero (top 500px), show after
        setShowWhatsappBtn(window.scrollY > 500);
      };
      window.addEventListener('scroll', handleScroll);
      handleScroll();
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    setCatLoading(true);
    setCatError('');
    fetch('https://lindo-project.onrender.com/category/getAllCategories')
      .then(res => res.json())
      .then(data => {
        let cats = [];
        if (Array.isArray(data)) cats = data;
        else if (data && Array.isArray(data.categories)) cats = data.categories;
        setCategories(cats);
      })
      .catch(() => setCatError('Failed to fetch categories.'))
      .finally(() => setCatLoading(false));
  }, []);

  useEffect(() => {
    setProdLoading(true);
    setProdError('');
    fetch('https://lindo-project.onrender.com/product/getAllProduct')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
        else if (data && Array.isArray(data.products)) setProducts(data.products);
        else setProducts([]);
      })
      .catch(() => setProdError('Failed to fetch products.'))
      .finally(() => setProdLoading(false));
  }, []);

  // Fetch wishlist on mount
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
          setWishlist((data.products || []).map((p: any) => p._id || p.id));
        } catch {
          setWishlist([]);
        }
      } else {
        // Guest: fallback to localStorage
        const email = getCurrentUserEmail();
        const key = email ? `wishlist_${email}` : 'wishlist';
        const saved = localStorage.getItem(key);
        const ids = saved ? JSON.parse(saved).map((id: any) => String(id)) : [];
        setWishlist(ids);
      }
    }
    fetchWishlist();
  }, []);

  // Toggle wishlist handler
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
        if (!res.ok) {
          let data = {};
          try { data = await res.json(); } catch {}
          if (res.status === 401) {
            // Clear auth and show login modal
            localStorage.removeItem('token');
            localStorage.removeItem('userEmail');
            setLoginMsg('Your session has expired. Please log in again to use the wishlist.');
            setLoginOpen(true);
            setWishlist((prev) => prev.filter(pid => pid !== id)); // Optionally remove from UI
            return;
          }
          setToastMsg((data as any).message || 'Failed to update wishlist.');
          setShowToast(true);
          setTimeout(() => setShowToast(false), 1200);
          return;
        }
        // Refetch wishlist from backend
        const wishlistRes = await fetch(`https://lindo-project.onrender.com/wishlist/getUserWishlistProducts/${userId}`, {
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const wishlistData = await wishlistRes.json();
        setWishlist((wishlistData.products || []).map((p: any) => p._id || p.id));
      } catch (err) {
        setToastMsg('Network error. Please try again.');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 1200);
      }
    } else {
      // Guest: fallback to localStorage
      const email = getCurrentUserEmail();
      const key = email ? `wishlist_${email}` : 'wishlist';
      setWishlist((prev) => {
        const updated = prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id];
        localStorage.setItem(key, JSON.stringify(updated));
        window.dispatchEvent(new StorageEvent('storage', { key }));
        return updated;
      });
    }
  }

  // Add to cart handler (adapted from category page)
  const handleAddToCart = async (product: any) => {
    const email = getCurrentUserEmail();
    const token = getAuthToken();
    // Ensure image is always a string URL
    let imageUrl = '/lindo.png';
    if (Array.isArray(product.image) && product.image.length > 0) {
      imageUrl = product.image[0];
    } else if (typeof product.image === 'string' && product.image.trim().length > 0) {
      imageUrl = product.image;
    }
    if (token) {
      // Logged in: add to server cart
      try {
        await addToCartOnServer(token, product.id || product._id, 1);
        // Optionally, update localStorage for instant UI
        const cartKey = `cart:${email}`;
        const cartRaw = localStorage.getItem(cartKey);
        let cart = [];
        try { cart = cartRaw ? JSON.parse(cartRaw) : []; } catch { cart = []; }
        const idx = cart.findIndex((item: { id: any }) => item.id === product.id);
        if (idx > -1) {
          cart[idx].quantity = (cart[idx].quantity || 1) + 1;
        } else {
          cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: imageUrl,
            quantity: 1,
          });
        }
        localStorage.setItem(cartKey, JSON.stringify(cart));
        window.dispatchEvent(new StorageEvent('storage', { key: cartKey }));
        window.dispatchEvent(new StorageEvent('storage', { key: 'cart' }));
        setToastMsg(`${product.name} added to cart!`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 1200);
      } catch (err) {
        setToastMsg('Failed to add to cart. Please try again.');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 1200);
      }
    } else {
      // Guest: localStorage only
      const cartKey = `cart:${email}`;
      const cartRaw = localStorage.getItem(cartKey);
      let cart = [];
      try { cart = cartRaw ? JSON.parse(cartRaw) : []; } catch { cart = []; }
      const idx = cart.findIndex((item: { id: any }) => item.id === product.id);
      if (idx > -1) {
        cart[idx].quantity = (cart[idx].quantity || 1) + 1;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: imageUrl,
          quantity: 1,
        });
      }
      localStorage.setItem(cartKey, JSON.stringify(cart));
      window.dispatchEvent(new StorageEvent('storage', { key: cartKey }));
      window.dispatchEvent(new StorageEvent('storage', { key: 'cart' }));
      setToastMsg(`${product.name} added to cart!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1200);
    }
  };

  return (
    <>
      <SocialShareBar />
      <div className="px-2 md:px-4 lg:px-8 py-4 md:py-6 flex flex-col gap-6">
        <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} message={loginMsg} />
        {showToast && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-full flex justify-center pointer-events-none">
            <div className="bg-lindo-blue text-white px-4 py-2 rounded-full shadow-lg font-semibold animate-fade-in text-center max-w-xs w-full">
              {toastMsg}
            </div>
          </div>
        )}
        {/* Hero Section (Banners) */}
        <BannersSection banners={banners} bannerLoading={bannerLoading} bannerError={bannerError} />
        {/* Category Icons Row */}
        {/* Category Cards as Slider */}
        <CategoriesSlider categories={categories} catLoading={catLoading} catError={catError} />
        {/* Promo/Info Banners */}
        <AdsSection ads={ads} adsLoading={adsLoading} adsError={adsError} />
        {/* Product Grids */}
        <NewArrivalsSection
          filteredProducts={filteredProducts}
          prodLoading={prodLoading}
          prodError={prodError}
          wishlist={wishlist}
          toggleWishlist={toggleWishlist}
          handleAddToCart={handleAddToCart}
          priceMin={priceMin}
          setPriceMin={setPriceMin}
          priceMax={priceMax}
          setPriceMax={setPriceMax}
          sort={sort}
          setSort={setSort}
          sortOptions={sortOptions}
          handleClearAll={handleClearAll}
          iconsRow={<IconsRow icons={icons} iconsLoading={iconsLoading} iconsError={iconsError} />}
        />
        {/* Wishlist Promo Banner */}
        <PromoBanner categories={categories} catLoading={catLoading} />
        {/* Email Signup Banner */}
        <EmailSignupBanner />
      </div>
      {/* WhatsApp Support Button (only visible after hero) */}
      {showWhatsappBtn && (
        <a
          href="https://wa.me/250785064255"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center transition-colors duration-200"
          aria-label="Chat with support on WhatsApp"
        >
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
            <circle cx="16" cy="16" r="16" fill="#25D366"/>
            <path d="M23.472 19.339c-.355-.177-2.104-1.037-2.43-1.155-.326-.119-.563-.177-.8.177-.237.355-.914 1.155-1.12 1.392-.207.237-.412.266-.767.089-.355-.178-1.5-.553-2.86-1.763-1.057-.944-1.77-2.108-1.98-2.463-.207-.355-.022-.546.155-.723.159-.158.355-.414.533-.622.178-.207.237-.355.355-.592.119-.237.06-.444-.03-.622-.089-.177-.8-1.924-1.096-2.637-.289-.693-.583-.599-.8-.61-.207-.009-.444-.011-.681-.011-.237 0-.622.089-.948.444-.326.355-1.24 1.211-1.24 2.955 0 1.744 1.27 3.428 1.447 3.666.178.237 2.5 3.82 6.05 5.209.846.291 1.505.464 2.021.594.849.216 1.622.186 2.233.113.682-.08 2.104-.859 2.402-1.689.296-.83.296-1.541.207-1.689-.089-.148-.326-.237-.681-.414z" fill="#fff"/>
          </svg>
        </a>
      )}
    </>
  );
}
