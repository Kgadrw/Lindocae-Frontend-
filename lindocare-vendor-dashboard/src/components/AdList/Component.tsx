import React, { useEffect, useState, useRef } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, X } from 'lucide-react';

const API_URL = 'https://lindo-project.onrender.com/adds';

const AdList: React.FC = () => {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editAd, setEditAd] = useState<any | null>(null);
  const [form, setForm] = useState({ title: '', content: '', buttonLabel: '', link: '', categoryId: '', image: null as File | null });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [adToDelete, setAdToDelete] = useState<any | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch ads
  const fetchAds = async () => {
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
      const res = await fetch(`${API_URL}/getAds`, { headers });
      const data = await res.json();
      setAds(data || []);
    } catch {
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAds(); }, []);

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
    
    if (!form.title || !form.content || !form.buttonLabel || !form.link) {
      setFormError('Please fill in all required fields');
      return;
    }
    
    if (!editAd && !form.image) {
      setFormError('Please upload an image');
      return;
    }
    
    setFormLoading(true);
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('content', form.content);
    formData.append('buttonLabel', form.buttonLabel);
    formData.append('link', form.link);
    if (form.categoryId) formData.append('categoryId', form.categoryId);
    if (form.image) formData.append('image', form.image);
    
    try {
      const url = editAd ? `${API_URL}/updateAdd/${editAd._id}` : `${API_URL}/createAdd`;
      const method = editAd ? 'PUT' : 'POST';
      
      const res = await fetch(url, { method, body: formData });
      
      if (res.ok) {
        setShowModal(false);
        setEditAd(null);
        setForm({ title: '', content: '', buttonLabel: '', link: '', categoryId: '', image: null });
        fetchAds();
        setSuccessMessage(editAd ? 'Ad updated!' : 'Ad created!');
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
    if (!adToDelete) return;
    
    try {
      const res = await fetch(`${API_URL}/deleteAdd/${adToDelete._id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        fetchAds();
        setSuccessMessage('Ad deleted!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setShowDeleteModal(false);
      setAdToDelete(null);
    }
  };

  const openAddModal = () => {
    setEditAd(null);
    setForm({ title: '', content: '', buttonLabel: '', link: '', categoryId: '', image: null });
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (ad: any) => {
    setEditAd(ad);
    setForm({ 
      title: ad.title, 
      content: ad.content, 
      buttonLabel: ad.buttonLabel, 
      link: ad.link, 
      categoryId: ad.categoryId || '', 
      image: null 
    });
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
          <h1 className="text-2xl font-semibold text-gray-900">Advertisements</h1>
          <p className="text-sm text-gray-500 mt-1">Manage promotional ads</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus size={18} />
          Add Ad
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {successMessage}
        </div>
      )}

      {/* Ads Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading ads...</div>
      ) : ads.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <ImageIcon className="mx-auto mb-3 text-gray-400" size={48} />
          <p>No ads found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {ads.map((ad) => (
            <div key={ad._id} className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow group">
              <div className="flex flex-col sm:flex-row">
                {/* Image */}
                <div className="sm:w-48 aspect-video sm:aspect-square bg-gray-100 relative overflow-hidden flex-shrink-0">
                  {ad.image ? (
                    <img
                      src={normalizeImageUrl(ad.image)}
                      alt={ad.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="text-gray-300" size={40} />
                    </div>
                  )}
                </div>
                {/* Content */}
                <div className="flex-1 p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{ad.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ad.content}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-block px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded">
                      {ad.buttonLabel}
                    </span>
                    {ad.categoryId && (
                      <span className="text-xs text-gray-500">Category: {ad.categoryId}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(ad)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setAdToDelete(ad);
                        setShowDeleteModal(true);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {editAd ? 'Edit Ad' : 'Add Ad'}
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
                  name="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Ad title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  name="content"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  rows={3}
                  placeholder="Ad content"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Button Label</label>
                <input
                  type="text"
                  name="buttonLabel"
                  value={form.buttonLabel}
                  onChange={(e) => setForm({ ...form, buttonLabel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Shop Now"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                <input
                  type="text"
                  name="link"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Ad link URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category (Optional)</label>
                <select
                  name="categoryId"
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
                  {formLoading ? 'Saving...' : editAd ? 'Update' : 'Create'}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Ad</h3>
            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to delete "{adToDelete?.title}"? This action cannot be undone.
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

export default AdList;
