import React from 'react';
import Link from 'next/link';

interface Icon {
  _id?: string;
  title: string;
  image: string[] | string;
}

interface IconsRowProps {
  icons: Icon[] | undefined;
  iconsLoading: boolean;
  iconsError: any;
}

const IconsRow: React.FC<IconsRowProps> = ({ icons, iconsLoading, iconsError }) => {
  return (
    <section className="w-full mb-8">
      {iconsLoading ? (
        <div className="text-center text-gray-500 py-8">Loading icons...</div>
      ) : iconsError ? (
        <div className="text-center text-red-500 py-8">{typeof iconsError === 'string' ? iconsError : iconsError?.message || String(iconsError)}</div>
      ) : icons?.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No icons found.</div>
      ) : (
        <div className="w-full">
          {/* Horizontal scrolling container */}
          <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
            {icons?.map((icon: any, idx: number) => {
              let image = '';
              if (Array.isArray(icon.image) && icon.image.length > 0) image = icon.image[0];
              else if (typeof icon.image === 'string') image = icon.image;
              
              return (
                <Link
                  key={icon._id || idx}
                  href={`/category/${encodeURIComponent(icon.title)}`}
                  className="flex flex-col items-center min-w-[100px] group cursor-pointer"
                >
                  {/* Icon container with soft blob background */}
                  <div className="relative w-20 h-20 mb-3 group-hover:scale-105 transition-transform duration-300">
                    {/* Soft blob background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-100 rounded-full shadow-sm group-hover:shadow-md transition-shadow duration-300" />
                    
                    {/* Icon image */}
                    <div className="absolute inset-2 rounded-full overflow-hidden bg-white">
                      {image ? (
                        <img
                          src={image}
                          alt={icon.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <span className="text-2xl text-gray-400">🛍️</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Category label with arrow */}
                  <div className="text-center">
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300 flex items-center justify-center gap-1">
                      {icon.title}
                      <span className="text-xs opacity-60 group-hover:opacity-100 transition-opacity duration-300">→</span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
          
          {/* Scroll indicator for mobile */}
          <div className="flex justify-center mt-2 lg:hidden">
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      )}
    </section>
  );
};

export default IconsRow; 