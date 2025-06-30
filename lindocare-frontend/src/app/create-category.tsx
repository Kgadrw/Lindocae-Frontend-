import React, { useState } from 'react';

const CreateCategoryPage = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const res = await fetch('http://localhost:5000/category/createCategory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      if (res.status === 201) {
        setSuccess('Category created successfully!');
        setName('');
        setDescription('');
      } else if (res.status === 400) {
        setError('Category already exists.');
      } else {
        setError('Server error. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-yellow-200">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">Create Category</h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Category Name"
            className="rounded-full border-2 border-yellow-400 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300 text-blue-700 font-medium"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <textarea
            placeholder="Description"
            className="rounded-2xl border-2 border-yellow-400 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300 text-blue-700 font-medium min-h-[80px]"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full rounded-full bg-yellow-400 text-white font-bold py-2 text-lg mt-2 shadow hover:bg-yellow-500 transition"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Category'}
          </button>
        </form>
        {success && <div className="text-green-600 text-center mt-4 font-semibold">{success}</div>}
        {error && <div className="text-red-500 text-center mt-4 font-semibold">{error}</div>}
      </div>
    </div>
  );
};

export default CreateCategoryPage; 