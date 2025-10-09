import React, { useEffect, useState, useRef } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, X } from 'lucide-react';

const API_URL = 'https://lindo-project.onrender.com/banner';

const BannerSection: React.FC = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editBanner, setEditBanner] = useState<any | null>(null);
  const [form, setForm] = useState({ title: '', subTitle: '', categoryId: '', image: null as File | null });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [bannerToDelete, setBannerToDelete] = useState<any | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch banners
  const fetchBanners = async () => {
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
      const res = await fetch(`${API_URL}/getAllBanners`, { headers });
      const data = await res.json();
      setBanners(data.banners || []);
    } catch {
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBanners(); }, []);

  // Fetch categories when modal opens
  useEffect(() => {
    if (showModal) {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('userData') : null;
      let openLock: string | null = null;
      if (stored) {
        const parsed = JSON.parse(stored);
        openLock = parsed?.user?.tokens?.accessToken || null;
      }
      const headers: Record<string, string> = {};
      if (openLock) headers['Authorization'] = `Bearer ${openLock}`;
      fetch('https://lindo-project.onrender.com/category/getAllCategories', { headers })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setCategories(data);
          else if (data && Array.isArray(data.categories)) setCategories(data.categories);
          else setCategories([]);
        })
        .catch(() => setCategories([]));
    }
  }, [showModal]);

  // Handle form submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    if (!form.title || !form.subTitle) {
      setFormError('Please fill in all required fields');
      return;
    }
    
    if (!editBanner && !form.image) {
      setFormError('Please upload an image');
      return;
    }
    
    setFormLoading(true);
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('subTitle', form.subTitle);
    if (form.categoryId) formData.append('categoryId', form.categoryId);
    if (form.image) formData.append('image', form.image);
    
    try {
      const url = editBanner ? `${API_URL}/updateBanner/${editBanner._id}` : `${API_URL}/createBanner`;
      const method = editBanner ? 'PUT' : 'POST';
      
      const res = await fetch(url, { method, body: formData });
      
      if (res.ok) {
        setShowModal(false);
        setEditBanner(null);
        setForm({ title: '', subTitle: '', categoryId: '', image: null });
        fetchBanners();
        setSuccessMessage(editBanner ? 'Banner updated!' : 'Banner created!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setFormError('Operation failed');
      }
    } catch (error) {
      setFormError('An error occurred');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!bannerToDelete) return;
    
    try {
      const res = await fetch(`${API_URL}/deleteBanner/${bannerToDelete._id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        fetchBanners();
        setSuccessMessage('Banner deleted!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setShowDeleteModal(false);
      setBannerToDelete(null);
    }
  };

  const openAddModal = () => {
    setEditBanner(null);
    setForm({ title: '', subTitle: '', categoryId: '', image: null });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (banner: any) => {
    setEditBanner(banner);
    setForm({ 
      title: banner.title, 
      subTitle: banner.subTitle, 
      categoryId: banner.categoryId || '', 
      image: null 
    });
    setFormError('');
    setShowModal(true);
  };

  const normalizeImageUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://lindo-project.onrender.com/${url}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Banners</h1>
          <p className="text-sm text-gray-500 mt-1">Manage homepage banners</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus size={18} />
          Add Banner
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {successMessage}
        </div>
      )}

      {/* Banners Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading banners...</div>
      ) : banners.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <ImageIcon className="mx-auto mb-3 text-gray-400" size={48} />
          <p>No banners found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((banner) => (
            <div key={banner._id} className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow group">
              {/* Image */}
              <div className="aspect-[2/1] bg-gray-100 relative overflow-hidden">
                {banner.image ? (
                  <img
                    src={normalizeImageUrl(banner.image)}
                    alt={banner.title}
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
                    onClick={() => openEditModal(banner)}
                    className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Edit2 size={18} className="text-gray-700" />
                  </button>
                  <button
                    onClick={() => {
                      setBannerToDelete(banner);
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
                <h3 className="font-semibold text-gray-900 mb-1">{banner.title}</h3>
                <p className="text-sm text-gray-600">{banner.subTitle}</p>
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
                {editBanner ? 'Edit Banner' : 'Add Banner'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Banner title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={form.subTitle}
                  onChange={(e) => setForm({ ...form, subTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Banner subtitle"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category (Optional)</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
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
                  {formLoading ? 'Saving...' : editBanner ? 'Update' : 'Create'}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Banner</h3>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to delete "{bannerToDelete?.title}"? This action cannot be undone.
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

export default BannerSection;
