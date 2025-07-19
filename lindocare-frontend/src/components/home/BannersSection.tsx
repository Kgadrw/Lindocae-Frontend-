import Link from 'next/link';

interface Banner {
  _id?: string;
  title: string;
  subTitle?: string;
  images: string[];
  category?: string;
}

interface BannersSectionProps {
  banners: { banners: Banner[] } | undefined;
  bannerLoading: boolean;
  bannerError: any;
}

const BannersSection = ({ banners, bannerLoading, bannerError }: BannersSectionProps) => {
  // Get banner data safely
  const bannerData = banners?.banners || [];
  const gridBanners = bannerData.slice(0, 4); // Get up to 4 banners for the grid
  // Find the first banner not used in the grid for the large promo section
  const gridBannerIds = new Set(gridBanners.map(b => b._id));
  const promoBanner = bannerData.find(b => !gridBannerIds.has(b._id));
  const promoImage = promoBanner?.images?.[0] || '/lindo.png';

  return (
    <section className="w-full mb-8">
      {bannerLoading ? (
        <div className="text-center text-gray-500 py-8"></div>
      ) : bannerError ? (
        <div className="text-center text-red-500 py-8">{typeof bannerError === 'string' ? bannerError : bannerError?.message || String(bannerError)}</div>
      ) : bannerData.length === 0 ? (
        <div className="text-center text-gray-500 py-8"></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-9 gap-8">
          {/* Large promotional section on the left */}
          <div className="lg:col-span-4 relative rounded-xl p-6 flex flex-col justify-end pb-10 overflow-hidden">
            {/* Background image */}
            <div className="absolute inset-0 w-full h-full z-0">
              <img src={promoImage} alt="Banner" className="w-full h-full object-cover object-center" />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            {/* Content */}
            <div className="relative z-10">


              <div className="text-center lg:text-left space-y-4">
                <div className="space-y-3">
                  <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
                    Up to 30% Off
                  </h1>
                  <h2 className="text-xl lg:text-2xl font-semibold text-yellow-500">
                    Newborn-Ready Nursery
                  </h2>
                  <p className="text-base text-white leading-relaxed">
                    Everything you need to create the perfect nursery for your little one. Quality products, soft materials, and peace of mind.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Link 
                    href="/all-products"
                    className="bg-black  hover:bg-lindo-blue text-lindo-blue px-6 py-3 rounded-full font-bold text-white transition-colors duration-300 transform hover:scale-105"
                  >
                    Shop Now
                  </Link>
                  <Link 
                    href="/category/nursery"
                    className="border-2 border-lindo-blue bg-yellow-300 hover:border-lindo-yellow text-white hover:text-lindo-yellow px-6 py-3 rounded-full font-semibold text-base transition-colors duration-300"
                  >
                    View Categories
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* 2x2 grid of baby product images on the right */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            {/* Top-left: First banner */}
            <Link href={gridBanners[0]?.category ? `/category/${encodeURIComponent(gridBanners[0].category)}` : '#'} className="group cursor-pointer">
              <div className="relative bg-white rounded-xl overflow-hidden  hover:shadow-xl transition-shadow duration-300">
                {gridBanners[0]?.images?.[0] ? (
                  <div className="aspect-[4/3] relative">
                    <img 
                      src={gridBanners[0].images[0]} 
                      alt={gridBanners[0].title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="font-bold text-lg">{gridBanners[0].title}</h3>
                      {gridBanners[0].subTitle && (
                        <p className="text-sm opacity-90">{gridBanners[0].subTitle}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 bg-blue-300 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-2xl">👶</span>
                      </div>
                      <h3 className="font-bold text-gray-800 text-lg">Nursery Essentials</h3>
                      <p className="text-sm text-gray-600">Changing pads & more</p>
                    </div>
                  </div>
                )}
              </div>
            </Link>

            {/* Top-right: Second banner */}
            <Link href={gridBanners[1]?.category ? `/category/${encodeURIComponent(gridBanners[1].category)}` : '#'} className="group cursor-pointer">
              <div className="relative bg-white rounded-xl overflow-hidden  hover:shadow-xl transition-shadow duration-300">
                {gridBanners[1]?.images?.[0] ? (
                  <div className="aspect-[4/3] relative">
                    <img 
                      src={gridBanners[1].images[0]} 
                      alt={gridBanners[1].title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="font-bold text-lg">{gridBanners[1].title}</h3>
                      {gridBanners[1].subTitle && (
                        <p className="text-sm opacity-90">{gridBanners[1].subTitle}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[4/3] bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 bg-yellow-300 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-2xl">🎪</span>
                      </div>
                      <h3 className="font-bold text-gray-800 text-lg">Ready, Set, Play!</h3>
                      <p className="text-sm text-gray-600">Baby play gyms</p>
                    </div>
                  </div>
                )}
              </div>
              </Link>

            {/* Bottom-left: Third banner */}
            <Link href={gridBanners[2]?.category ? `/category/${encodeURIComponent(gridBanners[2].category)}` : '#'} className="group cursor-pointer">
              <div className="relative bg-white rounded-xl overflow-hidden  hover:shadow-xl transition-shadow duration-300">
                {gridBanners[2]?.images?.[0] ? (
                  <div className="aspect-[4/3] relative">
                    <img 
                      src={gridBanners[2].images[0]} 
                      alt={gridBanners[2].title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="font-bold text-lg">{gridBanners[2].title}</h3>
                      {gridBanners[2].subTitle && (
                        <p className="text-sm opacity-90">{gridBanners[2].subTitle}</p>
                          )}
                        </div>
                  </div>
                ) : (
                  <div className="aspect-[4/3] bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 bg-green-300 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-2xl">🛁</span>
                      </div>
                      <h3 className="font-bold text-gray-800 text-lg">Bath Time Fun</h3>
                      <p className="text-sm text-gray-600">Towels & bath toys</p>
                    </div>
                  </div>
                )}
              </div>
                </Link>

            {/* Bottom-right: Fourth banner */}
            <Link href={gridBanners[3]?.category ? `/category/${encodeURIComponent(gridBanners[3].category)}` : '#'} className="group cursor-pointer">
              <div className="relative bg-white rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {gridBanners[3]?.images?.[0] ? (
                  <div className="aspect-[4/3] relative">
                    <img 
                      src={gridBanners[3].images[0]} 
                      alt={gridBanners[3].title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="font-bold text-lg">{gridBanners[3].title}</h3>
                      {gridBanners[3].subTitle && (
                        <p className="text-sm opacity-90">{gridBanners[3].subTitle}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[4/3] bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 bg-purple-300 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-2xl">🧸</span>
                      </div>
                      <h3 className="font-bold text-gray-800 text-lg">Most-Loved</h3>
                      <p className="text-sm text-gray-600">Wooden toys & more</p>
                    </div>
            </div>
          )}
              </div>
            </Link>
          </div>
        </div>
      )}
    </section>
  );
};

export default BannersSection; 