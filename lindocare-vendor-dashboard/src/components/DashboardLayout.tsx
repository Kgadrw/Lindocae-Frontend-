import React from 'react';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-row">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col py-6 px-4">
        <div className="mb-8 flex items-center gap-2">
          <div className="text-2xl font-bold text-black">Skillset</div>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          {/* Placeholder nav items */}
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-100">
            <span className="w-5 h-5 bg-gray-200 rounded" /> Dashboard
          </button>
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-100">
            <span className="w-5 h-5 bg-gray-200 rounded" /> Mentors
          </button>
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-100">
            <span className="w-5 h-5 bg-gray-200 rounded" /> Students
          </button>
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-100">
            <span className="w-5 h-5 bg-gray-200 rounded" /> Analytics
          </button>
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-100">
            <span className="w-5 h-5 bg-gray-200 rounded" /> Courses
          </button>
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-100">
            <span className="w-5 h-5 bg-gray-200 rounded" /> Forum
          </button>
        </nav>
        <div className="mt-auto flex flex-col gap-2">
          <button className="bg-gray-900 text-white rounded-lg py-2 font-semibold shadow hover:bg-gray-800">Upgrade</button>
          <button className="flex items-center gap-2 text-gray-500 text-sm mt-4 hover:underline">Log out</button>
        </div>
      </aside>
      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="flex items-center justify-between px-8 py-4 bg-gray-50 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex items-center gap-4">
            <input type="text" placeholder="Search..." className="rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-300" />
            <div className="w-10 h-10 rounded-full bg-gray-300" />
          </div>
        </header>
        {/* Main content */}
        <main className="flex-1 p-6 md:p-10 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 