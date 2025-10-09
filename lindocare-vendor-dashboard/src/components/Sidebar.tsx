import React from 'react';
import { LogOut, User, ChevronLeft, ChevronRight, Store } from 'lucide-react';
import Image from 'next/image';

interface SidebarSection {
  key: string;
  label: string;
  icon: () => React.ReactNode;
}

interface User {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role?: string;
  createdAt: string;
  updatedAt: string;
  image?: string[];
  tokens?: {
    accessToken: string;
  };
}

interface SidebarProps {
  activeSection: string;
  setActiveSection: (key: string) => void;
  handleLogout: () => void;
  SIDEBAR_SECTIONS: SidebarSection[];
  user?: User | null;
  collapsed?: boolean;
  isMobile?: boolean;
  mobileOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeSection, 
  setActiveSection, 
  handleLogout, 
  SIDEBAR_SECTIONS, 
  user,
  collapsed = false,
  isMobile = false,
  mobileOpen = false,
  onClose
}) => {
  const handleSectionClick = (key: string) => {
    setActiveSection(key);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const normalizeImageUrl = (src?: string) =>
    !src ? '' : src.startsWith('http') ? src : `https://lindo-project.onrender.com/${src}`;

  return (
    <aside className={`
      fixed top-0 left-0 h-full bg-white shadow-sm flex flex-col z-50 border-r border-gray-100 select-none transition-all duration-300
      ${isMobile 
        ? `w-64 transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`
        : collapsed 
          ? 'w-20' 
          : 'w-64'
      }
    `}>
      {/* User Profile Section */}
      <div className={`flex items-center ${collapsed ? 'justify-center px-3' : 'px-5'} py-6 border-b border-gray-100`}>
        {collapsed ? (
          <div className="relative">
            {user?.image && user.image.length > 0 ? (
              <img
                src={normalizeImageUrl(user.image[0])}
                alt="User"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="text-gray-600" size={20} />
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 w-full">
            <div className="relative">
              {user?.image && user.image.length > 0 ? (
                <img
                  src={normalizeImageUrl(user.image[0])}
                  alt="User"
                  className="w-11 h-11 rounded-full object-cover"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="text-gray-600" size={22} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">
                {user ? `${user.firstName || 'User'} ${user.lastName || ''}` : 'Admin'}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {user?.role || 'Vendor'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="flex flex-col gap-1">
          {SIDEBAR_SECTIONS.map(sec => (
            <button
              key={sec.key}
              className={`
                group flex items-center text-left rounded-lg transition-all duration-200
                ${collapsed ? 'justify-center p-3' : 'px-3 py-2.5'}
                ${activeSection === sec.key 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'
                }
              `}
              onClick={() => handleSectionClick(sec.key)}
              title={collapsed ? sec.label : undefined}
            >
              <span className={`
                flex items-center justify-center transition-colors
                ${collapsed ? '' : 'mr-3'}
              `}>
                {sec.icon()}
              </span>
              {!collapsed && (
                <span className="truncate text-sm font-medium">{sec.label}</span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="px-3 py-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className={`
            flex items-center rounded-lg font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all w-full
            ${collapsed ? 'justify-center p-3' : 'px-3 py-2.5'}
          `}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} className={collapsed ? '' : 'mr-3'} />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar; 