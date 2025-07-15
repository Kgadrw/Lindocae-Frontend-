import React, { useEffect, useState } from 'react';
import { Upload, X } from 'lucide-react';

interface Ad {
  _id: string;
  title: string;
  content: string;
  buttonLabel: string;
  image: string | string[];
}

interface AdListProps {
  tableView?: boolean;
}

const AdList: React.FC<AdListProps> = ({ tableView }) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editAd, setEditAd] = useState<Ad | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', content: '', buttonLabel: '', image: null as File | null });
  const [editLoading, setEditLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [modalMsg, setModalMsg] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (showEditModal) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [showEditModal]);

  // Show preview of selected or current image
  useEffect(() => {
    if (showEditModal) {
      if (editForm.image) {
        setImagePreview(URL.createObjectURL(editForm.image));
      } else if (editAd && editAd.image) {
        const img = Array.isArray(editAd.image) ? editAd.image[0] : editAd.image;
        setImagePreview(img || null);
      } else {
        setImagePreview(null);
      }
    } else {
      setImagePreview(null);
    }
    // Cleanup preview URL
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
    // eslint-disable-next-line
  }, [showEditModal, editForm.image, editAd]);

  const fetchAds = () => {
    setLoading(true);
    setError(null);
    fetch('https://lindo-project.onrender.com/adds/getAds')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAds(data);
        } else if (data && Array.isArray(data.ads)) {
          setAds(data.ads);
        } else {
          setAds([]);
          setError('Unexpected response format.');
        }
      })
      .catch(() => setError('Failed to fetch ads.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const getImage = (image: string | string[] | undefined) => {
    if (!image) return '';
    if (Array.isArray(image)) return image[0] || '';
    return image;
  };

  const handleEdit = (ad: Ad) => {
    setEditAd(ad);
    setEditForm({
      title: ad.title,
      content: ad.content,
      buttonLabel: ad.buttonLabel,
      image: null,
    });
    setShowEditModal(true);
    setModalMsg(null);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files, type } = e.target as any;
    if (name === 'image' && files && files[0]) {
      setEditForm(f => ({ ...f, image: files[0] }));
    } else {
      setEditForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAd) return;
    setEditLoading(true);
    setModalMsg(null);
    const formData = new FormData();
    formData.append('title', editForm.title);
    formData.append('content', editForm.content);
    formData.append('buttonLabel', editForm.buttonLabel);
    if (editForm.image) formData.append('image', editForm.image);
    try {
      const res = await fetch(`https://lindo-project.onrender.com/adds/updateAd/${editAd._id}`, {
        method: 'PUT',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setModalMsg('Ad updated successfully!');
        setShowEditModal(false);
        setEditAd(null);
        fetchAds();
      } else {
        setModalMsg(data.message || 'Failed to update ad.');
      }
    } catch (err) {
      setModalMsg('An error occurred.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this ad?')) return;
    setDeleteId(id);
    setDeleteLoading(true);
    try {
      const res = await fetch(`https://lindo-project.onrender.com/adds/deleteAd/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchAds();
      } else {
        alert('Failed to delete ad.');
      }
    } catch (err) {
      alert('An error occurred.');
    } finally {
      setDeleteId(null);
      setDeleteLoading(false);
    }
  };

  if (loading) return <div className="text-center text-gray-500 py-8">Loading ads...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;
  if (ads.length === 0) return <div className="text-center text-gray-500 py-8">No ads found.</div>;

  if (tableView) {
    return (
      <>
        <table className="min-w-full text-sm text-left">
          <thead className="bg-yellow-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-700">Image</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Title</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Content</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Button Label</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-yellow-100">
            {ads.map(ad => (
              <tr key={ad._id} className="hover:bg-yellow-50 transition">
                <td className="px-4 py-2">
                  {getImage(ad.image) ? (
                    <img src={getImage(ad.image)} alt={ad.title} className="w-16 h-16 object-cover rounded border border-gray-200" />
                  ) : (
                    <img src="/lindo.png" alt="No image" className="w-16 h-16 object-cover rounded border border-gray-200 opacity-60" />
                  )}
                </td>
                <td className="px-4 py-2 font-medium text-blue-900">{ad.title}</td>
                <td className="px-4 py-2 text-gray-700">{ad.content}</td>
                <td className="px-4 py-2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded text-xs">{ad.buttonLabel}</span>
                </td>
                <td className="px-4 py-2 flex gap-2">
                  <button className="bg-blue-500 text-white px-3 py-1 rounded text-xs font-semibold" onClick={() => handleEdit(ad)}>Edit</button>
                  <button className="bg-red-500 text-white px-3 py-1 rounded text-xs font-semibold" onClick={() => handleDelete(ad._id)} disabled={deleteId === ad._id && deleteLoading}>{deleteId === ad._id && deleteLoading ? 'Deleting...' : 'Delete'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {showEditModal && (
          <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl border border-blue-200 p-8 w-full max-w-md flex flex-col items-center relative transition-all duration-300">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-blue-700 text-2xl p-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
                onClick={() => setShowEditModal(false)}
                aria-label="Close modal"
              >
                <X size={28} />
              </button>
              <form onSubmit={handleEditSubmit} className="space-y-5 w-full">
                <h2 className="text-2xl font-bold mb-2 text-blue-900 text-center">Edit Ad</h2>
                {modalMsg && <div className="mb-2 text-red-600 font-semibold text-center">{modalMsg}</div>}
                <div>
                  <label className="block mb-1 font-medium text-blue-900">Title</label>
                  <input type="text" name="title" value={editForm.title} onChange={handleEditFormChange} className="w-full border px-3 py-2 rounded text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-300" required />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-blue-900">Content</label>
                  <textarea name="content" value={editForm.content} onChange={handleEditFormChange} className="w-full border px-3 py-2 rounded text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-300" required />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-blue-900">Button Label</label>
                  <input type="text" name="buttonLabel" value={editForm.buttonLabel} onChange={handleEditFormChange} className="w-full border px-3 py-2 rounded text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-300" required />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="ad-image-upload" className="flex items-center gap-2 cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg font-medium w-fit">
                    <Upload size={18} /> Upload Image
                  </label>
                  <input id="ad-image-upload" type="file" name="image" accept="image/*" onChange={handleEditFormChange} className="hidden" />
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="mt-2 rounded shadow w-24 h-24 object-cover border border-gray-200 mx-auto" />
                  )}
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition" disabled={editLoading}>{editLoading ? 'Updating...' : 'Update Ad'}</button>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  // Card view fallback
  return (
    <>
      {ads.map(ad => (
        <div key={ad._id} className="bg-white rounded-lg shadow p-4 flex flex-col gap-2 border border-yellow-100">
          {getImage(ad.image) && (
            <img src={getImage(ad.image)} alt={ad.title} className="w-full h-48 object-cover rounded border border-gray-200 mb-2" />
          )}
          <div className="font-bold text-blue-900 text-base truncate mb-2">{ad.title}</div>
          <div className="text-gray-700 text-sm mb-2">{ad.content}</div>
          <button className="bg-blue-500 text-white px-3 py-1 rounded text-xs self-start mt-2">{ad.buttonLabel}</button>
        </div>
      ))}
    </>
  );
};

export default AdList; 