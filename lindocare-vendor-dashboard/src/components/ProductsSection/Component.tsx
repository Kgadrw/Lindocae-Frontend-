'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Upload, X, Eye, EyeOff } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stockType: 'in_store' | 'online';
  quantity: number;
  shippingInfo: {
    provider: string;
    estimatedDeliveryDays: number;
  };
  images?: string[];
  isActive?: boolean;
}

interface Category {
  _id: string;
  name: string;
}

const ProductsSection: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stockType: 'in_store' as 'in_store' | 'online',
    quantity: '',
    shippingProvider: '',
    estimatedDeliveryDays: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('https://lindo-project.onrender.com/product/getAllProduct');
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log('Fetched products:', data);
          if (Array.isArray(data)) {
            setProducts(data);
          } else if (data && Array.isArray(data.products)) {
            setProducts(data.products);
          } else {
            setProducts([]);
          }
        } else {
          const text = await response.text();
          console.error('Expected JSON but got:', text);
          setProducts([]);
        }
      } else {
        console.error('Error fetching products:', response.status, response.statusText);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://lindo-project.onrender.com/category/getAllCategories');
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log('Fetched categories:', data);
          if (Array.isArray(data)) {
            setCategories(data);
          } else if (data && Array.isArray(data.categories)) {
            setCategories(data.categories);
          } else {
            setCategories([]);
          }
        } else {
          const text = await response.text();
          console.error('Expected JSON but got:', text);
          setCategories([]);
        }
      } else {
        setCategories([]);
      }
    } catch (error) {
      setCategories([]);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedImages(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that at least one image is uploaded
    if (uploadedImages.length === 0) {
      alert('Please upload at least one image');
      return;
    }
    
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('description', productForm.description);
      formData.append('price', productForm.price);
      formData.append('category', productForm.category);
      formData.append('stockType', productForm.stockType);
      formData.append('quantity', productForm.quantity);
      formData.append('shippingInfo', JSON.stringify({
        provider: productForm.shippingProvider,
        estimatedDeliveryDays: parseInt(productForm.estimatedDeliveryDays)
      }));

      uploadedImages.forEach((image, index) => {
        formData.append('image', image);
      });

      const url = editProduct 
        ? `https://lindo-project.onrender.com/product/updateProduct/${editProduct._id}`
        : 'https://lindo-project.onrender.com/product/createProduct';

      const method = editProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formData
      });

      if (response.ok) {
        setShowModal(false);
        setEditProduct(null);
        resetForm();
        fetchProducts();
        setSuccessMessage(editProduct ? 'Product updated successfully!' : 'Product created successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const errorData = await response.json();
        alert(errorData.message || `Error ${editProduct ? 'updating' : 'creating'} product`);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: (product.price || 0).toString(),
      category: typeof product.category === 'string' ? product.category : product.category?._id || product.category?.id || '',
      stockType: product.stockType || 'in_store',
      quantity: (product.quantity || 0).toString(),
      shippingProvider: product.shippingInfo?.provider || '',
      estimatedDeliveryDays: (product.shippingInfo?.estimatedDeliveryDays || 0).toString()
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`https://lindo-project.onrender.com/product/deleteProduct/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          fetchProducts();
        }
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const resetForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      category: '',
      stockType: 'in_store',
      quantity: '',
      shippingProvider: '',
      estimatedDeliveryDays: ''
    });
    setUploadedImages([]);
    setImagePreview([]);
  };

  const openModal = () => {
    setShowModal(true);
    setEditProduct(null);
    resetForm();
  };

  const closeModal = () => {
    setShowModal(false);
    setEditProduct(null);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
          <p className="text-gray-600 mt-1">Manage your product catalog</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setSuccessMessage('')}
                className="inline-flex text-green-400 hover:text-green-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stock Type</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50">
                <td className="px-4 py-2">
                  {Array.isArray(product.image) && product.image.length > 0 ? (
                    <img src={product.image[0].url || product.image[0]} alt={product.name} className="w-16 h-16 object-cover rounded" />
                  ) : Array.isArray(product.images) && product.images.length > 0 ? (
                    <img src={product.images[0].url || product.images[0]} alt={product.name} className="w-16 h-16 object-cover rounded" />
                  ) : typeof product.image === 'string' && product.image ? (
                    <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center text-gray-300 text-2xl bg-gray-100 rounded">?</div>
                  )}
                </td>
                <td className="px-4 py-2 font-semibold text-gray-900 truncate max-w-xs">{product.name}</td>
                <td className="px-4 py-2 text-gray-700">${product.price}</td>
                <td className="px-4 py-2 text-gray-700">{typeof product.category === 'object' && product.category !== null ? product.category.name : product.category}</td>
                <td className="px-4 py-2 text-gray-700">{product.stockType}</td>
                <td className="px-4 py-2 text-gray-700">{product.quantity}</td>
                <td className="px-4 py-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 rounded shadow hover:from-blue-600 hover:to-blue-700 transition-all"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="bg-gradient-to-r from-red-500 to-red-600 text-white p-2 rounded shadow hover:from-red-600 hover:to-red-700 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white p-6 shadow-md w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
              onClick={closeModal}
              aria-label="Close"
            >
              ×
            </button>
            <h4 className="text-lg font-semibold mb-4">{editProduct ? 'Edit Product' : 'Create Product'}</h4>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    value={productForm.name}
                    onChange={handleFormChange}
                    required
                    placeholder="e.g. iPhone 15 Pro Max"
                    className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    value={productForm.category}
                    onChange={handleFormChange}
                    required
                    className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900"
                  >
                    <option value="" disabled>Select category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    name="price"
                    value={productForm.price}
                    onChange={handleFormChange}
                    required
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={productForm.quantity}
                    onChange={handleFormChange}
                    required
                    min="0"
                    placeholder="0"
                    className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-700 mb-1">Stock Type</label>
                  <select
                    name="stockType"
                    value={productForm.stockType}
                    onChange={handleFormChange}
                    required
                    className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900"
                  >
                    <option value="in_store">In Store</option>
                    <option value="online">Online</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-700 mb-1">Estimated Delivery Days</label>
                  <input
                    type="number"
                    name="estimatedDeliveryDays"
                    value={productForm.estimatedDeliveryDays}
                    onChange={handleFormChange}
                    required
                    min="1"
                    placeholder="3"
                    className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-700 mb-1">Shipping Provider</label>
                <input
                  type="text"
                  name="shippingProvider"
                  value={productForm.shippingProvider}
                  onChange={handleFormChange}
                  required
                  placeholder="e.g., DHL, FedEx"
                  className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={productForm.description}
                  onChange={handleFormChange}
                  required
                  rows={2}
                  placeholder="e.g. Latest Apple smartphone with advanced features"
                  className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 placeholder-gray-400 resize-y"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-700 mb-1">
                  Product Images <span className="text-red-500">*</span>
                </label>
                <div
                  className={`border-2 border-dashed px-2 py-2 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 bg-gray-50 ${
                    uploadedImages.length > 0 ? 'border-blue-700' : 'border-red-300'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  style={{ borderRadius: 0 }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
                  <span className="text-gray-500 text-xs">Drop images or click to upload</span>
                  {uploadedImages.length === 0 && (
                    <span className="text-red-500 text-xs">At least one image is required</span>
                  )}
                </div>
              </div>

              {/* Image Preview */}
              {imagePreview.length > 0 && (
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Uploaded Images</label>
                  <div className="grid grid-cols-4 gap-2">
                    {imagePreview.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-12 object-cover border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                        >
                          <X size={8} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="bg-blue-700 text-white px-4 py-2 text-xs font-semibold shadow hover:bg-blue-800 transition-all mt-2"
                disabled={loading}
              >
                {loading ? (editProduct ? 'Saving...' : 'Creating...') : (editProduct ? 'Save Changes' : 'Create Product')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsSection; 