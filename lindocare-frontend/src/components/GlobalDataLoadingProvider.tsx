"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import Image from "next/image";

interface GlobalDataLoadingContextType {
  markLoaded: (key: "categories" | "products" | "banners" | "ads" | "icons") => void;
  loading: boolean;
}

const GlobalDataLoadingContext = createContext<GlobalDataLoadingContextType | undefined>(undefined);

export const useGlobalDataLoading = () => {
  const ctx = useContext(GlobalDataLoadingContext);
  if (!ctx) throw new Error("useGlobalDataLoading must be used within GlobalDataLoadingProvider");
  return ctx;
};

const initialState = {
  categories: false,
  products: false,
  banners: false,
  ads: false,
  icons: false,
};

const GlobalDataLoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loaded, setLoaded] = useState(initialState);

  const markLoaded = useCallback((key: keyof typeof initialState) => {
    setLoaded(prev => ({ ...prev, [key]: true }));
  }, []);

  const loading = !Object.values(loaded).every(Boolean);

  return (
    <GlobalDataLoadingContext.Provider value={{ markLoaded, loading }}>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <Image src="/lindo.png" alt="Lindocare Logo" width={120} height={120} className="animate-pulse" style={{ width: 120, height: 'auto' }} />
        </div>
      ) : (
        children
      )}
    </GlobalDataLoadingContext.Provider>
  );
};

export default GlobalDataLoadingProvider; 