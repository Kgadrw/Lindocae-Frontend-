import React, { useEffect, useState, useRef } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, X } from 'lucide-react';

const API_URL = 'https://lindo-project.onrender.com/category';

const CategoriesSection: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState<any | null>(null);
  const [form, setForm] = useState({ name: '', description: '', image: null as File | null });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<any | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('userData') : null;
      let openLock: string | null = null;
        if (stored) {
        const parsed = JSON.parse(stored);
          openLock = parsed?.user?.tokens?.accessToken || null;
        }
      const headers: Record<string, string> = {};
      if (openLock) headers['Authorization'] = `Bearer ${openLock}`;
      const res = await fetch(`${API_URL}/getAllCategories`, { headers });
      const data = await res.json();
      const allCategories = data.categories || data || [];
      const activeCategories = allCategories.filter((cat: any) => !cat.isDeleted && cat.isActive !== false);
      setCategories(activeCategories);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle form submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    if (!form.name || !form.description) {
      setFormError('Please fill name and description fields');
      return;
    }
    
    if (!editCategory && !form.image) {
      setFormError('Please upload an image for new categories');
      return;
    }
    
    setFormLoading(true);
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    if (form.image) formData.append('image', form.image);
    
    try {
      const url = editCategory 
        ? `${API_URL}/updateCategoryById/${editCategory._id}`
        : `${API_URL}/createCategory`;
      const method = editCategory ? 'PUT' : 'POST';
      
      const res = await fetch(url, { method, body: formData });
      
      if (res.ok) {
          setShowModal(false);
          setEditCategory(null);
          setForm({ name: '', description: '', image: null });
          fetchCategories();
        setSuccessMessage(editCategory ? 'Category updated!' : 'Category created!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setFormError('Operation failed. Please try again.');
      }
    } catch (error) {
      setFormError('An error occurred');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!categoryToDelete) return;
    
    try {
      const res = await fetch(`${API_URL}/deleteCategory/${categoryToDelete._id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        fetchCategories();
        setSuccessMessage('Category deleted!');
          setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    }
  };

  const openAddModal = () => {
    setEditCategory(null);
    setForm({ name: '', description: '', image: null });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (cat: any) => {
    setEditCategory(cat);
    setForm({ name: cat.name, description: cat.description, image: null });
    setFormError('');
    setShowModal(true);
  };

  const normalizeImageUrl = (url: any) => {
    if (!url) return '';
    // Handle array of images
    if (Array.isArray(url)) {
      url = url[0];
    }
    // Convert to string if not already
    const urlString = typeof url === 'string' ? url : String(url);
    if (!urlString) return '';
    return urlString.startsWith('http') ? urlString : `https://lindo-project.onrender.com/${urlString}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">Manage product categories</p>
        </div>
                        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus size={18} />
          Add Category
                                      </button>
                                    </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {successMessage}
        </div>
      )}

      {/* Categories Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading categories...</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <ImageIcon className="mx-auto mb-3 text-gray-400" size={48} />
          <p>No categories found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div key={cat._id} className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow group">
              {/* Image */}
              <div className="aspect-video bg-gray-100 relative overflow-hidden">
                {cat.image ? (
                  <img
                    src={normalizeImageUrl(cat.image)}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="text-gray-300" size={40} />
                  </div>
                )}
                {/* Action Buttons Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                    onClick={() => openEditModal(cat)}
                    className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                      >
                    <Edit2 size={18} className="text-gray-700" />
                      </button>
                      <button
                    onClick={() => {
                      setCategoryToDelete(cat);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 bg-white rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={18} className="text-red-600" />
                      </button>
                </div>
              </div>
              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 truncate">{cat.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{cat.description}</p>
              </div>
            </div>
          ))}
          </div>
        )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {editCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  {formError}
                </div>
              )}

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Category name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  rows={3}
                  placeholder="Category description"
                  />
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                    <input
                  ref={fileInputRef}
                      type="file"
                      accept="image/*"
                  onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
                {form.image && (
                  <p className="text-xs text-gray-500 mt-1">Selected: {form.image.name}</p>
                )}
            </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {formLoading ? 'Saving...' : editCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
          </div>
        )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Category</h3>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to delete "{categoryToDelete?.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
                  <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
                  </button>
            </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default CategoriesSection; 
