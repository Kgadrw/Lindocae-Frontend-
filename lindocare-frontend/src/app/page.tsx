export default function Home() {
  return (
    <div className="px-4 md:px-8 lg:px-16 py-6 md:py-10 flex flex-col gap-8">
      {/* Hero Section */}
      <section className="w-full mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Main Hero Banner - spans 2 columns on md+ */}
          <div className="md:col-span-2 bg-white rounded-xl shadow p-4 flex items-center justify-center h-64">
            <span className="text-3xl font-bold text-yellow-500">Baby Diapers Banner</span>
          </div>
          {/* Other Hero Images */}
          <div className="bg-white rounded-xl shadow p-4 flex items-center justify-center h-64">Image 2</div>
          <div className="bg-white rounded-xl shadow p-4 flex items-center justify-center h-64">Image 3</div>
        </div>
      </section>
      {/* Category Cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {/* TODO: Add category cards (Go Exploring Together, Snuggle Season, etc.) */}
        <div className="bg-white rounded-lg shadow p-4 h-32 flex items-center justify-center">Category 1</div>
        <div className="bg-white rounded-lg shadow p-4 h-32 flex items-center justify-center">Category 2</div>
        <div className="bg-white rounded-lg shadow p-4 h-32 flex items-center justify-center">Category 3</div>
        <div className="bg-white rounded-lg shadow p-4 h-32 flex items-center justify-center">Category 4</div>
      </section>
      {/* Promo/Info Banners */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* TODO: Add Celebrate Dad and Organic & Eco-Friendly banners */}
        <div className="bg-green-100 rounded-lg p-4 h-32 flex items-center justify-center">Celebrate Dad</div>
        <div className="bg-green-200 rounded-lg p-4 h-32 flex items-center justify-center">Organic & Eco-Friendly</div>
      </section>
      {/* Category Icons Row */}
      <section className="flex flex-wrap gap-4 justify-center mb-4">
        {/* TODO: Add category icons */}
        <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center">Icon 1</div>
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">Icon 2</div>
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">Icon 3</div>
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">Icon 4</div>
      </section>
      {/* Product Grids */}
      <section className="mb-4">
        <h2 className="text-xl font-bold mb-2">New Arrivals</h2>
        {/* TODO: Add product grid for new arrivals */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4 h-40 flex items-center justify-center">Product 1</div>
          <div className="bg-white rounded-lg shadow p-4 h-40 flex items-center justify-center">Product 2</div>
          <div className="bg-white rounded-lg shadow p-4 h-40 flex items-center justify-center">Product 3</div>
          <div className="bg-white rounded-lg shadow p-4 h-40 flex items-center justify-center">Product 4</div>
        </div>
      </section>
      <section className="mb-4">
        <h2 className="text-xl font-bold mb-2">Bestsellers</h2>
        {/* TODO: Add product grid for bestsellers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4 h-40 flex items-center justify-center">Bestseller 1</div>
          <div className="bg-white rounded-lg shadow p-4 h-40 flex items-center justify-center">Bestseller 2</div>
          <div className="bg-white rounded-lg shadow p-4 h-40 flex items-center justify-center">Bestseller 3</div>
          <div className="bg-white rounded-lg shadow p-4 h-40 flex items-center justify-center">Bestseller 4</div>
        </div>
      </section>
    </div>
  );
}
