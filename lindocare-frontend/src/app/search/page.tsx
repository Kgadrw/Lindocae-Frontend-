"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Heart } from "lucide-react";
import { getCurrentUserEmail } from '../../components/Header';
import Image from 'next/image';
import { addToCartServer, isUserLoggedIn, getUserEmail, getLocalWishlist, saveLocalWishlist, fetchUserWishlist, toggleWishlistProduct } from "../../utils/serverStorage";

// Remove template productsData. Use real products from backend.

const SearchPage = () => {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const query = q.trim().toLowerCase();

  // Client-only flag
  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // State for search history, wishlist, recommended, results
  const [searchHistory, setSearchHistory] = React.useState<string[]>([]);
  const [wishlist, setWishlist] = React.useState<string[]>([]);
  const [recommended, setRecommended] = React.useState<any[]>([]);
  const [results, setResults] = React.useState<any[]>([]);
  const [allProducts, setAllProducts] = React.useState<any[]>([]);
  const [allCategories, setAllCategories] = React.useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all products and categories on mount
  React.useEffect(() => {
    fetch('https://lindo-project.onrender.com/product/getAllProduct')
      .then(res => res.json())
      .then(data => {
        let prods = [];
        if (Array.isArray(data)) prods = data;
        else if (data && Array.isArray(data.products)) prods = data.products;
        setAllProducts(prods);
      });
    fetch('https://lindo-project.onrender.com/category/getAllCategories')
      .then(res => res.json())
      .then(data => {
        let cats = [];
        if (Array.isArray(data)) cats = data;
        else if (data && Array.isArray(data.categories)) cats = data.categories;
        setAllCategories(cats);
      });
  }, []);

  React.useEffect(() => {
    if (!isClient) return;
    // Get user email
    const userEmail = getCurrentUserEmail();
    const searchHistoryKey = userEmail ? `searchHistory_${userEmail}` : 'searchHistory';

    // Get wishlist (server or local unified helper)
    (async () => {
      try {
        if (isUserLoggedIn()) {
          const serverWishlist = await fetchUserWishlist();
          const ids = serverWishlist.map((p: any) => String(p._id || p.id));
          setWishlist(ids);
        } else {
          setWishlist(getLocalWishlist());
        }
      } catch {
        setWishlist([]);
      }
    })();

    // Get search history
    const savedHistory = localStorage.getItem(searchHistoryKey);
    const history = savedHistory ? JSON.parse(savedHistory) : [];
    setSearchHistory(history);
    // Save search if q
    if (q) {
      let newHistory = history.filter((item: string) => item.toLowerCase() !== q.toLowerCase());
      newHistory.unshift(q);
      if (newHistory.length > 10) newHistory = newHistory.slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem(searchHistoryKey, JSON.stringify(newHistory));
    }
    // Results: filter real products and deduplicate by id or _id
    let filtered = query ? allProducts.filter((p) => p.name && p.name.toLowerCase().includes(query)) : [];
    const seen = new Set();
    filtered = filtered.filter((p) => {
      const key = p.id || p._id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    setResults(filtered);
    // Recommended: show products matching favorite search terms or in wishlist
    const freqMap: Record<string, number> = {};
    history.forEach((term: string) => {
      const t = term.trim().toLowerCase();
      if (t) freqMap[t] = (freqMap[t] || 0) + 1;
    });
    const favoriteTerms = Object.entries(freqMap)
      .sort((a, b) => b[1] - a[1])
      .map(([term]) => term)
      .slice(0, 2);
    let recommendedProducts = allProducts.filter(
      p => favoriteTerms.some(term => p.name && p.name.toLowerCase().includes(term)) || (wishlist ? wishlist.includes(String(p.id || p._id)) : false)
    );
    recommendedProducts = recommendedProducts.filter((p, i, arr) => arr.findIndex(x => (x.id || x._id) === (p.id || p._id)) === i);
    setRecommended(recommendedProducts);
  }, [isClient, q, query, allProducts]);

  const toggleWishlist = async (id: number | string) => {
    if (!isClient) return;
    const strId = String(id);
    const wasIn = wishlist.includes(strId);
    // Optimistic
    setWishlist(prev => wasIn ? prev.filter(x => x !== strId) : [...prev, strId]);
    try { window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: { type: wasIn ? 'remove' : 'add', productId: strId } })); } catch {}
    try {
      if (isUserLoggedIn()) {
        await toggleWishlistProduct(strId);
      } else {
        const local = getLocalWishlist();
        const updated = local.includes(strId) ? local.filter(x => x !== strId) : [...local, strId];
        saveLocalWishlist(updated);
      }
    } catch (e) {
      // Revert optimistic on error
      setWishlist(prev => prev.includes(strId) ? prev.filter(x => x !== strId) : [...prev, strId]);
    }
  };

  // Add to cart handler
  const handleAddToCart = async (product: any) => {
    try {
      if (isUserLoggedIn()) {
        // Logged in: add to server cart
        await addToCartServer({
          productId: String(product._id || product.id),
          quantity: 1,
        });
        alert('Added to cart!');
      } else {
        // Guest: add to localStorage
        const email = getUserEmail();
        if (!email) {
          alert('Please log in to add items to cart');
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
        alert('Added to cart!');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add to cart. Please try again.');
    }
  };

  // Check if query matches a category
  const matchedCategory = allCategories.find(c => c.name && c.name.toLowerCase() === query);

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-7xl mx-auto px-2 pt-4 md:pt-6 pb-12">
        <div className="text-sm text-blue-700 mb-4 pt-14 md:pt-0">
          <Link href="/">Home</Link> / <span className="text-blue-900 font-medium">Search</span>
        </div>
        <h1 className="text-2xl font-bold text-blue-900 mb-6">
          Search Results{q ? ` for "${q}"` : ""}
        </h1>
        {/* If query matches a category, show a link to that category */}
        {matchedCategory && (
          <div className="mb-8">
            <div className="text-blue-900 font-semibold mb-2">Category Match</div>
            <Link href={`/category/${encodeURIComponent(matchedCategory.name)}`} className="block px-4 py-3 bg-yellow-100 text-blue-900 rounded-xl font-bold text-lg hover:bg-yellow-200 transition">
              See all products in "{matchedCategory.name}"
            </Link>
          </div>
        )}
        {/* Recent Searches */}
        {searchHistory.length > 0 && (
          <div className="mb-8">
            <div className="text-blue-900 font-semibold mb-2">Your Recent Searches</div>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((term, i) => (
                <Link key={i} href={`/search?q=${encodeURIComponent(term)}`} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition">
                  {term}
                </Link>
              ))}
            </div>
          </div>
        )}
        {/* Recommended for You */}
        {recommended.length > 0 && (
          <div className="mb-8">
            <div className="text-blue-900 font-semibold mb-2">Recommended for You</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recommended.map((product, idx) => (
                <div key={product.id || product._id || idx} className="bg-white rounded-2xl shadow p-4 flex flex-col">
                  <div className="relative mb-3">
                    <Image
                      src={
                        Array.isArray(product.image) && product.image.length > 0
                          ? product.image[0]
                          : (typeof product.image === 'string' && product.image.trim() !== ''
                              ? product.image
                              : '/lindo.png')
                      }
                      alt={product.name}
                      className="w-full h-40 object-cover rounded-xl"
                      width={160}
                      height={160}
                    />
                    {(product.tags || []).map((tag: string) => (
                      <span key={tag} className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold ${tag === 'Sale' ? 'bg-red-100 text-red-500' : tag === 'New' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>{tag}</span>
                    ))}
                    <button
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                      onClick={() => toggleWishlist(product.id || product._id)}
                      aria-label="Add to wishlist"
                    >
                      <Heart
                        size={20}
                        color={wishlist.includes(String(product.id || product._id)) ? '#F87171' : '#3B82F6'}
                        fill={wishlist.includes(String(product.id || product._id)) ? '#F87171' : 'none'}
                        strokeWidth={2.2}
                      />
                    </button>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm font-semibold text-blue-900">{product.rating}</span>
                      <span className="text-xs text-blue-500">({product.reviews} reviews)</span>
                    </div>
                    <div className="font-bold text-blue-900 mb-1">{product.name}</div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-bold text-blue-900">${product.price.toFixed(2)}</span>
                      {product.oldPrice && <span className="text-sm line-through text-blue-400">${product.oldPrice}</span>}
                    </div>
                    <button 
                      className="mt-auto rounded-full bg-blue-600 text-white font-bold py-2 text-sm shadow hover:bg-blue-700 transition" 
                      onClick={() => handleAddToCart(product)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Search Results */}
        {q && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24">
            <p className="mt-4 text-blue-900 text-lg font-semibold">No products found for &quot;{q}&quot;.</p>
            <p className="text-blue-500">Try a different search term.</p>
            <Link href="/" className="mt-6 px-6 py-2 rounded-full bg-blue-600 text-white font-bold shadow hover:bg-blue-700 transition">Go Home</Link>
          </div>
        )}
        {results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map((product, idx) => (
              <div key={product.id || product._id || idx} className="bg-white rounded-2xl shadow p-4 flex flex-col">
                <div className="relative mb-3">
                  <Image
                    src={
                      Array.isArray(product.image) && product.image.length > 0
                        ? product.image[0]
                        : (typeof product.image === 'string' && product.image.trim() !== ''
                            ? product.image
                            : '/lindo.png')
                    }
                    alt={product.name}
                    className="w-full h-40 object-cover rounded-xl"
                    width={160}
                    height={160}
                  />
                  {(product.tags || []).map((tag: string) => (
                    <span key={tag} className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold ${tag === 'Sale' ? 'bg-red-100 text-red-500' : 'New' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>{tag}</span>
                  ))}
                  <button
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                    onClick={() => toggleWishlist(product.id || product._id)}
                    aria-label="Add to wishlist"
                  >
                    <Heart
                      size={20}
                      color={wishlist.includes(String(product.id || product._id)) ? '#F87171' : '#3B82F6'}
                      fill={wishlist.includes(String(product.id || product._id)) ? '#F87171' : 'none'}
                      strokeWidth={2.2}
                    />
                  </button>
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-yellow-400">★</span>
                    <span className="text-sm font-semibold text-blue-900">{product.rating}</span>
                    <span className="text-xs text-blue-500">({product.reviews} reviews)</span>
                  </div>
                  <div className="font-bold text-blue-900 mb-1">{product.name}</div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-blue-900">${product.price.toFixed(2)}</span>
                    {product.oldPrice && <span className="text-sm line-through text-blue-400">${product.oldPrice}</span>}
                  </div>
                  <button 
                    className="mt-auto rounded-full bg-blue-600 text-white font-bold py-2 text-sm shadow hover:bg-blue-700 transition" 
                    onClick={() => handleAddToCart(product)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function SearchPageWrapper() {
  return (
    <Suspense fallback={null}>
      <SearchPage />
    </Suspense>
  );
} 