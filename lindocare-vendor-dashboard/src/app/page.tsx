'use client';

import { useState, useEffect } from 'react';
import { List, Box, ShoppingCart, Megaphone, Receipt, Image as ImageIcon, Menu, X, PanelLeftClose, PanelLeft } from 'lucide-react';
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    // Check screen size for mobile responsiveness
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
        setMobileMenuOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

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

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex">
      {/* Mobile Overlay */}
      {isMobile && mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 z-40 md:hidden backdrop-blur-sm"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        SIDEBAR_SECTIONS={SIDEBAR_SECTIONS}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        handleLogout={handleLogout}
        user={user}
        collapsed={sidebarCollapsed}
        isMobile={isMobile}
        mobileOpen={mobileMenuOpen}
        onClose={closeMobileMenu}
      />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${
        isMobile 
          ? 'ml-0' 
          : sidebarCollapsed 
            ? 'ml-20' 
            : 'ml-72'
      }`}>
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200 sticky top-0 z-30">
          <div className="px-4 md:px-8 py-4 md:py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebar}
                className="p-2.5 rounded-xl hover:bg-slate-100 transition-all duration-200 group"
                aria-label={isMobile ? 'Toggle menu' : (sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar')}
              >
                {isMobile ? (
                  mobileMenuOpen ? <X size={22} className="text-slate-600" /> : <Menu size={22} className="text-slate-600" />
                ) : (
                  sidebarCollapsed ? <PanelLeft size={22} className="text-slate-600 group-hover:text-blue-600" /> : <PanelLeftClose size={22} className="text-slate-600 group-hover:text-blue-600" />
                )}
              </button>
              
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-slate-800">
                  {SIDEBAR_SECTIONS.find(s => s.key === activeSection)?.label || 'Dashboard'}
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">Welcome back, {user?.firstName || 'Admin'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-sm text-slate-600">
                  <span className="font-medium text-slate-800">{user ? `${user.firstName || 'User'} ${user.lastName || ''}` : 'Admin'}</span>
                  <div className="text-xs text-slate-500 mt-0.5">{user?.role || 'Vendor'}</div>
                </div>
                {user?.image && user.image.length > 0 ? (
                  <img
                    src={user.image[0]}
                    alt="User"
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md border-2 border-white">
                    <span className="text-white text-sm font-bold">
                      {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>

              {/* Mobile avatar only */}
              <div className="lg:hidden">
                {user?.image && user.image.length > 0 ? (
                  <img
                    src={user.image[0]}
                    alt="User"
                    className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-md"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md border-2 border-white">
                    <span className="text-white text-sm font-bold">
                      {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <main className={`p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 transition-all duration-300 ${
          isMobile ? '' : sidebarCollapsed ? 'lg:px-8' : 'lg:px-8'
        }`}>
          <div className="max-w-full">
            {activeSection === 'stats' && <StatsCards />}
            {activeSection === 'categories' && <CategoriesSection />}
            {activeSection === 'ads' && <AdList />}
            {activeSection === 'banner' && <BannerSection />}
            {activeSection === 'products' && <ProductsSection />}
            {activeSection === 'orders' && <OrdersComponent />}
          </div>
        </main>
      </div>
    </div>
  );
}
