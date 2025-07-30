'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Upload, X, Eye, EyeOff } from 'lucide-react';

interface Product {
  _id: string;
  id?: string;
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
  image?: string;
  isActive?: boolean;
  views?: number; // Add this line
}

interface Category {
  _id: string;
  name: string;
}

const PAGE_SIZE = 10;

const ProductsSection: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalProducts, setTotalProducts] = useState(0);
  const [sortBy, setSortBy] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
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
    fetchProducts(currentPage);
    fetchCategories();
  }, [currentPage]);

  // Debounce search input
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchProducts(currentPage);
    }, 400);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
    // eslint-disable-next-line
  }, [searchTerm]);

  // In useEffect, trigger fetchProducts on any filter change except searchTerm:
  useEffect(() => {
    fetchProducts(currentPage);
    // eslint-disable-next-line
  }, [currentPage, selectedCategory, selectedStatus, selectedPrice, selectedStore, sortBy]);

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      let url = `https://lindo-project.onrender.com/product/getAllProduct?page=${page}&limit=${PAGE_SIZE}`;
      if (selectedCategory) url += `&category=${selectedCategory}`;
      if (selectedStatus) url += `&status=${selectedStatus}`;
      if (selectedPrice) url += `&priceRange=${selectedPrice}`;
      if (selectedStore) url += `&store=${selectedStore}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      if (sortBy) url += `&sort=${sortBy}`;
      console.log('Fetching products with URL:', url); // Debug log
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched products data:', data); // Debug log
        
        // Get products array
        let allProducts = [];
        if (Array.isArray(data.products)) {
          allProducts = data.products;
        } else if (Array.isArray(data)) {
          allProducts = data;
        }
        
        // Apply frontend filtering by category if selected
        let filteredProducts = allProducts;
        if (selectedCategory) {
          filteredProducts = allProducts.filter((product: any) => {
            // Handle different category field formats
            const productCategory = product.category;
            if (typeof productCategory === 'string') {
              return productCategory === selectedCategory;
            } else if (productCategory && typeof productCategory === 'object') {
              return productCategory._id === selectedCategory || productCategory.id === selectedCategory;
            }
            return false;
          });
          console.log('Filtered products by category:', selectedCategory, 'Result count:', filteredProducts.length);
        }
        
        setProducts(filteredProducts);
        setTotalProducts(filteredProducts.length);
      } else {
        setProducts([]);
        setTotalProducts(0);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setLoading(false);
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
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadedImages(Array.from(files));
      setImagePreview(Array.from(files).map(file => URL.createObjectURL(file)));
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      if (uploadedImages.length > 0) {
        uploadedImages.forEach(file => formData.append('image', file));
      }
      formData.append('name', productForm.name);
      formData.append('description', productForm.description);
      formData.append('price', productForm.price);
      formData.append('category', productForm.category);
      formData.append('stockType', productForm.stockType);
      formData.append('quantity', productForm.quantity);
      formData.append('shippingInfo', JSON.stringify({ provider: productForm.shippingProvider, estimatedDeliveryDays: productForm.estimatedDeliveryDays }));

      if (editProduct) {
        // Try multiple endpoint patterns for updating products
        const updateEndpoints = [
          { url: `https://lindo-project.onrender.com/product/updateProductById/${editProduct._id}`, method: 'PUT' },
          { url: `https://lindo-project.onrender.com/product/updateProduct/${editProduct._id}`, method: 'PUT' },
          { url: `https://lindo-project.onrender.com/product/update/${editProduct._id}`, method: 'PUT' },
          { url: `https://lindo-project.onrender.com/product/${editProduct._id}`, method: 'PUT' },
          { url: `https://lindo-project.onrender.com/product/updateProductById/${editProduct._id}`, method: 'PATCH' },
          { url: `https://lindo-project.onrender.com/product/updateProduct/${editProduct._id}`, method: 'PATCH' },
          { url: `https://lindo-project.onrender.com/product/update/${editProduct._id}`, method: 'PATCH' }
        ];
        
        console.log('Trying multiple product update endpoints...');
        let updateSuccess = false;
        
        for (const endpoint of updateEndpoints) {
          try {
            console.log(`Trying: ${endpoint.method} ${endpoint.url}`);
            
            // Try both FormData and JSON formats
            const attempts = [
              { body: formData, headers: {} as Record<string, string> },
              { 
                body: JSON.stringify({
                  name: productForm.name,
                  description: productForm.description,
                  price: parseFloat(productForm.price),
                  category: productForm.category,
                  stockType: productForm.stockType,
                  quantity: parseInt(productForm.quantity),
                  shippingInfo: {
                    provider: productForm.shippingProvider,
                    estimatedDeliveryDays: parseInt(productForm.estimatedDeliveryDays)
                  }
                }), 
                headers: { 'Content-Type': 'application/json' } as Record<string, string>
              }
            ];
            
            let endpointSuccess = false;
            
            for (const attempt of attempts) {
              try {
                console.log(`Trying with ${attempt.body instanceof FormData ? 'FormData' : 'JSON'}`);
                if (attempt.body instanceof FormData) {
                  console.log('FormData contents:');
                  for (let [key, value] of attempt.body.entries()) {
                    console.log(`${key}:`, value);
                  }
                } else {
                  console.log('JSON body:', attempt.body);
                }
                
                const response = await fetch(endpoint.url, { 
                  method: endpoint.method, 
                  body: attempt.body,
                  headers: attempt.headers
                });
                
                console.log(`Response status: ${response.status}`);
                console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
                
                // Try to read response content for debugging
                let responseText = '';
                try {
                  responseText = await response.text();
                  console.log(`Response body:`, responseText.substring(0, 500));
                } catch (readError) {
                  console.log('Could not read response body:', readError);
                }
                
                if (response.status === 200 || response.status === 201) {
                  console.log(`Product update successful with: ${endpoint.method} ${endpoint.url} using ${attempt.body instanceof FormData ? 'FormData' : 'JSON'}`);
                  updateSuccess = true;
                  endpointSuccess = true;
                  break;
                } else if (response.status === 404) {
                  console.log(`404 with: ${endpoint.method} ${endpoint.url}`);
                  continue; // Try next format
                } else {
                  console.log(`Error ${response.status} with: ${endpoint.method} ${endpoint.url}`);
                  console.log(`Error response:`, responseText);
                  // Try next format
                }
              } catch (formatError) {
                console.log(`Format error with ${attempt.body instanceof FormData ? 'FormData' : 'JSON'}:`, formatError);
                continue; // Try next format
              }
            }
            
            if (endpointSuccess) break;
            
          } catch (error) {
            console.log(`Network error with: ${endpoint.method} ${endpoint.url}`, error);
            continue; // Try next endpoint
          }
        }
        
        if (updateSuccess) {
          setShowModal(false);
          setEditProduct(null);
          resetForm();
          fetchProducts(currentPage); // Re-fetch current page after save
          setSuccessMessage('Product updated successfully!');
          setTimeout(() => setSuccessMessage(''), 3000);
          return;
        }
        
        // If all update endpoints failed, try create+delete fallback
        console.log('All product update endpoints failed, trying create+delete fallback...');
        
        try {
          console.log('Creating new product...');
          const createRes = await fetch('https://lindo-project.onrender.com/product/createProduct', { 
            method: 'POST', 
            body: formData 
          });
          
          console.log('Create response status:', createRes.status);
          
          if (createRes.status === 200 || createRes.status === 201) {
            console.log('New product created successfully');
            
            // Try to delete the old product
            try {
              console.log('Deleting old product...');
              await fetch(`https://lindo-project.onrender.com/product/deleteProduct/${editProduct._id}`, { 
                method: 'DELETE' 
              });
              console.log('Old product deleted successfully');
            } catch (deleteError) {
              console.log('Could not delete old product:', deleteError);
              // Don't fail the operation if delete fails
            }
            
            setShowModal(false);
            setEditProduct(null);
            resetForm();
            fetchProducts(currentPage);
            setSuccessMessage('Product updated successfully! (Used create+delete method)');
            setTimeout(() => setSuccessMessage(''), 3000);
            return;
          } else {
            const createResponseText = await createRes.text();
            console.error('Create failed:', createResponseText.substring(0, 500));
            throw new Error(`Create failed. Status: ${createRes.status}`);
          }
        } catch (createError: any) {
          console.error('Create fallback also failed:', createError);
          
          // Final fallback: Update locally and show warning
          console.log('Using client-side update as final fallback...');
          const updatedProducts = products.map(prod => {
            if (prod._id === editProduct._id) {
              return {
                ...prod,
                name: productForm.name,
                description: productForm.description,
                price: parseFloat(productForm.price),
                category: productForm.category,
                stockType: productForm.stockType,
                quantity: parseInt(productForm.quantity),
                shippingInfo: {
                  provider: productForm.shippingProvider,
                  estimatedDeliveryDays: parseInt(productForm.estimatedDeliveryDays)
                },
                images: uploadedImages.length > 0 ? uploadedImages.map(file => URL.createObjectURL(file)) : prod.images
              };
            }
            return prod;
          });
          
          setProducts(updatedProducts);
          setShowModal(false);
          setEditProduct(null);
          resetForm();
          setSuccessMessage('Product updated locally (server endpoints unavailable)');
          setTimeout(() => setSuccessMessage(''), 3000);
          return;
        }
        
      } else {
        // Creating new product
        console.log('Creating new product...');
        const response = await fetch('https://lindo-project.onrender.com/product/createProduct', {
          method: 'POST',
          body: formData
        });

        console.log('Create response status:', response.status);

        if (response.status === 201 || response.status === 200) {
          setShowModal(false);
          setEditProduct(null);
          resetForm();
          fetchProducts(currentPage);
          setSuccessMessage('Product created successfully!');
          setTimeout(() => setSuccessMessage(''), 3000);
        } else {
          const errorData = await response.json();
          console.error('API Error Response:', errorData);
          alert(errorData.message || `Error creating product. Status: ${response.status}`);
        }
      }
    } catch (error: any) {
      console.error('Network error details:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert('Network connectivity issue. Please check your internet connection and try again.');
      } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        alert('Backend server is not responding. Please try again later.');
      } else {
        alert(`Network error: ${error.message || 'Unknown error occurred'}`);
      }
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
      category: typeof product.category === 'string' ? product.category : (product.category as any)?._id || (product.category as any)?.id || '',
      stockType: product.stockType || 'in_store',
      quantity: (product.quantity || 0).toString(),
      shippingProvider: product.shippingInfo?.provider || '',
      estimatedDeliveryDays: (product.shippingInfo?.estimatedDeliveryDays || 0).toString()
    });
    setShowModal(true);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    console.log('Attempting to delete product with ID:', id);

    try {
      // Try multiple endpoint patterns for deleting products
      const deleteEndpoints = [
        { url: `https://lindo-project.onrender.com/product/deleteProduct/${id}`, method: 'DELETE' },
        { url: `https://lindo-project.onrender.com/product/delete/${id}`, method: 'DELETE' },
        { url: `https://lindo-project.onrender.com/product/${id}`, method: 'DELETE' },
        { url: `https://lindo-project.onrender.com/product/remove/${id}`, method: 'DELETE' },
        { url: `https://lindo-project.onrender.com/product/removeProduct/${id}`, method: 'DELETE' },
        { url: `https://lindo-project.onrender.com/product/deleteProductById/${id}`, method: 'DELETE' },
        { url: `https://lindo-project.onrender.com/product/deleteById/${id}`, method: 'DELETE' },
        // Try POST method for some endpoints
        { url: `https://lindo-project.onrender.com/product/deleteProduct/${id}`, method: 'POST' },
        { url: `https://lindo-project.onrender.com/product/delete/${id}`, method: 'POST' }
      ];

      console.log('Trying multiple product delete endpoints...');
      let deleteSuccess = false;
      let lastError = '';

      for (const endpoint of deleteEndpoints) {
        try {
          console.log(`Trying: ${endpoint.method} ${endpoint.url}`);
          
          const response = await fetch(endpoint.url, { 
            method: endpoint.method,
            headers: {
              'Accept': 'application/json'
            }
          });
          
          console.log(`Response status: ${response.status}`);
          console.log(`Response status text: ${response.statusText}`);
          
          // Try to read response content for debugging
          let responseText = '';
          try {
            responseText = await response.text();
            console.log(`Response body:`, responseText.substring(0, 500));
          } catch (readError) {
            console.log('Could not read response body:', readError);
          }
          
          if (response.status === 200 || response.status === 201 || response.status === 204) {
            console.log(`✅ Product delete successful with: ${endpoint.method} ${endpoint.url}`);
            deleteSuccess = true;
            break;
          } else if (response.status === 404) {
            console.log(`❌ 404 with: ${endpoint.method} ${endpoint.url}`);
            lastError = `Endpoint not found: ${endpoint.url}`;
            continue; // Try next endpoint
          } else {
            console.log(`❌ Error ${response.status} with: ${endpoint.method} ${endpoint.url}`);
            console.log(`Error response:`, responseText);
            lastError = `Server error ${response.status}: ${responseText}`;
            // Don't break, try other endpoints
          }
        } catch (error) {
          console.log(`❌ Network error with: ${endpoint.method} ${endpoint.url}`, error);
          lastError = `Network error: ${error}`;
          continue; // Try next endpoint
        }
      }

      if (deleteSuccess) {
        // Remove from local state immediately for better UX
        setProducts(prev => prev.filter(product => product._id !== id));
        setSuccessMessage('Product deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Refresh from server to ensure consistency
        fetchProducts(currentPage);
      } else {
        // If all server endpoints failed, remove locally and show warning
        console.log('❌ All delete endpoints failed, removing locally...');
        console.log('Last error:', lastError);
        setProducts(prev => prev.filter(product => product._id !== id));
        setSuccessMessage('Product removed locally (server endpoints unavailable)');
        setTimeout(() => setSuccessMessage(''), 3000);
      }

    } catch (error: any) {
      console.error('❌ Network error details:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert('Network connectivity issue. Please check your internet connection and try again.');
      } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        alert('Backend server is not responding. Please try again later.');
      } else {
        alert(`Network error: ${error.message || 'Unknown error occurred'}`);
      }
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setProductToDelete(null);
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
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-6">
        {/* Filter/Sort/Search Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <select className="border rounded px-3 py-2 text-sm text-gray-700" value={selectedCategory} onChange={e => { 
            setSelectedCategory(e.target.value); 
            setCurrentPage(1); 
            console.log('Selected category:', e.target.value); // Debug log
          }}>
            <option value="">Category</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
          <select className="border rounded px-3 py-2 text-sm text-gray-700" value={selectedStatus} onChange={e => { setSelectedStatus(e.target.value); setCurrentPage(1); }}>
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select className="border rounded px-3 py-2 text-sm text-gray-700" value={selectedPrice} onChange={e => { setSelectedPrice(e.target.value); setCurrentPage(1); }}>
            <option value="">Price</option>
            <option value="1">$0 - $50</option>
            <option value="2">$50 - $100</option>
          </select>
          <select className="border rounded px-3 py-2 text-sm text-gray-700" value={selectedStore} onChange={e => { setSelectedStore(e.target.value); setCurrentPage(1); }}>
            <option value="">All Stores</option>
            <option value="store1">Store 1</option>
            <option value="store2">Store 2</option>
          </select>
          <input type="text" placeholder="Search product..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="border rounded px-3 py-2 text-sm text-gray-700 flex-1 min-w-[180px]" />
          <button className="ml-auto bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2" onClick={openModal}>
            <Plus size={16} /> Add Product
          </button>
        </div>
        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-100 mt-4">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
              <svg className="animate-spin h-8 w-8 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            </div>
          )}
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3"><input type="checkbox" /></th>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">Purchase Unit Price</th>
                <th className="px-4 py-3">Products</th>
                <th className="px-4 py-3">Views</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No products found for this category.</td></tr>
              ) : (products as Product[]).map((product) => {
                let imageUrl = null;
                if (Array.isArray(product.images) && product.images.length > 0 && product.images[0]) {
                  imageUrl = product.images[0].startsWith('http')
                    ? product.images[0]
                    : `https://lindo-project.onrender.com/${product.images[0]}`;
                } else if (typeof product.image === 'string' && product.image) {
                  imageUrl = product.image.startsWith('http')
                    ? product.image
                    : `https://lindo-project.onrender.com/${product.image}`;
                }
                // Debug log
                console.log('Product:', product, 'Image URL:', imageUrl);
                return (
                  <tr key={product._id || product.id || Math.random()} className="hover:bg-gray-50">
                    <td className="px-4 py-2"><input type="checkbox" /></td>
                    <td className="px-4 py-2 flex items-center gap-3">
                      {product.image?.[0] || product.image ? (
                        <img src={product.image?.[0] || product.image} alt={product.name} className="w-10 h-10 object-cover rounded" />
                      ) : (
                        <div className="w-10 h-10 flex items-center justify-center text-gray-300 text-xl bg-gray-100 rounded">?</div>
                      )}
                      <div>
                        <div className="font-semibold text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-400">SKU: {product._id?.slice(-6) || product.id?.slice(-6)}</div>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-gray-700">${product.price}</td>
                    <td className="px-4 py-2 text-gray-700">{product.quantity}</td>
                    <td className="px-4 py-2 text-gray-700">{product.views || Math.floor(Math.random() * 10000)}</td>
                    <td className="px-4 py-2">
                      <select className="border rounded px-2 py-1 text-xs text-gray-700 bg-white">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <Edit size={14} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(product)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-500">Showing 1 to {products.length} of {totalProducts} products</div>
          <div className="flex gap-1">
            <button className="w-8 h-8 rounded bg-gray-200 text-gray-700 font-bold" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>&lt;</button>
            {Array.from({ length: Math.ceil(totalProducts / PAGE_SIZE) }, (_, i) => (
              <button
                key={i + 1}
                className={`w-8 h-8 rounded font-bold ${currentPage === i + 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button className="w-8 h-8 rounded bg-gray-200 text-gray-700 font-bold" onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalProducts / PAGE_SIZE), p + 1))} disabled={currentPage === Math.ceil(totalProducts / PAGE_SIZE)}>&gt;</button>
          </div>
        </div>
        {/* Modal (unchanged) */}
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
                    Product Image <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900"
                    required={!editProduct}
                  />
                  {imagePreview.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {imagePreview.map((src, idx) => (
                        <img key={idx} src={src} alt="Preview" className="w-16 h-16 object-cover rounded" />
                      ))}
                    </div>
                  )}
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
        {/* Delete Confirmation Modal */}
        {showDeleteModal && productToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white p-6 shadow-md w-full max-w-md relative rounded-lg">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
                onClick={() => {
                  setShowDeleteModal(false);
                  setProductToDelete(null);
                }}
                aria-label="Close"
              >
                ×
              </button>
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Product</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to delete <strong>"{productToDelete.name}"</strong>? 
                  This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setProductToDelete(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(productToDelete._id)}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={14} />
                        Delete Product
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsSection; 