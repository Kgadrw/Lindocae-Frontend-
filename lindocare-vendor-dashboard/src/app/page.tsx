'use client';

import { useState, useEffect } from 'react';
import { List, Box, ShoppingCart, Megaphone, Receipt, Image as ImageIcon } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import StatsCards from '../components/StatsCards/Component';
import CategoriesSection from '../components/CategoriesSection/Component';
import AdList from '../components/AdList/Component';
import BannerSection from '../components/BannerSection';
import ProductsSection from '../components/ProductsSection/Component';
import CartComponent from '../components/Cart/Component';
import OrdersComponent from '../components/Orders/Component';
import LoginForm from '../components/LoginForm';

const SIDEBAR_SECTIONS = [
  { key: 'stats', label: 'Stats', icon: () => <Box size={20} /> },
  { key: 'categories', label: 'Categories', icon: () => <List size={20} /> },
  { key: 'ads', label: 'Ads', icon: () => <Megaphone size={20} /> },
  { key: 'banner', label: 'Banner', icon: () => <ImageIcon size={20} /> },
  { key: 'products', label: 'Products', icon: () => <ShoppingCart size={20} /> },
  { key: 'orders', label: 'Orders', icon: () => <Receipt size={20} /> },
  { key: 'cart', label: 'Cart', icon: () => <ShoppingCart size={20} /> },
];

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('stats');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);

  const handleLogin = (email: string, password: string) => {
    // Simple authentication logic - in real app, this would be an API call
    if (email === 'admin@lindo.com' && password === 'admin123') {
      setUser({ email, name: 'Admin User' });
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify({ email, name: 'Admin User' }));
    } else {
      alert('Invalid credentials. Please use the demo credentials provided.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    alert('Logged out successfully!');
  };

  // Check for existing authentication on component mount
  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    const userData = localStorage.getItem('user');
    if (auth === 'true' && userData) {
        setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  // Show dashboard if authenticated
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
        {activeSection === 'cart' && <CartComponent />}
        {activeSection === 'orders' && <OrdersComponent />}
          </main>
        </div>
  );
}
