"use client";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Heart, Star } from 'lucide-react';
import Image from 'next/image';
import { getCurrentUserEmail } from '../../../components/Header';
import Link from 'next/link';

// Helper to get auth token
function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

// Helper to format RWF with thousands separator
function formatRWF(amount: number) {
  return amount.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mainImageIdx, setMainImageIdx] = useState(0);
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError("");
    fetch(`https://lindo-project.onrender.com/product/getProductById/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then(data => {
        if (!data || !data.product) throw new Error("Product not found");
        setProduct(data.product || data);
        setLoading(false);
      })
      .catch(() => {
        setError("Product not found");
        setLoading(false);
      });
    // Fetch all categories
    fetch('https://lindo-project.onrender.com/category/getAllCategories')
      .then(res => res.json())
      .then(data => {
        let cats = Array.isArray(data) ? data : data.categories || [];
        setCategories(cats);
      });
    // Fetch all products
    fetch('https://lindo-project.onrender.com/product/getAllProduct')
      .then(res => res.json())
      .then(data => {
        let prods = Array.isArray(data) ? data : data.products || [];
        setAllProducts(prods);
      });
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"></div>;
  }
  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500 text-xl">{error}</div>;
  }
  if (!product) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500 text-xl">Product not found.</div>;
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
        cart.push({
          id: String(product.id),
          name: product.name,
          price: product.price,
          image: imageUrl,
          quantity: 1,
        });
        localStorage.setItem(cartKey, JSON.stringify(cart));
        setTimeout(() => window.dispatchEvent(new StorageEvent('storage', { key: cartKey })), 0);
        setTimeout(() => window.dispatchEvent(new StorageEvent('storage', { key: 'cart' })), 0);
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
      cart.push({
        id: String(product.id),
        name: product.name,
        price: product.price,
        image: imageUrl,
        quantity: 1,
      });
      localStorage.setItem(cartKey, JSON.stringify(cart));
      setTimeout(() => window.dispatchEvent(new StorageEvent('storage', { key: cartKey })), 0);
      setTimeout(() => window.dispatchEvent(new StorageEvent('storage', { key: 'cart' })), 0);
      setToastMsg(`${product.name} added to cart!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1200);
    }
  };

  // Map images as in NewArrivalsSection
  let images: string[] = [];
  if (Array.isArray(product.image) && product.image.length > 0) {
    images = product.image.filter(img => img && typeof img === 'string' && img.trim() !== '');
  } else if (typeof product.image === 'string' && product.image.trim() !== '') {
    images = [product.image];
  } else {
    images = ['/lindo.png'];
  }
  const mainImage = images[mainImageIdx] || images[0];

  return (
    <div className="bg-white pt-16 min-h-screen font-montserrat pb-12">
      <div className="flex flex-col md:flex-row gap-6 rounded-lg p-4 max-w-5xl mx-auto">
        {/* Left: Images */}
        <div className="flex-1 flex flex-col items-center">
          <div className="w-full flex justify-center mb-4">
            {mainImage && typeof mainImage === 'string' && mainImage.trim() !== '' ? (
              <Image src={mainImage} alt={product.name} width={400} height={400} className="rounded-xl object-cover bg-gray-100 max-h-[350px]" />
            ) : (
              <div className="w-[400px] h-[400px] rounded-xl bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
            )}
          </div>
          <div className="flex gap-2 mt-2">
            {images.map((img, idx) => (
              <button key={idx} onClick={() => setMainImageIdx(idx)} className={`rounded-xl border-2 ${mainImageIdx === idx ? 'border-blue-500' : 'border-gray-200'} p-0.5`}>
                {img && typeof img === 'string' && img.trim() !== '' ? (
                  <Image src={img} alt="" width={64} height={64} className="w-16 h-16 object-cover rounded-xl" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
                )}
              </button>
            ))}
          </div>
        </div>
        {/* Right: Info */}
        <div className="flex-1 flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-500 text-lg">★</span>
            <span className="font-semibold">{product.rating || 4.5}</span>
            <span className="text-green-600 font-medium ml-2">Verified</span>
          </div>
          {/* Stock type and category row */}
          <div className="flex flex-wrap gap-4 mb-2 text-sm text-blue-700">
            <div>
              <span className="font-semibold">Stock :</span>
              <span className="ml-2">{product.stockType || 'N/A'}</span>
            </div>
            <div>
              <span className="font-semibold">Category:</span>
              <span className="ml-2">{typeof product.category === 'object' && product.category !== null ? product.category.name : product.category}</span>
            </div>
          </div>
          <div className="text-2xl font-semibold text-gray-900 mb-2"> Price: <span className="text-2xl font-bold text-blue-900">{formatRWF(product.price)} RWF</span>
            {product.oldPrice && <span className="text-lg line-through text-gray-400 ml-2">{formatRWF(product.oldPrice)} RWF</span>}
          </div>
          {/* Quantity Selector */}
          <div className="flex items-center gap-3 mb-4">
            <button
              className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xl font-bold flex items-center justify-center hover:bg-blue-200 border border-blue-500"
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
            >-</button>
            <span className="text-lg font-bold w-8 text-center text-blue-700">{quantity}</span>
            <button
              className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xl font-bold flex items-center justify-center hover:bg-blue-200 border border-blue-500"
              onClick={() => setQuantity(q => q + 1)}
              aria-label="Increase quantity"
            >+</button>
          </div>
          <div className="text-gray-700 mb-4 whitespace-pre-line">{product.description}</div>
          {/* Add to cart and brand info at the bottom */}
          <div className="flex flex-col gap-2 mt-0">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-lg w-full max-w-xs">Add to cart</button>
            <div className="flex flex-row gap-4 text-sm mt-2">
              <div>
              </div>
              <div>
                
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* You may also like section */}
      {allProducts && product.category && (
        <div className="mt-12 flex flex-col items-center justify-center">
          <h2 className="text-xl font-bold text-blue-700 mb-6 text-center font-montserrat">You may also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-5xl mx-auto">
            {allProducts.filter(p => (typeof p.category === 'object' ? p.category.name : p.category) === (typeof product.category === 'object' ? product.category.name : product.category) && p._id !== product._id).slice(0, 8).map((p, idx) => {
              let img = '';
              if (Array.isArray(p.image) && p.image.length > 0) img = p.image[0];
              else if (typeof p.image === 'string') img = p.image;
              return (
                <Link
                  key={p._id || p.id || idx}
                  href={`/product/${p._id || p.id}`}
                  className="flex flex-col items-center bg-white rounded-2xl shadow p-4 font-montserrat hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="relative w-full h-40 mb-3 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                    {img ? (
                      <Image src={img} alt={p.name} width={256} height={160} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No Image</div>
                    )}
                    {/* Wishlist Icon */}
                    <button
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                      // You may want to implement a toggleWishlist function for related products
                      aria-label="Add to wishlist"
                    >
                      <Heart
                        size={20}
                        color={'#2563eb'}
                        fill={'none'}
                        strokeWidth={2.2}
                      />
                    </button>
                  </div>
                  <div className="font-semibold text-blue-900 text-sm text-left line-clamp-2 mb-1">{p.name}</div>
                  <div className="text-blue-700 font-bold text-base mb-2 text-left">{formatRWF(p.price)} RWF</div>
                  <button
                    className="mt-auto rounded-full bg-blue-600 text-white font-bold py-2 text-sm shadow hover:bg-blue-700 transition w-full"
                    onClick={() => handleAddToCart(p)}
                  >Add to Cart</button>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 