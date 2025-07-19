import React, { useEffect, useState, useRef } from 'react';

const API_URL = 'https://lindo-project.onrender.com/category';
const ICONS_URL = 'https://lindo-project.onrender.com/icons';

const CategoriesSection: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [icons, setIcons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);
  const [editCategory, setEditCategory] = useState<any | null>(null);
  const [iconCategoryId, setIconCategoryId] = useState<string>('');
  const [form, setForm] = useState({ name: '', description: '', image: null as File | null });
  const [iconForm, setIconForm] = useState({ title: '', image: null as File | null, categoryId: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [iconFormError, setIconFormError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iconFileInputRef = useRef<HTMLInputElement>(null);
  const [editIcon, setEditIcon] = useState<any | null>(null);

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/getAllCategories`);
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch icons
  const fetchIcons = async () => {
    try {
      const res = await fetch(`${ICONS_URL}/getIcons`);
      const data = await res.json();
      setIcons(Array.isArray(data) ? data : []);
    } catch {
      setIcons([]);
    }
  };

  useEffect(() => { fetchCategories(); fetchIcons(); }, []);

  // Handle form input
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === 'image' && files) {
      setForm(f => ({ ...f, image: files[0] }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };
  const handleIconFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === 'image' && files) {
      setIconForm(f => ({ ...f, image: files[0] }));
    } else {
      setIconForm(f => ({ ...f, [name]: value }));
    }
  };

  // Open modal for create or edit
  const openCreateModal = () => {
    setEditCategory(null);
    setForm({ name: '', description: '', image: null });
    setShowModal(true);
    setFormError('');
  };
  const openEditModal = (cat: any) => {
    setEditCategory(cat);
    setForm({
      name: cat.name,
      description: cat.description,
      image: null,
    });
    setShowModal(true);
    setFormError('');
  };
  // Open icon modal
  const openIconModal = (categoryId: string, icon?: any) => {
    setIconCategoryId(categoryId);
    if (icon) {
      setEditIcon(icon);
      setIconForm({
        title: icon.title,
        image: null,
        categoryId: icon.categoryId?._id || icon.categoryId || '',
      });
    } else {
      setEditIcon(null);
      setIconForm({ title: '', image: null, categoryId });
    }
    setShowIconModal(true);
    setIconFormError('');
  };

  // Handle form submit (create or edit)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.name || !form.description || (!form.image && !editCategory)) {
      setFormError('Please fill all fields and upload an image');
      return;
    }
    setFormLoading(true);
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    if (form.image) formData.append('image', form.image);
    try {
      let res;
      if (editCategory) {
        res = await fetch(`${API_URL}/updateCategory/${editCategory._id}`, { method: 'PUT', body: formData });
      } else {
        res = await fetch(`${API_URL}/createCategory`, { method: 'POST', body: formData });
      }
      if (res.status === 201 || res.status === 200) {
        setShowModal(false);
        setEditCategory(null);
        setForm({ name: '', description: '', image: null });
        fetchCategories();
        setSuccessMessage('Category saved successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await res.json();
        setFormError(data.message || 'Failed to save category');
      }
    } catch {
      setFormError('Network error');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle icon form submit
  const handleIconFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIconFormError('');
    if (!iconForm.title || !iconForm.categoryId || (!iconForm.image && !editIcon)) {
      setIconFormError('Please fill all fields and upload an image');
      return;
    }
    setFormLoading(true);
    const formData = new FormData();
    formData.append('title', iconForm.title);
    formData.append('categoryId', iconForm.categoryId);
    if (iconForm.image) formData.append('image', iconForm.image);
    try {
      let res;
      if (editIcon) {
        res = await fetch(`${ICONS_URL}/updateIcon/${editIcon._id}`, { method: 'PUT', body: formData });
      } else {
        res = await fetch(`${ICONS_URL}/createIcon`, { method: 'POST', body: formData });
      }
      if (res.status === 201 || res.status === 200) {
        setShowIconModal(false);
        setEditIcon(null);
        setIconForm({ title: '', image: null, categoryId: '' });
        fetchIcons();
        setSuccessMessage('Icon saved successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await res.json();
        setIconFormError(data.message || 'Failed to save icon');
      }
    } catch {
      setIconFormError('Network error');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (catId: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    setFormLoading(true);
    try {
      await fetch(`${API_URL}/deleteCategory/${catId}`, { method: 'DELETE' });
      fetchCategories();
    } catch {}
    setFormLoading(false);
  };

  // Handle icon delete
  const handleIconDelete = async (iconId: string) => {
    if (!window.confirm('Are you sure you want to delete this icon?')) return;
    setFormLoading(true);
    try {
      await fetch(`${ICONS_URL}/deleteIcon/${iconId}`, { method: 'DELETE' });
      fetchIcons();
    } catch {}
    setFormLoading(false);
  };

  // Group icons by categoryId
  const iconsByCategory: Record<string, any[]> = {};
  icons.forEach(icon => {
    const catId = icon.categoryId?._id || icon.categoryId;
    if (!catId) return;
    if (!iconsByCategory[catId]) iconsByCategory[catId] = [];
    iconsByCategory[catId].push(icon);
  });

  return (
    <div className="w-full p-0 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Categories</h3>
        <button
          className="bg-blue-700 text-white px-4 py-2 text-xs font-semibold shadow hover:bg-blue-800 transition-all"
          onClick={openCreateModal}
        >
          + Create Category
        </button>
      </div>
      {/* Categories List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full overflow-x-auto">
        <table className="min-w-full text-sm text-left border-separate border-spacing-0">
          <thead>
            <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <th className="px-6 py-3 font-semibold">Image</th>
              <th className="px-6 py-3 font-semibold">Name</th>
              <th className="px-6 py-3 font-semibold">Description</th>
              <th className="px-6 py-3 font-semibold">Created</th>
              <th className="px-6 py-3 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">No categories found.</td></tr>
            ) : categories.map((cat, index) => (
              <tr key={cat._id} className={`transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}`}>
                <td className="px-6 py-4 align-middle">
                  <img src={cat.image?.[0] || cat.image} alt={cat.name} className="w-16 h-10 object-cover rounded-lg border border-gray-200" />
                </td>
                <td className="px-6 py-4 align-middle font-semibold text-gray-900">{cat.name}</td>
                <td className="px-6 py-4 align-middle text-gray-700">{cat.description}</td>
                <td className="px-6 py-4 align-middle text-gray-500">{new Date(cat.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 align-middle text-center flex gap-2 items-center justify-center">
                  <button
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 text-xs font-semibold rounded-lg shadow hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-1"
                    onClick={() => openEditModal(cat)}
                  >
                    <span role="img" aria-label="Edit">✏️</span> Edit
                  </button>
                  <button
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 text-xs font-semibold rounded-lg shadow hover:from-red-600 hover:to-red-700 transition-all flex items-center gap-1"
                    onClick={() => handleDelete(cat._id)}
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
      {/* Icons Table */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Icons</h4>
          <button
            className="bg-blue-700 text-white px-4 py-2 text-xs font-semibold shadow hover:bg-blue-800 transition-all"
            onClick={() => openIconModal('')}
          >
            + Add Icon
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full overflow-x-auto">
          <table className="min-w-full text-sm text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <th className="px-6 py-3 font-semibold">Image</th>
                <th className="px-6 py-3 font-semibold">Title</th>
                <th className="px-6 py-3 font-semibold">Category</th>
                <th className="px-6 py-3 font-semibold">Created</th>
                <th className="px-6 py-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {icons.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">No icons found.</td></tr>
              ) : icons.map((icon, index) => (
                <tr key={icon._id} className={`transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-purple-50'}`}>
                  <td className="px-6 py-4 align-middle">
                    <img src={icon.image?.[0] || icon.image} alt={icon.title} className="w-10 h-10 object-cover rounded-lg border border-gray-200" />
                  </td>
                  <td className="px-6 py-4 align-middle font-semibold text-gray-900">{icon.title}</td>
                  <td className="px-6 py-4 align-middle text-gray-700">{icon.categoryId?.name || (categories.find(c => c._id === icon.categoryId)?.name || '')}</td>
                  <td className="px-6 py-4 align-middle text-gray-500">{icon.createdAt ? new Date(icon.createdAt).toLocaleDateString() : ''}</td>
                  <td className="px-6 py-4 align-middle text-center flex gap-2 items-center justify-center">
                    <button
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 text-xs font-semibold rounded-lg shadow hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-1"
                      onClick={() => openIconModal(icon.categoryId?._id || icon.categoryId, icon)}
                    >
                      <span role="img" aria-label="Edit">✏️</span> Edit
                    </button>
                    <button
                      className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 text-xs font-semibold rounded-lg shadow hover:from-red-600 hover:to-red-700 transition-all flex items-center gap-1"
                      onClick={() => handleIconDelete(icon._id)}
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
      </div>
      {/* Create/Edit Category Modal */}
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
            <h4 className="text-lg font-semibold mb-4">{editCategory ? 'Edit Category' : 'Create Category'}</h4>
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs text-gray-700 mb-1">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="e.g. Electronics"
                  required
                  className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="e.g. Products related to electronic devices."
                  required
                  className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 placeholder-gray-400 resize-y"
                  rows={2}
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
                  {!form.image && editCategory && editCategory.image?.[0] && (
                    <img src={editCategory.image[0]} alt="current" className="mt-1 w-16 h-10 object-cover" />
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
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                </div>
              )}
              <button
                type="submit"
                className="bg-blue-700 text-white px-4 py-2 text-xs font-semibold shadow hover:bg-blue-800 transition-all mt-2"
                disabled={formLoading}
              >
                {formLoading ? (editCategory ? 'Saving...' : 'Creating...') : (editCategory ? 'Save Changes' : 'Create Category')}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Create Icon Modal */}
      {showIconModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white p-6 shadow-md w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
              onClick={() => setShowIconModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h4 className="text-lg font-semibold mb-4">{editIcon ? 'Edit Icon' : 'Add Icon'}</h4>
            <form onSubmit={handleIconFormSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs text-gray-700 mb-1">Title</label>
                <input
                  name="title"
                  value={iconForm.title}
                  onChange={handleIconFormChange}
                  placeholder="e.g. Diapers"
                  required
                  className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">Image</label>
                <div
                  className={`border-2 border-dashed px-2 py-2 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 bg-gray-50 ${iconForm.image ? 'border-blue-700' : 'border-gray-300'}`}
                  onClick={() => iconFileInputRef.current?.click()}
                  style={{ borderRadius: 0 }}
                >
                  <input
                    ref={iconFileInputRef}
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleIconFormChange}
                    className="hidden"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
                  <span className="text-gray-500 text-xs">Drop image or click to upload</span>
                  {iconForm.image && (
                    <img src={URL.createObjectURL(iconForm.image)} alt="preview" className="mt-1 w-16 h-10 object-cover" />
                  )}
                  {/* Show current image if editing and no new image selected */}
                  {!iconForm.image && editIcon && editIcon.image?.[0] && (
                    <img src={editIcon.image[0]} alt="current" className="mt-1 w-16 h-10 object-cover" />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">Category</label>
                <select
                  name="categoryId"
                  value={iconForm.categoryId}
                  onChange={handleIconFormChange}
                  required
                  className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 bg-white"
                >
                  <option value="" disabled>Select category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              {iconFormError && <div className="text-red-600 text-xs font-semibold mt-1">{iconFormError}</div>}
              {successMessage && (
                <div className="bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded relative" role="alert">
                  <strong className="font-bold">Success!</strong>
                  <span className="block sm:inline"> {successMessage}</span>
                  <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                    <button onClick={() => setSuccessMessage('')} className="text-green-800 hover:text-green-900">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                </div>
              )}
              <button
                type="submit"
                className="bg-blue-700 text-white px-4 py-2 text-xs font-semibold shadow hover:bg-blue-800 transition-all mt-2"
                disabled={formLoading}
              >
                {formLoading ? 'Saving...' : (editIcon ? 'Save Changes' : 'Add Icon')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesSection; 