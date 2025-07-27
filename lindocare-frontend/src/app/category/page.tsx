"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  count?: number;
}

const CategoryLandingPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('https://lindo-project.onrender.com/category/getAllCategories');
        if (!res.ok) throw new Error('Server error');
        const data = await res.json();
        const cats = Array.isArray(data) ? data : (data.categories || []);
        setCategories(cats);
      } catch {
        setError('Failed to fetch categories.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 pt-10 pb-16">
        <h1 className="text-3xl font-bold text-black mb-8 text-center">Shop by Category</h1>
        {loading && <div className="text-center text-gray-500">Loading categories...</div>}
        {error && <div className="text-center text-red-500">{error}</div>}
        {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {categories.length === 0 && <div className="col-span-full text-center text-gray-500">No categories found.</div>}
          {categories.map(cat => (
            <div
                key={cat._id}
              className="group bg-white rounded-2xl shadow hover:shadow-lg transition cursor-pointer flex flex-col h-[320px] border border-black"
            >
                <Link
                  href="/all-products"
                  className="block flex-1"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('selectedCategoryId', cat._id);
                      localStorage.setItem('selectedCategoryName', cat.name);
                    }
                  }}
                >
                <div className="w-full h-40 overflow-hidden rounded-t-2xl border-b border-black">
                  <Image
                      src={cat.image || '/lindo.png'}
                    alt={cat.name}
                    className="w-full h-full object-cover object-center block"
                    width={300}
                    height={200}
                  />
                </div>
                <div className="flex flex-col items-start px-4 pt-4">
                  <div className="font-bold text-lg text-black mb-1 truncate w-full">{cat.name}</div>
                    <div className="text-sm text-black mb-2">{cat.count ?? 0} products</div>
                </div>
              </Link>
                {cat.description && (
                <div className="px-4 pb-4 text-black text-xs transition-all duration-200">{cat.description}</div>
              )}
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
};

export default CategoryLandingPage; 