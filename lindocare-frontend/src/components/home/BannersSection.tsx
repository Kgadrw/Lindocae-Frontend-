          import Link from 'next/link';
          import Image from 'next/image';
          import { useRouter } from 'next/navigation';
          import { useState } from 'react';
          import OfflineError from '../OfflineError';
          import { normalizeImageUrl } from '../../utils/image';

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
            bannerError: unknown;
          }

          const BannerSkeleton = () => (
            <section className="w-full mb-8 animate-pulse">
              <div className="grid grid-cols-1 lg:grid-cols-9 gap-8">
                {/* Large promo skeleton */}
                <div className="lg:col-span-4 relative  p-6 flex flex-col justify-end pb-10 overflow-hidden bg-gray-200 h-80" />
                {/* 2x2 grid skeleton */}
                <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-gray-200  h-48" />
                  ))}
                </div>
              </div>
            </section>
          );

          const BannersSection = ({ banners, bannerLoading, bannerError }: BannersSectionProps) => {
            const router = useRouter();
            const [loadingBannerId, setLoadingBannerId] = useState<string | null>(null);
            // Get banner data safely
            const bannerData = banners?.banners || [];
            const gridBanners = bannerData.slice(0, 4); // Get up to 4 banners for the grid
            // Find the first banner not used in the grid for the large promo section
            const gridBannerIds = new Set(gridBanners.map(b => b._id));
            const promoBanner = bannerData.find(b => !gridBannerIds.has(b._id));
            const promoImage = normalizeImageUrl(promoBanner?.images?.[0] || '/lindo.png');

            // Handler for clicking a banner
            const handleBannerClick = async (banner: Banner, e: React.MouseEvent) => {
              e.preventDefault();
              if (!banner._id) return;
              setLoadingBannerId(banner._id);
              try {
                const res = await fetch(`https://lindo-project.onrender.com/banner/getCategoryByBanner/${banner._id}`);
                if (!res.ok) throw new Error('Network error. Please check your connection.');
                const data = await res.json();
                const categoryId = data?.category?._id || data?.categoryId || data?._id || data?.id;
                const categoryName = data?.category?.name || data?.name || 'Category';
                if (categoryId && categoryName) {
                  // Navigate to all-products with category filtering using URL parameters
                  router.push(`/all-products?category=${encodeURIComponent(categoryName)}`);
                }
              } catch (err) {
                // Optionally show error
              } finally {
                setLoadingBannerId(null);
              }
            };

            return (
              <section className="w-full mb-8  ">
                {bannerLoading ? (
                  <BannerSkeleton />
                ) : bannerError ? (
                  <OfflineError message={typeof bannerError === 'string' ? bannerError : (bannerError as Error)?.message || String(bannerError)} />
                ) : bannerData.length === 0 ? (
                  <div className="text-center text-gray-500 py-8"></div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-9 gap-8">
                    {/* Large promotional section on the left */}
                    <div className="lg:col-span-4 relative rounded-xl p-6 flex flex-col justify-end pb-10 overflow-hidden group cursor-pointer">
            {/* Background image */}
            <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
              <Image
                src={promoImage}
                alt="Banner"
                layout="fill"
                objectFit="cover"
                objectPosition="center"
                className="transition-transform duration-500 ease-in-out group-hover:scale-105 group-hover:brightness-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
            </div>
            {/* Content */}
            <div className="relative z-10">
              <div className="text-center lg:text-left space-y-4">
                <div className="space-y-3">
                  <h1
                    className="text-6xl lg:text-4xl font-bold leading-tight transition-transform duration-500 group-hover:-translate-y-1"
                    style={{
                      color: '#3267bdff', // Tailwind blue-500
                      WebkitTextStroke: '0.5px white', // white stroke
                    }}
                  >
                    Up to 30% Off
                  </h1>
                  <h2 className="text-xl lg:text-2xl font-semibold text-yellow-500 transition-transform duration-500 group-hover:-translate-y-1">
                    Newborn-Ready Nursery
                  </h2>
                  <p className="text-base text-white leading-relaxed transition-opacity duration-500 group-hover:opacity-95">
                    Everything you need to create the perfect nursery for your little one. Quality products, soft materials, and peace of mind.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mt-4">
                  <Link 
                    href="/all-products"
                    className="bg-blue-600 hover:text-white px-6 py-3 rounded-full font-bold text-base transition-all duration-300 transform hover:bg-white/20 backdrop-blur-md text-white hover:scale-105"
                  >
                    Shop Now 
                  </Link>
                  <Link 
                    href="/all-products"
                    className="bg-yellow-400 hover:text-white px-6 py-3 rounded-full font-semibold text-base transition-all duration-300 transform hover:bg-white/20 backdrop-blur-md text-white hover:scale-105"
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
                      <a
            href="#"
            className="group cursor-pointer"
            onClick={gridBanners[0]?._id ? (e) => handleBannerClick(gridBanners[0], e) : undefined}
          >
            <div className="relative bg-white rounded-xl overflow-hidden  hover:shadow-xl transition-shadow duration-300 group-hover:brightness-110">
              {gridBanners[0]?.images?.[0] ? (
                <div className="aspect-[4/3] relative">
                  <Image
                    src={normalizeImageUrl(gridBanners[0].images[0])}
                    alt={gridBanners[0].title}
                    layout="fill"
                    objectFit="cover"
                    className=" group-hover:brightness-125"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
                  {/* Text */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3
                      className="font-bold text-lg transition-transform duration-500 group-hover:-translate-y-1"
                      style={{
                        color: '#ffffffff', 
                      
                      }}
                    >
                      {gridBanners[0].title}
                    </h3>
                    {gridBanners[0].subTitle && (
                      <p className="text-sm opacity-90 transition-opacity duration-500 group-hover:opacity-95">
                        {gridBanners[0].subTitle}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center  group-hover:brightness-110">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-blue-300 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-2xl">👶</span>
                    </div>
                    <h3
                      className="font-bold text-lg transition-transform duration-500 group-hover:-translate-y-1"
                      style={{
                        color: '#1d57b6ff', // blue
                      }}
                    >
                      Nursery Essentials
                    </h3>
                    <p className="text-sm text-gray-600 transition-opacity duration-500 group-hover:opacity-95">
                      Changing pads & more
                    </p>
                  </div>
                </div>
              )}
            </div>
          </a>


                      {/* Top-right: Second banner */}
                      <a
                        href="#"
                        className="group cursor-pointer"
                        onClick={gridBanners[1]?._id ? (e) => handleBannerClick(gridBanners[1], e) : undefined}
                      >
                        <div className="relative bg-white rounded-xl overflow-hidden  hover:shadow-xl transition-shadow duration-300 group-hover:brightness-110">
                          {gridBanners[1]?.images?.[0] ? (
                            <div className="aspect-[4/3] relative">
                              <Image
                                src={normalizeImageUrl(gridBanners[1].images[0])} 
                                alt={gridBanners[1].title} 
                                layout="fill"
                                objectFit="cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                              <div className="absolute bottom-4 left-4 right-4 text-white">
                                <h3 className="font-bold text-lg transition-transform duration-500 group-hover:-translate-y-1">{gridBanners[1].title}</h3>
                                {gridBanners[1].subTitle && (
                                  <p className="text-sm opacity-90">{gridBanners[1].subTitle}</p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="aspect-[4/3] bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center group-hover:brightness-110">
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
                      </a>

                      {/* Bottom-left: Third banner */}
                      <a
                        href="#"
                        className="group cursor-pointer"
                        onClick={gridBanners[2]?._id ? (e) => handleBannerClick(gridBanners[2], e) : undefined}
                      >
                        <div className="relative bg-white rounded-xl overflow-hidden  hover:shadow-xl transition-shadow duration-300 group-hover:brightness-110">
                          {gridBanners[2]?.images?.[0] ? (
                            <div className="aspect-[4/3] relative">
                              <Image
                                src={normalizeImageUrl(gridBanners[2].images[0])} 
                                alt={gridBanners[2].title} 
                                layout="fill"
                                objectFit="cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent group-hover:brightness-110"></div>
                              <div className="absolute bottom-4 left-4 right-4 text-white">
                                <h3 className="font-bold text-lg transition-transform duration-500 group-hover:-translate-y-1">{gridBanners[2].title}</h3>
                                {gridBanners[2].subTitle && (
                                  <p className="text-sm opacity-90">{gridBanners[2].subTitle}</p>
                                    )}
                                  </div>
                            </div>
                          ) : (
                            <div className="aspect-[4/3] bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center group-hover:brightness-110">
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
                          </a>

                      {/* Bottom-right: Fourth banner */}
                      <a
                        href="#"
                        className="group cursor-pointer"
                        onClick={gridBanners[3]?._id ? (e) => handleBannerClick(gridBanners[3], e) : undefined}
                      >
                        <div className="relative bg-white rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-300 group-hover:brightness-110">
                          {gridBanners[3]?.images?.[0] ? (
                            <div className="aspect-[4/3] relative">
                              <Image
                                src={normalizeImageUrl(gridBanners[3].images[0])} 
                                alt={gridBanners[3].title} 
                                layout="fill"
                                objectFit="cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                              <div className="absolute bottom-4 left-4 right-4 text-white">
                                <h3 className="font-bold text-lg transition-transform duration-500 group-hover:-translate-y-1">{gridBanners[3].title}</h3>
                                {gridBanners[3].subTitle && (
                                  <p className="text-sm opacity-90">{gridBanners[3].subTitle}</p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="aspect-[4/3] bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center group-hover:brightness-110">
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
                      </a>
                    </div>
                  </div>
                )}
              </section>
            );
          };

          export default BannersSection; 