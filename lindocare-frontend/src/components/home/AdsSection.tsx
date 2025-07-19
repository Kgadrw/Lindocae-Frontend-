import React from 'react';
import Link from 'next/link';

interface Ad {
  _id?: string;
  title: string;
  content: string;
  image: string[] | string;
  buttonLabel: string;
}

interface AdsSectionProps {
  ads: Ad[] | undefined;
  adsLoading: boolean;
  adsError: any;
}

const AdsSection: React.FC<AdsSectionProps> = ({ ads, adsLoading, adsError }) => {
  // Get the first two ads for the side-by-side layout
  const firstAd = ads?.[0];
  const secondAd = ads?.[1];

  return (
    <section className="w-full mb-8">
    
      
      {adsLoading ? (
        <div className="text-center text-gray-500 py-8"></div>
      ) : adsError ? (
        <div className="text-center text-red-500 py-8">{typeof adsError === 'string' ? adsError : adsError?.message || String(adsError)}</div>
      ) : ads?.length === 0 ? (
        <div className="text-center text-gray-500 py-8"></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Ad */}
          {firstAd && (
            <div className="relative bg-white rounded-2xl  overflow-hidden">
              <div className="relative h-48 lg:h-64">
                {/* Background image */}
                {firstAd.image && (
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${Array.isArray(firstAd.image) ? firstAd.image[0] : firstAd.image})`
                    }}
                  />
                )}
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/60 via-purple-900/50 to-pink-900/60" />

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                  <h2 className="text-xl lg:text-2xl font-bold text-white mb-3 drop-shadow-lg">
                    {firstAd.title}
                  </h2>
                  <p className="text-sm lg:text-base text-white/90 leading-relaxed drop-shadow mb-4 max-w-xs">
                    {firstAd.content}
                  </p>
                  <Link
                    href="/all-products"
                    className="bg-lindo-blue hover:bg-lindo-yellow text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200"
                  >
                    {firstAd.buttonLabel || 'Shop Now'} →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Second Ad */}
          {secondAd && (
            <div className="relative bg-white rounded-2xl  overflow-hidden">
              <div className="relative h-48 lg:h-64">
                {/* Background image */}
                {secondAd.image && (
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${Array.isArray(secondAd.image) ? secondAd.image[0] : secondAd.image})`
                    }}
                  />
                )}
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-900/60 via-yellow-900/50 to-orange-900/60" />

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                  <h2 className="text-xl lg:text-2xl font-bold text-white mb-3 drop-shadow-lg">
                    {secondAd.title}
                  </h2>
                  <p className="text-sm lg:text-base text-white/90 leading-relaxed drop-shadow mb-4 max-w-xs">
                    {secondAd.content}
                  </p>
                  <Link
                    href="/all-products"
                    className="bg-lindo-blue hover:bg-lindo-yellow text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200"
                  >
                    {secondAd.buttonLabel || 'Shop Now'} →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default AdsSection; 