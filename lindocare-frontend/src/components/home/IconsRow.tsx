import React from 'react';

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
    <section className="flex flex-wrap gap-4 justify-center mb-4">
      {iconsLoading ? (
        <div className="text-center text-gray-500 py-8">Loading icons...</div>
      ) : iconsError ? (
        <div className="text-center text-red-500 py-8">{typeof iconsError === 'string' ? iconsError : iconsError?.message || String(iconsError)}</div>
      ) : icons?.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No icons found.</div>
      ) : (
        icons?.map((icon: any, idx: number) => {
          let image = '';
          if (Array.isArray(icon.image) && icon.image.length > 0) image = icon.image[0];
          else if (typeof icon.image === 'string') image = icon.image;
          return (
            <div key={icon._id || idx} className="flex flex-col items-center w-20">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow border border-gray-200 overflow-hidden mb-2">
                {image ? (
                  <img src={image} alt={icon.title} className="w-12 h-12 object-contain" />
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center bg-gray-100 text-gray-400 text-3xl rounded-full">🖼️</div>
                )}
              </div>
              <span className="text-xs text-blue-900 font-semibold text-center truncate w-16 mt-1">{icon.title}</span>
            </div>
          );
        })
      )}
    </section>
  );
};

export default IconsRow; 