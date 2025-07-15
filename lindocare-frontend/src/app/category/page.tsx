import React, { useState } from 'react';
import Link from 'next/link';

// Template categories (replace with API data later)
const categories = [
  { name: 'Cribs', count: 128, image: 'https://images.pexels.com/photos/459225/pexels-photo-459225.jpeg', description: 'Safe and cozy cribs for your baby.' },
  { name: 'Changing Tables', count: 140, image: 'https://images.pexels.com/photos/3933276/pexels-photo-3933276.jpeg', description: 'Convenient changing tables for easy diaper changes.' },
  { name: 'Rocking Chairs', count: 95, image: 'https://images.pexels.com/photos/3933275/pexels-photo-3933275.jpeg', description: 'Comfortable rocking chairs for soothing moments.' },
  { name: 'Baby Dressers', count: 87, image: 'https://images.pexels.com/photos/3933277/pexels-photo-3933277.jpeg', description: 'Spacious dressers for baby clothes and essentials.' },
  { name: 'Playpens & Playards', count: 77, image: 'https://images.pexels.com/photos/3933278/pexels-photo-3933278.jpeg', description: 'Safe playpens and playards for playtime.' },
];

const CategoryLandingPage = () => {
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 pt-10 pb-16">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Shop by Category</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {categories.map(cat => (
            <div
              key={cat.name}
              className="group bg-white rounded-2xl shadow hover:shadow-lg transition cursor-pointer flex flex-col h-[320px]"
            >
              <Link href={`/category/${encodeURIComponent(cat.name)}`} className="block flex-1">
                <div className="w-full h-40 overflow-hidden rounded-t-2xl">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover object-center block"
                    style={{ display: 'block', width: '100%', height: '100%' }}
                  />
                </div>
                <div className="flex flex-col items-start px-4 pt-4">
                  <div className="font-bold text-lg text-gray-800 mb-1 truncate w-full">{cat.name}</div>
                  <div className="text-sm text-gray-500 mb-2">{cat.count} products</div>
                </div>
              </Link>
              <button
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 px-4 pb-2 pt-1 text-sm font-medium focus:outline-none"
                onClick={() => setExpanded(expanded === cat.name ? null : cat.name)}
                aria-label={expanded === cat.name ? 'Hide description' : 'Show description'}
              >
                <span>{expanded === cat.name ? 'Hide details' : 'Show details'}</span>
                <span className={`transform transition-transform ${expanded === cat.name ? 'rotate-90' : ''}`}>→</span>
              </button>
              {expanded === cat.name && (
                <div className="px-4 pb-4 text-gray-700 text-xs transition-all duration-200">{cat.description}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryLandingPage; 