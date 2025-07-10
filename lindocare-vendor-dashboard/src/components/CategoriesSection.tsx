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
        <table className="min-w-full text-sm bg-white rounded-lg shadow overflow-hidden">
          <thead className="bg-gradient-to-r from-blue-200 to-purple-200">
            <tr>
              <th className="px-4 py-2 text-left text-blue-900 font-bold">Name</th>
              <th className="px-4 py-2 text-left text-purple-900 font-bold">Description</th>
              <th className="px-4 py-2 text-left text-green-900 font-bold">Products</th>
              <th className="px-4 py-2 text-center text-red-900 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => {
              const catProducts = products.filter(p => p.category === cat._id);
              const expanded = !!expandedCategories[cat._id];
              return (
                <React.Fragment key={cat._id}>
                  <tr className="border-b last:border-none bg-gradient-to-r from-blue-50 to-purple-50">
                    <td className="px-4 py-2 text-blue-800 font-semibold">{safeRender(cat.name)}</td>
                    <td className="px-4 py-2 text-purple-800">{safeRender(cat.description)}</td>
                    <td className="px-4 py-2">
                      <button
                        className={`px-3 py-1 rounded-full text-xs font-bold transition ${expanded ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700'}`}
                        onClick={() => setExpandedCategories(prev => ({ ...prev, [cat._id]: !prev[cat._id] }))}
                      >
                        {expanded ? 'Hide Products' : `Show Products (${catProducts.length})`}
                      </button>
                    </td>
                    <td className="px-4 py-2 flex gap-2 justify-center">
                      <button className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 font-bold" onClick={() => handleCatEdit(cat)}>Edit</button>
                      <button className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 font-bold" onClick={() => handleCatDelete(cat)}>Delete</button>
                    </td>
                  </tr>
                  {expanded && catProducts.length > 0 && (
                    <tr>
                      <td colSpan={4} className="bg-white p-0">
                        <table className="w-full text-xs bg-gredient-to-r from-green-50 to-blue-50 border-t border-green-200">
                          <thead>
                            <tr>
                              <th className="px-3 py-1 text-left text-green-800 font-bold">Product Name</th>
                              <th className="px-3 py-1 text-left text-yellow-800 font-bold">Price</th>
                              <th className="px-3 py-1 text-left text-blue-800 font-bold">Stock</th>
                              <th className="px-3 py-1 text-left text-purple-800 font-bold">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {catProducts.map(prod => (
                              <tr key={prod._id} className="border-b last:border-none hover:bg-green-100/30">
                                <td className="px-3 py-1 text-green-900 font-semibold">{safeRender(prod.name)}</td>
                                <td className="px-3 py-1 text-yellow-900 font-semibold">${safeRender(prod.price)}</td>
                                <td className="px-3 py-1 text-blue-900">{safeRender(prod.quantity)}</td>
                                <td className="px-3 py-1">
                                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-green-400 text-white">Active</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div className="text-center text-gray-500 py-8">No categories found.</div>
      )
    )}
  </section>
);

export default CategoriesSection; 