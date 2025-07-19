import React from 'react';
import { LogOut, User } from 'lucide-react';

interface SidebarSection {
  key: string;
  label: string;
  icon: () => React.ReactNode;
}

interface SidebarProps {
  activeSection: string;
  setActiveSection: (key: string) => void;
  handleLogout: () => void;
  SIDEBAR_SECTIONS: SidebarSection[];
  user?: { email: string; name: string } | null;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection, handleLogout, SIDEBAR_SECTIONS, user }) => (
  <aside className="fixed top-0 left-0 h-full w-64 bg-white/70 backdrop-blur-lg shadow-lg flex flex-col z-30 border-r border-gray-100 py-8 px-4 select-none">
    <div className="flex flex-col items-center mb-8">
      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
        <User className="h-8 w-8 text-white" />
      </div>
      <div className="mt-2 text-sm text-blue-700 font-semibold">{user?.name || 'Admin'}</div>
      <div className="text-xs text-gray-500">{user?.email || 'admin@lindo.com'}</div>
    </div>
    <nav className="flex flex-col gap-2">
      {SIDEBAR_SECTIONS.map(sec => (
        <button
          key={sec.key}
          className={`group flex items-center text-left px-4 py-2 rounded-xl font-medium text-base transition-all duration-150 relative overflow-hidden ${activeSection === sec.key ? 'bg-blue-100/80 text-blue-700 shadow border-l-4 border-blue-500' : 'text-gray-600 hover:bg-gray-100/70'}`}
          onClick={() => setActiveSection(sec.key)}
        >
          <span className={`mr-4 flex items-center justify-center w-8 h-8 rounded-lg ${activeSection === sec.key ? 'bg-blue-500 text-white shadow' : 'bg-gray-100 text-blue-400 group-hover:bg-blue-100 group-hover:text-blue-500'}`}>{sec.icon()}</span>
          <span className="truncate">{sec.label}</span>
        </button>
      ))}
    </nav>
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 mt-8 px-4 py-2 rounded-xl text-base font-medium text-gray-400 hover:bg-gray-100/70 transition border border-transparent hover:border-gray-200"
    >
      <LogOut size={18} /> Logout
    </button>
    <div className="mt-auto text-xs text-gray-300">Lindocare &copy; 2024</div>
  </aside>
);

export default Sidebar; 