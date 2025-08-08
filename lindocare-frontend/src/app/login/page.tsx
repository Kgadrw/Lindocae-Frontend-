"use client";
import React, { useState, useEffect } from 'react';
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

    const data = await res.json(); // <-- parse the JSON here

    if (res.status === 200 && data?.user) {
      // Save token in localStorage
      localStorage.setItem('userData', JSON.stringify(data));
      // if (token) {
      //   localStorage.setItem('accessToken', token);
      // }

      // Save email
      localStorage.setItem('userEmail', loginEmail);

      // Save full name (if available)
      const name = `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim() 
                    || data.user.email 
                    || loginEmail;
      localStorage.setItem(`userName:${loginEmail}`, name);

      // Dispatch event so UI updates
      window.dispatchEvent(new StorageEvent('storage', { key: 'userEmail' }));

      setLoginSuccess('Login successful!');
      setLoginEmail("");
      setLoginPassword("");

      setTimeout(() => {
        setLoginSuccess("");
        router.push('/');
      }, 800);
    } 
    else if (res.status === 401) {
      setLoginError('Invalid credentials');
    } 
    else if (res.status === 404) {
      setLoginError('User not found');
    } 
    else {
      setLoginError(data?.message || 'Server error. Please try again later.');
    }
  } catch {
    setLoginError('Network error. Please try again.');
  } finally {
    setLoginLoading(false);
  }
};


  // Handle Google OAuth callback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const googleEmail = params.get('email');
      const googleUserId = params.get('user');
      const loginValue = googleEmail || googleUserId;
      if (loginValue) {
        localStorage.setItem('userEmail', loginValue);
        // Optionally set userName and avatar if available
        localStorage.setItem(`userName:${loginValue}`, loginValue.includes('@') ? loginValue.split('@')[0] : loginValue);
        window.dispatchEvent(new StorageEvent('storage', { key: 'userEmail' }));
        window.location.replace('/'); // Force full reload so header updates
      }
    }
  }, []);

  const [activeTab, setActiveTab] = useState('login');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-2">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-8 mx-4 flex flex-col items-center border border-yellow-200" style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)' }}>
        
        {/* Tab Navigation */}
        <div className="w-full max-w-2xl mb-6">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-3 px-4 rounded-md font-semibold text-sm transition-all ${
                activeTab === 'login' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <User size={16} className="inline mr-2" />
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-3 px-4 rounded-md font-semibold text-sm transition-all ${
                activeTab === 'register' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <UserPlus size={16} className="inline mr-2" />
              Create Account
            </button>
          </div>
        </div>

        <div className="w-full max-w-md">
          {/* Create Account Form */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <UserPlus size={24} className="text-green-600" />
                  <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
                </div>
                <p className="text-gray-600 text-sm">Join Lindo for the best baby care experience</p>
              </div>
              
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Email address"
                  value={registerEmail}
                  onChange={e => setRegisterEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black placeholder-gray-400"
                  required
                />
                <div className="relative">
                  <input
                    type={registerShowPassword ? "text" : "password"}
                    placeholder="Create password"
                    value={registerPassword}
                    onChange={e => setRegisterPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black placeholder-gray-400"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setRegisterShowPassword(v => !v)}
                    tabIndex={-1}
                  >
                    {registerShowPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input 
                    type="checkbox" 
                    checked={registerKeepSignedIn} 
                    onChange={e => setRegisterKeepSignedIn(e.target.checked)} 
                    className="accent-green-600" 
                  />
                  Keep me signed in
                </label>
                
                {registerError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <XCircle size={16} className="text-red-500" />
                      <span className="text-red-700 text-sm font-medium">{registerError}</span>
                    </div>
                  </div>
                )}
                
                {registerSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-500" />
                      <span className="text-green-700 text-sm font-medium">{registerSuccess}</span>
                    </div>
                  </div>
                )}
                
                <button
                  type="submit"
                  className="w-full rounded-lg bg-green-600 text-white font-semibold py-3 text-base flex items-center justify-center gap-2 hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={registerLoading}
                >
                  {registerLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <UserPlus size={20} /> Create Account
                    </>
                  )}
                </button>
              </div>
              
              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="mx-3 text-gray-400 text-sm">or</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>
              
              <button
                type="button"
                onClick={() => window.location.href = 'https://lindo-project.onrender.com/auth/google'}
                className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium py-3 text-base shadow-sm hover:bg-gray-50 transition"
              >
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google" width={20} height={20} />
                Continue with Google
              </button>
              
              <div className="text-xs text-gray-500 text-center mt-4">
                By creating an account, you agree to our{' '}
                <Link href="/terms-of-use" className="text-green-600 hover:underline">Terms & Conditions</Link> and{' '}
                <Link href="/privacy-policy" className="text-green-600 hover:underline">Privacy Policy</Link>.
              </div>
            </form>
          )}

          {/* Sign In Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <User size={24} className="text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
                </div>
                <p className="text-gray-600 text-sm">Sign in to your Lindo account</p>
              </div>
              
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Email address"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-400"
                  required
                />
                <div className="relative">
                  <input
                    type={loginShowPassword ? "text" : "password"}
                    placeholder="Password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black placeholder-gray-400"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setLoginShowPassword(v => !v)}
                    tabIndex={-1}
                  >
                    {loginShowPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input 
                      type="checkbox" 
                      checked={loginKeepSignedIn} 
                      onChange={e => setLoginKeepSignedIn(e.target.checked)} 
                      className="accent-blue-600" 
                    />
                    Keep me signed in
                  </label>
                  <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                
                {loginError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <XCircle size={16} className="text-red-500" />
                      <span className="text-red-700 text-sm font-medium">{loginError}</span>
                    </div>
                  </div>
                )}
                
                {loginSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-500" />
                      <span className="text-green-700 text-sm font-medium">{loginSuccess}</span>
                    </div>
                  </div>
                )}
                
                <button
                  type="submit"
                  className="w-full rounded-lg bg-blue-600 text-white font-semibold py-3 text-base flex items-center justify-center gap-2 hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loginLoading}
                >
                  {loginLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Signing In...
                    </>
                  ) : (
                    <>
                      <User size={20} /> Sign In
                    </>
                  )}
                </button>
              </div>
              
              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="mx-3 text-gray-400 text-sm">or</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>
              
              <button
                type="button"
                onClick={() => window.location.href = 'https://lindo-project.onrender.com/auth/google'}
                className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium py-3 text-base shadow-sm hover:bg-gray-50 transition"
              >
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google" width={20} height={20} />
                Continue with Google
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 