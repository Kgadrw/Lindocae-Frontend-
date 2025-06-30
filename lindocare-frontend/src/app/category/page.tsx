import React from 'react';
import Link from 'next/link';

// Template categories (replace with API data later)
const categories = [
  { name: 'Cribs', count: 128, image: 'https://images.pexels.com/photos/459225/pexels-photo-459225.jpeg' },
  { name: 'Changing Tables', count: 140, image: 'https://images.pexels.com/photos/3933276/pexels-photo-3933276.jpeg' },
  { name: 'Rocking Chairs', count: 95, image: 'https://images.pexels.com/photos/3933275/pexels-photo-3933275.jpeg' },
  { name: 'Baby Dressers', count: 87, image: 'https://images.pexels.com/photos/3933277/pexels-photo-3933277.jpeg' },
  { name: 'Playpens & Playards', count: 77, image: 'https://images.pexels.com/photos/3933278/pexels-photo-3933278.jpeg' },
];

const CategoryLandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 pt-10 pb-16">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Shop by Category</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {categories.map(cat => (
            <Link key={cat.name} href={`/category/${encodeURIComponent(cat.name)}`} className="group block bg-white rounded-2xl shadow hover:shadow-lg transition p-4 cursor-pointer">
              <div className="relative mb-4">
                <img src={cat.image} alt={cat.name} className="w-full h-40 object-cover rounded-xl group-hover:scale-105 transition-transform" />
              </div>
              <div className="flex flex-col items-center">
                <div className="font-bold text-lg text-gray-800 mb-1">{cat.name}</div>
                <div className="text-sm text-gray-500">{cat.count} products</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryLandingPage; 