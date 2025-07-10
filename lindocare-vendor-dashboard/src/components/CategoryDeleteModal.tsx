import React from 'react';

interface CategoryDeleteModalProps {
  open: boolean;
  category: { name: string } | null;
  error: string;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onRefresh: () => void;
}

const CategoryDeleteModal: React.FC<CategoryDeleteModalProps> = ({
  open,
  category,
  error,
  loading,
  onCancel,
  onConfirm,
  onRefresh,
}) => {
  if (!open || !category) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity animate-fade-in" onClick={onCancel} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-6 max-w-sm w-full flex flex-col gap-4 border border-red-200 animate-modal-pop" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold mb-2 text-red-700">Delete Category</h3>
        <div className="text-gray-700 mb-4">Are you sure you want to delete <span className="font-bold">{category.name}</span>?</div>
        {error && (
          <div className="text-red-500 text-sm text-center mb-2">
            {error}
            {error.includes('not found') && (
              <button className="ml-2 underline text-blue-600" onClick={onRefresh} type="button">Refresh Categories</button>
            )}
          </div>
        )}
        <div className="flex gap-4 justify-end">
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition font-semibold text-sm" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition font-semibold text-sm" onClick={onConfirm} disabled={loading}>{loading ? 'Deleting...' : 'Delete'}</button>
        </div>
      </div>
    </>
  );
};

export default CategoryDeleteModal; 