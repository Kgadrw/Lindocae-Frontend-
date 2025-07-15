import React, { useState } from 'react';

const AdCreateForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [buttonLabel, setButtonLabel] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!image) {
      setMessage('Please select an image.');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('buttonLabel', buttonLabel);
    formData.append('image', image);
    try {
      const res = await fetch('https://lindo-project.onrender.com/adds/createAd', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Ad created successfully!');
        setTitle('');
        setContent('');
        setButtonLabel('');
        setImage(null);
      } else {
        setMessage(data.message || 'Failed to create ad.');
      }
    } catch (err) {
      setMessage('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded max-w-md mx-auto mt-8 bg-white shadow">
      <h2 className="text-xl font-bold mb-2">Create New Ad</h2>
      {message && <div className="mb-2 text-red-500">{message}</div>}
      <div>
        <label className="block mb-1 font-medium">Title</label>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border px-2 py-1 rounded" required />
      </div>
      <div>
        <label className="block mb-1 font-medium">Content</label>
        <textarea value={content} onChange={e => setContent(e.target.value)} className="w-full border px-2 py-1 rounded" required />
      </div>
      <div>
        <label className="block mb-1 font-medium">Button Label</label>
        <input type="text" value={buttonLabel} onChange={e => setButtonLabel(e.target.value)} className="w-full border px-2 py-1 rounded" required />
      </div>
      <div>
        <label className="block mb-1 font-medium">Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={e => {
            const files = (e.target as HTMLInputElement).files;
            if (files && files[0]) {
              setImage(files[0]);
            } else {
              setImage(null);
            }
          }}
          className="w-full"
          required
        />
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Creating...' : 'Create Ad'}</button>
    </form>
  );
};

export default AdCreateForm; 