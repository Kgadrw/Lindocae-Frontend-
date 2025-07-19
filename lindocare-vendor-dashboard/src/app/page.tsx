'use client';

import { useState, useRef, useEffect } from "react";
import { List, Box, ShoppingCart, Megaphone, Star, Link as LinkIcon, LogOut, Receipt, Image as ImageIcon, Upload, Users as UsersIcon } from 'lucide-react';
import Image from 'next/image';
import React from "react"; // Added missing import for React
import Sidebar from '../components/Sidebar';
import StatsCards from '../components/StatsCards';
import CategoriesSection from '../components/CategoriesSection';
import Link from 'next/link';
import AdCreateForm from '../components/AdCreateForm';
import AdList from '../components/AdList';
import CategoryDeleteModal from '../components/CategoryDeleteModal';

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
  image?: string;
  count?: number;
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

type SidebarSection = { key: string; label: string; icon: () => React.ReactNode };

export default function AdminDashboard() {
  // Move activeSection to the very top
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
  const [prodImagePreview, setProdImagePreview] = useState<string | null>(null);
  // Add missing product delete state
  const [prodToDelete, setProdToDelete] = useState<Product | null>(null);
  const [prodDeleteLoading, setProdDeleteLoading] = useState(false);
  const [prodDeleteError, setProdDeleteError] = useState('');

  // Add this after the other useState hooks
  const [expandedCategories, setExpandedCategories] = useState<{ [catId: string]: boolean }>({});

  // --- AUTH ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(true);
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  // Banner state
  const [bannerForm, setBannerForm] = useState({ title: '', subTitle: '', categoryId: '', images: [] as File[] });
  const [bannerFormLoading, setBannerFormLoading] = useState(false);
  const [bannerFormError, setBannerFormError] = useState('');
  const [bannerFormSuccess, setBannerFormSuccess] = useState('');
  const [bannerImagePreview, setBannerImagePreview] = useState<string[] | null>(null);
  const [banners, setBanners] = useState<any[]>([]);
  const [bannerLoading, setBannerLoading] = useState(false);
  const [bannerError, setBannerError] = useState('');
  const [expandedBannerId, setExpandedBannerId] = useState<string | null>(null);
  const [bannerProducts, setBannerProducts] = useState<{ [bannerId: string]: Product[] }>({});
  const [bannerProductsLoading, setBannerProductsLoading] = useState<{ [bannerId: string]: boolean }>({});
  const [bannerProductsError, setBannerProductsError] = useState<{ [bannerId: string]: string }>({});
  const [bannerEditId, setBannerEditId] = useState<string | null>(null);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [showAdForm, setShowAdForm] = useState(false);
  const [showIconForm, setShowIconForm] = useState(false);
  // Add missing banner delete state
  const [bannerToDelete, setBannerToDelete] = useState<any | null>(null);
  const [bannerDeleteLoading, setBannerDeleteLoading] = useState(false);
  const [bannerDeleteError, setBannerDeleteError] = useState('');

  // Cart state
  const [cart, setCart] = useState<any[]>([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState('');

  // API Explorer state
  const [apiEndpoints, setApiEndpoints] = useState<string[]>([]);
  const [apiExplorerError, setApiExplorerError] = useState('');
  const [showApiExplorer, setShowApiExplorer] = useState(false);

  // Users state
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [userEditId, setUserEditId] = useState<string | null>(null);
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [userForm, setUserForm] = useState<any>({});
  const [userFormLoading, setUserFormLoading] = useState(false);
  const [userFormError, setUserFormError] = useState('');

  // ICONS STATE (add after other useState hooks)
  const [icons, setIcons] = useState<any[]>([]);
  const [iconsLoading, setIconsLoading] = useState(true);
  const [iconsError, setIconsError] = useState('');
  // Icon edit/delete state
  const [iconEditId, setIconEditId] = useState<string | null>(null);
  const [iconEditForm, setIconEditForm] = useState({
    title: '',
    categoryId: '',
    image: null, // File or string (URL)
  });
  const [iconEditLoading, setIconEditLoading] = useState(false);
  const [iconEditMsg, setIconEditMsg] = useState('');
  const [iconToDelete, setIconToDelete] = useState<any | null>(null);
  const [iconDeleteLoading, setIconDeleteLoading] = useState(false);
  const [iconDeleteError, setIconDeleteError] = useState('');

  // 1. Add state for category to delete
  const [catToDelete, setCatToDelete] = useState<Category | null>(null);
  const [catDeleteLoading, setCatDeleteLoading] = useState(false);
  const [catDeleteError, setCatDeleteError] = useState('');

  // Icon form state and handlers
  const [iconForm, setIconForm] = useState({ title: '', categoryId: '', image: null });
  const [iconFormMsg, setIconFormMsg] = useState('');
  const [iconFormLoading, setIconFormLoading] = useState(false);

  const handleIconFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files, type } = e.target as any;
    if (name === 'image' && files && files.length > 0) {
      setIconForm((f: any) => ({ ...f, image: files[0] }));
    } else {
      setIconForm((f: any) => ({ ...f, [name]: value }));
    }
  };

  const handleIconFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIconFormLoading(true);
    setIconFormMsg('');
    try {
      const formData = new FormData();
      formData.append('title', iconForm.title);
      formData.append('categoryId', iconForm.categoryId);
      if (iconForm.image) formData.append('image', iconForm.image);
      const res = await fetch('https://lindo-project.onrender.com/icons/createIcon', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Failed to upload icon');
      setIconForm({ title: '', categoryId: '', image: null });
      setShowIconForm(false);
      // Refresh icons
      fetchIcons();
    } catch (err: any) {
      setIconFormMsg(err.message || 'Error uploading icon');
    } finally {
      setIconFormLoading(false);
    }
  };

  // Fetch icons function
  const fetchIcons = async () => {
    setIconsLoading(true);
    setIconsError('');
    try {
      const res = await fetch('https://lindo-project.onrender.com/icons/getIcons');
      const data = await res.json();
      if (Array.isArray(data)) setIcons(data);
      else if (data && Array.isArray(data.icons)) setIcons(data.icons);
      else setIcons([]);
    } catch (err: any) {
      setIconsError('Failed to fetch icons.');
    } finally {
      setIconsLoading(false);
    }
  };

  useEffect(() => { fetchIcons(); }, []);

  // --- User Form Handlers ---
  const handleUserFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files, type } = e.target as any;
    if (name === "image" && files && files[0]) {
      setUserForm((f: any) => ({ ...f, image: files[0] }));
    } else {
      setUserForm((f: any) => ({ ...f, [name]: value }));
    }
  };

  const handleUserImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUserForm((f: any) => ({ ...f, image: e.target.files[0] }));
    }
  };

  const handleUserFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormLoading(true);
    setUserFormError('');
    try {
      const formData = new FormData();
      if (userForm.image) formData.append('image', userForm.image);
      formData.append('firstName', userForm.firstName || '');
      formData.append('lastName', userForm.lastName || '');
      formData.append('email', userForm.email || '');
      formData.append('gender', userForm.gender || '');
      if (userForm.password) formData.append('password', userForm.password);
      formData.append('role', userForm.role || 'user');
      let res;
      if (userEditId) {
        // Update user
        res = await fetch(`https://lindo-project.onrender.com/user/updateUserById/${userEditId}`,
          { method: 'PUT', body: formData });
        if (!res.ok) throw new Error('Failed to update user');
      } else {
        // Create user
        res = await fetch('https://lindo-project.onrender.com/user/Register',
          { method: 'POST', body: formData });
        if (!res.ok) throw new Error('Failed to create user');
      }
      setUserForm({});
      setUserEditId(null);
      setUserFormOpen(false);
      // Refresh users
      setUsersLoading(true);
      fetch('https://lindo-project.onrender.com/user/getAllUsers')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setUsers(data);
          else if (data && Array.isArray(data.users)) setUsers(data.users);
          else setUsers([]);
        })
        .catch(() => setUsersError('Failed to fetch users.'))
        .finally(() => setUsersLoading(false));
    } catch (err: any) {
      setUserFormError(err.message || 'Error');
    } finally {
      setUserFormLoading(false);
    }
  };

  // User delete state
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [userDeleteLoading, setUserDeleteLoading] = useState(false);
  const [userDeleteError, setUserDeleteError] = useState('');

  // --- User Delete Handlers ---
  const handleUserDelete = (user: any) => {
    setUserToDelete(user);
    setUserDeleteError('');
  };

  const cancelUserDelete = () => {
    setUserToDelete(null);
    setUserDeleteError('');
  };

  const confirmUserDelete = async () => {
    if (!userToDelete) return;
    setUserDeleteLoading(true);
    setUserDeleteError('');
    try {
      const res = await fetch(`https://lindo-project.onrender.com/user/deleteUserById/${userToDelete._id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete user');
      setUsers(users => users.filter(u => u._id !== userToDelete._id));
      setUserToDelete(null);
    } catch (err: any) {
      setUserDeleteError(err.message || 'Error deleting user');
    } finally {
      setUserDeleteLoading(false);
    }
  };

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

  // Fetch categories
  useEffect(() => {
    if (activeSection !== 'categories') return;
    setCatLoading(true);
    setCatError('');
    const token = getAuthToken();
    fetch('https://lindo-project.onrender.com/category/getAllCategories', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        let cats: any[] = [];
        if (Array.isArray(data)) {
          cats = data;
        } else if (data && Array.isArray(data.categories)) {
          cats = data.categories;
        }
        const filteredCats = cats.map((cat: any) => ({
          _id: cat._id || '',
          name: typeof cat.name === 'string' ? cat.name : '',
          description: typeof cat.description === 'string' ? cat.description : '',
          image: cat.image,
          count: cat.count || 0,
        }));
        setCategories(filteredCats);
      })
      .catch(() => setCatError('Failed to fetch categories.'))
      .finally(() => setCatLoading(false));
  }, [activeSection]);

  // Fetch products
  useEffect(() => {
    if (activeSection !== 'products') return;
    setProdLoading(true);
    setProdError('');
    const token = getAuthToken();
    fetch('https://lindo-project.onrender.com/product/getAllProduct', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setProducts([]);
          setProdError('Unexpected response format from server.');
        }
      })
      .catch(() => setProdError('Failed to fetch products.'))
      .finally(() => setProdLoading(false));
  }, [activeSection]);

  // Fetch orders
  useEffect(() => {
    if (activeSection !== 'orders') return;
    setOrdersLoading(true);
    setOrdersError('');
    const token = getAuthToken();
    fetch('https://lindo-project.onrender.com/api/order', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setOrders(Array.isArray(data) ? data : (data.orders || [])))
      .catch(() => setOrdersError('Failed to fetch orders.'))
      .finally(() => setOrdersLoading(false));
  }, [activeSection]);

  // Fetch all banners when Banners section is active
  useEffect(() => {
    if (activeSection !== 'banners') return;
    setBannerLoading(true);
    setBannerError('');
    fetch('https://lindo-project.onrender.com/banner/getAllBanners')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.banners)) setBanners(data.banners);
        else setBanners([]);
      })
      .catch(() => setBannerError('Failed to fetch banners.'))
      .finally(() => setBannerLoading(false));
  }, [activeSection, bannerFormSuccess]);

  // Fetch cart when Cart section is active
  useEffect(() => {
    if (activeSection !== 'cart') return;
    setCartLoading(true);
    setCartError('');
    const token = getAuthToken();
    fetch('https://lindo-project.onrender.com/api/cart', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setCart(Array.isArray(data) ? data : (data.cart || [])))
      .catch(() => setCartError('Failed to fetch cart.'))
      .finally(() => setCartLoading(false));
  }, [activeSection]);

  // Fetch users
  useEffect(() => {
    if (activeSection !== 'users') return;
    setUsersLoading(true);
    setUsersError('');
    fetch('https://lindo-project.onrender.com/user/getAllUsers')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUsers(data);
        else if (data && Array.isArray(data.users)) setUsers(data.users);
        else setUsers([]);
      })
      .catch(() => setUsersError('Failed to fetch users.'))
      .finally(() => setUsersLoading(false));
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
      const res = await fetch("https://lindo-project.onrender.com/user/Register", {
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

    // Validation: Ensure name and description are not empty
    if (!catForm.name || !catForm.description) {
      setCatFormError('Both name and description are required.');
      setCatFormLoading(false);
      return;
    }

    const token = getAuthToken();
    try {
      let res;
      if (catEditId) {
        // Update
        const formData = new FormData();
        formData.append('name', catForm.name);
        formData.append('description', catForm.description);
        if (catImage) formData.append('image', catImage);
        res = await fetch(`https://lindo-project.onrender.com/category/updateCategoryById/${catEditId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
        });
        if (!res.ok) {
          let msg = 'Failed to update category';
          try { msg = (await res.json()).message || msg; } catch {}
          throw new Error(msg);
        }
      } else {
        // Create
        const formData = new FormData();
        formData.append('name', catForm.name);
        formData.append('description', catForm.description);
        if (catImage) formData.append('image', catImage);
        res = await fetch('https://lindo-project.onrender.com/category/createCategory', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
        });
        if (!res.ok) {
          let msg = 'Failed to create category';
          try { msg = (await res.json()).message || msg; } catch {}
          throw new Error(msg);
        }
      }
      setCatForm({ name: '', description: '' });
      setCatEditId(null);
      setCatFormOpen(false);
      // Refresh
      setCatLoading(true);
      fetch('https://lindo-project.onrender.com/category/getAllCategories', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setCategories(Array.isArray(data) ? data : (data.categories || [])))
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
  // 2. Update handleCatDelete to show modal instead of immediate confirm
  const handleCatDelete = (cat: Category) => {
    setCatToDelete(cat);
    setCatDeleteError('');
  };
  const cancelCatDelete = () => {
    setCatToDelete(null);
    setCatDeleteError('');
  };
  const confirmCatDelete = async () => {
    if (!catToDelete) return;
    setCatDeleteLoading(true);
    setCatDeleteError('');
    const token = getAuthToken();
    const payload = { _id: catToDelete._id };
    try {
      const res = await fetch('https://lindo-project.onrender.com/category/deleteCategory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setCatDeleteLoading(false);
        setCatDeleteModalOpen(false);
        setCatToDelete(null);
        fetchCategories();
        return;
      } else {
        let errorMsg = `Failed to delete category (status: ${res.status})`;
        try {
          const data = await res.json();
          if (data && data.message) errorMsg += ` - ${data.message}`;
          else errorMsg += ` - ${JSON.stringify(data)}`;
        } catch {
          try {
            const text = await res.text();
            if (text) errorMsg += ` - ${text}`;
          } catch {}
        }
        setCatDeleteError(errorMsg);
        setCatDeleteLoading(false);
      }
    } catch (err) {
      setCatDeleteError('Network error. Please try again.');
      setCatDeleteLoading(false);
    }
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
    if (e.target.files && e.target.files[0]) {
      setProdImage(e.target.files[0]);
      setProdImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };
  const handleProdFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProdFormLoading(true);
    setProdFormError('');

    // Strict validation for required fields
    if (!prodForm.name || !prodForm.description || prodForm.price === undefined || prodForm.price === null || prodForm.category === undefined || prodForm.category === null || !prodForm.stockType || prodForm.quantity === undefined || prodForm.quantity === null) {
      setProdFormError('All fields are required.');
      setProdFormLoading(false);
      return;
    }

    // Ensure correct types and values
    const price = Number(prodForm.price);
    const quantity = Number(prodForm.quantity);
    const category = typeof prodForm.category === 'string' ? prodForm.category : (prodForm.category?.name || '');
    if (!category) {
      setProdFormError('Category is required and must be valid.');
      setProdFormLoading(false);
      return;
    }
    if (isNaN(price) || isNaN(quantity)) {
      setProdFormError('Price and quantity must be numbers.');
      setProdFormLoading(false);
      return;
    }

    const token = getAuthToken();
    try {
      const formData = new FormData();
      if (prodImage) formData.append('image', prodImage);
      formData.append('name', prodForm.name);
      formData.append('description', prodForm.description);
      formData.append('price', String(price));
      formData.append('category', category);
      formData.append('stockType', prodForm.stockType);
      formData.append('quantity', String(quantity));

      let res;
      if (prodEditId) {
        // Update by ID in path
        res = await fetch(`https://lindo-project.onrender.com/product/updateProductById/${prodEditId}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });
        if (!res.ok) {
          let msg = 'Failed to update product';
          try { msg = (await res.json()).message || msg; } catch {}
          throw new Error(msg);
        }
      } else {
        // Create
        res = await fetch('https://lindo-project.onrender.com/product/createProduct', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        });
        if (!res.ok) {
          let msg = 'Failed to create product';
          try { msg = (await res.json()).message || msg; } catch {}
          throw new Error(msg);
        }
      }
      setProdForm({});
      setProdEditId(null);
      setProdFormOpen(false);
      setProdImage(null);
      setProdImagePreview(null);
      // Refresh
      setProdLoading(true);
      fetch('https://lindo-project.onrender.com/product/getAllProduct', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setProducts(data);
          } else if (data && Array.isArray(data.products)) {
            setProducts(data.products);
          } else {
            setProducts([]);
            setProdError('Unexpected response format from server.');
          }
        })
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
  const handleProdDelete = (prod: Product) => {
    setProdToDelete(prod);
    setProdDeleteError('');
  };
  const cancelProdDelete = () => {
    setProdToDelete(null);
    setProdDeleteError('');
  };
  const confirmProdDelete = async () => {
    if (!prodToDelete) return;
    setProdDeleteLoading(true);
    setProdDeleteError('');
    const token = getAuthToken();
    try {
      const res = await fetch(`https://lindo-project.onrender.com/product/deleteProductById/${prodToDelete._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete product');
      // Refresh products
      fetch('https://lindo-project.onrender.com/product/getAllProduct', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setProducts(data);
          } else if (data && Array.isArray(data.products)) {
            setProducts(data.products);
          } else {
            setProducts([]);
            setProdError('Unexpected response format from server.');
          }
        })
        .catch(() => setProdError('Failed to fetch products.'))
        .finally(() => setProdLoading(false));
      setProdToDelete(null);
    } catch (err: any) {
      setProdDeleteError(err.message || 'Error deleting product');
    } finally {
      setProdDeleteLoading(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowAuth(true);
    setAuthForm({ username: '', password: '' });
    setAuthError('');
    if (typeof window !== 'undefined') sessionStorage.removeItem('admin-auth');
  };

  // Banner CRUD handlers
  const handleBannerEdit = (banner: any) => {
    setBannerEditId(banner._id);
    setBannerForm({
      title: banner.title || '',
      subTitle: banner.subTitle || '',
      categoryId: banner.category?._id || banner.category || '',
      images: [], // User must re-upload images to update
    });
    setBannerImagePreview(banner.images || []);
  };

  const handleBannerFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBannerFormLoading(true);
    setBannerFormError('');
    setBannerFormSuccess('');
    try {
      const formData = new FormData();
      formData.append('title', bannerForm.title);
      formData.append('subTitle', bannerForm.subTitle);
      formData.append('categoryId', bannerForm.categoryId);
      if (bannerForm.images && bannerForm.images.length > 0) {
        bannerForm.images.forEach(img => formData.append('images', img));
      }
      let res;
      if (bannerEditId) {
        // Update
        res = await fetch(`https://lindo-project.onrender.com/banner/updateBanner/${bannerEditId}`,
          { method: 'PUT', body: formData });
        if (res.status === 404) {
          setBannerFormError('Banner not found. It may have been deleted.');
          // Refresh banners list
          setBannerLoading(true);
          fetch('https://lindo-project.onrender.com/banner/getAllBanners')
            .then(res => res.json())
            .then(data => {
              if (data && Array.isArray(data.banners)) setBanners(data.banners);
              else setBanners([]);
            })
            .catch(() => setBannerError('Failed to fetch banners.'))
            .finally(() => setBannerLoading(false));
          setBannerFormLoading(false);
          return;
        }
      } else {
        // Create
        res = await fetch('https://lindo-project.onrender.com/banner/createBanner',
          { method: 'POST', body: formData });
      }
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setBannerFormSuccess(bannerEditId ? 'Banner updated successfully!' : 'Banner created successfully!');
        setBannerForm({ title: '', subTitle: '', categoryId: '', images: [] });
        setBannerImagePreview(null);
        setBannerEditId(null);
        // Auto-close modal after creation
        if (!bannerEditId) setShowBannerForm(false);
        // Always refresh banners list after update
        setBannerLoading(true);
        fetch('https://lindo-project.onrender.com/banner/getAllBanners')
          .then(res => res.json())
          .then(data => {
            if (data && Array.isArray(data.banners)) setBanners(data.banners);
            else setBanners([]);
          })
          .catch(() => setBannerError('Failed to fetch banners.'))
          .finally(() => setBannerLoading(false));
      } else {
        setBannerFormError(data.message || (bannerEditId ? 'Failed to update banner' : 'Failed to create banner'));
      }
    } catch (err: any) {
      setBannerFormError(err.message || 'Network error');
    } finally {
      setBannerFormLoading(false);
    }
  };

  const handleBannerFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as any;
    if (name === 'images' && files && files.length > 0) {
      setBannerForm(f => ({ ...f, images: Array.from(files) }));
      setBannerImagePreview(Array.from(files).map((file: File) => URL.createObjectURL(file)));
    } else {
      setBannerForm(f => ({ ...f, [name]: value }));
    }
  };

  // Banner delete handler
  const handleBannerDelete = (banner: any) => {
    setBannerToDelete(banner);
    setBannerDeleteError('');
  };
  const cancelBannerDelete = () => {
    setBannerToDelete(null);
    setBannerDeleteError('');
  };
  const confirmBannerDelete = async () => {
    if (!bannerToDelete) return;
    setBannerDeleteLoading(true);
    setBannerDeleteError('');
    try {
      const res = await fetch(`https://lindo-project.onrender.com/banner/deleteBanner/${bannerToDelete._id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete banner');
      // Refresh banners
      fetch('https://lindo-project.onrender.com/banner/getAllBanners')
        .then(res => res.json())
        .then(data => {
          if (data && Array.isArray(data.banners)) setBanners(data.banners);
          else setBanners([]);
        })
        .catch(() => setBannerError('Failed to fetch banners.'))
        .finally(() => setBannerLoading(false));
      setBannerToDelete(null);
    } catch (err: any) {
      setBannerDeleteError(err.message || 'Error deleting banner');
    } finally {
      setBannerDeleteLoading(false);
    }
  };

  // Fetch products for a banner
  const handleViewProducts = async (bannerId: string) => {
    setExpandedBannerId(expandedBannerId === bannerId ? null : bannerId);
    if (bannerProducts[bannerId] || expandedBannerId === bannerId) return; // Already loaded or closing
    setBannerProductsLoading(prev => ({ ...prev, [bannerId]: true }));
    setBannerProductsError(prev => ({ ...prev, [bannerId]: '' }));
    try {
      const res = await fetch(`https://lindo-project.onrender.com/api/banner/${bannerId}/products`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setBannerProducts(prev => ({ ...prev, [bannerId]: Array.isArray(data) ? data : (data.products || []) }));
    } catch (err: any) {
      setBannerProductsError(prev => ({ ...prev, [bannerId]: err.message || 'Error' }));
    } finally {
      setBannerProductsLoading(prev => ({ ...prev, [bannerId]: false }));
    }
  };

  // Cart handlers
  const handleAddToCart = async (productId: string, quantity: number = 1) => {
    setCartLoading(true);
    setCartError('');
    const token = getAuthToken();
    await fetch('https://lindo-project.onrender.com/api/cart/addToCart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId, quantity })
    });
    // Refresh cart
    fetch('https://lindo-project.onrender.com/api/cart', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setCart(Array.isArray(data) ? data : (data.cart || [])))
      .catch(() => setCartError('Failed to fetch cart.'))
      .finally(() => setCartLoading(false));
  };

  const handleRemoveFromCart = async (productId: string) => {
    setCartLoading(true);
    setCartError('');
    const token = getAuthToken();
    await fetch(`https://lindo-project.onrender.com/api/cart/${productId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    // Refresh cart
    fetch('https://lindo-project.onrender.com/api/cart', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setCart(Array.isArray(data) ? data : (data.cart || [])))
      .catch(() => setCartError('Failed to fetch cart.'))
      .finally(() => setCartLoading(false));
  };

  // API Explorer handlers
  const fetchApiEndpoints = async () => {
    setApiExplorerError('');
    setApiEndpoints([]);
    setShowApiExplorer(true);
    try {
      let res = await fetch('https://lindo-project.onrender.com/openapi.json');
      if (!res.ok) {
        res = await fetch('https://lindo-project.onrender.com/swagger.json');
      }
      if (!res.ok) throw new Error('OpenAPI/Swagger spec not found');
      const data = await res.json();
      if (data.paths) {
        setApiEndpoints(Object.keys(data.paths));
      } else {
        setApiExplorerError('No endpoints found in spec.');
      }
    } catch (err: any) {
      setApiExplorerError(err.message || 'Failed to fetch API spec.');
    }
  };

  // Utility to safely render only strings/numbers
  function safeRender(val: any) {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string' || typeof val === 'number') return val;
    return '';
  }

  // Utility to get auth token
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('token') || localStorage.getItem('token') || '';
    }
    return '';
  };

  // Fix: Use React.createElement for icons to avoid JSX parsing issues
  const SIDEBAR_SECTIONS: SidebarSection[] = [
    { key: 'categories', label: 'Categories', icon: () => React.createElement(List, { size: 18, className: 'mr-2' }) },
    { key: 'products', label: 'Products', icon: () => React.createElement(Box, { size: 18, className: 'mr-2' }) },
    { key: 'orders', label: 'Orders', icon: () => React.createElement(Receipt, { size: 18, className: 'mr-2' }) },
    { key: 'cart', label: 'Cart', icon: () => React.createElement(ShoppingCart, { size: 18, className: 'mr-2' }) },
    { key: 'banners', label: 'Banners', icon: () => React.createElement(Megaphone, { size: 18, className: 'mr-2' }) },
    { key: 'users', label: 'Users', icon: () => React.createElement(UsersIcon, { size: 18, className: 'mr-2' }) },
    { key: 'recommendations', label: 'Recommendations', icon: () => React.createElement(Star, { size: 18, className: 'mr-2' }) },
    { key: 'footer', label: 'Footer', icon: () => React.createElement(LinkIcon, { size: 18, className: 'mr-2' }) },
  ];

  // --- UI ---
  return (
    <>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-blue-50 to-purple-100">
        <div className="flex flex-1 pt-0">
          {/* Sidebar */}
          <Sidebar
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            handleLogout={handleLogout}
            SIDEBAR_SECTIONS={SIDEBAR_SECTIONS}
          />
          {/* Main Content */}
          <main className="flex-1 p-10 flex flex-col gap-8 bg-gradient-to-br from-white/80 via-blue-50/60 to-purple-100/60 ml-64">
            {/* Auth Modal */}
            {showAuth && !isAuthenticated && (
              <>
                <div className="fixed inset-0 bg-gray-900 bg-opacity-40 flex items-center justify-center z-50">
                  <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-xs flex flex-col items-center relative border border-blue-200">
                    <Image src="/lindo.png" alt="Lindocare Logo" width={48} height={48} className="mb-3 rounded-full border border-gray-200" style={{ width: 'auto', height: 'auto' }} />
                    <h2 className="text-lg font-bold text-blue-900 mb-1">Admin Login</h2>
                    <p className="text-blue-500 font-medium mb-3 text-xs">Please login to access dashboard</p>
                    <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4 w-full">
                      <div className="flex flex-col gap-1 mb-2">
                        <label htmlFor="login-username" className="text-blue-900 text-sm font-medium mb-1">Username</label>
                        <input
                          type="text"
                          name="username"
                          id="login-username"
                          value={authForm.username}
                          onChange={handleAuthChange}
                          className="border border-blue-200 rounded px-3 py-2 text-sm bg-white/80 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-300 w-full"
                          autoFocus
                          required
                          aria-label="Username"
                        />
                      </div>
                      <div className="flex flex-col gap-1 mb-2">
                        <label htmlFor="login-password" className="text-blue-900 text-sm font-medium mb-1">Password</label>
                        <input
                          type="password"
                          name="password"
                          id="login-password"
                          value={authForm.password}
                          onChange={handleAuthChange}
                          className="border border-blue-200 rounded px-3 py-2 text-sm bg-white/80 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-300 w-full"
                          required
                          aria-label="Password"
                        />
                      </div>
                      {authError && <div className="text-red-500 text-center text-xs font-semibold bg-red-50 border border-red-200 rounded py-1">{authError}</div>}
                      <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition font-semibold text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-300">Login</button>
                    </form>
                    <div className="mt-3 text-xs text-gray-400">Hint: admin / admin</div>
                  </div>
                </div>
              </>
            )}
            {/* Stats Cards Row */}
            <StatsCards
              categoriesCount={categories.length}
              productsCount={products.length}
              ordersCount={orders.length}
              bannersCount={banners.length}
              usersCount={users.length}
            />
            {/* Main Sections as Cards */}
            <div className="grid grid-cols-1 gap-8">
              {activeSection === 'categories' && (
                <>
                  <CategoriesSection
                    categories={categories}
                    products={products}
                    catLoading={catLoading}
                    catError={catError}
                    expandedCategories={expandedCategories}
                    setExpandedCategories={setExpandedCategories}
                    handleCatEdit={handleCatEdit}
                    handleCatDelete={handleCatDelete}
                    setCatFormOpen={setCatFormOpen}
                    setCatEditId={setCatEditId}
                    setCatForm={setCatForm}
                    safeRender={safeRender}
                  />
                  {/* Category Delete Modal */}
                  <CategoryDeleteModal
                    open={!!catToDelete}
                    category={catToDelete}
                    error={catDeleteError}
                    loading={catDeleteLoading}
                    onCancel={cancelCatDelete}
                    onConfirm={confirmCatDelete}
                    onRefresh={() => {
                      setCatLoading(true);
                      const token = getAuthToken();
                      fetch('https://lindo-project.onrender.com/category/getAllCategories', {
                        headers: { 'Authorization': `Bearer ${token}` }
                      })
                        .then(res => res.json())
                        .then(data => setCategories(Array.isArray(data) ? data : (data.categories || [])))
                        .catch(() => setCatError('Failed to fetch categories.'))
                        .finally(() => setCatLoading(false));
                    }}
                  />
                  {catFormOpen && (
                    <>
                      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity animate-fade-in" onClick={() => { setCatFormOpen(false); setCatEditId(null); setCatForm({ name: '', description: '' }); setCatImage(null); setCatImagePreview(null); }} />
                      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-6 max-w-sm w-full flex flex-col gap-4 border border-yellow-200 animate-modal-pop overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <button className="absolute top-3 right-3 text-blue-400 hover:text-blue-700 text-xl" onClick={() => { setCatFormOpen(false); setCatEditId(null); setCatForm({ name: '', description: '' }); setCatImage(null); setCatImagePreview(null); }} aria-label="Close">×</button>
                        <h3 className="text-xl font-bold mb-2 text-blue-700">{catEditId ? 'Edit' : 'Add'} Category</h3>
                        <form onSubmit={handleCatFormSubmit} className="flex flex-col gap-2">
                          <div className="flex flex-col gap-1 mb-2">
                            <label htmlFor="cat-name" className="text-blue-900 text-sm font-medium mb-1">Category Name</label>
                            <input
                              type="text"
                              name="name"
                              id="cat-name"
                              value={catForm.name}
                              onChange={handleCatFormChange}
                              className="border border-yellow-200 rounded px-3 py-2 w-full text-sm bg-white text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                              required
                            />
                          </div>
                          <div className="flex flex-col gap-1 mb-2">
                            <label htmlFor="cat-desc" className="text-blue-900 text-sm font-medium mb-1">Description</label>
                            <textarea
                              name="description"
                              id="cat-desc"
                              value={catForm.description}
                              onChange={handleCatFormChange}
                              className="border border-yellow-200 rounded px-3 py-2 w-full text-sm bg-white text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                              required
                            />
                          </div>
                          <div className="flex flex-col gap-2 mb-2">
                            <label htmlFor="cat-image" className="text-blue-900 text-sm font-medium mb-1">Category Image</label>
                            <label htmlFor="cat-image" className="flex items-center gap-2 cursor-pointer bg-yellow-100 hover:bg-yellow-200 text-blue-700 px-3 py-2 rounded-lg font-medium w-fit">
                              <Upload size={18} /> Upload Image
                            </label>
                            <input id="cat-image" name="image" type="file" accept="image/*" className="hidden" onChange={handleCatImageChange} />
                            {catImagePreview && <img src={catImagePreview} alt="Preview" className="mt-2 rounded shadow w-24 h-24 object-cover" />}
                          </div>
                          {catFormError && <div className="text-red-500 text-sm text-center">{catFormError}</div>}
                          <button type="submit" className="bg-yellow-400 text-blue-900 px-4 py-2 rounded hover:bg-yellow-500 transition font-semibold text-sm" disabled={catFormLoading}>{catEditId ? 'Update' : 'Add'} Category</button>
                        </form>
                      </div>
                    </>
                  )}
                </>
              )}
              {activeSection === 'products' && (
                <section className="bg-white/90 backdrop-blur rounded-2xl shadow-md p-6 border border-yellow-100">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="font-bold text-2xl text-blue-900">Products</span>
                      {/* Add filter/search/sort controls here if needed */}
                    </div>
                    <button
                      className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition text-sm flex items-center gap-2"
                      onClick={() => { setProdFormOpen(true); setProdEditId(null); setProdForm({}); setProdImage(null); }}
                    >
                      + Add Product
                    </button>
                  </div>
                  {prodLoading ? (
                    <div className="text-center text-gray-500 py-8">Loading products...</div>
                  ) : prodError ? (
                    <div className="text-center text-red-500 py-8">{prodError}</div>
                  ) : (
                    Array.isArray(products) && products.length > 0 ? (
                      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
                        <table className="min-w-full text-sm text-left">
                          <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                              <th className="px-4 py-3 font-semibold text-gray-700">Image</th>
                              <th className="px-4 py-3 font-semibold text-gray-700">Product Name</th>
                              <th className="px-4 py-3 font-semibold text-gray-700">Price</th>
                              <th className="px-4 py-3 font-semibold text-gray-700">Category</th>
                              <th className="px-4 py-3 font-semibold text-gray-700">Stock</th>
                              <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                              <th className="px-4 py-3 font-semibold text-gray-700">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {products.map(prod => (
                              <tr key={prod._id} className="hover:bg-gray-50 transition">
                                <td className="px-4 py-2">
                                  {Array.isArray(prod.image) && prod.image.length > 0 ? (
                                    <img src={prod.image[0]} alt={safeRender(prod.name)} className="w-12 h-12 object-cover rounded border border-gray-200" />
                                  ) : prod.image ? (
                                    <img src={prod.image} alt={safeRender(prod.name)} className="w-12 h-12 object-cover rounded border border-gray-200" />
                                  ) : (
                                    <img src="/lindo.png" alt="No image" className="w-12 h-12 object-cover rounded border border-gray-200 opacity-60" />
                                  )}
                                </td>
                                <td className="px-4 py-2 font-medium text-blue-900">{safeRender(prod.name)}</td>
                                <td className="px-4 py-2 text-yellow-700 font-semibold">${safeRender(prod.price)}</td>
                                <td className="px-4 py-2 text-blue-600">{safeRender(prod.category)}</td>
                                <td className="px-4 py-2 text-gray-700">{safeRender(prod.quantity)}</td>
                                <td className="px-4 py-2">
                                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Active</span>
                                </td>
                                <td className="px-4 py-2 flex gap-2">
                                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-xs font-semibold transition" onClick={() => handleProdEdit(prod)}>Edit</button>
                                  <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-semibold transition" onClick={() => handleProdDelete(prod)}>Delete</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">No products found.</div>
                      
                    )
                  )}
                  {/* Product Form Modal */}
                  {prodFormOpen && (
                    <>
                      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity animate-fade-in" onClick={() => { setProdFormOpen(false); setProdImage(null); setProdImagePreview(null); }} />
                      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-6 max-w-sm w-full flex flex-col gap-4 border border-yellow-200 animate-modal-pop overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <button className="absolute top-3 right-3 text-blue-400 hover:text-blue-700 text-xl" onClick={() => { setProdFormOpen(false); setProdImage(null); setProdImagePreview(null); }} aria-label="Close">×</button>
                        <h3 className="text-xl font-bold mb-2 text-blue-700">{prodEditId ? 'Edit' : 'Add'} Product</h3>
                        <form onSubmit={handleProdFormSubmit} className="flex flex-col gap-2">
                          <div className="flex flex-col gap-1 mb-2">
                            <label htmlFor="prod-name" className="text-blue-900 text-sm font-medium mb-1">Product Name</label>
                            <input
                              type="text"
                              name="name"
                              id="prod-name"
                              value={prodForm.name || ''}
                              onChange={handleProdFormChange}
                              className="border border-yellow-200 rounded px-3 py-2 w-full text-sm bg-white text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                              required
                            />
                          </div>
                          <div className="flex flex-col gap-1 mb-2">
                            <label htmlFor="prod-desc" className="text-blue-900 text-sm font-medium mb-1">Description</label>
                            <textarea
                              name="description"
                              id="prod-desc"
                              value={prodForm.description || ''}
                              onChange={handleProdFormChange}
                              className="border border-yellow-200 rounded px-3 py-2 w-full text-sm bg-white text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                              required
                            />
                          </div>
                          <div className="flex flex-col gap-1 mb-2">
                            <label htmlFor="prod-price" className="text-blue-900 text-sm font-medium mb-1">Price</label>
                            <input
                              type="number"
                              name="price"
                              id="prod-price"
                              value={prodForm.price || ''}
                              onChange={handleProdFormChange}
                              className="border border-yellow-200 rounded px-3 py-2 w-full text-sm bg-white text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                              required
                            />
                          </div>
                          <div className="flex flex-col gap-1 mb-2">
                            <label htmlFor="prod-category" className="text-blue-900 text-sm font-medium mb-1">Category</label>
                            <select
                              name="category"
                              id="prod-category"
                              value={typeof prodForm.category === 'string' ? prodForm.category : ''}
                              onChange={handleProdFormChange}
                              className="border border-yellow-200 rounded px-3 py-2 w-full text-sm bg-white text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                              required
                            >
                              <option value="" disabled>Select a category</option>
                              {categories.map(cat => (
                                <option key={cat._id} value={cat.name}>{cat.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex flex-col gap-1 mb-2">
                            <label htmlFor="prod-stockType" className="text-blue-900 text-sm font-medium mb-1">Stock Type</label>
                            <select
                              name="stockType"
                              id="prod-stockType"
                              value={prodForm.stockType || ''}
                              onChange={handleProdFormChange}
                              className="border border-yellow-200 rounded px-3 py-2 w-full text-sm bg-white text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                              required
                            >
                              <option value="" disabled hidden>Select stock type</option>
                              <option value="in_store">In Store</option>
                              <option value="online">Online</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-1 mb-2">
                            <label htmlFor="prod-quantity" className="text-blue-900 text-sm font-medium mb-1">Quantity</label>
                            <input
                              type="number"
                              name="quantity"
                              id="prod-quantity"
                              value={prodForm.quantity || ''}
                              onChange={handleProdFormChange}
                              className="border border-yellow-200 rounded px-3 py-2 w-full text-sm bg-white text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                              required
                            />
                          </div>
                          <div className="flex flex-col gap-2 mb-2">
                            <label htmlFor="prod-image" className="text-blue-900 text-sm font-medium mb-1">Product Image</label>
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
                <section className="bg-white/80 backdrop-blur rounded-2xl shadow-md p-8 border border-green-50">
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
                <section className="bg-white/80 backdrop-blur rounded-2xl shadow-md p-8 border border-gray-50">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Cart</h2>
                  {cartLoading ? (
                    <div className="text-center text-gray-500 py-8">Loading cart...</div>
                  ) : cartError ? (
                    <div className="text-center text-red-500 py-8">{cartError}</div>
                  ) : cart.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">Your cart is empty.</div>
                  ) : (
                    <table className="min-w-full text-sm bg-white rounded-lg shadow overflow-hidden">
                      <thead className="bg-yellow-100">
                        <tr>
                          <th className="px-4 py-2 text-left">Product</th>
                          <th className="px-4 py-2 text-left">Quantity</th>
                          <th className="px-4 py-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.map((item: any) => (
                          <tr key={item.productId} className="border-b last:border-none">
                            <td className="px-4 py-2">{item.productName || item.productId}</td>
                            <td className="px-4 py-2">{item.quantity}</td>
                            <td className="px-4 py-2">
                              <button className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" onClick={() => handleRemoveFromCart(item.productId)}>Remove</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </section>
              )}
              {activeSection === 'banners' && (
                <>
                  <section className="bg-white/80 backdrop-blur rounded-2xl shadow-md p-8 border border-orange-50 mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Banners</h2>
                      <button className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold px-5 py-2 rounded-lg shadow transition text-sm flex items-center gap-2" onClick={() => { setShowBannerForm(v => !v); if (!showBannerForm) { setBannerForm({ title: '', subTitle: '', categoryId: '', images: [] }); setBannerImagePreview(null); setBannerEditId(null); setBannerFormError(''); setBannerFormSuccess(''); } }}>Create Banner</button>
                  </div>
                    {/* Banner List (restore previous grid or card layout here) */}
                  {bannerLoading ? (
                    <div className="text-center text-gray-500 py-8">Loading banners...</div>
                  ) : bannerError ? (
                    <div className="text-center text-red-500 py-8">{bannerError}</div>
                    ) : (
                      <>
                        <h3 className="text-lg font-bold mb-4 text-blue-900">Banners</h3>
                        <div className="overflow-x-auto rounded-xl border border-yellow-100 bg-white mb-8">
                          <table className="min-w-full text-sm text-left">
                            <thead className="bg-yellow-50">
                              <tr>
                                <th className="px-4 py-3 font-semibold text-gray-700">Image</th>
                                <th className="px-4 py-3 font-semibold text-gray-700">Title</th>
                                <th className="px-4 py-3 font-semibold text-gray-700">Subtitle</th>
                                <th className="px-4 py-3 font-semibold text-gray-700">Category</th>
                                <th className="px-4 py-3 font-semibold text-gray-700">Created</th>
                                <th className="px-4 py-3 font-semibold text-gray-700">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-yellow-100">
                              {banners.length === 0 ? (
                                <tr><td colSpan={6} className="text-center text-gray-500 py-8">No banners found.</td></tr>
                              ) : banners.map((banner, idx) => (
                                <tr key={banner._id} className="hover:bg-yellow-50 transition">
                                  <td className="px-4 py-2">
                                    {banner.images && banner.images.length > 0 ? (
                                      <img src={banner.images[0]} alt={banner.title} className="w-16 h-16 object-cover rounded border border-gray-200" />
                                    ) : (
                                      <img src="/lindo.png" alt="No image" className="w-16 h-16 object-cover rounded border border-gray-200 opacity-60" />
                                    )}
                                  </td>
                                  <td className="px-4 py-2 font-medium text-blue-900">{banner.title}</td>
                                  <td className="px-4 py-2 text-blue-600">{banner.subTitle}</td>
                                  <td className="px-4 py-2 text-blue-600">{banner.category && typeof banner.category === 'object' ? banner.category.name : banner.category}</td>
                                  <td className="px-4 py-2 text-gray-400">{new Date(banner.createdAt).toLocaleString()}</td>
                                  <td className="px-4 py-2 flex flex-row gap-2">
                            <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs font-semibold transition" onClick={() => { handleBannerEdit(banner); setShowBannerForm(true); }}>Edit</button>
                            <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs font-semibold transition" onClick={() => handleBannerDelete(banner)}>Delete</button>
                            <button className="bg-yellow-400 text-blue-900 px-3 py-1 rounded hover:bg-yellow-500 text-xs font-semibold transition" onClick={() => handleViewProducts(banner._id)}>
                              {expandedBannerId === banner._id ? 'Hide Products' : 'View Products'}
                            </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          </div>
                        <h3 className="text-lg font-bold mb-4 text-blue-900">Ads</h3>
                        <div className="overflow-x-auto rounded-xl border border-yellow-100 bg-white">
                          <AdList />
                                      </div>
                      </>
                    )}
                  </section>
                  <section className="bg-white/80 backdrop-blur rounded-2xl shadow-md p-8 border border-blue-50 mb-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-800">Ads</h2>
                      <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg shadow transition text-sm flex items-center gap-2" onClick={() => setShowAdForm(true)}>Create Ad</button>
                            </div>
                    {/* Ads List (restore previous grid or card layout here) */}
                    <AdList />
                  </section>
                  <section className="bg-white/80 backdrop-blur rounded-2xl shadow-md p-8 border border-green-50">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-800">Icons</h2>
                      <button className="bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2 rounded-lg shadow transition text-sm flex items-center gap-2" onClick={() => setShowIconForm(true)}>Add Icon</button>
                    </div>
                    {/* Icons grid (restore previous grid layout here) */}
                    {iconsLoading ? (
                      <div className="col-span-4 text-center text-gray-500 py-8">Loading icons...</div>
                    ) : iconsError ? (
                      <div className="col-span-4 text-center text-red-500 py-8">{iconsError}</div>
                    ) : icons.length === 0 ? (
                      <div className="col-span-4 text-center text-gray-500 py-8">No icons found.</div>
                    ) : (
                      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        {icons.map((icon, idx) => {
                          let image = '';
                          if (Array.isArray(icon.image) && icon.image.length > 0) image = icon.image[0];
                          else if (typeof icon.image === 'string') image = icon.image;
                          const cat = categories.find(c => c._id === icon.categoryId);
                          return (
                            <div key={icon._id || idx} className="bg-white rounded-2xl shadow p-4 flex flex-col items-center border border-green-100">
                              {image ? (
                                <img src={image} alt={icon.title} className="w-16 h-16 object-cover rounded-full mb-2 border border-green-200" />
                              ) : (
                                <div className="w-16 h-16 flex items-center justify-center bg-gray-100 text-gray-400 text-3xl rounded-full mb-2">🖼️</div>
                              )}
                              <div className="font-bold text-green-900 text-base mb-1 text-center">{icon.title}</div>
                              <div className="text-xs text-green-700 text-center">{cat && typeof cat.name === 'string' ? cat.name : String(icon.categoryId)}</div>
                              <div className="flex gap-2 mt-2">
                                <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs font-semibold transition" onClick={() => handleIconEdit(icon)}>Edit</button>
                                <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs font-semibold transition" onClick={() => handleIconDelete(icon)}>Delete</button>
                              </div>
                            </div>
                          );
                        })}
                      </section>
                  )}
                </section>
                </>
              )}
              {activeSection === 'recommendations' && (
                <section className="bg-white/80 backdrop-blur rounded-2xl shadow-md p-8 border border-blue-50">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Recommendations</h2>
                  <div className="text-gray-500">Recommendation management coming soon...</div>
                </section>
              )}
              {activeSection === 'footer' && (
                <section className="bg-white/80 backdrop-blur rounded-2xl shadow-md p-8 border border-gray-50">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Footer</h2>
                  <div className="text-gray-500">Footer management coming soon...</div>
                </section>
              )}
              {activeSection === 'settings' && (
                <section className="bg-white/80 backdrop-blur rounded-2xl shadow-md p-8 border border-gray-50">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Settings</h2>
                  <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition font-semibold text-sm mb-4" onClick={fetchApiEndpoints}>Show API Endpoints</button>
                  {showApiExplorer && (
                    <div className="mt-4 p-4 bg-gray-50 rounded shadow border border-gray-200">
                      <h3 className="text-lg font-bold mb-2 text-blue-700">API Endpoints</h3>
                      {apiExplorerError ? (
                        <div className="text-red-500">{apiExplorerError}</div>
                      ) : apiEndpoints.length > 0 ? (
                        <ul className="list-disc pl-6 text-sm text-gray-700">
                          {apiEndpoints.map(ep => <li key={ep}>{ep}</li>)}
                        </ul>
                      ) : (
                        <div className="text-gray-500">No endpoints found.</div>
                      )}
                      <button className="mt-4 text-xs text-blue-500 underline" onClick={() => setShowApiExplorer(false)}>Close</button>
                    </div>
                  )}
                </section>
              )}

              {activeSection === 'users' && (
                <section className="bg-white/80 backdrop-blur rounded-2xl shadow-md p-8 border border-blue-50">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Users</h2>
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition text-sm flex items-center gap-2"
                      onClick={() => { setUserFormOpen(true); setUserEditId(null); setUserForm({}); }}
                    >
                      + Add User
                    </button>
                  </div>
                  {usersLoading ? (
                    <div className="text-center text-gray-500 py-8">Loading users...</div>
                  ) : usersError ? (
                    <div className="text-center text-red-500 py-8">{usersError}</div>
                  ) : users.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">No users found.</div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
                      <table className="min-w-full text-sm text-left">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-3 font-semibold text-gray-700">Image</th>
                            <th className="px-4 py-3 font-semibold text-gray-700">Name</th>
                            <th className="px-4 py-3 font-semibold text-gray-700">Email</th>
                            <th className="px-4 py-3 font-semibold text-gray-700">Role</th>
                            <th className="px-4 py-3 font-semibold text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {users.map((user: any) => (
                            <tr key={user._id} className="hover:bg-gray-50 transition">
                              <td className="px-4 py-2">
                                {Array.isArray(user.image) && user.image.length > 0 ? (
                                  <img src={user.image[0]} alt={user.firstName} className="w-12 h-12 object-cover rounded border border-gray-200" />
                                ) : user.image ? (
                                  <img src={user.image} alt={user.firstName} className="w-12 h-12 object-cover rounded border border-gray-200" />
                                ) : (
                                  <img src="/lindo.png" alt="No image" className="w-12 h-12 object-cover rounded border border-gray-200 opacity-60" />
                                )}
                              </td>
                              <td className="px-4 py-2 font-medium text-blue-900">{user.firstName} {user.lastName}</td>
                              <td className="px-4 py-2 text-blue-600">{user.email}</td>
                              <td className="px-4 py-2 text-purple-700">{user.role}</td>
                              <td className="px-4 py-2 flex gap-2">
                                <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-semibold transition" onClick={() => { setUserEditId(user._id); setUserForm(user); setUserFormOpen(true); }}>Edit</button>
                                <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-semibold transition" onClick={() => handleUserDelete(user)}>Delete</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {/* User Form Modal */}
                  {userFormOpen && (
                    <>
                      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity animate-fade-in" onClick={() => { setUserFormOpen(false); setUserEditId(null); setUserForm({}); }} />
                      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-6 max-w-sm w-full flex flex-col gap-4 border border-blue-200 animate-modal-pop overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <button className="absolute top-3 right-3 text-blue-400 hover:text-blue-700 text-xl" onClick={() => { setUserFormOpen(false); setUserEditId(null); setUserForm({}); }} aria-label="Close">×</button>
                        <h3 className="text-xl font-bold mb-2 text-blue-700">{userEditId ? 'Edit' : 'Add'} User</h3>
                        <form onSubmit={handleUserFormSubmit} className="flex flex-col gap-4">
                          <div className="relative">
                            <input type="text" name="firstName" placeholder=" " value={userForm.firstName || ''} onChange={handleUserFormChange} className="peer border border-blue-200 rounded px-3 py-2 w-full text-sm bg-white text-blue-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-300" required />
                            <label className="absolute left-3 top-4 pointer-events-none transition-all duration-200 bg-white px-1 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-2 peer-focus:text-xs">First Name</label>
                          </div>
                          <div className="relative">
                            <input type="text" name="lastName" placeholder=" " value={userForm.lastName || ''} onChange={handleUserFormChange} className="peer border border-blue-200 rounded px-3 py-2 w-full text-sm bg-white text-blue-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-300" required />
                            <label className="absolute left-3 top-4 pointer-events-none transition-all duration-200 bg-white px-1 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-2 peer-focus:text-xs">Last Name</label>
                          </div>
                          <div className="relative">
                            <input type="email" name="email" placeholder=" " value={userForm.email || ''} onChange={handleUserFormChange} className="peer border border-blue-200 rounded px-3 py-2 w-full text-sm bg-white text-blue-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-300" required />
                            <label className="absolute left-3 top-4 pointer-events-none transition-all duration-200 bg-white px-1 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-2 peer-focus:text-xs">Email</label>
                          </div>
                          <div className="relative">
                            <input type="password" name="password" placeholder=" " value={userForm.password || ''} onChange={handleUserFormChange} className="peer border border-blue-200 rounded px-3 py-2 w-full text-sm bg-white text-blue-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-300" required={!userEditId} />
                            <label className="absolute left-3 top-4 pointer-events-none transition-all duration-200 bg-white px-1 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:-top-2 peer-focus:text-xs">Password{userEditId ? ' (leave blank to keep unchanged)' : ''}</label>
                          </div>
                          <div className="relative">
                            <select name="gender" placeholder=" " value={userForm.gender || ''} onChange={handleUserFormChange} className="peer border border-blue-200 rounded px-3 py-2 w-full text-sm bg-white text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-300" required>
                              <option value="" disabled>Select Gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <div className="relative">
                            <select name="role" placeholder=" " value={userForm.role || 'user'} onChange={handleUserFormChange} className="peer border border-blue-200 rounded px-3 py-2 w-full text-sm bg-white text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-300" required>
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                              <option value="vendor">Vendor</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-2">
                            <label htmlFor="user-image" className="flex items-center gap-2 cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg font-medium w-fit">
                              <Upload size={18} /> Upload Image
                            </label>
                            <input id="user-image" name="image" type="file" accept="image/*" className="hidden" onChange={handleUserImageChange} />
                            {userForm.image && typeof userForm.image === 'object' && userForm.image instanceof File && (
                              <img src={URL.createObjectURL(userForm.image)} alt="Preview" className="mt-2 rounded shadow w-24 h-24 object-cover" />
                            )}
                            {userForm.image && typeof userForm.image === 'string' && (
                              <img src={userForm.image} alt="Preview" className="mt-2 rounded shadow w-24 h-24 object-cover" />
                            )}
                          </div>
                          {userFormError && <div className="text-red-500 text-sm text-center">{userFormError}</div>}
                          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold text-sm" disabled={userFormLoading}>{userFormLoading ? (userEditId ? 'Updating...' : 'Creating...') : (userEditId ? 'Update User' : 'Create User')}</button>
                        </form>
                      </div>
                    </>
                  )}
                </section>
              )}
              {activeSection === 'icons' && (
                <section className="bg-white/80 backdrop-blur rounded-2xl shadow-md p-8 border border-green-50">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Icons</h2>
                    <button className="bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2 rounded-lg shadow transition text-sm flex items-center gap-2" onClick={() => setShowIconForm(true)}>Add Icon</button>
                  </div>
                  {iconsLoading ? (
                    <div className="col-span-4 text-center text-gray-500 py-8">Loading icons...</div>
                  ) : iconsError ? (
                    <div className="col-span-4 text-center text-red-500 py-8">{iconsError}</div>
                  ) : icons.length === 0 ? (
                    <div className="col-span-4 text-center text-gray-500 py-8">No icons found.</div>
                  ) : (
                    <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                      {icons.map((icon, idx) => {
                        let image = '';
                        if (Array.isArray(icon.image) && icon.image.length > 0) image = icon.image[0];
                        else if (typeof icon.image === 'string') image = icon.image;
                        const cat = categories.find(c => c._id === icon.categoryId);
                        return (
                          <div key={icon._id || idx} className="bg-white rounded-2xl shadow p-4 flex flex-col items-center border border-green-100">
                            {image ? (
                              <img src={image} alt={icon.title} className="w-16 h-16 object-cover rounded-full mb-2 border border-green-200" />
                            ) : (
                              <div className="w-16 h-16 flex items-center justify-center bg-gray-100 text-gray-400 text-3xl rounded-full mb-2">🖼️</div>
                            )}
                            <div className="font-bold text-green-900 text-base mb-1 text-center">{icon.title}</div>
                            <div className="text-xs text-green-700 text-center">{cat && typeof cat.name === 'string' ? cat.name : String(icon.categoryId)}</div>
                            <div className="flex gap-2 mt-2">
                              <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs font-semibold transition" onClick={() => handleIconEdit(icon)}>Edit</button>
                              <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs font-semibold transition" onClick={() => handleIconDelete(icon)}>Delete</button>
                            </div>
                          </div>
                        );
                      })}
                    </section>
                  )}
                  {/* Edit Icon Modal */}
                  {iconEditId && (
                    <>
                      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity animate-fade-in" onClick={cancelIconEdit} />
                      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-6 max-w-sm w-full flex flex-col gap-4 border border-green-200 animate-modal-pop overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <button className="absolute top-3 right-3 text-green-400 hover:text-green-700 text-xl" onClick={cancelIconEdit} aria-label="Close">×</button>
                        <h3 className="text-xl font-bold mb-2 text-green-700">Edit Icon</h3>
                        <form onSubmit={handleIconEditFormSubmit} className="flex flex-col gap-2">
                          <div className="flex flex-col gap-1 mb-2">
                            <label htmlFor="icon-title" className="text-green-900 text-sm font-medium mb-1">Title</label>
                            <input
                              type="text"
                              name="title"
                              id="icon-title"
                              value={iconEditForm.title}
                              onChange={handleIconEditFormChange}
                              className="border border-green-200 rounded px-3 py-2 w-full text-sm bg-white text-green-900 focus:outline-none focus:ring-2 focus:ring-green-300"
                              required
                            />
                          </div>
                          <div className="flex flex-col gap-1 mb-2">
                            <label htmlFor="icon-category" className="text-green-900 text-sm font-medium mb-1">Category</label>
                            <select
                              name="categoryId"
                              id="icon-category"
                              value={iconEditForm.categoryId}
                              onChange={handleIconEditFormChange}
                              className="border border-green-200 rounded px-3 py-2 w-full text-sm bg-white text-green-900 focus:outline-none focus:ring-2 focus:ring-green-300"
                              required
                            >
                              <option value="" disabled>Select category</option>
                              {categories.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex flex-col gap-1 mb-2">
                            <label htmlFor="icon-image" className="text-green-900 text-sm font-medium mb-1">Image</label>
                            <input
                              type="file"
                              name="image"
                              id="icon-image"
                              accept="image/*"
                              onChange={handleIconEditFormChange}
                              className="border border-green-200 rounded px-3 py-2 w-full text-sm bg-white text-green-900 focus:outline-none focus:ring-2 focus:ring-green-300"
                            />
                            {iconEditForm.image && typeof iconEditForm.image === 'string' && (
                              <img src={iconEditForm.image} alt="Preview" className="mt-2 rounded shadow w-24 h-24 object-cover" />
                            )}
                            {iconEditForm.image && iconEditForm.image instanceof File && (
                              <img src={URL.createObjectURL(iconEditForm.image)} alt="Preview" className="mt-2 rounded shadow w-24 h-24 object-cover" />
                            )}
                          </div>
                          {iconEditMsg && <div className="text-red-500 text-sm text-center">{iconEditMsg}</div>}
                          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition font-semibold text-sm" disabled={iconEditLoading}>{iconEditLoading ? 'Updating...' : 'Update Icon'}</button>
                        </form>
                      </div>
                    </>
                  )}
                  {/* Delete Icon Modal */}
                  {iconToDelete && (
                    <>
                      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity animate-fade-in" />
                      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-6 max-w-sm w-full flex flex-col gap-4 border border-red-200 animate-modal-pop">
                        <h3 className="text-xl font-bold mb-2 text-red-700">Delete Icon</h3>
                        <div className="text-gray-700 mb-4">Are you sure you want to delete <span className="font-bold">{iconToDelete.title}</span>?</div>
                        {iconDeleteError && <div className="text-red-500 text-sm text-center">{iconDeleteError}</div>}
                        <div className="flex gap-4 justify-end">
                          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition font-semibold text-sm" onClick={cancelIconDelete} disabled={iconDeleteLoading}>Cancel</button>
                          <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition font-semibold text-sm" onClick={confirmIconDelete} disabled={iconDeleteLoading}>{iconDeleteLoading ? 'Deleting...' : 'Delete'}</button>
                        </div>
                      </div>
                    </>
                  )}
                </section>
              )}
            </div>
          </main>
        </div>
      </div>
      {userToDelete && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity animate-fade-in" />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-6 max-w-sm w-full flex flex-col gap-4 border border-red-200 animate-modal-pop">
            <h3 className="text-xl font-bold mb-2 text-red-700">Delete User</h3>
            <div className="text-gray-700 mb-4">Are you sure you want to delete <span className="font-bold">{userToDelete.firstName} {userToDelete.lastName}</span>?</div>
            {userDeleteError && <div className="text-red-500 text-sm text-center">{userDeleteError}</div>}
            <div className="flex gap-4 justify-end">
              <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition font-semibold text-sm" onClick={cancelUserDelete} disabled={userDeleteLoading}>Cancel</button>
              <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition font-semibold text-sm" onClick={confirmUserDelete} disabled={userDeleteLoading}>{userDeleteLoading ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </>
      )}
      {catToDelete && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity animate-fade-in" onClick={cancelCatDelete} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-6 max-w-sm w-full flex flex-col gap-4 border border-red-200 animate-modal-pop" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-2 text-red-700">Delete Category</h3>
            <div className="text-gray-700 mb-4">Are you sure you want to delete <span className="font-bold">{catToDelete.name}</span>?</div>
            {catDeleteError && <div className="text-red-500 text-sm text-center">{catDeleteError}</div>}
            <div className="flex gap-4 justify-end">
              <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition font-semibold text-sm" onClick={cancelCatDelete} disabled={catDeleteLoading}>Cancel</button>
              <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition font-semibold text-sm" onClick={confirmCatDelete} disabled={catDeleteLoading}>{catDeleteLoading ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </>
      )}
      {prodToDelete && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity animate-fade-in" onClick={cancelProdDelete} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-6 max-w-sm w-full flex flex-col gap-4 border border-red-200 animate-modal-pop" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-2 text-red-700">Delete Product</h3>
            <div className="text-gray-700 mb-4">Are you sure you want to delete <span className="font-bold">{prodToDelete.name}</span>?</div>
            {prodDeleteError && <div className="text-red-500 text-sm text-center">{prodDeleteError}</div>}
            <div className="flex gap-4 justify-end">
              <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition font-semibold text-sm" onClick={cancelProdDelete} disabled={prodDeleteLoading}>Cancel</button>
              <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition font-semibold text-sm" onClick={confirmProdDelete} disabled={prodDeleteLoading}>{prodDeleteLoading ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </>
      )}
      {bannerToDelete && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity animate-fade-in" onClick={cancelBannerDelete} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-6 max-w-sm w-full flex flex-col gap-4 border border-red-200 animate-modal-pop" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-2 text-red-700">Delete Banner</h3>
            <div className="text-gray-700 mb-4">Are you sure you want to delete <span className="font-bold">{bannerToDelete.title}</span>?</div>
            {bannerDeleteError && <div className="text-red-500 text-sm text-center">{bannerDeleteError}</div>}
            <div className="flex gap-4 justify-end">
              <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition font-semibold text-sm" onClick={cancelBannerDelete} disabled={bannerDeleteLoading}>Cancel</button>
              <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition font-semibold text-sm" onClick={confirmBannerDelete} disabled={bannerDeleteLoading}>{bannerDeleteLoading ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </>
      )}
      {showIconForm && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col items-center relative border border-green-200">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowIconForm(false)}>&times;</button>
            <form onSubmit={handleIconFormSubmit} className="space-y-4 w-full">
              <h2 className="text-xl font-bold mb-2 text-green-700">Add Icon</h2>
              {iconFormMsg && <div className="mb-2 text-red-600 font-semibold">{iconFormMsg}</div>}
              <div>
                <label className="block mb-1 font-medium text-green-900">Title</label>
                <input type="text" name="title" value={iconForm.title} onChange={handleIconFormChange} className="w-full border px-2 py-1 rounded text-green-900" required />
              </div>
              <div>
                <label className="block mb-1 font-medium text-green-900">Category</label>
                <select name="categoryId" value={iconForm.categoryId} onChange={handleIconFormChange} className="w-full border px-2 py-1 rounded text-green-900" required>
                  <option value="" disabled>Select a category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium text-green-900">Image</label>
                <input type="file" name="image" accept="image/*" onChange={handleIconFormChange} className="w-full" required />
              </div>
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded" disabled={iconFormLoading}>{iconFormLoading ? 'Uploading...' : 'Upload Icon'}</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

const handleIconEdit = (icon: any) => {
  if (!icon) return;
  setIconEditId(icon._id);
  setIconEditForm({
    title: icon.title || '',
    categoryId: icon.categoryId || '',
    image: Array.isArray(icon.image) ? icon.image[0] : icon.image || null,
  });
  setIconEditMsg('');
};

const handleIconDelete = (icon: any) => {
  if (!icon) return;
  setIconToDelete(icon);
  setIconDeleteError('');
};

// Add this inside AdminDashboard, after handleIconFormSubmit
const handleIconEditFormSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIconEditLoading(true);
  setIconEditMsg('');
  try {
    if (!iconEditId) throw new Error('No icon selected for editing.');
    const formData = new FormData();
    formData.append('title', iconEditForm.title);
    formData.append('categoryId', iconEditForm.categoryId);
    if (iconEditForm.image instanceof File) {
      formData.append('image', iconEditForm.image);
    }
    const res = await fetch(`https://lindo-project.onrender.com/icons/updateIcon/${iconEditId}`, {
      method: 'PUT',
      body: formData,
    });
    if (!res.ok) {
      let msg = 'Failed to update icon';
      try { msg = (await res.json()).message || msg; } catch {}
      throw new Error(msg);
    }
    setIconEditId(null);
    setIconEditForm({ title: '', categoryId: '', image: null });
    setShowIconForm(false);
    fetchIcons();
  } catch (err: any) {
    setIconEditMsg(err.message || 'Error updating icon');
  } finally {
    setIconEditLoading(false);
  }
};
