'use client';

import { useState } from 'react';
import { List, Box, ShoppingCart, Megaphone } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import StatsCards from '../components/StatsCards';
import CategoriesSection from '../components/CategoriesSection';
import AdList from '../components/AdList';

const SIDEBAR_SECTIONS = [
  { key: 'stats', label: 'Stats', icon: () => <Box size={20} /> },
  { key: 'categories', label: 'Categories', icon: () => <List size={20} /> },
  { key: 'ads', label: 'Ads', icon: () => <Megaphone size={20} /> },
  { key: 'products', label: 'Products', icon: () => <ShoppingCart size={20} /> },
];

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('stats');
  const handleLogout = () => {
    // Add logout logic here
    alert('Logged out!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
          <Sidebar
        SIDEBAR_SECTIONS={SIDEBAR_SECTIONS}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            handleLogout={handleLogout}
      />
      <main className="ml-64 p-4 md:p-8 space-y-8">
        {activeSection === 'stats' && <StatsCards />}
        {activeSection === 'categories' && <CategoriesSection />}
        {activeSection === 'ads' && <AdList />}
        {/* Add other main dashboard sections here as needed */}
          </main>
        </div>
  );
}
