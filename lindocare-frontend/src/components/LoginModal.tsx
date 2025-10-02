"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { X, ChevronDown, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onLoginSuccess?: (name: string, avatar?: string, email?: string) => void;
  message?: string;
  mode?: 'login' | 'register';
}

const LoginModal: React.FC<LoginModalProps> = ({ open, onClose, onLoginSuccess, message, mode }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  React.useEffect(() => {
    if (open) {
      setIsRegister(mode === 'register');
    }
  }, [open, mode]);

  // Async Gravatar URL generator
  async function getGravatarUrl(email: string) {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const msgUint8 = new TextEncoder().encode(email.trim().toLowerCase());
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return `https://www.gravatar.com/avatar/${hashHex}?d=identicon`;
    }
    return 'https://www.gravatar.com/avatar/?d=identicon';
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('https://lindo-project.onrender.com/user/Login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.status === 200) {
        const data = await res.json();
        setSuccess('Login successful!');
        // Store user/token if needed
        if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
        if (data.tokens?.accessToken) localStorage.setItem('accessToken', data.tokens.accessToken);
        setTimeout(async () => {
          setSuccess('');
          let avatar = '';
          if (email) avatar = await getGravatarUrl(email);
          if (onLoginSuccess) onLoginSuccess(email.split('@')[0], avatar, email);
          onClose();
        }, 1200);
      } else if (res.status === 401) {
        setError('Invalid credentials');
      } else if (res.status === 404) {
        setError('User not found');
      } else {
        setError('Server error. Please try again later.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('email', email);
      formData.append('gender', 'not_specified'); // Default value
      formData.append('password', password);
      formData.append('role', 'customer'); // Changed from vendor to customer
      // Optionally: formData.append('image', file);
      const res = await fetch('https://lindo-project.onrender.com/user/Register', {
        method: 'POST',
        body: formData,
      });
      if (res.status === 201) {
        setLoading(false);
        setFirstName(""); setLastName(""); setEmail(""); setPassword(""); setConfirmPassword("");
        setSuccess("Registration successful! You can now complete your order.");
        const avatar = await getGravatarUrl(email);
        setTimeout(() => {
          setSuccess("");
          if (onLoginSuccess) onLoginSuccess(firstName, avatar, email);
          onClose();
        }, 1500);
      } else if (res.status === 400) {
        setError("Email already exists");
        setLoading(false);
      } else {
        setError("Server error. Please try again later.");
        setLoading(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  // Add Google login handler
  const handleGoogleLogin = () => {
    window.location.href = 'https://lindo-project.onrender.com/auth/google';
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4 flex flex-col items-center border border-yellow-200" style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)' }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
          <X size={24} />
        </button>
        {message && (
          <div className="w-full mb-4 p-3 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-xl text-center font-semibold text-base">
            {message}
          </div>
        )}
        {success && (
          <div className="w-full flex justify-center items-center my-4 animate-fade-in">
            <div className="flex flex-col items-center gap-2 bg-white border-2 border-green-400 shadow-lg rounded-2xl px-6 py-4">
              <CheckCircle size={40} className="text-green-500 mb-1" />
              <span className="text-green-700 font-bold text-base">Success!</span>
            </div>
          </div>
        )}
        <Image src="/lindo.png" alt="Lindo Logo" width={90} height={36} className="mb-2" style={{ width: 'auto', height: 'auto' }} />
        <h2 className="text-xl font-bold text-gray-700 mb-4">{isRegister ? 'Quick Registration' : 'Register/Sign in'}</h2>
        {isRegister && (
          <p className="text-sm text-gray-600 mb-4 text-center">
            Create your account quickly. We'll collect your delivery address during checkout.
          </p>
        )}
        <form className="w-full flex flex-col gap-4 mb-4" onSubmit={isRegister ? handleRegister : handleLogin}>
          {!isRegister && (
            <>
              <div className="mb-2">
                <label className="block mb-0.5 text-blue-700 font-medium text-sm">Email</label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-blue-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm text-blue-900 placeholder:text-blue-400"
                  required
                />
              </div>
              <div className="mb-2">
                <label className="block mb-0.5 text-blue-700 font-medium text-sm">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full border border-blue-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300 pr-8 text-sm text-blue-900 placeholder:text-blue-400"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                    onClick={() => setShowPassword(v => !v)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="w-full rounded-full bg-yellow-400 text-white font-bold py-2 text-base mt-2 shadow hover:bg-yellow-500 transition" disabled={loading}>{loading ? 'Signing in...' : 'Signin'}</button>
              <div className="flex items-center my-2">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="mx-2 text-gray-400 text-xs">or</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>
              <button type="button" onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-gray-700 font-semibold py-2 text-base shadow hover:bg-gray-50 transition">
                <Image src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google" width={24} height={24} />
                Continue with Google
              </button>
            </>
          )}
          {isRegister && (
            <>
              <div className="mb-2 flex gap-2">
                <div className="flex-1">
                  <label className="block mb-0.5 text-blue-700 font-medium text-sm">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="w-full border border-blue-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm text-blue-900 placeholder:text-blue-400"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-0.5 text-blue-700 font-medium text-sm">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="w-full border border-blue-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm text-blue-900 placeholder:text-blue-400"
                    required
                  />
                </div>
              </div>
              <div className="mb-2">
                <label className="block mb-0.5 text-blue-700 font-medium text-sm">Email</label>
            <input
              type="email"
                  name="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
                  className="w-full border border-blue-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm text-blue-900 placeholder:text-blue-400"
                  required
            />
          </div>
              <div className="mb-2">
                <label className="block mb-0.5 text-blue-700 font-medium text-sm">Password</label>
                <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
                    name="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
                    className="w-full border border-blue-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300 pr-8 text-sm text-blue-900 placeholder:text-blue-400"
                    required
            />
            <button
              type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
              onClick={() => setShowPassword(v => !v)}
              tabIndex={-1}
            >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
              </div>
              <div className="mb-2">
                <label className="block mb-0.5 text-blue-700 font-medium text-sm">Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full border border-blue-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm text-blue-900 placeholder:text-blue-400"
                  required
                />
                {confirmPassword && password !== confirmPassword && (
                  <div className="text-red-500 text-xs mt-0.5">Passwords do not match</div>
                )}
              </div>
            </>
          )}
        </form>
        {error && (
          <div className="w-full flex justify-center items-center my-4 animate-fade-in">
            <div className="flex flex-col items-center gap-2 bg-white border-2 border-red-400 shadow-lg rounded-2xl px-6 py-4">
              <XCircle size={40} className="text-red-500 mb-1" />
              <span className="text-red-700 font-bold text-base">{error}</span>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 mb-2 text-gray-600 text-sm">
          <span>Location:</span>
          <span className="font-semibold">Rwanda</span>
          <ChevronDown size={16} />
        </div>
        <div className="w-full flex flex-col items-center gap-2 mt-2">
          <button
            type="button"
            className="text-blue-600 hover:underline text-sm font-semibold"
            onClick={() => setIsRegister(v => !v)}
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal; 