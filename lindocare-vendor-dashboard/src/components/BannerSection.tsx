import React, { useEffect, useState, useRef } from 'react';

const API_URL = 'https://lindo-project.onrender.com/banner';

const BannerSection: React.FC = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editBanner, setEditBanner] = useState<any | null>(null);
  const [form, setForm] = useState({ title: '', subTitle: '', categoryId: '', image: null as File | null });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch banners
  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/getAllBanners`);
      const data = await res.json();
      setBanners(data.banners || []);
    } catch {
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBanners(); }, []);

  // Handle form input
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === 'image' && files) {
      setForm(f => ({ ...f, image: files[0] }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  // Open modal for create or edit
  const openCreateModal = () => {
    setEditBanner(null);
    setForm({ title: '', subTitle: '', categoryId: '', image: null });
    setShowModal(true);
    setFormError('');
  };
  const openEditModal = (banner: any) => {
    setEditBanner(banner);
    setForm({
      title: banner.title,
      subTitle: banner.subTitle,
      categoryId: banner.category?._id || '',
      image: null,
    });
    setShowModal(true);
    setFormError('');
  };

  // Handle form submit (create or edit)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.title || !form.subTitle || !form.categoryId || (!form.image && !editBanner)) {
      setFormError('Please fill all fields and upload an image');
      return;
    }
    setFormLoading(true);
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('subTitle', form.subTitle);
    formData.append('categoryId', form.categoryId);
    if (form.image) formData.append('images', form.image);
    try {
      let res;
      if (editBanner) {
        res = await fetch(`${API_URL}/updateBanner/${editBanner._id}`, { method: 'PUT', body: formData });
      } else {
        res = await fetch(`${API_URL}/createBanner`, { method: 'POST', body: formData });
      }
      if (res.status === 201 || res.status === 200) {
        setShowModal(false);
        setEditBanner(null);
        setForm({ title: '', subTitle: '', categoryId: '', image: null });
        fetchBanners();
        setSuccessMessage('Banner saved successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await res.json();
        setFormError(data.message || 'Failed to save banner');
      }
    } catch {
      setFormError('Network error');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (bannerId: string) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    setFormLoading(true);
    try {
      await fetch(`${API_URL}/deleteBanner/${bannerId}`, { method: 'DELETE' });
      fetchBanners();
    } catch {}
    setFormLoading(false);
  };

  return (
    <div className="w-full p-0 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Banners</h3>
        <button
          className="bg-blue-700 text-white px-4 py-2 text-xs font-semibold shadow hover:bg-blue-800 transition-all"
          onClick={openCreateModal}
        >
          + Create Banner
        </button>
      </div>
      {/* Banner List */}
      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg shadow-lg border border-indigo-200 w-full overflow-x-auto">
        <table className="min-w-full text-sm text-left border-separate border-spacing-0">
          <thead className="sticky top-0 z-10">
            <tr className="bg-blue-600 text-white shadow-lg">
              <th className="px-6 py-3 font-bold text-white uppercase tracking-wider" style={{textShadow: '0 1px 2px rgba(0,0,0,0.3)'}}>Image</th>
              <th className="px-6 py-3 font-bold text-white uppercase tracking-wider" style={{textShadow: '0 1px 2px rgba(0,0,0,0.3)'}}>Title</th>
              <th className="px-6 py-3 font-bold text-white uppercase tracking-wider" style={{textShadow: '0 1px 2px rgba(0,0,0,0.3)'}}>Subtitle</th>
              <th className="px-6 py-3 font-bold text-white uppercase tracking-wider" style={{textShadow: '0 1px 2px rgba(0,0,0,0.3)'}}>Category</th>
              <th className="px-6 py-3 font-bold text-white uppercase tracking-wider" style={{textShadow: '0 1px 2px rgba(0,0,0,0.3)'}}>Status</th>
              <th className="px-6 py-3 font-bold text-white uppercase tracking-wider text-center" style={{textShadow: '0 1px 2px rgba(0,0,0,0.3)'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td></tr>
            ) : banners.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">No banners found.</td></tr>
            ) : banners.map((banner, index) => (
              <tr key={banner._id} className={`transition-colors ${index % 2 === 0 ? 'bg-white/80 backdrop-blur-sm' : 'bg-indigo-200/50'}`}>
                <td className="px-6 py-4 align-middle">
                  <img src={banner.images?.[0]} alt={banner.title} className="w-16 h-10 object-cover rounded-lg border border-gray-200" />
                </td>
                <td className="px-6 py-4 align-middle font-semibold text-gray-900">{banner.title}</td>
                <td className="px-6 py-4 align-middle text-gray-700">{banner.subTitle}</td>
                <td className="px-6 py-4 align-middle text-gray-700">{banner.category?.name}</td>
                <td className="px-6 py-4 align-middle">
                  <span className={banner.isActive ? 'bg-green-100 text-green-800 px-2 py-0.5 text-[10px] font-semibold rounded' : 'bg-gray-200 text-gray-600 px-2 py-0.5 text-[10px] font-semibold rounded'}>
                    {banner.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 align-middle text-center flex gap-2 items-center justify-center">
                  <button
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 text-xs font-semibold rounded-lg shadow hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-1"
                    onClick={() => openEditModal(banner)}
                  >
                    <span role="img" aria-label="Edit">✏️</span> Edit
                  </button>
                  <button
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 text-xs font-semibold rounded-lg shadow hover:from-red-600 hover:to-red-700 transition-all flex items-center gap-1"
                    onClick={() => handleDelete(banner._id)}
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
      {/* Create/Edit Banner Modal */}
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
            <h4 className="text-lg font-semibold mb-4">{editBanner ? 'Edit Banner' : 'Create Banner'}</h4>
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs text-gray-700 mb-1">Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  placeholder="e.g. Summer Sale Banner"
                  required
                  className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">Subtitle</label>
                <input
                  name="subTitle"
                  value={form.subTitle}
                  onChange={handleFormChange}
                  placeholder="e.g. Up to 50% Off"
                  required
                  className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">Category ID</label>
                <input
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleFormChange}
                  placeholder="e.g. 60f6b5a8f1a4f72a4c8b4566"
                  required
                  className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 placeholder-gray-400"
                />
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
                  {!form.image && editBanner && editBanner.images?.[0] && (
                    <img src={editBanner.images[0]} alt="current" className="mt-1 w-16 h-10 object-cover" />
                  )}
                </div>
              </div>
              {formError && <div className="text-red-600 text-xs font-semibold mt-1">{formError}</div>}
              {successMessage && (
                <div className="bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded relative" role="alert">
                  <strong className="font-bold">Success!</strong>
                  <span className="block sm:inline"> {successMessage}</span>
                  <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                    <button onClick={() => setSuccessMessage('')} className="text-green-800">
                      <svg className="fill-current h-6 w-6" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.15 2.759 3.152a1.2 1.2 0 0 1 0 1.698z"/></svg>
                    </button>
                  </span>
                </div>
              )}
              <button
                type="submit"
                className="bg-blue-700 text-white px-4 py-2 text-xs font-semibold shadow hover:bg-blue-800 transition-all mt-2"
                disabled={formLoading}
              >
                {formLoading ? (editBanner ? 'Saving...' : 'Creating...') : (editBanner ? 'Save Changes' : 'Create Banner')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerSection; 