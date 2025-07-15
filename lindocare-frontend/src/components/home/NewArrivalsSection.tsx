import React from 'react';
import { Heart } from 'lucide-react';
import Link from 'next/link';

interface Product {
  _id?: string;
  id?: string | number;
  name: string;
  price: number;
  oldPrice?: number;
  image?: string[] | string;
  rating?: number;
  reviews?: number;
  tags?: string[];
}

interface NewArrivalsSectionProps {
  filteredProducts: Product[];
  prodLoading: boolean;
  prodError: string;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  handleAddToCart: (product: Product) => void;
  priceMin: string;
  setPriceMin: (v: string) => void;
  priceMax: string;
  setPriceMax: (v: string) => void;
  sort: string;
  setSort: (v: string) => void;
  sortOptions: { value: string; label: string }[];
  handleClearAll: () => void;
}

const NewArrivalsSection: React.FC<NewArrivalsSectionProps> = ({
  filteredProducts,
  prodLoading,
  prodError,
  wishlist,
  toggleWishlist,
  handleAddToCart,
  priceMin,
  setPriceMin,
  priceMax,
  setPriceMax,
  sort,
  setSort,
  sortOptions,
  handleClearAll,
}) => {
  return (
    <section className="mb-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-center text-blue-700">New Arrivals</h2>
        <Link
          href="/all-products"
          className="text-yellow-500 text-sm font-semibold hover:underline focus:outline-none ml-4"
          style={{ minWidth: 70 }}
        >
          See more
        </Link>
      </div>
      {/* Filters and Sorting Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white rounded-xl p-4">
        {/* Price Range Filter (left) */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-blue-900">Price:</span>
          <input type="number" placeholder="Min" className="w-20 rounded-lg border px-2 py-1 text-sm text-blue-900" value={priceMin} onChange={e => setPriceMin(e.target.value)} />
          <span>-</span>
          <input type="number" placeholder="Max" className="w-20 rounded-lg border px-2 py-1 text-sm text-blue-900" value={priceMax} onChange={e => setPriceMax(e.target.value)} />
        </div>
        {/* Sort Dropdown (right) */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="font-semibold text-blue-900">Sort by:</span>
          <select className="rounded-lg border px-2 py-1 text-sm text-blue-900" value={sort} onChange={e => setSort(e.target.value)}>
            {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <button className="text-blue-600 text-sm font-medium hover:underline ml-2" onClick={handleClearAll}>Clear All</button>
        </div>
      </div>
      {prodLoading ? (
        <div className="text-center text-gray-500 py-8">Loading products...</div>
      ) : prodError ? (
        <div className="text-center text-red-500 py-8">{prodError}</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No products found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.slice(0, 12).map((prod, idx) => (
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
                  onClick={() => toggleWishlist(String(prod.id || prod._id))}
                  aria-label="Add to wishlist"
                >
                  <Heart
                    size={20}
                    color={wishlist.includes(String(prod.id || prod._id)) ? '#F87171' : '#3B82F6'}
                    fill={wishlist.includes(String(prod.id || prod._id)) ? '#F87171' : 'none'}
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
  );
};

export default NewArrivalsSection; 