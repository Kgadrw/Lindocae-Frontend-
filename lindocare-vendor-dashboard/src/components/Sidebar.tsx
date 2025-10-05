import React from 'react';
import { LogOut, User, ChevronLeft, ChevronRight } from 'lucide-react';

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
      fixed top-0 left-0 h-full bg-white/95 backdrop-blur-lg shadow-lg flex flex-col z-50 border-r border-gray-100 select-none transition-all duration-300
      ${isMobile 
        ? `w-80 transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`
        : collapsed 
          ? 'w-16' 
          : 'w-64'
      }
    `}>
      {/* User Profile Section */}
      <div className={`flex items-center ${collapsed ? 'justify-center px-2' : 'flex-col px-4'} py-6 border-b border-gray-100`}>
        <div className="relative">
          {user?.image && user.image.length > 0 ? (
            <img
              src={normalizeImageUrl(user.image[0])}
              alt="User"
              className={`rounded-full object-cover border-2 border-white shadow-lg ${
                collapsed ? 'w-10 h-10' : 'w-16 h-16'
              }`}
            />
          ) : (
            <div className={`rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg ${
              collapsed ? 'w-10 h-10' : 'w-16 h-16'
            }`}>
              <User className={`text-white ${collapsed ? 'h-5 w-5' : 'h-8 w-8'}`} />
            </div>
          )}
        </div>
        {!collapsed && (
          <div className="mt-3 text-center">
            <div className="text-sm text-blue-700 font-semibold">
              {user ? `${user.firstName || 'User'} ${user.lastName || ''}` : 'Admin'}
            </div>
            <div className="text-xs text-gray-500 truncate max-w-[200px]">
              {user?.email || 'admin@lindo.com'}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4">
        <div className="flex flex-col gap-1">
          {SIDEBAR_SECTIONS.map(sec => (
            <button
              key={sec.key}
              className={`
                group flex items-center text-left rounded-xl font-medium transition-all duration-150 relative overflow-hidden
                ${collapsed ? 'justify-center px-3 py-3' : 'px-4 py-3'}
                ${activeSection === sec.key 
                  ? 'bg-blue-100/80 text-blue-700 shadow border-l-4 border-blue-500' 
                  : 'text-gray-600 hover:bg-gray-100/70'
                }
              `}
              onClick={() => handleSectionClick(sec.key)}
              title={collapsed ? sec.label : undefined}
            >
              <span className={`
                flex items-center justify-center rounded-lg transition-colors
                ${collapsed ? 'w-8 h-8' : 'w-8 h-8 mr-3'}
                ${activeSection === sec.key 
                  ? 'bg-blue-500 text-white shadow' 
                  : 'bg-gray-100 text-blue-400 group-hover:bg-blue-100 group-hover:text-blue-500'
                }
              `}>
                {sec.icon()}
              </span>
              {!collapsed && (
                <span className="truncate text-sm">{sec.label}</span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="px-2 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className={`
            flex items-center rounded-xl font-medium text-gray-400 hover:bg-gray-100/70 transition-all border border-transparent hover:border-gray-200 w-full
            ${collapsed ? 'justify-center px-3 py-3' : 'px-4 py-3 gap-2'}
          `}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-2 text-xs text-gray-400 text-center border-t border-gray-100">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Vendor Dashboard</span>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar; 