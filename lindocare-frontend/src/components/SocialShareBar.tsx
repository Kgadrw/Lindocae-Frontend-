import React, { useState } from 'react';
import { Instagram, Mail, ChevronLeft } from 'lucide-react';

const SocialShareBar: React.FC = () => {
  const [hidden, setHidden] = useState(false);

  return (
    <>
      {/* Invisible hover area to show the bar when hidden */}
      {hidden && (
        <div
          className="fixed left-0 top-1/2 -translate-y-1/2 z-50 h-24 w-2 cursor-pointer hidden md:block"
          onMouseEnter={() => setHidden(false)}
          style={{ background: 'transparent' }}
        />
      )}
      <div
        className={`fixed left-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center transition-transform duration-300 hidden md:flex ${hidden ? '-translate-x-full' : ''}`}
      >
        <div className="bg-blue-600 flex flex-col items-center py-2 px-1 gap-2 shadow-lg">
          <a href="https://www.instagram.com/lindocare/" className="w-7 h-7 flex items-center justify-center" aria-label="Instagram">
            <Instagram size={18} className="text-white" />
          </a>
          <a href="mailto:lindocare@gmail.com" className="w-7 h-7 flex items-center justify-center" aria-label="Email">
            <Mail size={18} className="text-white" />
          </a>
          <button
            className="w-6 h-6 flex items-center justify-center mt-1"
            aria-label="Hide"
            onClick={() => setHidden(true)}
          >
            <ChevronLeft size={16} className="text-white" />
          </button>
        </div>
      </div>
    </>
  );
};

export default SocialShareBar; 