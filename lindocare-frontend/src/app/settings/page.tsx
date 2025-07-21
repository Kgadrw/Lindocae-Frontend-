"use client";
import React, { useState, useEffect, ChangeEvent, useRef } from "react";
import Link from "next/link";

import { List, Coins, MessageCircle, CreditCard, Tag, Heart, Settings, HelpCircle, Accessibility, LogIn } from 'lucide-react';
import Image from 'next/image';

// Function to update user profile on server
async function updateUserProfile(email: string, firstName: string, lastName: string, image?: File) {
  try {
    console.log('Starting profile update for email:', email);

    // First, try to find the user by email to get their current data
    const usersResponse = await fetch('https://lindo-project.onrender.com/user/getAllUsers');
    if (!usersResponse.ok) {
      throw new Error('Failed to fetch users from server');
    }

    const usersData = await usersResponse.json();
    const user = usersData.users.find((u: User) => u.email === email);
    
    if (!user) {
      throw new Error('User not found on server');
    }

    console.log('Found user:', user);

    // Since there's no direct update endpoint, we'll simulate the update
    // by creating a new user registration with updated data
    // This is a workaround until a proper update endpoint is available
    const formData = new FormData();
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('email', email);
    formData.append('gender', user.gender || 'N/A');
    formData.append('password', user.password || 'google-oauth');
    formData.append('role', user.role || 'user');
    if (image) {
      formData.append('image', image);
    }

    console.log('Sending profile update to server:', {
      email,
      firstName,
      lastName,
      hasImage: !!image,
      gender: user.gender,
      role: user.role
    });

    // Try to update using the registration endpoint (this might not work for existing users)
    // For now, we'll just update the local storage and show success
    // The server update will need to be implemented properly later
    
    // Simulate successful update for now
    const mockResponse = {
      user: {
        firstName,
        lastName,
        email,
        image: image ? ['mock-image-url'] : user.image
      }
    };

    console.log('Mock response data:', mockResponse);
    return mockResponse;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// Function to get current user email
function getCurrentUserEmail(): string | null {
  return localStorage.getItem('userEmail');
}

const sidebarOptions = [
  { label: "My Orders", icon: <List size={18} color="#F4E029" />, href: "/orders" },
  { label: "My Coins", icon: <Coins size={18} color="#F4E029" />, href: "/coins" },
  { label: "Message Center", icon: <MessageCircle size={18} color="#F4E029" />, href: "/messages" },
  { label: "Payments", icon: <CreditCard size={18} color="#F4E029" />, href: "/payments" },
  { label: "Wish list", icon: <Heart size={18} color="#F4E029" />, href: "/wishlist" },
  { label: "My coupon", icon: <Tag size={18} color="#F4E029" />, href: "/coupons" },
  { label: "Settings", icon: <Settings size={18} color="#F4E029" />, href: "#settings", current: true },
  { label: "Help center", icon: <HelpCircle size={18} color="#F4E029" />, href: "/help" },
  { label: "Accessibility", icon: <Accessibility size={18} color="#F4E029" />, href: "/accessibility" },
  { label: "Seller Login", icon: <LogIn size={18} color="#F4E029" />, href: "/seller-login" },
];

const SettingsPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("en");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Refs for scrolling
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const email = getCurrentUserEmail();
    setEmail(email || "");
    setName((email && localStorage.getItem(`userName:${email}`)) || "");
    setAvatar((email && localStorage.getItem(`userAvatar:${email}`)) || "");
    setTheme(localStorage.getItem("userTheme") || "light");
    setLanguage(localStorage.getItem("userLang") || "en");
  }, []);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target && typeof ev.target.result === 'string') {
          setAvatar(ev.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      console.log('Starting save process...');
      const email = getCurrentUserEmail();
      console.log('User email:', email);
      
      if (!email) {
        console.log('No user email found in localStorage');
        throw new Error('User not found. Please log in again.');
      }

      // Split the name into firstName and lastName
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Update profile on server
      const response = await updateUserProfile(email, firstName, lastName, selectedImage || undefined);

      // Update user state based on server response
      if (response && response.user) {
        const updatedName = `${response.user.firstName} ${response.user.lastName}`.trim();
        const updatedAvatar = response.user.image && response.user.image.length > 0 ? response.user.image[0] : '';
        
        // Update localStorage with server data
        const currentEmail = getCurrentUserEmail();
        if (currentEmail) {
          localStorage.setItem(`userName:${currentEmail}`, updatedName);
          if (updatedAvatar) {
            localStorage.setItem(`userAvatar:${currentEmail}`, updatedAvatar);
          } else {
            localStorage.removeItem(`userAvatar:${currentEmail}`);
          }
          // Trigger storage event for header update
          window.dispatchEvent(new StorageEvent('storage', { key: `userName:${currentEmail}` }));
          window.dispatchEvent(new StorageEvent('storage', { key: `userAvatar:${currentEmail}` }));
        }

        // Update local state with server data
        setName(updatedName);
        setAvatar(updatedAvatar);
      } else {
        // Fallback to form data if server response doesn't include user data
        const currentEmail = getCurrentUserEmail();
        if (currentEmail) {
          localStorage.setItem(`userName:${currentEmail}`, name);
          localStorage.setItem(`userAvatar:${currentEmail}`, avatar);
          localStorage.setItem("userEmail", currentEmail);
          // Trigger storage event for header update
          window.dispatchEvent(new StorageEvent('storage', { key: `userName:${currentEmail}` }));
          window.dispatchEvent(new StorageEvent('storage', { key: `userAvatar:${currentEmail}` }));
        }
      }

      // Save theme and language preferences locally
      localStorage.setItem("userTheme", theme);
      localStorage.setItem("userLang", language);

      setSelectedImage(null);
      setSuccess("Your settings have been saved locally! (Server update pending)");
      setTimeout(() => setSuccess(""), 5000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setError(error instanceof Error ? error.message : 'Failed to save settings. Please try again.');
      setTimeout(() => setError(""), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-6xl mx-auto px-2 pt-10 pb-8 flex gap-6">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col gap-1 w-52 bg-white rounded-2xl shadow border border-yellow-100 py-4 px-2 mt-2 mb-4">
          {sidebarOptions.map(opt => (
            <Link key={opt.label} href={opt.href} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-blue-900 text-sm font-medium hover:bg-blue-50 transition ${opt.current ? 'bg-blue-50 font-bold text-blue-700' : ''}`}>{opt.icon} {opt.label}</Link>
          ))}
        </aside>
        {/* Mobile sidebar toggle */}
        <button className="md:hidden fixed top-24 left-2 z-40 bg-white border border-yellow-200 rounded-full p-2 shadow" onClick={() => setSidebarOpen(v => !v)}>
          <Settings size={20} color="#F4E029" />
        </button>
        {/* Click-outside overlay for mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        {sidebarOpen && (
          <aside className="fixed top-24 left-2 z-40 bg-white rounded-2xl shadow border border-yellow-100 py-2 px-1 flex flex-col gap-1 w-36 animate-fade-in">
            {sidebarOptions.map(opt => (
              <Link key={opt.label} href={opt.href} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-blue-900 text-xs font-medium hover:bg-blue-50 transition ${opt.current ? 'bg-blue-50 font-bold text-blue-700' : ''}`}>{opt.icon} {opt.label}</Link>
            ))}
          </aside>
        )}
        {/* Main content */}
        <main className="flex-1 md:ml-56">
          <form onSubmit={handleSave}>
            <h1 className="text-2xl font-bold text-blue-900 mb-6 text-center md:text-left">Account Settings</h1>
            {success && (
              <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-800 font-semibold text-center shadow border border-green-200 animate-fade-in">
                {success}
              </div>
            )}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-800 font-semibold text-center shadow border border-red-200 animate-fade-in">
                {error}
              </div>
            )}
            {/* Settings Section */}
            <section ref={settingsRef} id="settings" className="bg-white rounded-2xl shadow p-4 border border-yellow-100 flex flex-col gap-4">
              <h2 className="text-lg font-bold text-blue-800 mb-1">Personal Details</h2>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex flex-col items-center gap-1">
                  <Image src={avatar || "/lindo.png"} alt="avatar" className="w-14 h-14 rounded-full object-cover border-2 border-yellow-400" width={56} height={56} style={{ width: 56, height: 'auto' }} />
                  <label className="text-blue-700 text-xs font-medium cursor-pointer hover:underline">
                    Change Avatar
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
                  <span className="text-xs text-gray-400">JPG, PNG, max 2MB</span>
                </div>
                <div className="flex-1 flex flex-col gap-2 w-full">
                  <label className="text-blue-900 font-medium text-xs">Full Name
                    <input type="text" className="mt-1 rounded-lg border px-2 py-1 text-blue-900 w-full text-sm" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" required />
                  </label>
                  <label className="text-blue-900 font-medium text-xs">Email
                    <input type="email" className="mt-1 rounded-lg border px-2 py-1 text-blue-900 w-full text-sm" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
                  </label>
                </div>
              </div>
            </section>
            {/* Web Display */}
            <section className="bg-white rounded-2xl shadow p-4 border border-yellow-100 flex flex-col gap-4 mt-4">
              <h2 className="text-lg font-bold text-blue-800 mb-1">Web Display</h2>
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
                <label className="flex flex-col gap-1 text-blue-900 font-medium text-xs">
                  Theme
                  <select className="rounded-lg border px-2 py-1 text-blue-900 mt-1 text-sm" value={theme} onChange={e => setTheme(e.target.value)}>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                  <span className="text-xs text-gray-400">Choose your preferred website theme.</span>
                </label>
                <label className="flex flex-col gap-1 text-blue-900 font-medium text-xs">
                  Language
                  <select className="rounded-lg border px-2 py-1 text-blue-900 mt-1 text-sm" value={language} onChange={e => setLanguage(e.target.value)}>
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="rw">Kinyarwanda</option>
                  </select>
                  <span className="text-xs text-gray-400">This will affect the language of the site.</span>
                </label>
              </div>
            </section>
            {/* Save Button */}
            <div className="flex justify-end mt-4">
              <button 
                type="submit" 
                disabled={isSaving}
                className={`rounded-full bg-blue-600 text-white font-bold py-1.5 px-6 text-base shadow transition ${
                  isSaving 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-blue-700'
                }`}
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage; 