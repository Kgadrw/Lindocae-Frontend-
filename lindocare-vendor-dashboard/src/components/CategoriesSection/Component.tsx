import React, { useEffect, useState, useRef } from 'react';

const API_URL = 'https://lindo-project.onrender.com/category';
const ICONS_URL = 'https://lindo-project.onrender.com/icons';
const PRODUCTS_URL = 'https://lindo-project.onrender.com/product';

const CategoriesSection: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [icons, setIcons] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [iconToDelete, setIconToDelete] = useState<string | null>(null);
  const [showDeleteIconModal, setShowDeleteIconModal] = useState(false);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any | null>(null);

  // Add state for products grouped by category
  const [productsByCategory, setProductsByCategory] = useState<Record<string, any[]>>({});

  // Pagination state
  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(categories.length / PAGE_SIZE);
  const paginatedCategories = categories.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Fetch categories
  const fetchCategories = async () => {
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
      const res = await fetch(`${API_URL}/getAllCategories`, { headers });
      const data = await res.json();
      const allCategories = data.categories || data || [];
      
      // Filter out deleted categories from server response
      const activeCategories = allCategories.filter((cat: any) => {
        // Only show categories that are not marked as deleted
        return !cat.isDeleted && cat.isActive !== false;
      });
      
      console.log('Fetched categories:', allCategories.length);
      console.log('Active categories (not deleted):', activeCategories.length);
      
      setCategories(activeCategories);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch icons
  const fetchIcons = async () => {
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
      const res = await fetch(`${ICONS_URL}/getIcons`, { headers });
      const data = await res.json();
      setIcons(Array.isArray(data) ? data : []);
    } catch {
      setIcons([]);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
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
      // First, try to get all products and then filter by category
      const allProductsRes = await fetch(`${PRODUCTS_URL}/getAllProduct`, { headers });
      if (!allProductsRes.ok) {
        console.error('Failed to fetch all products');
        setProductsByCategory({});
        return;
      }
      
      const allProductsData = await allProductsRes.json();
      const allProducts = Array.isArray(allProductsData) ? allProductsData : allProductsData.products || [];
      
      console.log('Fetched all products:', allProducts.length);
      
      // Group products by category
      const productsByCategory: Record<string, any[]> = {};
      
      allProducts.forEach((product: any) => {
        const categoryId = product.categoryId || product.category?._id || product.category;
        if (categoryId) {
          if (!productsByCategory[categoryId]) {
            productsByCategory[categoryId] = [];
          }
          productsByCategory[categoryId].push(product);
        }
      });
      
      console.log('Products grouped by category:', Object.keys(productsByCategory).length);
      setProductsByCategory(productsByCategory);
      
    } catch (error) {
      console.error('Error fetching products:', error);
      setProductsByCategory({});
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchIcons();
    fetchProducts();
  }, []);

  // Handle form input
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === 'image' && files) {
      setForm(f => ({ ...f, image: files[0] }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };
  const handleIconFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    
    // Fix validation: don't require image when editing if no new image is selected
    if (!form.name || !form.description) {
      setFormError('Please fill name and description fields');
      return;
    }
    
    // Only require image for new categories, not when editing
    if (!editCategory && !form.image) {
      setFormError('Please upload an image for new categories');
      return;
    }
    
    setFormLoading(true);
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    
    // Only append image if a new one is selected
    if (form.image) {
      formData.append('image', form.image); // Use 'image' (singular) as per API schema
    }
    
    try {
      let res;
      let url;
      
      if (editCategory) {
        // Use the correct update endpoint with multipart/form-data
        const updateUrl = `${API_URL}/updateCategoryById/${editCategory._id}`;
        
        console.log('Updating category with URL:', updateUrl);
        console.log('FormData contents:');
        for (let [key, value] of formData.entries()) {
          console.log(`${key}:`, value);
        }
        
        res = await fetch(updateUrl, { 
          method: 'PUT', 
          body: formData 
        });
        
        console.log(`Response status: ${res.status}`);
        
        if (res.status === 200 || res.status === 201) {
          console.log(`Update successful with: PUT ${updateUrl}`);
          setShowModal(false);
          setEditCategory(null);
          setForm({ name: '', description: '', image: null });
          fetchCategories(); // Refresh from server
          setSuccessMessage('Category updated successfully!');
          setTimeout(() => setSuccessMessage(''), 3000);
          return;
        } else {
          const responseText = await res.text();
          console.error('Update failed:', responseText.substring(0, 500));
          setFormError(`Update failed. Status: ${res.status}. ${responseText}`);
          return;
        }
        
      } else {
        // Creating new category with multipart/form-data
        url = `${API_URL}/createCategory`;
        console.log('Creating new category with URL:', url);
        console.log('FormData contents:');
        for (let [key, value] of formData.entries()) {
          console.log(`${key}:`, value);
        }
        
        res = await fetch(url, { 
          method: 'POST', 
          body: formData 
        });
        
        console.log('Create response status:', res.status);
        
        if (res.status === 201 || res.status === 200) {
          setShowModal(false);
          setEditCategory(null);
          setForm({ name: '', description: '', image: null });
          fetchCategories();
          setSuccessMessage('Category created successfully!');
          setTimeout(() => setSuccessMessage(''), 3000);
        } else {
          const responseText = await res.text();
          console.error('Create failed:', responseText);
          setFormError(`Failed to create category. Status: ${res.status}. ${responseText}`);
        }
      }
    } catch (error: any) {
      console.error('Network error details:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setFormError('Network connectivity issue. Please check your internet connection and try again.');
      } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        setFormError('Backend server is not responding. Please try again later.');
      } else {
        setFormError(`Network error: ${error.message || 'Unknown error occurred'}`);
      }
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

  // Handle delete click - opens modal
  const handleDeleteClick = (category: any) => {
    setCategoryToDelete(category);
    setShowDeleteCategoryModal(true);
  };

  // Handle category delete with modal confirmation
  const handleCategoryDelete = async (catId: string) => {
    setFormLoading(true);
    console.log('=== HARD DELETE CATEGORY BY ID ===');
    console.log('Category ID:', catId);
    console.log('Category Name:', categoryToDelete?.name);

    try {
      // Use the correct DELETE endpoint path
      const deleteUrl = `${API_URL}/deleteCategory/${catId}`;
      console.log('DELETE URL:', deleteUrl);
      
      console.log('Making DELETE request to remove category from server...');
      const response = await fetch(deleteUrl, { 
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`Response Status: ${response.status}`);
      console.log(`Response Status Text: ${response.statusText}`);
      
      const responseText = await response.text();
      console.log(`Response Body:`, responseText);
      
      if (response.status === 200 || response.status === 201 || response.status === 204) {
        console.log('✅ CATEGORY HARD DELETED FROM SERVER!');
        
        // Remove from local state
        setCategories(prev => prev.filter(cat => cat._id !== catId));
        setSuccessMessage('Category deleted successfully from server!');
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Refresh categories from server to ensure consistency
        fetchCategories();
      } else {
        console.log(`❌ Server delete failed with status: ${response.status}`);
        console.log(`Error: ${responseText}`);
        
        // If DELETE fails, try the soft delete approach as fallback
        console.log('Trying soft delete as fallback...');
        const updateUrl = `${API_URL}/updateCategoryById/${catId}`;
        
        const formData = new FormData();
        formData.append('name', categoryToDelete?.name || '');
        formData.append('description', categoryToDelete?.description || '');
        formData.append('isDeleted', 'true');
        formData.append('deletedAt', new Date().toISOString());
        formData.append('isActive', 'false');
        
        const fallbackResponse = await fetch(updateUrl, { 
          method: 'PUT',
          body: formData
        });
        
        if (fallbackResponse.status === 200 || fallbackResponse.status === 201 || fallbackResponse.status === 204) {
          console.log('✅ CATEGORY SOFT DELETED FROM SERVER!');
          setCategories(prev => prev.filter(cat => cat._id !== catId));
          setSuccessMessage('Category marked as deleted on server!');
          setTimeout(() => setSuccessMessage(''), 3000);
          fetchCategories();
        } else {
          console.log(`❌ Soft delete also failed with status: ${fallbackResponse.status}`);
          setFormError(`Failed to delete category from server. Status: ${response.status}`);
        }
      }

    } catch (error: any) {
      console.error('❌ Network error:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      
      setFormError('Network error. Please check your connection and try again.');
    } finally {
      console.log('=== END DELETE CATEGORY ===');
      setFormLoading(false);
      setShowDeleteCategoryModal(false);
      setCategoryToDelete(null);
    }
  };

  // Handle icon delete
  const handleIconDelete = async (iconId: string) => {
    setIconToDelete(iconId);
    setShowDeleteIconModal(true);
  };
  const confirmDeleteIcon = async () => {
    if (!iconToDelete) return;
    setFormLoading(true);
    try {
      await fetch(`${ICONS_URL}/deleteIcon/${iconToDelete}`, { method: 'DELETE' });
      fetchIcons();
      setIconToDelete(null);
      setShowDeleteIconModal(false);
    } catch {}
    setFormLoading(false);
  };

  // Toggle category expansion
  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Edit product
  const openEditProductModal = (product: any) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  // Delete product
  const handleDeleteProduct = async (productId: string, categoryId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    console.log('Attempting to delete product with ID:', productId, 'from category:', categoryId);
    
    try {
      // Try multiple endpoint patterns for deleting products (same as ProductsSection)
      const deleteEndpoints = [
        { url: `${PRODUCTS_URL}/deleteProduct/${productId}`, method: 'DELETE' },
        { url: `${PRODUCTS_URL}/delete/${productId}`, method: 'DELETE' },
        { url: `${PRODUCTS_URL}/${productId}`, method: 'DELETE' },
        { url: `${PRODUCTS_URL}/remove/${productId}`, method: 'DELETE' },
        { url: `${PRODUCTS_URL}/removeProduct/${productId}`, method: 'DELETE' },
        { url: `${PRODUCTS_URL}/deleteProductById/${productId}`, method: 'DELETE' },
        { url: `${PRODUCTS_URL}/deleteById/${productId}`, method: 'DELETE' },
        // Try POST method for some endpoints
        { url: `${PRODUCTS_URL}/deleteProduct/${productId}`, method: 'POST' },
        { url: `${PRODUCTS_URL}/delete/${productId}`, method: 'POST' }
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
        // Remove product from the category
        const updatedProducts = productsByCategory[categoryId].filter(p => p._id !== productId);
        setProductsByCategory(prev => ({
          ...prev,
          [categoryId]: updatedProducts
        }));
        setSuccessMessage('Product deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        // If all server endpoints failed, remove locally and show warning
        console.log('❌ All delete endpoints failed, removing locally...');
        console.log('Last error:', lastError);
        const updatedProducts = productsByCategory[categoryId].filter(p => p._id !== productId);
        setProductsByCategory(prev => ({
          ...prev,
          [categoryId]: updatedProducts
        }));
        setSuccessMessage('Product removed locally (server endpoints unavailable)');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      setFormError('Failed to delete product. Please try again.');
    }
  };

  // Handle product form submission
  const handleProductFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setFormLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', editingProduct.name);
      formData.append('description', editingProduct.description || '');
      formData.append('price', editingProduct.price?.toString() || '0');
      formData.append('categoryId', editingProduct.categoryId?._id || editingProduct.categoryId || '');

      const res = await fetch(`${PRODUCTS_URL}/updateProduct/${editingProduct._id}`, {
        method: 'PUT',
        body: formData,
      });

      if (res.ok) {
        const updatedProduct = await res.json();
        
        // Update the product in the category
        const categoryId = editingProduct.categoryId?._id || editingProduct.categoryId;
        const updatedProducts = productsByCategory[categoryId].map(p => 
          p._id === editingProduct._id ? updatedProduct : p
        );
        
        setProductsByCategory(prev => ({
          ...prev,
          [categoryId]: updatedProducts
        }));
        
        setShowProductModal(false);
        setEditingProduct(null);
        setSuccessMessage('Product updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setFormLoading(false);
    }
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
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-6">
        {/* Filter/Sort/Search Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <input type="text" placeholder="Search category..." className="border rounded px-3 py-2 text-sm text-gray-700 flex-1 min-w-[180px]" />
          <button className="ml-auto bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2" onClick={openCreateModal}>
            + Create Category
          </button>
        </div>
        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3"><input type="checkbox" /></th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Products</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td></tr>
              ) : paginatedCategories.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No categories found.</td></tr>
              ) : paginatedCategories.map((cat, index) => {
                const categoryProducts = productsByCategory[cat._id] || [];
                const isExpanded = expandedCategories.has(cat._id);
                return (
                  <React.Fragment key={cat._id}>
                    {/* Category Row */}
                    <tr className={`transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-blue-50'} hover:bg-blue-100`}>
                      <td className="px-4 py-3"><input type="checkbox" /></td>
                      <td className="px-4 py-3 flex items-center gap-3">
                        <button
                          onClick={() => toggleCategoryExpansion(cat._id)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          {isExpanded ? '▼' : '▶'}
                        </button>
                        <img src={cat.image?.[0] || cat.image} alt={cat.name} className="w-12 h-8 object-cover rounded-lg border border-gray-200" />
                        <div>
                          <div className="font-semibold text-blue-700">{cat.name}</div>
                          <div className="text-xs text-gray-500">ID: {cat._id.slice(-8)}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{cat.description}</td>
                      <td className="px-4 py-3 text-gray-700">{categoryProducts.length}</td>
                      <td className="px-4 py-3 text-gray-500">{cat.createdAt ? new Date(cat.createdAt).toLocaleDateString() : ''}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 text-xs font-semibold rounded-lg shadow hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-1"
                          onClick={() => openEditModal(cat)}
                        >
                          Edit
                        </button>
                        <button
                          className="ml-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 text-xs font-semibold rounded-lg shadow hover:from-red-600 hover:to-red-700 transition-all flex items-center gap-1"
                          onClick={() => handleDeleteClick(cat)}
                          disabled={formLoading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                    {/* Expanded: Icons and Products (unchanged) */}
                    {isExpanded && (
                      <>
                        {/* Icons Row for this category */}
                        {iconsByCategory[cat._id] && iconsByCategory[cat._id].length > 0 && (
                          <tr className={`transition-colors ${index % 2 === 0 ? 'bg-purple-50' : 'bg-white'}`}>
                            <td colSpan={6} className="px-6 py-3 align-middle">
                              <div className="flex flex-wrap gap-4 items-center pl-8">
                                {iconsByCategory[cat._id].map((icon, iconIndex) => (
                                  <div key={icon._id} className="flex flex-col items-center">
                                    <img src={icon.image?.[0] || icon.image || '/lindo.png'} alt={icon.title} className="w-12 h-12 object-cover rounded border border-gray-200 mb-1" />
                                    <div className="text-xs text-purple-700 font-medium text-center mb-1">{icon.title}</div>
                                    <div className="flex gap-1">
                                      <button
                                        className="bg-gradient-to-r from-green-500 to-green-600 text-white px-2 py-1 text-xs font-semibold rounded shadow hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-1"
                                        onClick={() => openIconModal(icon.categoryId?._id || icon.categoryId, icon)}
                                      >
                                        <span role="img" aria-label="Edit">✏️</span>
                                      </button>
                                      <button
                                        className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 text-xs font-semibold rounded shadow hover:from-red-600 hover:to-red-700 transition-all flex items-center gap-1"
                                        onClick={() => handleIconDelete(icon._id)}
                                        disabled={formLoading}
                                      >
                                        <span role="img" aria-label="Delete">🗑️</span>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                        {/* Products */}
                        {categoryProducts.length === 0 ? (
                          <tr className={`transition-colors ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                            <td colSpan={6} className="px-6 py-4 align-middle">
                              <div className="pl-8 text-sm text-gray-400 italic flex items-center gap-2">
                                <span>📦</span> No products in this category
                              </div>
                            </td>
                          </tr>
                        ) : (
                          categoryProducts.map((product, productIndex) => (
                            <tr key={`${cat._id}-${product._id}`} className={`transition-colors ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100`}>
                              <td className="px-6 py-3 align-middle"></td>
                              <td className="px-6 py-3 align-middle" colSpan={2}>
                                <div className="flex items-center pl-8">
                                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                                  <img 
                                    src={product.image?.[0] || product.image || '/lindo.png'} 
                                    alt={product.name} 
                                    className="w-12 h-8 object-cover rounded border border-gray-200 mr-3" 
                                  />
                                  <div>
                                    <div className="text-sm text-gray-700 font-medium">{product.name}</div>
                                    <div className="text-xs text-gray-500">ID: {product._id?.slice(-8)}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-3 align-middle text-gray-600 max-w-xs truncate">
                                {product.description || 'No description'}
                              </td>
                              <td className="px-6 py-3 align-middle">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-green-600">
                                    ${product.price?.toFixed(2) || '0.00'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {product.quantity || 0} in stock
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-3 align-middle text-gray-500">
                                <div className="text-xs">
                                  {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : ''}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-500">Showing 1 to {paginatedCategories.length} of {categories.length} categories</div>
          <div className="flex gap-1">
            <button className="w-8 h-8 rounded bg-gray-200 text-gray-700 font-bold" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>&lt;</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`w-8 h-8 rounded font-bold ${currentPage === i + 1 ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button className="w-8 h-8 rounded bg-gray-200 text-gray-700 font-bold" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>&gt;</button>
          </div>
        </div>
        {/* Modals (unchanged) */}
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
                <div className="flex gap-2 mt-2">
                  {editCategory && (
                    <>
                      <button
                        type="button"
                        className="bg-purple-600 text-white px-3 py-2 text-xs font-semibold rounded shadow hover:bg-purple-700 transition-all"
                        onClick={() => { openIconModal(editCategory._id); setShowModal(false); }}
                      >
                        + Add Icon to this Category
                      </button>
                      <button
                        type="button"
                        className="bg-blue-600 text-white px-3 py-2 text-xs font-semibold rounded shadow hover:bg-blue-700 transition-all"
                        onClick={() => { setEditingProduct({ categoryId: editCategory._id }); setShowProductModal(true); setShowModal(false); }}
                      >
                        + Add Product to this Category
                      </button>
                    </>
                  )}
                </div>
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
        {/* Delete Icon Modal */}
        {showDeleteIconModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white p-6 shadow-md w-full max-w-sm relative rounded">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
                onClick={() => { setShowDeleteIconModal(false); setIconToDelete(null); }}
                aria-label="Close"
              >
                ×
              </button>
              <h4 className="text-lg font-semibold mb-4 text-red-700">Delete Icon</h4>
              <p className="mb-4 text-gray-700">Are you sure you want to delete this icon? This action cannot be undone.</p>
              <div className="flex gap-3 justify-end">
                <button
                  className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
                  onClick={() => { setShowDeleteIconModal(false); setIconToDelete(null); }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60"
                  onClick={confirmDeleteIcon}
                  disabled={formLoading}
                >
                  {formLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Delete Category Modal */}
        {showDeleteCategoryModal && categoryToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white p-6 shadow-md w-full max-w-md relative rounded-lg">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
                onClick={() => { setShowDeleteCategoryModal(false); setCategoryToDelete(null); }}
                aria-label="Close"
              >
                ×
              </button>
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Category</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to delete <strong>"{categoryToDelete.name}"</strong>? 
                  This action cannot be undone and will also remove all associated products and icons.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => { setShowDeleteCategoryModal(false); setCategoryToDelete(null); }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    disabled={formLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCategoryDelete(categoryToDelete._id)}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
                    disabled={formLoading}
                  >
                    {formLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Category
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Product Edit Modal */}
        {showProductModal && editingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Edit Product</h3>
                <button
                  onClick={() => {
                    setShowProductModal(false);
                    setEditingProduct(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold focus:outline-none"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleProductFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.price || 0}
                    onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={editingProduct.categoryId?._id || editingProduct.categoryId || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, categoryId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {formLoading ? 'Updating...' : 'Update Product'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProductModal(false);
                      setEditingProduct(null);
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesSection; 