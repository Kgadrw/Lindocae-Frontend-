import React from 'react';

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
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      {adsLoading ? (
        <div className="col-span-2 text-center text-gray-500 py-8">Loading ads...</div>
      ) : adsError ? (
        <div className="col-span-2 text-center text-red-500 py-8">{typeof adsError === 'string' ? adsError : adsError?.message || String(adsError)}</div>
      ) : (
        ads?.slice(0, 2).map((ad: any, idx: number) => {
          let image = '';
          if (Array.isArray(ad.image) && ad.image.length > 0) image = ad.image[0];
          else if (typeof ad.image === 'string') image = ad.image;
          const bgColor = idx === 0 ? 'bg-green-100' : 'bg-green-200';
          const overlayColor = idx === 0 ? 'bg-green-100/40' : 'bg-green-200/40';
          return (
            <div key={ad._id || idx} className={`relative rounded-2xl shadow h-32 flex items-center justify-center overflow-hidden ${bgColor}`}> 
              <>
                {image && (
                  <img src={image} alt={ad.title} className="absolute inset-0 w-full h-full object-cover object-center z-0" style={{opacity: 0.5}} />
                )}
                <div className={`absolute inset-0 w-full h-full z-10 ${overlayColor}`} />
                <div className="relative z-20 flex flex-col items-center justify-center w-full h-full px-4 text-center">
                  <span className="text-xl md:text-2xl font-bold text-blue-900 drop-shadow mb-1">{ad.title}</span>
                  <span className="text-xs md:text-sm text-blue-800 drop-shadow mb-2">{ad.content}</span>
                  <button className="mt-1 rounded-full bg-yellow-400 text-yellow-900 font-bold py-1 px-4 text-xs shadow hover:bg-yellow-500 transition">{ad.buttonLabel}</button>
                </div>
              </>
            </div>
          );
        })
      )}
    </section>
  );
};

export default AdsSection; 