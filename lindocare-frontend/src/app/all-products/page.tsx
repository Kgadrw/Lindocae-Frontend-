"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { getCurrentUserEmail } from "../components/Header";

export default function AllProductsPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wishlist, setWishlist] = useState<number[]>([]);

  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([
      fetch("https://lindo-project.onrender.com/category/getAllCategories").then(res => res.json()),
      fetch("https://lindo-project.onrender.com/product/getAllProduct").then(res => res.json()),
    ])
      .then(([catData, prodData]) => {
        let cats = Array.isArray(catData) ? catData : catData.categories || [];
        let prods = Array.isArray(prodData) ? prodData : prodData.products || [];
        setCategories(cats);
        setProducts(prods);
      })
      .catch(() => setError("Failed to fetch products or categories."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("wishlist");
    setWishlist(saved ? JSON.parse(saved) : []);
  }, []);

  const toggleWishlist = (id: number) => {
    setWishlist((prev) => {
      const updated = prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id];
      localStorage.setItem("wishlist", JSON.stringify(updated));
      window.dispatchEvent(new StorageEvent("storage", { key: "wishlist" }));
      return updated;
    });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-700 text-xl">Loading all products...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 text-xl">{error}</div>;

  // Group products by category name
  const productsByCategory: Record<string, any[]> = {};
  products.forEach((prod) => {
    if (!prod.category) return;
    if (!productsByCategory[prod.category]) productsByCategory[prod.category] = [];
    productsByCategory[prod.category].push(prod);
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-16 px-4 md:px-8 lg:px-16 font-sans">
      <div className="max-w-7xl mx-auto pt-10 pb-16">
        <h1 className="text-3xl font-bold text-blue-900 mb-8 text-center">All Products by Category</h1>
        {categories.map((cat) => {
          const catProducts = productsByCategory[cat.name] || [];
          if (catProducts.length === 0) return null;
          return (
            <section key={cat._id || cat.name} className="mb-12">
              <h2 className="text-2xl font-bold text-blue-700 mb-6">{cat.name}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {catProducts.map((prod, idx) => {
                  let image = '';
                  if (Array.isArray(prod.image) && prod.image.length > 0) image = prod.image[0];
                  else if (typeof prod.image === 'string') image = prod.image;
                  return (
                    <div key={prod._id || prod.id || idx} className="bg-white rounded-2xl shadow p-4 flex flex-col">
                      <div className="relative mb-3">
                        {image && (
                          <img src={image} alt={prod.name} className="w-full h-40 object-cover rounded-xl" />
                        )}
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
                        <button className="mt-auto rounded-full bg-blue-600 text-white font-bold py-2 text-sm shadow hover:bg-blue-700 transition">Add to Cart</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
        {/* If no products at all */}
        {categories.every(cat => (productsByCategory[cat.name] || []).length === 0) && (
          <div className="text-center text-gray-500 py-8">No products found.</div>
        )}
      </div>
    </div>
  );
} 