"use client";
import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import { ArrowLeft, Mail, Eye, EyeOff, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const ForgotPasswordContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  // Forgot password state
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Reset password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  // Handle forgot password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    if (!email) {
      setError("Email is required.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('https://lindo-project.onrender.com/reset/forgot-password', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (res.status === 200) {
        setSuccess("Reset link sent to your email.");
        setEmail("");
        setTimeout(() => setSuccess(""), 3000);
      } else if (res.status === 404) {
        setError("User not found with this email address.");
      } else {
        setError("Server error. Please try again later.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setResetLoading(true);

    if (!newPassword || !confirmPassword) {
      setResetError("Both password fields are required.");
      setResetLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError("Passwords do not match.");
      setResetLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setResetError("Password must be at least 6 characters long.");
      setResetLoading(false);
      return;
    }

    try {
      const res = await fetch(`https://lindo-project.onrender.com/reset/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
      });

      if (res.status === 200) {
        setResetSuccess("Password reset successful! Redirecting to login...");
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setResetError("Invalid or expired reset token. Please request a new reset link.");
      }
    } catch {
      setResetError("Network error. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  // If token is present, show reset password form
  if (token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-2">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 mx-4 flex flex-col items-center border border-yellow-200">
          <Image src="/lindo.png" alt="Lindo Logo" width={90} height={36} className="mb-6" style={{ width: 'auto', height: 'auto' }} />
          
          <div className="w-full">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle size={22} className="text-blue-700" />
              <span className="text-lg font-bold text-gray-800">Reset Password</span>
            </div>

            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 text-base w-full focus:outline-none focus:ring-2 focus:ring-blue-200 text-black placeholder-gray-400"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 text-base w-full focus:outline-none focus:ring-2 focus:ring-blue-200 text-black placeholder-gray-400"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setShowConfirmPassword(v => !v)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {resetError && <div className="text-red-600 text-xs font-semibold">{resetError}</div>}
              {resetSuccess && <div className="text-green-600 text-xs font-semibold">{resetSuccess}</div>}

              <button
                type="submit"
                className="w-full rounded-full bg-blue-600 text-white font-bold py-2 text-base mt-2 flex items-center justify-center gap-2 hover:bg-blue-700 transition"
                disabled={resetLoading}
              >
                {resetLoading ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            <Link href="/login" className="flex items-center gap-2 text-xs text-blue-700 hover:underline mt-4 justify-center">
              <ArrowLeft size={14} />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show forgot password form
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-2">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 mx-4 flex flex-col items-center border border-yellow-200">
        <Image src="/lindo.png" alt="Lindo Logo" width={90} height={36} className="mb-6" style={{ width: 'auto', height: 'auto' }} />
        
        <div className="w-full">
          <div className="flex items-center gap-2 mb-6">
            <Mail size={22} className="text-blue-700" />
            <span className="text-lg font-bold text-gray-800">Forgot Password</span>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-200 text-black placeholder-gray-400"
              required
            />

            {error && <div className="text-red-600 text-xs font-semibold">{error}</div>}
            {success && <div className="text-green-600 text-xs font-semibold">{success}</div>}

            <button
              type="submit"
              className="w-full rounded-full bg-blue-600 text-white font-bold py-2 text-base mt-2 flex items-center justify-center gap-2 hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <Link href="/login" className="flex items-center gap-2 text-xs text-blue-700 hover:underline mt-4 justify-center">
            <ArrowLeft size={14} />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

const ForgotPasswordPage: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
};

export default ForgotPasswordPage; 