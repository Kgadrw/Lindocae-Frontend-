import React from 'react';

interface CategoryFormModalProps {
  open: boolean;
  form: { name: string; description: string };
  loading: boolean;
  error: string;
  isEdit: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  open,
  form,
  loading,
  error,
  isEdit,
  onChange,
  onSubmit,
  onCancel,
}) => {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity animate-fade-in" onClick={onCancel} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-6 max-w-sm w-full flex flex-col gap-4 border border-blue-200 animate-modal-pop" onClick={e => e.stopPropagation()}>
        <button className="absolute top-3 right-3 text-blue-400 hover:text-blue-700 text-xl" onClick={onCancel} aria-label="Close">×</button>
        <h3 className="text-xl font-bold mb-2 text-blue-700">{isEdit ? 'Edit' : 'Add'} Category</h3>
        <form onSubmit={onSubmit} className="flex flex-col gap-2">
          <input
            type="text"
            name="name"
            placeholder="Category Name"
            value={form.name}
            onChange={onChange}
            className="border border-blue-200 rounded px-3 py-2 w-full text-sm bg-white text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={onChange}
            className="border border-blue-200 rounded px-3 py-2 w-full text-sm bg-white text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            required
          />
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <div className="flex gap-4 justify-end mt-2">
            <button type="button" className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition font-semibold text-sm" onClick={onCancel} disabled={loading}>Cancel</button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold text-sm" disabled={loading}>{loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Category' : 'Create Category')}</button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CategoryFormModal; 