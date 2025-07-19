import React from 'react';
import { Heart, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

interface Product {
  _id?: string;
  id?: string | number;
  name: string;
  price: number;
  oldPrice?: number;
  image?: string[] | string;
  rating?: number;
  reviews?: number;
  tags?: string[];
}

interface NewArrivalsSectionProps {
  filteredProducts: Product[];
  prodLoading: boolean;
  prodError: string;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  handleAddToCart: (product: Product) => void;
  priceMin: string;
  setPriceMin: (v: string) => void;
  priceMax: string;
  setPriceMax: (v: string) => void;
  sort: string;
  setSort: (v: string) => void;
  sortOptions: { value: string; label: string }[];
  handleClearAll: () => void;
  iconsRow?: ReactNode;
}

const features = [
  { icon: '/icons/reddot.svg', label: 'Red Dot Winner' },
  { icon: '/icons/sustainable.svg', label: 'Global Sustainable Sourcing' },
  { icon: '/icons/medical.svg', label: 'Medical-Grade Manufactured' },
  { icon: '/icons/pediatrician.svg', label: 'Pediatrician Co-developed' },
];

const NewArrivalsSection: React.FC<NewArrivalsSectionProps> = ({
  filteredProducts,
  prodLoading,
  prodError,
  wishlist,
  toggleWishlist,
  handleAddToCart,
  priceMin,
  setPriceMin,
  priceMax,
  setPriceMax,
  sort,
  setSort,
  sortOptions,
  handleClearAll,
  iconsRow,
}) => {
  return (
    <section className="mb-8">
      {/* Section Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl lg:text-5xl font-extrabold text-gray-800 mb-2">Shop The Must Haves</h2>
        <p className="text-gray-600">Discover our latest arrivals and trending products</p>
      </div>
      {iconsRow && <div className="mb-4 flex justify-center">{iconsRow}</div>}
      
      <div className="flex items-center justify-end mb-4">
        <Link
          href="/all-products"
          className="text-black text-sm font-semibold hover:underline focus:outline-none flex items-center gap-1"
          style={{ minWidth: 70 }}
        >
          See more <ChevronRight size={16} />
        </Link>
      </div>
      


      {prodLoading ? (
        <div className="text-center text-gray-500 py-8"></div>
      ) : prodError ? (
        <div className="text-center text-red-500 py-8">{prodError}</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center text-gray-500 py-8"></div>
      ) : (
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {filteredProducts.slice(0, 12).map((prod, idx) => (
              <div key={prod._id || prod.id || idx} className="bg-white rounded-2xl shadow-lg flex-shrink-0 w-64">
                <div className="relative">
                  {prod.image && (Array.isArray(prod.image) ? (
                    <img src={prod.image[0]} alt={prod.name} className="w-full h-48 object-cover rounded-t-2xl" />
                  ) : (
                    <img src={prod.image} alt={prod.name} className="w-full h-48 object-cover rounded-t-2xl" />
                  ))}
                  <button
                    className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition"
                    onClick={() => toggleWishlist(String(prod.id || prod._id))}
                    aria-label="Add to wishlist"
                  >
                    <Heart
                      size={18}
                      color={wishlist.includes(String(prod.id || prod._id)) ? '#F87171' : '#6B7280'}
                      fill={wishlist.includes(String(prod.id || prod._id)) ? '#F87171' : 'none'}
                      strokeWidth={2}
                    />
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-sm ${i < (prod.rating || 5) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                    ))}
                  </div>
                  <div className="text-sm font-semibold text-blue-900 mb-1 line-clamp-2">{prod.name}</div>
                  <div className="text-lg font-bold text-blue-900">From ${prod.price?.toFixed ? prod.price.toFixed(2) : prod.price}</div>
                </div>
              </div>
            ))}
            {/* Arrow indicator for more items */}
            <div className="flex items-center justify-center w-16 flex-shrink-0">
              <ChevronRight size={24} className="text-gray-400" />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default NewArrivalsSection; 

export function RedesignForLoveSection({ banners }: { banners: string[] }) {
  // Animation on scroll (fade/slide in)
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) setVisible(true);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <section
      ref={ref}
      className={`w-full flex flex-col md:flex-row items-center justify-between gap-8 px-4 py-10 md:py-14 max-w-5xl mx-auto rounded-2xl mt-10 bg-[#f8f8f8] shadow-sm transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ minHeight: 220 }}
    >
      <div className="flex-1 flex flex-col items-start justify-center max-w-lg">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Redesign for Love</h2>
        <p className="text-gray-700 text-base md:text-lg mb-4">With a focus on innovation and excellence, we aim to enhance every aspect of motherhood.</p>
        <a href="#" className="text-blue-700 text-sm font-medium underline underline-offset-2 hover:text-blue-900 transition mb-2">Learn More &gt;</a>
      </div>
      <div className="flex-1 flex flex-row items-center justify-center gap-6 md:gap-10 w-full">
        {[0,1,2,3].map(i => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white flex items-center justify-center shadow border border-gray-200 mb-2 overflow-hidden">
              {banners && banners[i] ? (
                <img src={banners[i]} alt={`Feature ${i+1}`} className="w-12 h-12 md:w-16 md:h-16 object-cover" />
              ) : (
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-full" />
              )}
            </div>
            <span className="text-xs md:text-sm text-gray-800 text-center font-medium max-w-[90px]">{features[i]?.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
} 