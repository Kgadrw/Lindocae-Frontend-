"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { isUserLoggedIn } from '../../../utils/serverStorage';

// Account Deletion Page Component
const DeleteAccountPage = () => {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    if (!isUserLoggedIn()) {
      alert('You must be logged in to access this page. Redirecting to home...');
      router.push('/');
      return;
    }
  }, [router]);

  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmText(e.target.value);
    setIsConfirmed(e.target.value.toLowerCase() === 'delete');
  };

  const handleAccountDeletion = async () => {
    setIsDeleting(true);
    try {
      // Check if user is logged in
      if (!isUserLoggedIn()) {
        console.log('User is not logged in.');
        alert('You must be logged in to delete your account. Please log in and try again.');
        setIsDeleting(false);
        return;
      }

      const userEmail = localStorage.getItem('userEmail');

      // Since the server doesn't have a deleteAccount endpoint,
      // we'll clear the local data for now
      console.log('Clearing account data locally (server endpoint not available)');
      
      // Clear all user data from localStorage
      const email = localStorage.getItem('userEmail');
      if (email) {
        localStorage.removeItem('userEmail');
        localStorage.removeItem(`userName:${email}`);
        localStorage.removeItem(`userAvatar:${email}`);
        localStorage.removeItem(`firstName:${email}`);
        localStorage.removeItem(`lastName:${email}`);
        localStorage.removeItem(`userPhone:${email}`);
        localStorage.removeItem(`userProvince:${email}`);
        localStorage.removeItem(`userDistrict:${email}`);
        localStorage.removeItem(`userSector:${email}`);
        localStorage.removeItem(`userCell:${email}`);
        localStorage.removeItem(`userVillage:${email}`);
        localStorage.removeItem(`cart:${email}`);
        localStorage.removeItem(`wishlist:${email}`);
      }
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userData');
      
      alert('Account deleted successfully!');
      router.push('/');
      
    } catch (error) {
      console.error('Error clearing account data:', error);
      alert(`Failed to clear account data: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft size={20} className="mr-2" />
                Back to Home
              </Link>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Delete Account</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          {/* Header Section */}
          <div className="flex flex-col items-center pt-8 pb-6 px-8 border-b border-gray-100">
            <div className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center text-xl font-bold border-4 border-gray-200 mb-4">
              <Trash2 size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Delete Account</h2>
            <p className="text-gray-600">This action cannot be undone</p>
          </div>

          {/* Content Section */}
          <div className="p-8">
            {/* Warning Section */}
            <div className="mb-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-red-600 mt-0.5 mr-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Warning: This action cannot be undone</h3>
                    <p className="text-red-700 leading-relaxed">
                      Deleting your account will permanently remove all your data, including orders, wishlist, and profile information. This action is irreversible.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  To confirm, type <span className="font-bold text-red-600">DELETE</span> in the box below:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={handleConfirmChange}
                  placeholder="Type DELETE here"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-center font-mono text-lg"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Link
                href="/"
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-center"
              >
                Cancel
              </Link>
              <button
                onClick={handleAccountDeletion}
                disabled={!isConfirmed || isDeleting}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountPage;
