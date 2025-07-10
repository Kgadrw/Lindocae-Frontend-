"use client";
import { useEffect, useState } from 'react';
import LoginModal from '../components/LoginModal';
import { getCurrentUserEmail } from '../components/Header';
import { Heart } from 'lucide-react';
import Header from '../components/Header';

export default function Home() {
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
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [bannerLoading, setBannerLoading] = useState(true);
  const [bannerError, setBannerError] = useState('');

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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('wishlist');
    setWishlist(saved ? JSON.parse(saved) : []);
  }, []);

  useEffect(() => {
    setBannerLoading(true);
    setBannerError('');
    fetch('https://lindo-project.onrender.com/banner/getAllBanners')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.banners)) setBanners(data.banners);
        else setBanners([]);
      })
      .catch(() => setBannerError('Failed to fetch banners.'))
      .finally(() => setBannerLoading(false));
  }, []);

  const toggleWishlist = (id: number) => {
    setWishlist((prev) => {
      const updated = prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id];
      localStorage.setItem('wishlist', JSON.stringify(updated));
      return updated;
    });
  };

  // Add to cart handler (adapted from category page)
  const handleAddToCart = (product: any) => {
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
    const idx = cart.findIndex((item: { id: any }) => item.id === product.id);
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
    window.dispatchEvent(new StorageEvent('storage', { key: cartKey }));
    window.dispatchEvent(new StorageEvent('storage', { key: 'cart' }));
    setToastMsg(`${product.name} added to cart!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1200);
  };

  return (
    <>
      <div className="px-4 md:px-8 lg:px-16 py-6 md:py-10 flex flex-col gap-8">
        <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} message={loginMsg} />
        {showToast && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-full flex justify-center pointer-events-none">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg font-semibold animate-fade-in text-center max-w-xs w-full">
              {toastMsg}
            </div>
          </div>
        )}
        {/* Hero Section (Banners) */}
        <section className="w-full mb-4">
          {bannerLoading ? (
            <div className="text-center text-gray-500 py-8">Loading banners...</div>
          ) : bannerError ? (
            <div className="text-center text-red-500 py-8">{bannerError}</div>
          ) : banners.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No banners found.</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                {/* Main large banner */}
                <div className="md:col-span-2 bg-white rounded-2xl shadow p-0 flex items-center justify-center h-64 overflow-hidden relative">
                  {banners[0]?.images?.[0] && (
                    <img src={banners[0].images[0]} alt={banners[0].title} className="absolute inset-0 w-full h-full object-cover rounded-2xl" />
                  )}
                  {/* Title at top center */}
                  <div className="absolute top-0 left-0 w-full flex flex-col items-center pt-6 z-10">
                    <span className="text-3xl font-bold text-yellow-500 drop-shadow-lg bg-white/70 px-4 py-1 rounded-full shadow-md text-center">{banners[0]?.title}</span>
                    {/* Hide subtitle for the first banner */}
                    {/* {banners[0]?.subTitle && <span className="text-base text-blue-900 mt-2 drop-shadow bg-white/60 px-3 py-1 rounded-full shadow text-center">{banners[0].subTitle}</span>} */}
                  </div>
                </div>
                {/* Two vertical banners on the right */}
                {[1,2].map(i => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl shadow p-0 flex flex-col h-64 overflow-hidden relative group transition-transform duration-300 animate-fade-in"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    {banners[i]?.images?.[0]
                      ? (
                        <>
                          <img
                            src={banners[i].images[0]}
                            alt={banners[i].title}
                            className="absolute inset-0 w-full h-full object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105 group-hover:brightness-90"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent rounded-2xl transition-opacity duration-300 group-hover:opacity-80" />
                          <div className="absolute bottom-0 left-0 w-full flex flex-col items-start px-4 pb-4 z-10">
                            <a href="#" className="flex items-center text-lg font-bold text-white drop-shadow-lg transition group-hover:text-yellow-300">
                              <span>{banners[i].title}</span>
                              <span className="ml-2 text-xl transition-transform group-hover:translate-x-1">→</span>
                            </a>
                            {banners[i].subTitle && (
                              <span className="text-xs text-white mt-2 drop-shadow">{banners[i].subTitle}</span>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100 rounded-2xl">No Banner</div>
                      )}
                  </div>
                ))}
              </div>
              {/* Row of smaller banners below */}
              {banners.length > 3 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {banners.slice(3, 7).map((banner, idx) => (
                    <div
                      key={banner._id || idx}
                      className="bg-white rounded-2xl shadow p-0 flex flex-col h-40 overflow-hidden relative group transition-transform duration-300 animate-fade-in"
                      style={{ animationDelay: `${(idx + 3) * 100}ms` }}
                    >
                      {banner.images && banner.images[0]
                        ? (
                          <>
                            <img
                              src={banner.images[0]}
                              alt={banner.title}
                              className="absolute inset-0 w-full h-full object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105 group-hover:brightness-90"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent rounded-2xl transition-opacity duration-300 group-hover:opacity-80" />
                            <div className="absolute bottom-0 left-0 w-full flex flex-col items-start px-3 pb-3 z-10">
                              <a href="#" className="flex items-center text-base font-bold text-white drop-shadow-lg transition group-hover:text-yellow-300">
                                <span>{banner.title}</span>
                                <span className="ml-2 text-lg transition-transform group-hover:translate-x-1">→</span>
                              </a>
                              {banner.subTitle && (
                                <span className="text-xs text-white mt-2 drop-shadow">{banner.subTitle}</span>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100 rounded-2xl">No Banner</div>
                        )}
                    </div>
                  ))}
                  {Array.from({length: Math.max(0, 4 - (banners.length - 3))}).map((_, idx) => (
                    <div key={idx} className="bg-gray-100 rounded-2xl shadow h-40" />
                  ))}
                </div>
              )}
            </>
          )}
        </section>
        {/* Category Cards */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {catLoading ? (
            <div className="col-span-4 text-center text-gray-500 py-8">Loading categories...</div>
          ) : catError ? (
            <div className="col-span-4 text-center text-red-500 py-8">{catError}</div>
          ) : categories.length === 0 ? (
            <div className="col-span-4 text-center text-gray-500 py-8">No categories found.</div>
          ) : (
            categories.map((cat, idx) => {
              // Always treat cat.image as an array
              let images = [];
              if (Array.isArray(cat.image)) images = cat.image;
              else if (cat.image) images = [cat.image];
              return (
                <div key={cat._id || idx} className="bg-white rounded-2xl shadow p-0 flex flex-col h-48 overflow-hidden min-h-0 min-w-0">
                  {images.length > 0 ? (
                    <div className="flex gap-1 w-full h-28 overflow-x-auto p-1 min-h-0 min-w-0">
                      {images.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={cat.name}
                          className="h-24 w-24 object-contain rounded border border-gray-200 flex-shrink-0 bg-white transition-transform duration-300 hover:scale-105"
                          style={{ width: '100%', height: '100%' }}
                        />
                      ))}
                    </div>
                  ) : null}
                  <div className="flex flex-col items-start px-4 pt-2 pb-3">
                    <span className="font-bold text-blue-700 text-base mb-1">{cat.name}</span>
                    <span className="text-xs text-gray-500 text-left">{cat.description}</span>
                  </div>
                </div>
              );
            })
          )}
        </section>
        {/* Promo/Info Banners */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* TODO: Add Celebrate Dad and Organic & Eco-Friendly banners */}
          <div className="bg-green-100 rounded-2xl shadow p-4 h-32 flex items-center justify-center">Celebrate Dad</div>
          <div className="bg-green-200 rounded-2xl shadow p-4 h-32 flex items-center justify-center">Organic & Eco-Friendly</div>
        </section>
        {/* Category Icons Row */}
        <section className="flex flex-wrap gap-4 justify-center mb-4">
          {/* TODO: Add category icons */}
          <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center">Icon 1</div>
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">Icon 2</div>
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">Icon 3</div>
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">Icon 4</div>
        </section>
        {/* Product Grids */}
        <section className="mb-4">
          <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">New Arrivals</h2>
          {prodLoading ? (
            <div className="text-center text-gray-500 py-8">Loading products...</div>
          ) : prodError ? (
            <div className="text-center text-red-500 py-8">{prodError}</div>
          ) : products.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No products found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.slice(0, 8).map((prod, idx) => (
                <div key={prod._id || prod.id || idx} className="bg-white rounded-2xl shadow p-4 flex flex-col">
                  <div className="relative mb-3">
                    {prod.image && (Array.isArray(prod.image) ? (
                      <img src={prod.image[0]} alt={prod.name} className="w-full h-40 object-cover rounded-xl" />
                    ) : (
                      <img src={prod.image} alt={prod.name} className="w-full h-40 object-cover rounded-xl" />
                    ))}
                    {prod.tags && Array.isArray(prod.tags) && prod.tags.map((tag: string) => (
                      <span key={tag} className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold ${tag === 'Sale' ? 'bg-red-100 text-red-500' : tag === 'New' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>{tag}</span>
                    ))}
                    <button
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                      onClick={() => toggleWishlist(prod.id || prod._id)}
                      aria-label="Add to wishlist"
                    >
                      <Heart
                        size={20}
                        color={wishlist.includes(prod.id || prod._id) ? '#F87171' : '#3B82F6'}
                        fill={wishlist.includes(prod.id || prod._id) ? '#F87171' : 'none'}
                        strokeWidth={2.2}
                      />
                    </button>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm font-semibold text-blue-900">{prod.rating || 4.7}</span>
                      <span className="text-xs text-blue-500">({prod.reviews || 12} reviews)</span>
                    </div>
                    <div className="font-bold text-blue-900 mb-1">{prod.name}</div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-bold text-blue-900">${prod.price?.toFixed ? prod.price.toFixed(2) : prod.price}</span>
                      {prod.oldPrice && <span className="text-sm line-through text-blue-400">${prod.oldPrice}</span>}
                    </div>
                    <button className="mt-auto rounded-full bg-blue-600 text-white font-bold py-2 text-sm shadow hover:bg-blue-700 transition" onClick={() => handleAddToCart(prod)}>Add to Cart</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="mb-4">
          <h2 className="text-2xl font-bold mb-4 text-center text-yellow-500">Bestsellers</h2>
          {/* TODO: Add product grid for bestsellers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl shadow p-4 h-40 flex items-center justify-center">Bestseller 1</div>
            <div className="bg-white rounded-2xl shadow p-4 h-40 flex items-center justify-center">Bestseller 2</div>
            <div className="bg-white rounded-2xl shadow p-4 h-40 flex items-center justify-center">Bestseller 3</div>
            <div className="bg-white rounded-2xl shadow p-4 h-40 flex items-center justify-center">Bestseller 4</div>
          </div>
        </section>
      </div>
    </>
  );
}
