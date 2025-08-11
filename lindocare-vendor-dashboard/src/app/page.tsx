'use client';

import { useState, useEffect } from 'react';
import { List, Box, ShoppingCart, Megaphone, Receipt, Image as ImageIcon } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import StatsCards from '../components/StatsCards/Component';
import CategoriesSection from '../components/CategoriesSection/Component';
import AdList from '../components/AdList/Component';
import BannerSection from '../components/BannerSection';
import ProductsSection from '../components/ProductsSection/Component';
import OrdersComponent from '../components/Orders/Component';
import LoginForm from '../components/LoginForm';

interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role?: string;
  createdAt: string;
  updatedAt: string;
  tokens?: {
    accessToken: string;
  };
}

const SIDEBAR_SECTIONS = [
  { key: 'stats', label: 'Stats', icon: () => <Box size={20} /> },
  { key: 'categories', label: 'Categories', icon: () => <List size={20} /> },
  { key: 'ads', label: 'Ads', icon: () => <Megaphone size={20} /> },
  { key: 'banner', label: 'Banner', icon: () => <ImageIcon size={20} /> },
  { key: 'products', label: 'Products', icon: () => <ShoppingCart size={20} /> },
  { key: 'orders', label: 'Orders', icon: () => <Receipt size={20} /> },
];

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('stats');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (userData: User) => {
    if (userData.role === 'vendor') {
      setUser(userData);
      setIsAuthenticated(true);
      // Store unified auth state so child components (which read `userData`) work
      try {
        localStorage.setItem('userData', JSON.stringify({ user: userData }));
        if (userData.email) localStorage.setItem('userEmail', userData.email);
      } catch {}
      // Backwards compatibility with any older keys
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('accessToken', userData.tokens?.accessToken || '');
      console.log('Vendor logged in successfully:', userData.firstName, userData.lastName);
    } else {
      alert('Access denied. Only vendors can access this dashboard.');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userData');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userData');
    alert('Logged out successfully!');
  };

  useEffect(() => {
    // Preferred: use unified `userData`
    const unified = localStorage.getItem('userData');
    if (unified) {
      try {
        const parsed = JSON.parse(unified);
        const u: User | undefined = parsed?.user;
        if (u && u.role === 'vendor') {
          setIsAuthenticated(true);
          setUser(u);
          return;
        }
      } catch (e) {
        console.error('Error parsing userData:', e);
      }
      // If invalid or not vendor, clear it
      localStorage.removeItem('userData');
    }

    // Fallback to older keys if present
    const auth = localStorage.getItem('isAuthenticated');
    const legacyUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');
    if (auth === 'true' && legacyUser && accessToken) {
      try {
        const parsedUser = JSON.parse(legacyUser);
        if (parsedUser.role === 'vendor') {
          setIsAuthenticated(true);
          setUser(parsedUser);
        } else {
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
        }
      } catch (error) {
        console.error('Error parsing legacy user data:', error);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
      }
    }
  }, []);

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        SIDEBAR_SECTIONS={SIDEBAR_SECTIONS}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        handleLogout={handleLogout}
        user={user}
      />
      <main className="ml-64 p-4 md:p-8 space-y-8">
        {activeSection === 'stats' && <StatsCards />}
        {activeSection === 'categories' && <CategoriesSection />}
        {activeSection === 'ads' && <AdList />}
        {activeSection === 'banner' && <BannerSection />}
        {activeSection === 'products' && <ProductsSection />}
        {activeSection === 'orders' && <OrdersComponent />}
      </main>
    </div>
  );
}
