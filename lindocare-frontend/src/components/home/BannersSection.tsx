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
  return (
    <section className="w-full mb-4">
      {bannerLoading ? (
        <div className="text-center text-gray-500 py-8">Loading banners...</div>
      ) : bannerError ? (
        <div className="text-center text-red-500 py-8">{typeof bannerError === 'string' ? bannerError : bannerError?.message || String(bannerError)}</div>
      ) : banners?.banners?.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No banners found.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Main large banner */}
            <Link href={banners?.banners?.[0]?.category ? `/category/${encodeURIComponent(banners.banners[0].category)}` : '#'} className="md:col-span-2 bg-white rounded-2xl shadow p-0 flex items-center justify-center h-64 overflow-hidden relative group cursor-pointer">
              {banners?.banners?.[0]?.images?.[0] && (
                <img src={banners.banners[0].images[0]} alt={banners.banners[0].title} className="absolute inset-0 w-full h-full object-cover rounded-2xl group-hover:brightness-90 transition" />
              )}
              {/* Title at top center */}
              <div className="absolute top-0 left-0 w-full flex flex-col items-center pt-6 z-10">
                <span className="text-3xl font-bold text-yellow-500 drop-shadow-lg bg-white/70 px-4 py-1 rounded-full shadow-md text-center">{banners?.banners?.[0]?.title}</span>
              </div>
            </Link>
            {/* Two vertical banners on the right */}
            {[1,2].map(i => (
              <Link
                key={i}
                href={banners?.banners?.[i]?.category ? `/category/${encodeURIComponent(banners.banners[i].category)}` : '#'}
                className="bg-white rounded-2xl shadow p-0 flex flex-col h-64 overflow-hidden relative group transition-transform duration-300 animate-fade-in cursor-pointer"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {banners?.banners?.[i]?.images?.[0]
                  ? (
                    <>
                      <img
                        src={banners.banners[i].images[0]}
                        alt={banners.banners[i].title}
                        className="absolute inset-0 w-full h-full object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105 group-hover:brightness-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent rounded-2xl transition-opacity duration-300 group-hover:opacity-80" />
                      <div className="absolute bottom-0 left-0 w-full flex flex-col items-start px-4 pb-4 z-10">
                        <span className="flex items-center text-lg font-bold text-white drop-shadow-lg transition group-hover:text-yellow-300">
                          {banners.banners[i].title}
                          <span className="ml-2 text-xl transition-transform group-hover:translate-x-1">→</span>
                        </span>
                        {banners.banners[i].subTitle && (
                          <span className="text-xs text-white mt-2 drop-shadow">{banners.banners[i].subTitle}</span>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100 rounded-2xl">No Banner</div>
                  )}
              </Link>
            ))}
          </div>
          {/* Row of smaller banners below */}
          {banners?.banners?.length > 3 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {banners.banners.slice(3, 7).map((banner: any, idx: number) => (
                <Link
                  key={banner._id || idx}
                  href={banner.category ? `/category/${encodeURIComponent(banner.category)}` : '#'}
                  className="bg-white rounded-2xl shadow p-0 flex flex-col h-40 overflow-hidden relative group transition-transform duration-300 animate-fade-in cursor-pointer"
                  style={{ animationDelay: `${(idx + 3) * 100}ms` }}
                >
                  {banner.images && banner.images[0]
                    ? (
                      <>
                        <img
                          src={banner.images[0]}
                          alt={banner.title}
                          className="absolute inset-0 w-full h-full object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105 group-hover:brightness-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent rounded-2xl transition-opacity duration-300 group-hover:opacity-80" />
                        <div className="absolute bottom-0 left-0 w-full flex flex-col items-start px-3 pb-3 z-10">
                          <span className="flex items-center text-base font-bold text-white drop-shadow-lg transition group-hover:text-yellow-300">
                            {banner.title}
                            <span className="ml-2 text-lg transition-transform group-hover:translate-x-1">→</span>
                          </span>
                          {banner.subTitle && (
                            <span className="text-xs text-white mt-2 drop-shadow">{banner.subTitle}</span>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100 rounded-2xl">No Banner</div>
                    )}
                </Link>
              ))}
              {Array.from({length: Math.max(0, 4 - (banners.banners.length - 3))}).map((_, idx) => (
                <div key={idx} className="bg-gray-100 rounded-2xl shadow h-40" />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default BannersSection; 