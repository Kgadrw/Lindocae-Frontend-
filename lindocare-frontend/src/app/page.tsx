"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { addToCartServer, toggleWishlistProduct, fetchUserWishlist, getLocalWishlist, saveLocalWishlist, isUserLoggedIn, syncLocalWishlistToServer } from "../utils/serverStorage";
import { getCurrentUserEmail } from "../components/Header";
import BannersSection from "../components/home/BannersSection";
import CategoriesSlider from "../components/home/CategoriesSlider";
import PromoBanner from "../components/home/PromoBanner";
import EmailSignupBanner from "../components/home/EmailSignupBanner";
import AdsSection from "../components/home/AdsSection";
import IconsRow from "../components/home/IconsRow";
import NewArrivalsSection from "../components/home/NewArrivalsSection";
import SocialShareBar from "../components/SocialShareBar";
import { motion } from "framer-motion";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay,
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
};

export default function Home() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [prodLoading, setProdLoading] = useState(true);
  const [catError, setCatError] = useState("");
  const [prodError, setProdError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [wishlist, setWishlist] = useState<string[]>([]);

  const { data: banners, error: bannerError, isLoading: bannerLoading } = useSWR(
    "https://lindo-project.onrender.com/banner/getAllBanners",
    fetcher
  );
  const { data: ads, error: adsError, isLoading: adsLoading } = useSWR(
    "https://lindo-project.onrender.com/adds/getAds",
    fetcher
  );
  const { data: icons, error: iconsError, isLoading: iconsLoading } = useSWR(
    "https://lindo-project.onrender.com/icons/getIcons",
    fetcher
  );

  const [sort, setSort] = useState("popular");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [selectedDelivery, setSelectedDelivery] = useState<string[]>([]);

  const filteredProducts = (() => {
    let filtered = [...products];
    if (selectedDelivery.length > 0) {
      filtered = filtered.filter((p) =>
        selectedDelivery.some((d) => p.delivery && p.delivery.includes(d))
      );
    }
    if (priceMin) filtered = filtered.filter((p) => p.price >= parseFloat(priceMin));
    if (priceMax) filtered = filtered.filter((p) => p.price <= parseFloat(priceMax));
    if (sort === "priceLow") filtered.sort((a, b) => a.price - b.price);
    else if (sort === "priceHigh") filtered.sort((a, b) => b.price - a.price);
    else if (sort === "newest") filtered = filtered.slice().reverse();
    return filtered;
  })();

  const [showWhatsappBtn, setShowWhatsappBtn] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleScroll = () => {
        setShowWhatsappBtn(window.scrollY > 500);
      };
      window.addEventListener("scroll", handleScroll);
      handleScroll();
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, []);

  useEffect(() => {
    setCatLoading(true);
    setCatError("");
    fetch("https://lindo-project.onrender.com/category/getAllCategories")
      .then((res) => res.json())
      .then((data) => {
        let cats = [];
        if (Array.isArray(data)) cats = data;
        else if (data && Array.isArray(data.categories)) cats = data.categories;
        else if (data && Array.isArray(data.data)) cats = data.data;
        cats = (cats || []).map((cat: any) => ({
          _id: cat._id || cat.id || cat.ID || cat.categoryId,
          name: cat.name || cat.title || cat.categoryName || "",
          image: cat.image || cat.img || cat.images || "",
          description: cat.description || cat.desc || "",
        }));
        setCategories(Array.isArray(cats) ? cats : []);
        if (!Array.isArray(cats) || cats.length === 0) {
          setCatError("No categories found.");
        }
      })
      .catch(() => setCatError("Network error."))
      .finally(() => setCatLoading(false));
  }, []);

  useEffect(() => {
    setProdLoading(true);
    setProdError("");
    fetch("https://lindo-project.onrender.com/product/getAllProduct")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
        else if (data && Array.isArray(data.products)) setProducts(data.products);
        else setProducts([]);
      })
      .catch(() => setProdError("Network error."))
      .finally(() => setProdLoading(false));
  }, []);

  useEffect(() => {
    async function fetchWishlist() {
      try {
        if (isUserLoggedIn()) {
          const serverWishlist = await fetchUserWishlist();
          setWishlist(serverWishlist.map((p) => String(p._id || p.id)));
        } else {
          setWishlist(getLocalWishlist());
        }
      } catch {
        setWishlist([]);
      }
    }
    fetchWishlist();
  }, []);

  async function toggleWishlist(id: string) {
    try {
      const wasInWishlist = wishlist.includes(id);
      const next = wasInWishlist ? wishlist.filter((x) => x !== id) : [...wishlist, id];
      setWishlist(next);
      if (isUserLoggedIn()) {
        await toggleWishlistProduct(id);
      } else {
        const localWishlist = getLocalWishlist();
        let updatedWishlist: string[] = wasInWishlist
          ? localWishlist.filter((itemId) => itemId !== id)
          : [...localWishlist, id];
        saveLocalWishlist(updatedWishlist);
      }
    } catch (err) {
      setToastMsg("Failed to update wishlist.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1200);
    }
  }

  const handleAddToCart = async (product: any) => {
    try {
      if (isUserLoggedIn()) {
        await addToCartServer({ productId: String(product._id || product.id), quantity: 1 });
        setToastMsg("Added to cart!");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 1200);
      } else {
        const email = getCurrentUserEmail();
        if (!email) {
          router.push("/login");
          return;
        }
        const cartKey = `cart:${email}`;
        const cartRaw = localStorage.getItem(cartKey);
        let cart = cartRaw ? JSON.parse(cartRaw) : [];
        const existingItem = cart.find((item: any) => String(item.id) === String(product._id || product.id));
        if (existingItem) existingItem.quantity = (existingItem.quantity || 1) + 1;
        else {
          cart.push({
            id: product._id || product.id,
            name: product.name,
            price: product.price,
            image: Array.isArray(product.image) ? product.image[0] : product.image,
            quantity: 1,
          });
        }
        localStorage.setItem(cartKey, JSON.stringify(cart));
        setToastMsg("Added to cart!");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 1200);
      }
    } catch {
      setToastMsg("Failed to add to cart.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1200);
    }
  };

  return (
    <>
    <div className="bg-white px-0 md:px-4 lg:px-8 py-2 md:py-2 flex flex-col gap-3 md:gap-4">
      <SocialShareBar />
      <div className="px-3 md:px-4 lg:px-8 py-4 md:py-6 flex flex-col gap-4 md:gap-6">
        {showToast && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-full flex justify-center pointer-events-none">
            <div className="bg-white text-white px-4 py-2 rounded-full shadow-lg font-semibold animate-fade-in text-center max-w-xs w-full">
              {toastMsg}
            </div>
          </div>
        )}

        {/* Animate sections with Framer Motion */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0.1}>
          <BannersSection banners={banners} bannerLoading={bannerLoading} bannerError={bannerError} />
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0.2}>
          <CategoriesSlider categories={categories} catLoading={catLoading} catError={catError} />
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0.3}>
          <AdsSection ads={ads} adsLoading={adsLoading} adsError={adsError} />
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0.4}>
          <NewArrivalsSection
            filteredProducts={filteredProducts}
            prodLoading={prodLoading}
            prodError={prodError}
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
            handleAddToCart={handleAddToCart}
            iconsRow={<IconsRow icons={icons} iconsLoading={iconsLoading} iconsError={iconsError} />}
          />
        </motion.div>

        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0.5}>
          <PromoBanner categories={categories} catLoading={catLoading} />
        </motion.div>


        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0.7}>
          <EmailSignupBanner />
        </motion.div>
      </div>

      {showWhatsappBtn && (
        <a
          href="https://wa.me/250795575622"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg w-16 h-16 items-center justify-center transition-colors duration-200"
          aria-label="Chat with support on WhatsApp"
        >
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
            <circle cx="16" cy="16" r="16" fill="#25D366" />
            <path
              d="M23.472 19.339c-.355-.177-2.104-1.037-2.43-1.155-.326-.119-.563-.177-.8.177-.237.355-.914 1.155-1.12 1.392-.207.237-.412.266-.767.089-.355-.178-1.5-.553-2.86-1.763-1.057-.944-1.77-2.108-1.98-2.463-.207-.355-.022-.546.155-.723.159-.158.355-.414.533-.622.178-.207.237-.355.355-.592.119-.237.06-.444-.03-.622-.089-.177-.8-1.924-1.096-2.637-.289-.693-.583-.599-.8-.61-.207-.009-.444-.011-.681-.011-.237 0-.622.089-.948.444-.326.355-1.24 1.211-1.24 2.955 0 1.744 1.27 3.428 1.447 3.666.178.237 2.5 3.82 6.05 5.209.846.291 1.505.464 2.021.594.849.216 1.622.186 2.233.113.682-.08 2.104-.859 2.402-1.689.296-.83.296-1.541.207-1.689-.089-.148-.326-.237-.681-.414z"
              fill="#fff"
            />
          </svg>
        </a>
      )}
      </div>
    </>
  );
}