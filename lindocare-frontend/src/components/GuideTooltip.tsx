"use client";
import React, { useState } from 'react';
import Image from 'next/image';

const GuideTooltip = () => {
  const [visible, setVisible] = useState(false);

  // Only show the tooltip if the user hasn't seen it before
  React.useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('lindoGuideShown')) {
      setVisible(true);
    }
  }, []);

  const handleClose = () => {
    setVisible(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lindoGuideShown', 'true');
    }
  };

  if (!visible) return null;

  return (
    <div className="absolute z-[9999] top-12 right-0 md:top-14 md:right-0 bg-white border border-yellow-200 rounded-xl shadow-xl p-4 w-64 animate-fade-in flex flex-col items-center pointer-events-auto">
      <Image src="/lindo.png" alt="Guide" width={40} height={40} className="mb-2" style={{ width: 40, height: 'auto' }} />
      <h2 className="text-base font-bold text-blue-900 mb-1 text-center">Login or Create an Account</h2>
      <p className="text-gray-700 text-center text-sm mb-1">Click here to login or register. You can use Google for quick sign-in.</p>
      <button className="mt-2 px-3 py-1 rounded bg-yellow-400 text-blue-900 font-semibold text-xs" onClick={handleClose}>Got it</button>
    </div>
  );
};

export default GuideTooltip; 