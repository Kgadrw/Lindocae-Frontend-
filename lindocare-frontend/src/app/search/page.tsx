"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Heart } from "lucide-react";
import { getCurrentUserEmail } from '../../components/Header';
import Image from 'next/image';

// Template products (should match those in category page)
const productsData = [
  {
    id: 1,
    name: "Sorelle Natural Pinewood Crib",
    price: 526.63,
    oldPrice: 567.05,
    image: "https://images.pexels.com/photos/459225/pexels-photo-459225.jpeg",
    reviews: 22,
    rating: 4.8,
    tags: ["Sale"],
    delivery: ["Fast Delivery"],
  },
  {
    id: 2,
    name: "Premium Changing Table",
    price: 289.99,
    image: "https://images.pexels.com/photos/3933276/pexels-photo-3933276.jpeg",
    reviews: 15,
    rating: 4.5,
    tags: [],
    delivery: ["Pickup Nearby"],
  },
  {
    id: 3,
    name: "Comfort Rocking Chair",
    price: 459.0,
    image: "https://images.pexels.com/photos/3933275/pexels-photo-3933275.jpeg",
    reviews: 45,
    rating: 4.7,
    tags: ["Featured"],
    delivery: ["Fast Delivery"],
  },
  {
    id: 4,
    name: "Baby Dresser & Changer",
    price: 399.99,
    image: "https://images.pexels.com/photos/3933277/pexels-photo-3933277.jpeg",
    reviews: 28,
    rating: 4.6,
    tags: [],
    delivery: ["Pickup Nearby"],
  },
  {
    id: 5,
    name: "Portable Baby Playpen",
    price: 179.99,
    image: "https://images.pexels.com/photos/3933278/pexels-photo-3933278.jpeg",
    reviews: 12,
    rating: 4.4,
    tags: ["New"],
    delivery: ["Fast Delivery"],
  },
  {
    id: 6,
    name: "Organic Crib Mattress",
    price: 299.99,
    image: "https://images.pexels.com/photos/3933279/pexels-photo-3933279.jpeg",
    reviews: 67,
    rating: 4.9,
    tags: [],
    delivery: ["Pickup Nearby"],
  },
];

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
  const [wishlist, setWishlist] = React.useState<number[]>([]);
  const [recommended, setRecommended] = React.useState<typeof productsData>([]);
  const [results, setResults] = React.useState<typeof productsData>([]);

  React.useEffect(() => {
    if (!isClient) return;
    // Get user email
    const userEmail = getCurrentUserEmail();
    const wishlistKey = userEmail ? `wishlist_${userEmail}` : 'wishlist';
    const searchHistoryKey = userEmail ? `searchHistory_${userEmail}` : 'searchHistory';
    // Get wishlist
    const savedWishlist = localStorage.getItem(wishlistKey);
    setWishlist(savedWishlist ? JSON.parse(savedWishlist) : []);
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
    // Results
    setResults(query ? productsData.filter((p) => p.name.toLowerCase().includes(query)) : []);
    // Recommended
    const freqMap: Record<string, number> = {};
    history.forEach((term: string) => {
      const t = term.trim().toLowerCase();
      if (t) freqMap[t] = (freqMap[t] || 0) + 1;
    });
    const favoriteTerms = Object.entries(freqMap)
      .sort((a, b) => b[1] - a[1])
      .map(([term]) => term)
      .slice(0, 2);
    let recommendedProducts = productsData.filter(
      p => favoriteTerms.some(term => p.name.toLowerCase().includes(term)) || (savedWishlist ? JSON.parse(savedWishlist).includes(p.id) : false)
    );
    recommendedProducts = recommendedProducts.filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i);
    setRecommended(recommendedProducts);
  }, [isClient, q, query]);

  const toggleWishlist = (id: number) => {
    if (!isClient) return;
    const userEmail = getCurrentUserEmail();
    const wishlistKey = userEmail ? `wishlist_${userEmail}` : 'wishlist';
    setWishlist((prev) => {
      const updated = prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id];
      localStorage.setItem(wishlistKey, JSON.stringify(updated));
      return updated;
    });
  };

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
              {recommended.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl shadow p-4 flex flex-col">
                  <div className="relative mb-3">
                    <Image src={product.image} alt={product.name} className="w-full h-40 object-cover rounded-xl" width={160} height={160} />
                    {product.tags.map((tag) => (
                      <span key={tag} className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold ${tag === 'Sale' ? 'bg-red-100 text-red-500' : tag === 'New' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>{tag}</span>
                    ))}
                    <button
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                      onClick={() => toggleWishlist(product.id)}
                      aria-label="Add to wishlist"
                    >
                      <Heart
                        size={20}
                        color={wishlist.includes(product.id) ? '#F87171' : '#3B82F6'}
                        fill={wishlist.includes(product.id) ? '#F87171' : 'none'}
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
                    <button className="mt-auto rounded-full bg-blue-600 text-white font-bold py-2 text-sm shadow hover:bg-blue-700 transition">Add to Cart</button>
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
            {results.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow p-4 flex flex-col">
                <div className="relative mb-3">
                  <Image src={product.image} alt={product.name} className="w-full h-40 object-cover rounded-xl" width={160} height={160} />
                  {product.tags.map((tag) => (
                    <span key={tag} className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold ${tag === 'Sale' ? 'bg-red-100 text-red-500' : tag === 'New' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>{tag}</span>
                  ))}
                  <button
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                    onClick={() => toggleWishlist(product.id)}
                    aria-label="Add to wishlist"
                  >
                    <Heart
                      size={20}
                      color={wishlist.includes(product.id) ? '#F87171' : '#3B82F6'}
                      fill={wishlist.includes(product.id) ? '#F87171' : 'none'}
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
                  <button className="mt-auto rounded-full bg-blue-600 text-white font-bold py-2 text-sm shadow hover:bg-blue-700 transition">Add to Cart</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage; 