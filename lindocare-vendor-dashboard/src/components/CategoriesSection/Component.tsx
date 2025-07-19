import React from 'react';

interface Category {
  _id: string;
  name: string;
  description: string;
}
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stockType: string;
  quantity: number;
  image?: string;
}

interface CategoriesSectionProps {
  categories: Category[];
  products: Product[];
  catLoading: boolean;
  catError: string;
  expandedCategories: { [catId: string]: boolean };
  setExpandedCategories: (cb: (prev: { [catId: string]: boolean }) => { [catId: string]: boolean }) => void;
  handleCatEdit: (cat: Category) => void;
  handleCatDelete: (cat: Category) => void;
  setCatFormOpen: (open: boolean) => void;
  setCatEditId: (id: string | null) => void;
  setCatForm: (form: { name: string; description: string }) => void;
  safeRender: (val: any) => React.ReactNode;
}

const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  categories,
  products,
  catLoading,
  catError,
  expandedCategories,
  setExpandedCategories,
  handleCatEdit,
  handleCatDelete,
  setCatFormOpen,
  setCatEditId,
  setCatForm,
  safeRender,
}) => (
  <section className="bg-white/80 backdrop-blur rounded-2xl shadow-md p-8 border border-blue-50">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-semibold text-gray-800">Categories</h2>
      <button
        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded shadow hover:from-blue-600 hover:to-purple-600 transition font-bold"
        onClick={() => { setCatFormOpen(true); setCatEditId(null); setCatForm({ name: '', description: '' }); }}
      >+ Add Category</button>
    </div>
    {catLoading ? (
      <div className="text-center text-gray-500 py-8">Loading categories...</div>
    ) : catError ? (
      <div className="text-center text-red-500 py-8">{catError}</div>
    ) : (
      Array.isArray(categories) && categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {categories.map(cat => (
            <div key={cat._id} className="bg-white rounded-xl shadow-lg border border-blue-100 flex flex-col overflow-hidden hover:shadow-xl transition">
              {/* Category Image */}
              {cat.image ? (
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-40 object-cover object-center bg-gray-100"
                />
              ) : (
                <div className="w-full h-40 flex items-center justify-center bg-gray-100 text-gray-400 text-4xl">🖼️</div>
              )}
              {/* Name and Description */}
              <div className="flex-1 flex flex-col p-4">
                <h3 className="text-lg font-bold text-blue-900 mb-2 truncate">{safeRender(cat.name)}</h3>
                <p className="text-gray-700 text-sm mb-4 line-clamp-3">{safeRender(cat.description)}</p>
                <div className="mt-auto flex gap-2">
                  <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 font-bold text-xs" onClick={() => handleCatEdit(cat)}>Edit</button>
                  <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 font-bold text-xs" onClick={() => handleCatDelete(cat)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">No categories found.</div>
      )
    )}
  </section>
);

export default CategoriesSection; 