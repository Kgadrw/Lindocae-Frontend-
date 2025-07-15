"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { X, ChevronDown, Eye, EyeOff, Upload, CheckCircle } from 'lucide-react';

// SVG for the modern Twitter (X) icon
const TwitterXIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 32 32" fill="none" width={28} height={28} {...props}>
    <rect width="32" height="32" rx="16" fill="#000" />
    <path d="M21.5 10.5L10.5 21.5M10.5 10.5L21.5 21.5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onLoginSuccess?: (name: string, avatar?: string, email?: string) => void;
  message?: string;
}

const LoginModal: React.FC<LoginModalProps> = ({ open, onClose, onLoginSuccess, message }) => {
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
  const [icons, setIcons] = useState<any[]>([]);
  const [iconsLoading, setIconsLoading] = useState(true);
  const [iconsError, setIconsError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

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
    setTimeout(async () => {
      setLoading(false);
      setSuccess('Login successful!');
      setTimeout(async () => {
        setSuccess('');
        let avatar = '';
        if (email) avatar = await getGravatarUrl(email);
        if (onLoginSuccess) onLoginSuccess(email.split('@')[0], avatar, email);
        onClose();
      }, 1200);
    }, 1000);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!firstName || !lastName || !email || !gender || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('email', email);
      formData.append('gender', gender);
      formData.append('password', password);
      formData.append('role', 'vendor');
      const res = await fetch("https://lindo-project.onrender.co/user/Register", {
        method: "POST",
        body: formData,
      });
      if (res.status === 201) {
        setLoading(false);
        setFirstName(""); setLastName(""); setGender(""); setEmail(""); setPassword(""); setConfirmPassword("");
        setSuccess("Registration successful!");
        const avatar = await getGravatarUrl(email);
        setTimeout(() => {
          setSuccess("");
          if (onLoginSuccess) onLoginSuccess(firstName, avatar, email);
          onClose();
        }, 1200);
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
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-full flex justify-center z-50">
            <div className="flex items-center gap-2 bg-white border-2 border-green-400 shadow-lg rounded-full px-6 py-3 animate-fade-in">
              <CheckCircle size={28} className="text-green-500" />
              <span className="text-green-700 font-bold text-lg">{success}</span>
            </div>
          </div>
        )}
        <Image src="/lindo.png" alt="Lindo Logo" width={90} height={36} className="mb-2" style={{ width: 90, height: 'auto' }} />
        <h2 className="text-xl font-bold text-gray-700 mb-4">{isRegister ? 'Register' : 'Register/Sign in'}</h2>
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
                <label className="block mb-0.5 text-blue-700 font-medium text-sm">Gender</label>
                <select
                  name="gender"
                  value={gender}
                  onChange={e => setGender(e.target.value)}
                  className="w-full border border-blue-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm text-blue-900 placeholder:text-blue-400"
                  required
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
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
        {error && <div className="text-red-500 text-sm mb-2 text-center">{error}</div>}
        <div className="flex items-center gap-2 mb-2 text-gray-600 text-sm">
          <span>Location:</span>
          <span className="font-semibold">Rwanda</span>
          <ChevronDown size={16} />
        </div>
        <button
          className="text-blue-700 font-semibold underline underline-offset-2"
          onClick={() => setIsRegister((v) => !v)}
        >
          {isRegister ? 'Back to Sign in' : 'Register'}
        </button>
      </div>
    </div>
  );
};

export default LoginModal; 