import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import Image from 'next/image';

interface OfflineErrorProps {
  onRetry?: () => void;
  message?: string;
}

const OfflineError: React.FC<OfflineErrorProps> = ({ onRetry, message = "No Internet Connection" }) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const checkConnection = async () => {
    try {
      const response = await fetch('https://lindo-project.onrender.com/health', { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Image src="/internet.png" alt="No Internet" width={40} height={40} className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">No Internet Connection</h1>
          <p className="text-gray-600 mb-6">
            {message || "It looks like you're offline. Please check your internet connection and try again."}
          </p>
        </div>

        {/* Connection Status */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Wifi size={16} className="text-gray-500" />
            <span className="text-sm text-gray-600">Connection Status</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm text-red-600 font-medium">Offline</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Go to Homepage
          </button>
        </div>

        {/* Tips */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Troubleshooting Tips:</h3>
          <ul className="text-xs text-gray-600 space-y-1 text-left">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              Check your Wi-Fi or mobile data connection
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              Try turning airplane mode on and off
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              Restart your device if the problem persists
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OfflineError; 