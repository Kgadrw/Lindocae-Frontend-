import React, { useEffect, useState, useRef } from 'react';

const API_URL = 'https://lindo-project.onrender.com/adds';

const AdList: React.FC = () => {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editAd, setEditAd] = useState<any | null>(null);
  const [form, setForm] = useState({ title: '', content: '', buttonLabel: '', link: '', categoryId: '', image: null as File | null });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [categories, setCategories] = useState<any[]>([]);

  // Fetch ads
  const fetchAds = async () => {
    setLoading(true);
    try {
      // passing The Token in The Local Storage
      const stored = typeof window !== 'undefined' ? localStorage.getItem('userData') : null;
      let openLock: string | null = null;
      try {
        if (stored) {
          const parsed = JSON.parse(stored); // back to object
          openLock = parsed?.user?.tokens?.accessToken || null;
          if (openLock) { console.log(openLock); console.log(openLock); }
        }
      } catch {}
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
      // passing The Token in The Local Storage
      const stored = typeof window !== 'undefined' ? localStorage.getItem('userData') : null;
      let openLock: string | null = null;
      try {
        if (stored) {
          const parsed = JSON.parse(stored); // back to object
          openLock = parsed?.user?.tokens?.accessToken || null;
        }
      } catch {}
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

  // Handle form input
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === 'image' && files) {
      setForm(f => ({ ...f, image: files[0] }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  // Open modal for create or edit
  const openCreateModal = () => {
    setEditAd(null);
    setForm({ title: '', content: '', buttonLabel: '', link: '', categoryId: '', image: null });
    setShowModal(true);
    setFormError('');
  };
  const openEditModal = (ad: any) => {
    setEditAd(ad);
    setForm({
      title: ad.title,
      content: ad.content,
      buttonLabel: ad.buttonLabel,
      link: ad.link || '',
      categoryId: ad.categoryId || '',
      image: null,
    });
    setShowModal(true);
    setFormError('');
  };

  // Handle form submit (create or edit)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.title || !form.content || !form.buttonLabel || !form.categoryId || (!form.image && !editAd)) {
      setFormError('Please fill all fields and upload an image');
      return;
    }
    setFormLoading(true);
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('content', form.content);
    formData.append('buttonLabel', form.buttonLabel);
    formData.append('link', form.link);
    formData.append('categoryId', form.categoryId);
    if (form.image) formData.append('image', form.image);
    try {
      let res;
      if (editAd) {
        // passing The Token in The Local Storage
        const stored = typeof window !== 'undefined' ? localStorage.getItem('userData') : null;
        let openLock: string | null = null;
        try {
          if (stored) {
            const parsed = JSON.parse(stored); // back to object
            openLock = parsed?.user?.tokens?.accessToken || null;
          }
        } catch {}
        const headers: Record<string, string> = {};
        if (openLock) headers['Authorization'] = `Bearer ${openLock}`;
        res = await fetch(`${API_URL}/updateAd/${editAd._id}`, { method: 'PUT', body: formData, headers });
      } else {
        // passing The Token in The Local Storage
        const stored = typeof window !== 'undefined' ? localStorage.getItem('userData') : null;
        let openLock: string | null = null;
        try {
          if (stored) {
            const parsed = JSON.parse(stored); // back to object
            openLock = parsed?.user?.tokens?.accessToken || null;
          }
        } catch {}
        const headers: Record<string, string> = {};
        if (openLock) headers['Authorization'] = `Bearer ${openLock}`;
        res = await fetch(`${API_URL}/createAd`, { method: 'POST', body: formData, headers });
      }
      if (res.status === 201 || res.status === 200) {
        setShowModal(false);
        setEditAd(null);
        setForm({ title: '', content: '', buttonLabel: '', link: '', categoryId: '', image: null });
        fetchAds();
        setSuccessMessage('Ad saved successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await res.json();
        setFormError(data.message || 'Failed to save ad');
      }
    } catch {
      setFormError('Network error');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (adId: string) => {
    if (!window.confirm('Are you sure you want to delete this ad?')) return;
    setFormLoading(true);
    try {
      // passing The Token in The Local Storage
      const stored = typeof window !== 'undefined' ? localStorage.getItem('userData') : null;
      let openLock: string | null = null;
      try {
        if (stored) {
          const parsed = JSON.parse(stored); // back to object
          openLock = parsed?.user?.tokens?.accessToken || null;
        }
      } catch {}
      const headers: Record<string, string> = {};
      if (openLock) headers['Authorization'] = `Bearer ${openLock}`;
      await fetch(`${API_URL}/deleteAd/${adId}`, { method: 'DELETE', headers });
      fetchAds();
    } catch {}
    setFormLoading(false);
  };

  return (
    <div className="w-full p-0 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Ads</h3>
        <button
          className="bg-blue-700 text-white px-4 py-2 text-xs font-semibold shadow hover:bg-blue-800 transition-all"
          onClick={openCreateModal}
        >
          + Create Ad
        </button>
      </div>
      {/* Ads List */}
      <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg shadow-lg border border-pink-200 w-full overflow-x-auto">
        <table className="min-w-full text-sm text-left border-separate border-spacing-0">
          <thead className="sticky top-0 z-10">
            <tr className="bg-blue-600 text-white shadow-lg">
              <th className="px-6 py-3 font-bold text-white uppercase tracking-wider" style={{textShadow: '0 1px 2px rgba(0,0,0,0.3)'}}>Image</th>
              <th className="px-6 py-3 font-bold text-white uppercase tracking-wider" style={{textShadow: '0 1px 2px rgba(0,0,0,0.3)'}}>Title</th>
              <th className="px-6 py-3 font-bold text-white uppercase tracking-wider" style={{textShadow: '0 1px 2px rgba(0,0,0,0.3)'}}>Content</th>
              <th className="px-6 py-3 font-bold text-white uppercase tracking-wider" style={{textShadow: '0 1px 2px rgba(0,0,0,0.3)'}}>Button</th>
              <th className="px-6 py-3 font-bold text-white uppercase tracking-wider" style={{textShadow: '0 1px 2px rgba(0,0,0,0.3)'}}>Link</th>
              <th className="px-6 py-3 font-bold text-white uppercase tracking-wider" style={{textShadow: '0 1px 2px rgba(0,0,0,0.3)'}}>Category</th>
              <th className="px-6 py-3 font-bold text-white uppercase tracking-wider text-center" style={{textShadow: '0 1px 2px rgba(0,0,0,0.3)'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">Loading...</td></tr>
            ) : ads.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">No ads found.</td></tr>
            ) : ads.map((ad, index) => (
              <tr key={ad._id} className={`transition-colors ${index % 2 === 0 ? 'bg-white/80 backdrop-blur-sm' : 'bg-pink-200/50'}`}>
                <td className="px-6 py-4 align-middle">
                  <img src={ad.image?.[0] || ad.image} alt={ad.title} className="w-16 h-10 object-cover rounded-lg border border-gray-200" />
                </td>
                <td className="px-6 py-4 align-middle font-semibold text-gray-900">{ad.title}</td>
                <td className="px-6 py-4 align-middle text-gray-700">{ad.content}</td>
                <td className="px-6 py-4 align-middle text-blue-700 font-semibold">{ad.buttonLabel}</td>
                <td className="px-6 py-4 align-middle text-gray-700 break-words">{ad.link}</td>
                <td className="px-6 py-4 align-middle text-gray-700">{categories.find((cat: any) => cat._id === ad.categoryId)?.name || ad.categoryId}</td>
                <td className="px-6 py-4 align-middle text-center flex gap-2 items-center justify-center">
                  <button
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 text-xs font-semibold rounded-lg shadow hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-1"
                    onClick={() => openEditModal(ad)}
                  >
                    <span role="img" aria-label="Edit">✏️</span> Edit
                  </button>
                  <button
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 text-xs font-semibold rounded-lg shadow hover:from-red-600 hover:to-red-700 transition-all flex items-center gap-1"
                    onClick={() => handleDelete(ad._id)}
                    disabled={formLoading}
                  >
                    <span role="img" aria-label="Delete">🗑️</span> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Create/Edit Ad Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white p-6 shadow-md w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h4 className="text-lg font-semibold mb-4">{editAd ? 'Edit Ad' : 'Create Ad'}</h4>
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs text-gray-700 mb-1">Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  placeholder="e.g. Summer Sale Ad"
                  required
                  className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">Content</label>
                <textarea
                  name="content"
                  value={form.content}
                  onChange={handleFormChange}
                  placeholder="e.g. Up to 50% Off"
                  required
                  className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 placeholder-gray-400 resize-y"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">Button Label</label>
                <input
                  name="buttonLabel"
                  value={form.buttonLabel}
                  onChange={handleFormChange}
                  placeholder="e.g. Shop Now"
                  required
                  className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">Link</label>
                <input
                  name="link"
                  value={form.link}
                  onChange={handleFormChange}
                  placeholder="e.g. https://yourshop.com"
                  className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">Category</label>
                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleFormChange}
                  required
                  className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 bg-white"
                >
                  <option value="" disabled>Select category</option>
                  {categories.map((cat: any) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">Image</label>
                <div
                  className={`border-2 border-dashed px-2 py-2 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 bg-gray-50 ${form.image ? 'border-blue-700' : 'border-gray-300'}`}
                  onClick={() => fileInputRef.current?.click()}
                  style={{ borderRadius: 0 }}
                >
                  <input
                    ref={fileInputRef}
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFormChange}
                    className="hidden"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
                  <span className="text-gray-500 text-xs">Drop image or click to upload</span>
                  {form.image && (
                    <img src={URL.createObjectURL(form.image)} alt="preview" className="mt-1 w-16 h-10 object-cover" />
                  )}
                  {/* Show current image if editing and no new image selected */}
                  {!form.image && editAd && adImagePreview(editAd) && (
                    <img src={adImagePreview(editAd)} alt="current" className="mt-1 w-16 h-10 object-cover" />
                  )}
                </div>
              </div>
              {formError && <div className="text-red-600 text-xs font-semibold mt-1">{formError}</div>}
              {successMessage && (
                <div className="bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded relative" role="alert">
                  <strong className="font-bold">Success!</strong>
                  <span className="block sm:inline"> {successMessage}</span>
                  <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                    <button onClick={() => setSuccessMessage('')} className="text-green-800 hover:text-green-900">
                      <svg className="fill-current h-6 w-6" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    </button>
                  </span>
                </div>
              )}
              <button
                type="submit"
                className="bg-blue-700 text-white px-4 py-2 text-xs font-semibold shadow hover:bg-blue-800 transition-all mt-2"
                disabled={formLoading}
              >
                {formLoading ? (editAd ? 'Saving...' : 'Creating...') : (editAd ? 'Save Changes' : 'Create Ad')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper to get image preview for edit
function adImagePreview(ad: any) {
  if (ad.image && Array.isArray(ad.image) && ad.image[0]) return ad.image[0];
  if (ad.images && Array.isArray(ad.images) && ad.images[0]) return ad.images[0];
  if (typeof ad.image === 'string') return ad.image;
  return '';
}

export default AdList; 