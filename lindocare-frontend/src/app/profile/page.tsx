"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User, ArrowLeft, Camera, Trash2, Upload, X } from 'lucide-react';
import Link from 'next/link';
import { isUserLoggedIn } from '../../utils/serverStorage';
import Image from 'next/image';

// Profile Update Page Component
const ProfilePage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    province: '',
    district: '',
    sector: '',
    cell: '',
    village: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if user is logged in
    if (!isUserLoggedIn()) {
      alert('You must be logged in to access this page. Redirecting to home...');
      router.push('/');
      return;
    }

    const email = localStorage.getItem('userEmail');

    // Load current user data
    setFormData({
      firstName: localStorage.getItem(`firstName:${email}`) || '',
      lastName: localStorage.getItem(`lastName:${email}`) || '',
      email: email,
      phone: localStorage.getItem(`userPhone:${email}`) || '',
      province: localStorage.getItem(`userProvince:${email}`) || '',
      district: localStorage.getItem(`userDistrict:${email}`) || '',
      sector: localStorage.getItem(`userSector:${email}`) || '',
      cell: localStorage.getItem(`userCell:${email}`) || '',
      village: localStorage.getItem(`userVillage:${email}`) || ''
    });

    // Load profile image
    const savedImage = localStorage.getItem(`userAvatar:${email}`);
    if (savedImage) {
      setProfileImage(savedImage);
    }
  }, [router]);

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB.');
      return;
    }

    setIsUploadingImage(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setProfileImage(result);
      
      // Save to localStorage
      const email = localStorage.getItem('userEmail');
      if (email) {
        localStorage.setItem(`userAvatar:${email}`, result);
        
        // Trigger header update
        try {
          window.dispatchEvent(new CustomEvent('avatarUpdated', { 
            detail: { email, avatar: result } 
          }));
        } catch (e) {
          console.log('Could not dispatch avatar update event:', e);
        }
      }
      
      setIsUploadingImage(false);
      alert('Profile image updated successfully!');
    };
    reader.onerror = () => {
      setIsUploadingImage(false);
      alert('Error uploading image. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  // Handle image deletion
  const handleImageDelete = () => {
    if (confirm('Are you sure you want to delete your profile image?')) {
      setProfileImage(null);
      
      // Remove from localStorage
      const email = localStorage.getItem('userEmail');
      if (email) {
        localStorage.removeItem(`userAvatar:${email}`);
        
        // Trigger header update
        try {
          window.dispatchEvent(new CustomEvent('avatarUpdated', { 
            detail: { email, avatar: null } 
          }));
        } catch (e) {
          console.log('Could not dispatch avatar update event:', e);
        }
      }
      
      alert('Profile image deleted successfully!');
    }
  };

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleProfileUpdate = async (profileData: any) => {
    setIsUpdating(true);
    try {
      // Check if user is logged in
      if (!isUserLoggedIn()) {
        console.log('User is not logged in.');
        alert('You must be logged in to update your profile. Please log in and try again.');
        setIsUpdating(false);
        return;
      }

      const userEmail = localStorage.getItem('userEmail');

      // Try to update profile on the server first
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const userData = localStorage.getItem('userData');
      let userId = null;
      
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          userId = parsed.user?._id || parsed.user?.id;
        } catch (e) {
          console.log('Error parsing userData:', e);
        }
      }
      
      if (token && userId) {
        try {
          console.log('Attempting to update profile on server:', profileData);
          console.log('User ID:', userId);
          
          // Create FormData for multipart/form-data
          const formData = new FormData();
          formData.append('firstName', profileData.firstName || '');
          formData.append('lastName', profileData.lastName || '');
          formData.append('email', profileData.email || '');
          formData.append('gender', 'Male'); // Default gender
          formData.append('role', 'user');
          formData.append('province', profileData.province || '');
          formData.append('district', profileData.district || '');
          formData.append('sector', profileData.sector || '');
          formData.append('cell', profileData.cell || '');
          formData.append('village', profileData.village || '');
          formData.append('street', ''); // Not in our form yet
          formData.append('customerPhone', profileData.phone || '');
          formData.append('image', ''); // Empty for now, will handle image upload separately

          const response = await fetch(`https://lindo-project.onrender.com/user/updateUserById/${userId}`, {
            method: 'PUT',
            headers: {
              'accept': '*/*',
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });

          if (response.ok) {
            const result = await response.json();
            console.log('Profile updated on server successfully:', result);
            
            // Update localStorage with server response
            const email = localStorage.getItem('userEmail');
            if (email) {
              if (profileData.firstName) localStorage.setItem(`firstName:${email}`, profileData.firstName);
              if (profileData.lastName) localStorage.setItem(`lastName:${email}`, profileData.lastName);
              if (profileData.phone) localStorage.setItem(`userPhone:${email}`, profileData.phone);
              if (profileData.province) localStorage.setItem(`userProvince:${email}`, profileData.province);
              if (profileData.district) localStorage.setItem(`userDistrict:${email}`, profileData.district);
              if (profileData.sector) localStorage.setItem(`userSector:${email}`, profileData.sector);
              if (profileData.cell) localStorage.setItem(`userCell:${email}`, profileData.cell);
              if (profileData.village) localStorage.setItem(`userVillage:${email}`, profileData.village);
              
              if (profileData.email && profileData.email !== email) {
                localStorage.setItem('userEmail', profileData.email);
                localStorage.setItem(`userName:${profileData.email}`, `${profileData.firstName} ${profileData.lastName}`);
              } else {
                localStorage.setItem(`userName:${email}`, `${profileData.firstName} ${profileData.lastName}`);
              }
            }
            
            alert('Profile updated successfully on server!');
            router.push('/');
            return;
          } else {
            console.log('Server update failed, falling back to localStorage');
          }
        } catch (error) {
          console.log('Server update error, falling back to localStorage:', error);
        }
      }
      
      // Fallback: Update localStorage only
      console.log('Updating profile locally (server update failed or no token):', profileData);
      
      const email = localStorage.getItem('userEmail');
      if (email) {
        if (profileData.firstName) localStorage.setItem(`firstName:${email}`, profileData.firstName);
        if (profileData.lastName) localStorage.setItem(`lastName:${email}`, profileData.lastName);
        if (profileData.phone) localStorage.setItem(`userPhone:${email}`, profileData.phone);
        if (profileData.province) localStorage.setItem(`userProvince:${email}`, profileData.province);
        if (profileData.district) localStorage.setItem(`userDistrict:${email}`, profileData.district);
        if (profileData.sector) localStorage.setItem(`userSector:${email}`, profileData.sector);
        if (profileData.cell) localStorage.setItem(`userCell:${email}`, profileData.cell);
        if (profileData.village) localStorage.setItem(`userVillage:${email}`, profileData.village);
        
        if (profileData.email && profileData.email !== email) {
          localStorage.setItem('userEmail', profileData.email);
          localStorage.setItem(`userName:${profileData.email}`, `${profileData.firstName} ${profileData.lastName}`);
        } else {
          localStorage.setItem(`userName:${email}`, `${profileData.firstName} ${profileData.lastName}`);
        }
      }
      
      alert('Profile updated successfully!');
      router.push('/');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(`Failed to update profile: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleProfileUpdate(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-gray-500 hover:text-gray-700 transition-colors">
                <ArrowLeft size={16} className="mr-1" />
                <span className="text-sm">Back</span>
              </Link>
            </div>
            <h1 className="text-lg font-medium text-gray-800">Profile</h1>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Profile Image Section */}
          <div className="lg:col-span-1">
            <div className="bg-white p-4 sticky top-16">
              <div className="text-center">
                <h2 className="text-sm font-medium text-gray-700 mb-4">Photo</h2>
                
                {/* Profile Image Display */}
                <div className="relative inline-block mb-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden">
                    {profileImage ? (
                      <Image
                        src={profileImage}
                        alt="Profile"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                        <User size={24} className="text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* Upload Overlay */}
                  <button
                    onClick={triggerFileInput}
                    disabled={isUploadingImage}
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-600 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50"
                  >
                    {isUploadingImage ? (
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Camera size={10} />
                    )}
                  </button>
                </div>

                {/* Image Actions */}
                <div className="space-y-2">
                  <button
                    onClick={triggerFileInput}
                    disabled={isUploadingImage}
                    className="w-full flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-xs transition-all duration-200 disabled:opacity-50"
                  >
                    <Upload size={12} />
                    {isUploadingImage ? 'Uploading...' : 'Upload'}
                  </button>
                  
                  {profileImage && (
                    <button
                      onClick={handleImageDelete}
                      className="w-full flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white text-xs transition-all duration-200"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  )}
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {/* Image Info */}
                <div className="mt-4 p-2 bg-gray-50 text-xs text-gray-500">
                  <p>JPG, PNG, GIF • Max 5MB</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-3">
            <div className="bg-white overflow-hidden">
              {/* Header */}
              <div className="bg-gray-600 px-6 py-4">
                <h2 className="text-lg font-medium text-white">Personal Information</h2>
                <p className="text-gray-200 text-sm mt-1">Update your profile details</p>
              </div>

              {/* Form Content */}
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-4 flex items-center gap-2">
                      <User size={16} className="text-gray-500" />
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          First Name <span className="text-gray-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          className="w-full px-3 py-2 bg-gray-50 focus:bg-white transition-all duration-200 text-sm"
                          placeholder="First name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Last Name <span className="text-gray-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          className="w-full px-3 py-2 bg-gray-50 focus:bg-white transition-all duration-200 text-sm"
                          placeholder="Last name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Email <span className="text-gray-400">*</span>
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full px-3 py-2 bg-gray-50 focus:bg-white transition-all duration-200 text-sm"
                          placeholder="Email address"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Phone <span className="text-gray-400">*</span>
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full px-3 py-2 bg-gray-50 focus:bg-white transition-all duration-200 text-sm"
                          placeholder="Phone number"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Address
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Province</label>
                        <input
                          type="text"
                          value={formData.province}
                          onChange={(e) => setFormData({...formData, province: e.target.value})}
                          className="w-full px-3 py-2 bg-gray-50 focus:bg-white transition-all duration-200 text-sm"
                          placeholder="Province"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">District</label>
                        <input
                          type="text"
                          value={formData.district}
                          onChange={(e) => setFormData({...formData, district: e.target.value})}
                          className="w-full px-3 py-2 bg-gray-50 focus:bg-white transition-all duration-200 text-sm"
                          placeholder="District"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Sector</label>
                        <input
                          type="text"
                          value={formData.sector}
                          onChange={(e) => setFormData({...formData, sector: e.target.value})}
                          className="w-full px-3 py-2 bg-gray-50 focus:bg-white transition-all duration-200 text-sm"
                          placeholder="Sector"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Cell</label>
                        <input
                          type="text"
                          value={formData.cell}
                          onChange={(e) => setFormData({...formData, cell: e.target.value})}
                          className="w-full px-3 py-2 bg-gray-50 focus:bg-white transition-all duration-200 text-sm"
                          placeholder="Cell"
                        />
                      </div>
                      <div className="md:col-span-2 lg:col-span-1">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Village</label>
                        <input
                          type="text"
                          value={formData.village}
                          onChange={(e) => setFormData({...formData, village: e.target.value})}
                          className="w-full px-3 py-2 bg-gray-50 focus:bg-white transition-all duration-200 text-sm"
                          placeholder="Village"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-6">
                    <Link
                      href="/"
                      className="flex-1 sm:flex-none px-6 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200 text-sm text-center"
                    >
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="flex-1 sm:flex-none px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
                    >
                      {isUpdating ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                          Updating...
                        </div>
                      ) : (
                        'Update Profile'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
