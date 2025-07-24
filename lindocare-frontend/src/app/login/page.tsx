"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { Eye, EyeOff, CheckCircle, XCircle, UserPlus, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const LoginPage: React.FC = () => {
  const router = useRouter();
  // Create Account state
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerShowPassword, setRegisterShowPassword] = useState(false);
  const [registerKeepSignedIn, setRegisterKeepSignedIn] = useState(true);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");

  // Sign In state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginShowPassword, setLoginShowPassword] = useState(false);
  const [loginKeepSignedIn, setLoginKeepSignedIn] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState("");

  // Register handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterLoading(true);
    if (!registerEmail || !registerPassword) {
      setRegisterError("Email and password are required.");
      setRegisterLoading(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append('email', registerEmail);
      formData.append('password', registerPassword);
      formData.append('role', 'vendor');
      const res = await fetch('https://lindo-project.onrender.com/user/Register', {
        method: 'POST',
        body: formData,
      });
      if (res.status === 201) {
        setRegisterSuccess("Registration successful!");
        setRegisterEmail("");
        setRegisterPassword("");
        setTimeout(() => setRegisterSuccess(""), 1500);
      } else if (res.status === 400) {
        setRegisterError("Email already exists");
      } else {
        setRegisterError("Server error. Please try again later.");
      }
    } catch {
      setRegisterError("Network error. Please try again.");
    } finally {
      setRegisterLoading(false);
    }
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    if (!loginEmail || !loginPassword) {
      setLoginError("Email and password are required.");
      setLoginLoading(false);
      return;
    }
    try {
      const res = await fetch('https://lindo-project.onrender.com/user/Login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      if (res.status === 200) {
        // Save email in localStorage
        localStorage.setItem('userEmail', loginEmail);
        // Try to fetch user profile for name
        let name = '';
        try {
          const profileRes = await fetch(`https://lindo-project.onrender.com/user/getUserByEmail/${encodeURIComponent(loginEmail)}`);
          if (profileRes.ok) {
            const userData = await profileRes.json();
            name = userData?.name || userData?.fullName || userData?.email || loginEmail;
          } else {
            name = loginEmail;
          }
        } catch {
          name = loginEmail;
        }
        localStorage.setItem(`userName:${loginEmail}`, name);
        // Dispatch storage event so header updates in same tab
        window.dispatchEvent(new StorageEvent('storage', { key: 'userEmail' }));
        setLoginSuccess('Login successful!');
        setLoginEmail("");
        setLoginPassword("");
        setTimeout(() => {
          setLoginSuccess("");
          router.push('/');
        }, 800);
      } else if (res.status === 401) {
        setLoginError('Invalid credentials');
      } else if (res.status === 404) {
        setLoginError('User not found');
      } else {
        setLoginError('Server error. Please try again later.');
      }
    } catch {
      setLoginError('Network error. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-2">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl p-8 mx-4 flex flex-col items-center border border-yellow-200" style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)' }}>
        <Image src="/lindo.png" alt="Lindo Logo" width={90} height={36} className="mb-2" style={{ width: 'auto', height: 'auto' }} />
        <div className="w-full flex flex-col md:flex-row gap-8 mt-4">
          {/* Create Account */}
          <form onSubmit={handleRegister} className="flex-1 flex flex-col gap-4 border-r border-gray-200 pr-0 md:pr-8">
            <div className="flex items-center gap-2 mb-2">
              <UserPlus size={22} className="text-blue-700" />
              <span className="text-lg font-bold text-gray-800">Create Account</span>
            </div>
            <input
              type="email"
              placeholder="Email"
              value={registerEmail}
              onChange={e => setRegisterEmail(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-200 text-black placeholder-gray-400"
              required
            />
            <div className="relative">
              <input
                type={registerShowPassword ? "text" : "password"}
                placeholder="Password"
                value={registerPassword}
                onChange={e => setRegisterPassword(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-base w-full focus:outline-none focus:ring-2 focus:ring-blue-200 text-black placeholder-gray-400"
                required
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                onClick={() => setRegisterShowPassword(v => !v)}
                tabIndex={-1}
              >
                {registerShowPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <label className="flex items-center gap-2 text-xs text-gray-700">
              <input type="checkbox" checked={registerKeepSignedIn} onChange={e => setRegisterKeepSignedIn(e.target.checked)} className="accent-blue-600" />
              Keep me signed in. <span className="text-gray-400" title="Stay signed in for faster checkout.">i</span>
            </label>
            {registerError && <div className="text-red-600 text-xs font-semibold mt-1">{registerError}</div>}
            {registerSuccess && <div className="text-green-600 text-xs font-semibold mt-1">{registerSuccess}</div>}
            <button
              type="submit"
              className="w-full rounded-full border-2 border-black text-black font-bold py-2 text-base mt-2 flex items-center justify-center gap-2 hover:bg-gray-50 transition"
              disabled={registerLoading}
            >
              <UserPlus size={18} /> Create Account
            </button>
            <div className="text-xs text-gray-500 text-center mt-2">
              By creating an account, you agree to our{' '}
              <Link href="/terms-of-use" className="underline hover:text-blue-700">Terms & Conditions</Link> and{' '}
              <Link href="/privacy-policy" className="underline hover:text-blue-700">Privacy Policy</Link>.
            </div>
          </form>
          {/* Sign In */}
          <form onSubmit={handleLogin} className="flex-1 flex flex-col gap-4 pl-0 md:pl-8">
            <div className="flex items-center gap-2 mb-2">
              <User size={22} className="text-blue-700" />
              <span className="text-lg font-bold text-gray-800">Sign In</span>
            </div>
            <input
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-200 text-black placeholder-gray-400"
              required
            />
            <div className="relative">
              <input
                type={loginShowPassword ? "text" : "password"}
                placeholder="Password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-base w-full focus:outline-none focus:ring-2 focus:ring-blue-200 text-black placeholder-gray-400"
                required
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                onClick={() => setLoginShowPassword(v => !v)}
                tabIndex={-1}
              >
                {loginShowPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <label className="flex items-center gap-2 text-xs text-gray-700">
              <input type="checkbox" checked={loginKeepSignedIn} onChange={e => setLoginKeepSignedIn(e.target.checked)} className="accent-blue-600" />
              Keep me signed in. <span className="text-gray-400" title="Stay signed in for faster checkout.">i</span>
            </label>
            {loginError && <div className="text-red-600 text-xs font-semibold mt-1">{loginError}</div>}
            {loginSuccess && <div className="text-green-600 text-xs font-semibold mt-1">{loginSuccess}</div>}
            <button
              type="submit"
              className="w-full rounded-full bg-teal-600 text-white font-bold py-2 text-base mt-2 flex items-center justify-center gap-2 hover:bg-teal-700 transition"
              disabled={loginLoading}
            >
              <User size={18} /> Sign In
            </button>
            <Link href="/forgot-password" className="text-xs text-blue-700 hover:underline text-center mt-2">Forgot your password?</Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 