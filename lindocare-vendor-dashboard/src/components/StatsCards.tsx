import React from 'react';

interface StatsCardsProps {
  categoriesCount: number;
  productsCount: number;
  ordersCount: number;
  bannersCount: number;
  usersCount: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({ categoriesCount, productsCount, ordersCount, bannersCount, usersCount }) => (
  <div className="w-full overflow-x-auto">
    <div className="flex flex-row gap-6 mb-8 min-w-[700px]">
      <div className="rounded-2xl shadow bg-white/80 backdrop-blur p-6 flex flex-col items-start border border-blue-100 min-w-[180px]">
        <div className="text-lg font-semibold text-blue-700">Categories</div>
        <div className="text-3xl font-bold mt-2 text-blue-900">{categoriesCount}</div>
      </div>
      <div className="rounded-2xl shadow bg-white/80 backdrop-blur p-6 flex flex-col items-start border border-purple-100 min-w-[180px]">
        <div className="text-lg font-semibold text-purple-700">Products</div>
        <div className="text-3xl font-bold mt-2 text-purple-900">{productsCount}</div>
      </div>
      <div className="rounded-2xl shadow bg-white/80 backdrop-blur p-6 flex flex-col items-start border border-green-100 min-w-[180px]">
        <div className="text-lg font-semibold text-green-700">Orders</div>
        <div className="text-3xl font-bold mt-2 text-green-900">{ordersCount}</div>
      </div>
      <div className="rounded-2xl shadow bg-white/80 backdrop-blur p-6 flex flex-col items-start border border-orange-100 min-w-[180px]">
        <div className="text-lg font-semibold text-orange-700">Banners</div>
        <div className="text-3xl font-bold mt-2 text-orange-900">{bannersCount}</div>
      </div>
      <div className="rounded-2xl shadow bg-white/80 backdrop-blur p-6 flex flex-col items-start border border-pink-100 min-w-[180px]">
        <div className="text-lg font-semibold text-pink-700">Users</div>
        <div className="text-3xl font-bold mt-2 text-pink-900">{usersCount}</div>
      </div>
    </div>
  </div>
);

export default StatsCards; 