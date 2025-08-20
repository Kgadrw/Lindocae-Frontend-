"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Heart, ShoppingCart, Star, Truck, Clock, MapPin } from 'lucide-react';
import { 
  addToCartServer, 
  toggleWishlistProduct, 
  fetchUserWishlist, 
  getLocalWishlist, 
  saveLocalWishlist,
  isUserLoggedIn,
  syncLocalWishlistToServer
} from '../utils/serverStorage';
import LoginModal from '../components/LoginModal';
import { getCurrentUserEmail } from '../components/Header';
import BannersSection from '../components/home/BannersSection';
import CategoriesSlider from '../components/home/CategoriesSlider';
import PromoBanner from '../components/home/PromoBanner';
import EmailSignupBanner from '../components/home/EmailSignupBanner';
import AdsSection from '../components/home/AdsSection';
import IconsRow from '../components/home/IconsRow';
import NewArrivalsSection from '../components/home/NewArrivalsSection';
import SocialShareBar from '../components/SocialShareBar';
import VideoSection from '../components/home/VideoSection';
import Reveal from '../components/Reveal';
import { normalizeImageUrl } from '../utils/image';

// Note: Using imported functions from serverStorage.ts instead of local duplicates

const fetcher = (url: string) => fetch(url).then(res => res.json());

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
        console.log('RAW categories API response:', data);
        let cats = [];
        if (Array.isArray(data)) cats = data;
        else if (data && Array.isArray(data.categories)) cats = data.categories;
        else if (data && Array.isArray(data.data)) cats = data.data;
        else {
          console.error('Unexpected categories API response:', data);
        }
        // Map to ensure each category has _id, name, image, description
        cats = (cats || []).map((cat: any) => ({
          _id: cat._id || cat.id || cat.ID || cat.categoryId || undefined,
          name: cat.name || cat.title || cat.categoryName || '',
          image: cat.image || cat.img || cat.images || '',
          description: cat.description || cat.desc || '',
        }));
        setCategories(Array.isArray(cats) ? cats : []);
        if (!Array.isArray(cats) || cats.length === 0) {
          setCatError('No categories found. Please check the API response.');
        }
      })
      .catch((err) => {
        setCatError('Network error. Please check your connection.');
        console.error('Fetch categories error:', err);
      })
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
      .catch(() => setProdError('Network error. Please check your connection.'))
      .finally(() => setProdLoading(false));
  }, []);

  // Fetch wishlist on mount
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

  // Toggle wishlist handler
  async function toggleWishlist(id: string) {
    try {
      const wasInWishlist = wishlist.includes(id);
      // Optimistic UI update
      const next = wasInWishlist ? wishlist.filter(x => x !== id) : [...wishlist, id];
      setWishlist(next);
      if (typeof window !== 'undefined') {
        try { window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: { type: wasInWishlist ? 'remove' : 'add', productId: id } })); } catch {}
      }

      if (isUserLoggedIn()) {
        // Logged in: call server
        await toggleWishlistProduct(id);
        // Do not immediately overwrite with a possibly empty server fetch; keep optimistic state
      } else {
        // Guest: update localStorage
        const localWishlist = getLocalWishlist();
        const isInWishlist = localWishlist.includes(id);
        
        let updatedWishlist: string[];
        if (isInWishlist) {
          updatedWishlist = localWishlist.filter(itemId => itemId !== id);
        } else {
          updatedWishlist = [...localWishlist, id];
        }
        
        saveLocalWishlist(updatedWishlist);
        // State already updated optimistically
      }
    } catch (err) {
      console.error('Error toggling wishlist:', err);
      // Revert optimistic change on error
      setWishlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
      setToastMsg('Failed to update wishlist. Please try again.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1200);
    }
  }

  // Add to cart handler
  const handleAddToCart = async (product: any) => {
    try {
      if (isUserLoggedIn()) {
        // Logged in: add to server cart
        await addToCartServer({
          productId: String(product._id || product.id),
          quantity: 1,
        });
        setToastMsg('Added to cart!');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 1200);
      } else {
        // Guest: add to localStorage
        const email = getCurrentUserEmail();
        if (!email) {
          setLoginMsg('Please log in to add items to cart');
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
        setToastMsg('Added to cart!');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 1200);
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      setToastMsg('Failed to add to cart. Please try again.');
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
        <Reveal direction="up" delayMs={40} durationMs={700} distancePx={28}>
          <BannersSection banners={banners} bannerLoading={bannerLoading} bannerError={bannerError} />
        </Reveal>
        <Reveal direction="up" delayMs={80} durationMs={700} distancePx={28}>
          <CategoriesSlider categories={categories} catLoading={catLoading} catError={catError} />
        </Reveal>
        <Reveal direction="up" delayMs={120} durationMs={700} distancePx={28}>
          <AdsSection ads={ads} adsLoading={adsLoading} adsError={adsError} />
        </Reveal>
        <Reveal direction="up" delayMs={160} durationMs={700} distancePx={28}>
          <NewArrivalsSection
            filteredProducts={filteredProducts}
            prodLoading={prodLoading}
            prodError={prodError}
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
            handleAddToCart={handleAddToCart}
            iconsRow={<IconsRow icons={icons} iconsLoading={iconsLoading} iconsError={iconsError} />}
          />
        </Reveal>
        <Reveal direction="up" delayMs={200} durationMs={700} distancePx={28}>
          <PromoBanner categories={categories} catLoading={catLoading} />
        </Reveal>
        <Reveal direction="up" delayMs={240} durationMs={700} distancePx={28}>
          <VideoSection />
        </Reveal>
        <Reveal direction="up" delayMs={280} durationMs={700} distancePx={28}>
          <EmailSignupBanner />
        </Reveal>
      </div>
      {/* WhatsApp Support Button (only visible after hero, hidden on mobile) */}
      {showWhatsappBtn && (
        <a
          href="https://wa.me/250795575622
"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg w-16 h-16 items-center justify-center transition-colors duration-200"
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
