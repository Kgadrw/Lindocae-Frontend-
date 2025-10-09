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
      fixed top-0 left-0 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl flex flex-col z-50 border-r border-slate-700/50 select-none transition-all duration-300
      ${isMobile 
        ? `w-72 transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`
        : collapsed 
          ? 'w-20' 
          : 'w-72'
      }
    `}>
      {/* Logo & Brand Section */}
      <div className={`flex items-center ${collapsed ? 'justify-center px-3' : 'px-6'} py-6 border-b border-slate-700/50`}>
        {collapsed ? (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Store className="text-white" size={20} />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Image
              src="/lindo.png"
              alt="Lindo"
              width={120}
              height={48}
              className="brightness-0 invert"
              style={{ width: 'auto', height: 'auto' }}
            />
          </div>
        )}
      </div>

      {/* User Profile Section */}
      <div className={`flex items-center ${collapsed ? 'justify-center px-2' : 'flex-col px-6'} py-6 border-b border-slate-700/50`}>
        <div className="relative">
          {user?.image && user.image.length > 0 ? (
            <img
              src={normalizeImageUrl(user.image[0])}
              alt="User"
              className={`rounded-full object-cover border-3 border-blue-500 shadow-lg ${
                collapsed ? 'w-12 h-12' : 'w-16 h-16'
              }`}
            />
          ) : (
            <div className={`rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl border-3 border-blue-400/30 ${
              collapsed ? 'w-12 h-12' : 'w-16 h-16'
            }`}>
              <User className={`text-white ${collapsed ? 'h-6 w-6' : 'h-8 w-8'}`} />
            </div>
          )}
          {!collapsed && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-slate-900 rounded-full"></div>
          )}
        </div>
        {!collapsed && (
          <div className="mt-4 text-center w-full">
            <div className="text-base text-white font-semibold truncate px-2">
              {user ? `${user.firstName || 'User'} ${user.lastName || ''}` : 'Admin'}
            </div>
            <div className="text-xs text-slate-400 truncate px-2 mt-1">
              {user?.email || 'admin@lindo.com'}
            </div>
            <div className="mt-3 px-3 py-1.5 bg-blue-500/20 text-blue-300 text-xs font-medium rounded-full inline-block">
              Vendor Account
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 overflow-y-auto">
        {!collapsed && (
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-3">
            Menu
          </div>
        )}
        <div className="flex flex-col gap-2">
          {SIDEBAR_SECTIONS.map(sec => (
            <button
              key={sec.key}
              className={`
                group flex items-center text-left rounded-xl font-medium transition-all duration-200 relative overflow-hidden
                ${collapsed ? 'justify-center px-3 py-4' : 'px-4 py-3.5'}
                ${activeSection === sec.key 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30' 
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }
              `}
              onClick={() => handleSectionClick(sec.key)}
              title={collapsed ? sec.label : undefined}
            >
              {activeSection === sec.key && !collapsed && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
              )}
              <span className={`
                flex items-center justify-center rounded-lg transition-all duration-200
                ${collapsed ? 'w-9 h-9' : 'w-9 h-9 mr-3'}
                ${activeSection === sec.key 
                  ? 'bg-white/20 text-white scale-110' 
                  : 'bg-slate-700/40 text-slate-300 group-hover:bg-slate-700 group-hover:text-white group-hover:scale-105'
                }
              `}>
                {sec.icon()}
              </span>
              {!collapsed && (
                <span className="truncate text-sm font-medium">{sec.label}</span>
              )}
              {activeSection === sec.key && !collapsed && (
                <div className="ml-auto">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="px-3 py-4 border-t border-slate-700/50">
        <button
          onClick={handleLogout}
          className={`
            flex items-center rounded-xl font-medium text-slate-300 hover:bg-red-500/20 hover:text-red-300 transition-all border border-transparent hover:border-red-500/30 w-full group
            ${collapsed ? 'justify-center px-3 py-4' : 'px-4 py-3.5'}
          `}
          title={collapsed ? 'Logout' : undefined}
        >
          <div className={`
            flex items-center justify-center rounded-lg transition-all
            ${collapsed ? 'w-9 h-9' : 'w-9 h-9 mr-3'}
            bg-slate-700/40 group-hover:bg-red-500/20 group-hover:scale-105
          `}>
            <LogOut size={18} />
          </div>
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="px-6 py-3 text-xs text-slate-500 text-center border-t border-slate-700/50">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium">Vendor Dashboard v2.0</span>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar; 