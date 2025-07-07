'use client';

import { useState, useRef, useEffect } from "react";
import { List, Box, ShoppingCart, Megaphone, Star, Link as LinkIcon, LogOut, Receipt, Image as ImageIcon, Upload } from 'lucide-react';
import Image from 'next/image';

interface Vendor {
  id: number;
  name: string;
  email: string;
  phone?: string;
  imageUrl?: string;
}

interface Category {
  _id: string;
  name: string;
  description: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stockType: string;
  quantity: number;
  image?: string;
  shippingInfo?: { provider: string; estimatedDeliveryDays: number };
}

interface Order {
  _id: string;
  user: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  status: string;
}

const SIDEBAR_SECTIONS = [
  { key: 'categories', label: 'Categories', icon: () => <List size={18} className="mr-2" /> },
  { key: 'products', label: 'Products', icon: () => <Box size={18} className="mr-2" /> },
  { key: 'orders', label: 'Orders', icon: () => <Receipt size={18} className="mr-2" /> },
  { key: 'cart', label: 'Cart', icon: () => <ShoppingCart size={18} className="mr-2" /> },
  { key: 'banners', label: 'Banners', icon: () => <Megaphone size={18} className="mr-2" /> },
  { key: 'recommendations', label: 'Recommendations', icon: () => <Star size={18} className="mr-2" /> },
  { key: 'footer', label: 'Footer', icon: () => <LinkIcon size={18} className="mr-2" /> },
];

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('categories');

  // Vendors state
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Vendor>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    image: null as File | null,
    firstName: "",
    lastName: "",
    email: "",
    gender: "",
    password: "",
  });
  const [registerStatus, setRegisterStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState('');
  const [catForm, setCatForm] = useState<{ name: string; description: string }>({ name: '', description: '' });
  const [catEditId, setCatEditId] = useState<string | null>(null);
  const [catFormOpen, setCatFormOpen] = useState(false);
  const [catFormLoading, setCatFormLoading] = useState(false);
  const [catFormError, setCatFormError] = useState('');
  const [catImage, setCatImage] = useState<File | null>(null);
  const [catImagePreview, setCatImagePreview] = useState<string | null>(null);

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [prodLoading, setProdLoading] = useState(true);
  const [prodError, setProdError] = useState('');
  const [prodForm, setProdForm] = useState<Partial<Product>>({});
  const [prodEditId, setProdEditId] = useState<string | null>(null);
  const [prodFormOpen, setProdFormOpen] = useState(false);
  const [prodFormLoading, setProdFormLoading] = useState(false);
  const [prodFormError, setProdFormError] = useState('');
  const [prodImage, setProdImage] = useState<File | null>(null);

  // --- AUTH ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(true);
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  // On mount, check sessionStorage for auth
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('admin-auth') === 'true') {
        setIsAuthenticated(true);
        setShowAuth(false);
      }
    }
  }, []);

  const handleAuthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuthForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authForm.username === 'admin' && authForm.password === 'admin') {
      setIsAuthenticated(true);
      setShowAuth(false);
      setAuthError('');
      if (typeof window !== 'undefined') sessionStorage.setItem('admin-auth', 'true');
    } else {
      setAuthError('Invalid credentials.');
    }
  };

  // Fetch all users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const res = await fetch("http://localhost:5000/user");
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        // Map API users to Vendor type
        const users: Vendor[] = data.map((u: any) => ({
          id: u.id || u._id || Date.now() + Math.random(),
          name: (u.firstName || "") + " " + (u.lastName || ""),
          email: u.email,
          phone: u.phone || "-",
        }));
        setVendors(users);
      } catch (err) {
        setFetchError("Could not load users from server.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Fetch categories
  useEffect(() => {
    if (activeSection !== 'categories') return;
    setCatLoading(true);
    setCatError('');
    fetch('http://localhost:5000/category/getAllCategories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(() => setCatError('Failed to fetch categories.'))
      .finally(() => setCatLoading(false));
  }, [activeSection]);

  // Fetch products
  useEffect(() => {
    if (activeSection !== 'products') return;
    setProdLoading(true);
    setProdError('');
    fetch('http://localhost:5000/product/getAllProduct')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(() => setProdError('Failed to fetch products.'))
      .finally(() => setProdLoading(false));
  }, [activeSection]);

  // Fetch orders
  useEffect(() => {
    if (activeSection !== 'orders') return;
    setOrdersLoading(true);
    setOrdersError('');
    fetch('http://localhost:5000/order/getAllOrders')
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(() => setOrdersError('Failed to fetch orders.'))
      .finally(() => setOrdersLoading(false));
  }, [activeSection]);

  const handleEdit = (vendor: Vendor) => {
    setEditing(vendor.id);
    setForm(vendor);
  };

  const handleDelete = (id: number) => {
    setVendors(vendors.filter((v) => v.id !== id));
    if (editing === id) setEditing(null);
  };

  const handleSave = () => {
    if (editing) {
      setVendors(vendors.map((v) => (v.id === editing ? { ...v, ...form } as Vendor : v)));
      setEditing(null);
    } else {
      setVendors([
        ...vendors,
        { ...form, id: Date.now() } as Vendor,
      ]);
      setShowAdd(false);
    }
    setForm({});
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as any;
    if (name === "image" && files && files[0]) {
      setRegisterForm(f => ({ ...f, image: files[0] }));
    } else {
      setRegisterForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterStatus(null);
    const formData = new FormData();
    if (registerForm.image) formData.append("image", registerForm.image);
    formData.append("firstName", registerForm.firstName);
    formData.append("lastName", registerForm.lastName);
    formData.append("email", registerForm.email);
    formData.append("gender", registerForm.gender);
    formData.append("password", registerForm.password);
    formData.append("role", "vendor");
    try {
      const res = await fetch("http://localhost:5000/user/Register", {
        method: "POST",
        body: formData,
      });
      if (res.status === 201) {
        setRegisterStatus("User registered successfully!");
        setShowRegister(false);
        setVendors(vs => [
          ...vs,
          {
            id: Date.now(),
            name: registerForm.firstName + " " + registerForm.lastName,
            email: registerForm.email,
            phone: "-",
            imageUrl: registerForm.image ? URL.createObjectURL(registerForm.image) : undefined,
          },
        ]);
        setRegisterForm({ image: null, firstName: "", lastName: "", email: "", gender: "", password: "" });
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else if (res.status === 400) {
        setRegisterStatus("Email already exists.");
      } else {
        setRegisterStatus("Server error. Please try again.");
      }
    } catch (err) {
      setRegisterStatus("Network error. Please check your connection.");
    }
  };

  // Category CRUD handlers
  const handleCatFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCatForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  const handleCatFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatFormLoading(true);
    setCatFormError('');
    try {
      if (catEditId) {
        // Update
        const res = await fetch(`http://localhost:5000/category/updateCategoryById/${catEditId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(catForm),
        });
        if (!res.ok) throw new Error('Failed to update category');
      } else {
        // Create
        const res = await fetch('http://localhost:5000/category/createCategory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(catForm),
        });
        if (!res.ok) throw new Error('Failed to create category');
      }
      setCatForm({ name: '', description: '' });
      setCatEditId(null);
      setCatFormOpen(false);
      // Refresh
      setCatLoading(true);
      fetch('http://localhost:5000/category/getAllCategories')
        .then(res => res.json())
        .then(data => setCategories(data))
        .catch(() => setCatError('Failed to fetch categories.'))
        .finally(() => setCatLoading(false));
    } catch (err: any) {
      setCatFormError(err.message || 'Error');
    } finally {
      setCatFormLoading(false);
    }
  };
  const handleCatEdit = (cat: Category) => {
    setCatEditId(cat._id);
    setCatForm({ name: cat.name, description: cat.description });
    setCatFormOpen(true);
  };
  const handleCatDelete = async (id: string) => {
    if (!window.confirm('Delete this category?')) return;
    setCatLoading(true);
    await fetch(`http://localhost:5000/category/deleteCategory/${id}`, { method: 'DELETE' });
    fetch('http://localhost:5000/category/getAllCategories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(() => setCatError('Failed to fetch categories.'))
      .finally(() => setCatLoading(false));
  };
  const handleCatImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCatImage(e.target.files[0]);
      setCatImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Product CRUD handlers
  const handleProdFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setProdForm(f => ({ ...f, [name]: type === 'number' ? Number(value) : value }));
  };
  const handleProdImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setProdImage(e.target.files[0]);
  };
  const handleProdFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProdFormLoading(true);
    setProdFormError('');
    try {
      const formData = new FormData();
      if (prodImage) formData.append('image', prodImage);
      Object.entries(prodForm).forEach(([k, v]) => formData.append(k, String(v)));
      if (prodEditId) {
        // Update
        const res = await fetch('http://localhost:5000/product/updateProductById', {
          method: 'PUT',
          body: JSON.stringify({ ...prodForm, id: prodEditId }),
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error('Failed to update product');
      } else {
        // Create
        const res = await fetch('http://localhost:5000/product/createProduct', {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) throw new Error('Failed to create product');
      }
      setProdForm({});
      setProdEditId(null);
      setProdFormOpen(false);
      setProdImage(null);
      // Refresh
      setProdLoading(true);
      fetch('http://localhost:5000/product/getAllProduct')
        .then(res => res.json())
        .then(data => setProducts(data))
        .catch(() => setProdError('Failed to fetch products.'))
        .finally(() => setProdLoading(false));
    } catch (err: any) {
      setProdFormError(err.message || 'Error');
    } finally {
      setProdFormLoading(false);
    }
  };
  const handleProdEdit = (prod: Product) => {
    setProdEditId(prod._id);
    setProdForm(prod);
    setProdFormOpen(true);
  };
  const handleProdDelete = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    setProdLoading(true);
    await fetch(`http://localhost:5000/product/deleteProductById/${id}`, { method: 'DELETE' });
    fetch('http://localhost:5000/product/getAllProduct')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(() => setProdError('Failed to fetch products.'))
      .finally(() => setProdLoading(false));
  };

  // Logout handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowAuth(true);
    setAuthForm({ username: '', password: '' });
    setAuthError('');
    if (typeof window !== 'undefined') sessionStorage.removeItem('admin-auth');
  };

  // --- UI ---
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-yellow-50 to-blue-100">
      {/* Auth Modal */}
      {showAuth && !isAuthenticated && (
        <div className="fixed inset-0 bg-blue-900 bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs flex flex-col items-center relative border-2 border-yellow-300">
            <Image src="/lindo.png" alt="Lindocare Logo" width={48} height={48} className="mb-3" />
            <h2 className="text-lg font-bold text-blue-700 mb-1">Admin Login</h2>
            <p className="text-yellow-500 font-medium mb-3 text-xs">Please login to access dashboard</p>
            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-3 w-full">
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={authForm.username}
                  onChange={handleAuthChange}
                  className="peer border border-yellow-200 rounded px-2 py-1 text-sm bg-white text-blue-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-300"
                  autoFocus
                  required
                />
                <label htmlFor="username" className="absolute left-3 top-2 pointer-events-none transition-all duration-200 bg-white px-1 peer-placeholder-shown:top-2 peer-placeholder-shown:text-xs peer-focus:-top-4 peer-focus:text-xs">Username</label>
              </div>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={authForm.password}
                  onChange={handleAuthChange}
                  className="peer border border-yellow-200 rounded px-2 py-1 text-sm bg-white text-blue-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                />
                <label htmlFor="password" className="absolute left-3 top-2 pointer-events-none transition-all duration-200 bg-white px-1 peer-placeholder-shown:top-2 peer-placeholder-shown:text-xs peer-focus:-top-4 peer-focus:text-xs">Password</label>
              </div>
              {authError && <div className="text-red-500 text-center text-xs">{authError}</div>}
              <button type="submit" className="bg-yellow-400 text-blue-900 px-3 py-1.5 rounded hover:bg-yellow-500 transition font-semibold text-sm">Login</button>
            </form>
            <div className="mt-3 text-xs text-blue-400">Hint: admin / admin</div>
          </div>
        </div>
      )}
      {/* Sidebar */}
      <aside className="sticky top-0 h-screen w-60 bg-white shadow p-6 flex flex-col gap-8 z-10 border-r border-yellow-200">
        <div className="flex items-center justify-center mb-8">
          <Image src="/lindo.png" alt="Lindocare Logo" width={64} height={64} />
        </div>
        <nav className="flex flex-col gap-1">
          {SIDEBAR_SECTIONS.map(sec => (
            <button
              key={sec.key}
              className={`flex items-center text-left px-3 py-2 rounded-lg font-medium text-sm transition-all duration-150 ${activeSection === sec.key ? 'bg-yellow-100 text-blue-900 shadow-sm' : 'text-blue-700 hover:bg-yellow-50'}`}
              onClick={() => setActiveSection(sec.key)}
            >
              {sec.icon()} {sec.label}
            </button>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 mt-8 px-3 py-2 rounded-lg text-sm font-medium text-blue-500 hover:bg-yellow-50 transition border border-transparent hover:border-yellow-200"
        >
          <LogOut size={16} /> Logout
        </button>
        <div className="mt-auto text-xs text-blue-300">Lindocare &copy; 2024</div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8 flex flex-col gap-8 text-sm">
        {activeSection === 'categories' && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Categories</h2>
              <button
                className="bg-purple-600 text-white px-4 py-2 rounded shadow hover:bg-purple-700 transition"
                onClick={() => { setCatFormOpen(true); setCatEditId(null); setCatForm({ name: '', description: '' }); }}
              >+ Add Category</button>
            </div>
            {catLoading ? (
              <div className="text-center text-gray-500 py-8">Loading categories...</div>
            ) : catError ? (
              <div className="text-center text-red-500 py-8">{catError}</div>
            ) : (
              <table className="min-w-full text-sm bg-white rounded-lg shadow overflow-hidden">
                <thead className="bg-purple-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Description</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(cat => (
                    <tr key={cat._id} className="border-b last:border-none">
                      <td className="px-4 py-2">{cat.name}</td>
                      <td className="px-4 py-2">{cat.description}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <button className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600" onClick={() => handleCatEdit(cat)}>Edit</button>
                        <button className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" onClick={() => handleCatDelete(cat._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {/* Category Form Modal */}
            {catFormOpen && (
              <>
                <div className="fixed inset-0 bg-blue-900/20 z-40" />
                <div className="absolute left-1/2 top-24 -translate-x-1/2 z-50 bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full flex flex-col gap-4">
                  <button className="absolute top-3 right-3 text-blue-400 hover:text-blue-700 text-xl" onClick={() => setCatFormOpen(false)} aria-label="Close">×</button>
                  <h3 className="text-xl font-bold mb-2 text-blue-700">{catEditId ? 'Edit' : 'Add'} Category</h3>
                  <form onSubmit={handleCatFormSubmit} className="flex flex-col gap-4">
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        id="cat-name"
                        value={catForm.name}
                        onChange={handleCatFormChange}
                        className="peer border border-yellow-200 rounded px-3 py-2 w-full text-sm bg-white text-blue-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-300"
                        placeholder="Category Name"
                        required
                      />
                      <label htmlFor="cat-name" className="absolute left-3 top-2 pointer-events-none transition-all duration-200 bg-white px-1 peer-placeholder-shown:top-2 peer-placeholder-shown:text-xs peer-focus:-top-4 peer-focus:text-xs">Category Name</label>
                    </div>
                    <div className="relative">
                      <textarea
                        name="description"
                        id="cat-desc"
                        value={catForm.description}
                        onChange={handleCatFormChange}
                        className="peer border border-yellow-200 rounded px-3 py-2 w-full text-sm bg-white text-blue-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-300"
                        placeholder="Description"
                        required
                      />
                      <label htmlFor="cat-desc" className="absolute left-3 top-2 pointer-events-none transition-all duration-200 bg-white px-1 peer-placeholder-shown:top-2 peer-placeholder-shown:text-xs peer-focus:-top-4 peer-focus:text-xs">Description</label>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="cat-image" className="flex items-center gap-2 cursor-pointer bg-yellow-100 hover:bg-yellow-200 text-blue-700 px-3 py-2 rounded-lg font-medium w-fit">
                        <Upload size={18} /> Upload Image
                      </label>
                      <input id="cat-image" name="image" type="file" accept="image/*" className="hidden" onChange={handleCatImageChange} />
                      {catImagePreview && <img src={catImagePreview} alt="Preview" className="mt-2 rounded shadow w-24 h-24 object-cover" />}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        name="tag"
                        id="cat-tag"
                        className="peer border border-yellow-200 rounded px-3 py-2 w-full text-sm bg-white text-blue-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-300"
                        placeholder="e.g. Featured, Sale, New, etc."
                        // onChange={handleCatTagChange} // implement if you want to use tags/colors
                      />
                      <label htmlFor="cat-tag" className="absolute left-3 top-2 pointer-events-none transition-all duration-200 bg-white px-1 peer-placeholder-shown:top-2 peer-placeholder-shown:text-xs peer-focus:-top-4 peer-focus:text-xs">Tag/Color (optional)</label>
                    </div>
                    {catFormError && <div className="text-red-500 text-sm text-center">{catFormError}</div>}
                    <button type="submit" className="bg-yellow-400 text-blue-900 px-4 py-2 rounded hover:bg-yellow-500 transition font-semibold text-sm" disabled={catFormLoading}>{catEditId ? 'Update' : 'Add'} Category</button>
                  </form>
                </div>
              </>
            )}
          </section>
        )}
        {activeSection === 'products' && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Products</h2>
              <button
                className="bg-purple-600 text-white px-4 py-2 rounded shadow hover:bg-purple-700 transition"
                onClick={() => { setProdFormOpen(true); setProdEditId(null); setProdForm({}); setProdImage(null); }}
              >+ Add Product</button>
            </div>
            {prodLoading ? (
              <div className="text-center text-gray-500 py-8">Loading products...</div>
            ) : prodError ? (
              <div className="text-center text-red-500 py-8">{prodError}</div>
            ) : (
              <table className="min-w-full text-sm bg-white rounded-lg shadow overflow-hidden">
                <thead className="bg-purple-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Description</th>
                    <th className="px-4 py-2 text-left">Price</th>
                    <th className="px-4 py-2 text-left">Category</th>
                    <th className="px-4 py-2 text-left">Stock Type</th>
                    <th className="px-4 py-2 text-left">Quantity</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(prod => (
                    <tr key={prod._id} className="border-b last:border-none">
                      <td className="px-4 py-2">{prod.name}</td>
                      <td className="px-4 py-2">{prod.description}</td>
                      <td className="px-4 py-2">${prod.price}</td>
                      <td className="px-4 py-2">{prod.category}</td>
                      <td className="px-4 py-2">{prod.stockType}</td>
                      <td className="px-4 py-2">{prod.quantity}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <button className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600" onClick={() => handleProdEdit(prod)}>Edit</button>
                        <button className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" onClick={() => handleProdDelete(prod._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {/* Product Form Modal */}
            {prodFormOpen && (
              <>
                <div className="fixed inset-0 bg-blue-900/20 z-40" />
                <div className="absolute left-1/2 top-24 -translate-x-1/2 z-50 bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full flex flex-col gap-4">
                  <button className="absolute top-3 right-3 text-blue-400 hover:text-blue-700 text-xl" onClick={() => setProdFormOpen(false)} aria-label="Close">×</button>
                  <h3 className="text-xl font-bold mb-2 text-blue-700">{prodEditId ? 'Edit' : 'Add'} Product</h3>
                  <form onSubmit={handleProdFormSubmit} className="flex flex-col gap-4">
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        id="prod-name"
                        value={prodForm.name || ''}
                        onChange={handleProdFormChange}
                        className="peer border border-yellow-200 rounded px-3 py-2 w-full text-sm bg-white text-blue-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-300"
                        placeholder="Product Name"
                        required
                      />
                      <label htmlFor="prod-name" className="absolute left-3 top-2 pointer-events-none transition-all duration-200 bg-white px-1 peer-placeholder-shown:top-2 peer-placeholder-shown:text-xs peer-focus:-top-4 peer-focus:text-xs">Product Name</label>
                    </div>
                    <div className="relative">
                      <textarea
                        name="description"
                        id="prod-desc"
                        value={prodForm.description || ''}
                        onChange={handleProdFormChange}
                        className="peer border border-yellow-200 rounded px-3 py-2 w-full text-sm bg-white text-blue-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-300"
                        placeholder="Description"
                        required
                      />
                      <label htmlFor="prod-desc" className="absolute left-3 top-2 pointer-events-none transition-all duration-200 bg-white px-1 peer-placeholder-shown:top-2 peer-placeholder-shown:text-xs peer-focus:-top-4 peer-focus:text-xs">Description</label>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        name="price"
                        id="prod-price"
                        value={prodForm.price || ''}
                        onChange={handleProdFormChange}
                        className="peer border border-yellow-200 rounded px-3 py-2 w-full text-sm bg-white text-blue-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-300"
                        placeholder="Price"
                        required
                      />
                      <label htmlFor="prod-price" className="absolute left-3 top-2 pointer-events-none transition-all duration-200 bg-white px-1 peer-placeholder-shown:top-2 peer-placeholder-shown:text-xs peer-focus:-top-4 peer-focus:text-xs">Price</label>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        name="category"
                        id="prod-category"
                        value={prodForm.category || ''}
                        onChange={handleProdFormChange}
                        className="peer border border-yellow-200 rounded px-3 py-2 w-full text-sm bg-white text-blue-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-300"
                        placeholder="Category"
                        required
                      />
                      <label htmlFor="prod-category" className="absolute left-3 top-2 pointer-events-none transition-all duration-200 bg-white px-1 peer-placeholder-shown:top-2 peer-placeholder-shown:text-xs peer-focus:-top-4 peer-focus:text-xs">Category</label>
                    </div>
                    <div className="relative">
                      <select
                        name="stockType"
                        id="prod-stockType"
                        value={prodForm.stockType || ''}
                        onChange={handleProdFormChange}
                        className="peer border border-yellow-200 rounded px-3 py-2 w-full text-sm bg-white text-blue-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-300"
                        required
                      >
                        <option value="" disabled hidden></option>
                        <option value="in_store">In Store</option>
                        <option value="online">Online</option>
                      </select>
                      <label htmlFor="prod-stockType" className="absolute left-3 top-2 pointer-events-none transition-all duration-200 bg-white px-1 peer-placeholder-shown:top-2 peer-placeholder-shown:text-xs peer-focus:-top-4 peer-focus:text-xs">Stock Type</label>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        name="quantity"
                        id="prod-quantity"
                        value={prodForm.quantity || ''}
                        onChange={handleProdFormChange}
                        className="peer border border-yellow-200 rounded px-3 py-2 w-full text-sm bg-white text-blue-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-300"
                        placeholder="Quantity"
                        required
                      />
                      <label htmlFor="prod-quantity" className="absolute left-3 top-2 pointer-events-none transition-all duration-200 bg-white px-1 peer-placeholder-shown:top-2 peer-placeholder-shown:text-xs peer-focus:-top-4 peer-focus:text-xs">Quantity</label>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="prod-image" className="flex items-center gap-2 cursor-pointer bg-yellow-100 hover:bg-yellow-200 text-blue-700 px-3 py-2 rounded-lg font-medium w-fit">
                        <Upload size={18} /> Upload Image
                      </label>
                      <input id="prod-image" name="image" type="file" accept="image/*" className="hidden" onChange={handleProdImageChange} />
                      {prodImagePreview && <img src={prodImagePreview} alt="Preview" className="mt-2 rounded shadow w-24 h-24 object-cover" />}
                    </div>
                    {prodFormError && <div className="text-red-500 text-sm text-center">{prodFormError}</div>}
                    <button type="submit" className="bg-yellow-400 text-blue-900 px-4 py-2 rounded hover:bg-yellow-500 transition font-semibold text-sm" disabled={prodFormLoading}>{prodEditId ? 'Update' : 'Add'} Product</button>
                  </form>
                </div>
              </>
            )}
          </section>
        )}
        {activeSection === 'orders' && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Orders</h2>
            </div>
            {ordersLoading ? (
              <div className="text-center text-gray-500 py-8">Loading orders...</div>
            ) : ordersError ? (
              <div className="text-center text-red-500 py-8">{ordersError}</div>
            ) : (
              <table className="min-w-full text-sm bg-white rounded-lg shadow overflow-hidden">
                <thead className="bg-yellow-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Order ID</th>
                    <th className="px-4 py-2 text-left">User</th>
                    <th className="px-4 py-2 text-left">Items</th>
                    <th className="px-4 py-2 text-left">Total</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order._id} className="border-b last:border-none">
                      <td className="px-4 py-2">{order._id}</td>
                      <td className="px-4 py-2">{order.user}</td>
                      <td className="px-4 py-2">
                        <ul className="list-disc pl-4">
                          {order.items.map((item, idx) => (
                            <li key={idx}>{item.name} x{item.quantity} (${item.price})</li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-4 py-2">${order.total}</td>
                      <td className="px-4 py-2">{order.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}
        {activeSection === 'cart' && (
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Cart</h2>
            <div className="text-gray-500">Cart management coming soon...</div>
          </section>
        )}
        {activeSection === 'banners' && (
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Banners</h2>
            <div className="text-gray-500">Banner management coming soon...</div>
          </section>
        )}
        {activeSection === 'recommendations' && (
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Recommendations</h2>
            <div className="text-gray-500">Recommendation management coming soon...</div>
          </section>
        )}
        {activeSection === 'footer' && (
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Footer</h2>
            <div className="text-gray-500">Footer management coming soon...</div>
          </section>
        )}
      </main>
    </div>
  );
}
