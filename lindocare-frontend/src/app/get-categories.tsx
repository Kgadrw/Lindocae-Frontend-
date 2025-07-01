import React, { useEffect, useState } from 'react';

interface Category {
  _id: string;
  name: string;
  description: string;
}

const GetCategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://localhost:5000/category/getAllCategories');
        if (!res.ok) throw new Error('Server error');
        const data = await res.json();
        setCategories(data);
      } catch {
        setError('Failed to fetch categories.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-yellow-200">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">All Categories</h1>
        {loading && <div className="text-center text-gray-500">Loading...</div>}
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}
        {!loading && !error && (
          <ul className="flex flex-col gap-4">
            {categories.length === 0 && <li className="text-gray-500 text-center">No categories found.</li>}
            {categories.map(cat => (
              <li key={cat._id} className="border border-yellow-100 rounded-xl p-4 bg-gray-50">
                <div className="font-bold text-blue-700 text-lg">{cat.name}</div>
                <div className="text-gray-700 text-sm mt-1">{cat.description}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default GetCategoriesPage; 