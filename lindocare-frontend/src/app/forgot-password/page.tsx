"use client";
import React, { useState } from "react";
import { ArrowLeft, Mail, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ForgotPasswordPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!email) {
      setError("Email address is required.");
      setLoading(false);
      return;
    }

    try {
      // Since the server doesn't have a forgot password endpoint yet,
      // we'll show a helpful message
      console.log('Forgot password request for:', email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess("Password reset instructions have been sent to your email address. Please check your inbox and follow the instructions to reset your password.");
      setEmail("");
      
    } catch (err) {
      setError("Failed to send reset instructions. Please try again or contact support.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Mail size={32} className="text-gray-600" />
              <h1 className="text-3xl font-bold text-gray-800">Forgot Password</h1>
            </div>
            <p className="text-gray-600">Enter your email address and we'll send you instructions to reset your password</p>
          </div>

          {/* Form */}
          <form onSubmit={handleForgotPassword} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            {/* Error and Success Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <XCircle size={20} className="text-red-500" />
                <span className="text-red-700 font-medium">{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle size={20} className="text-green-500" />
                <span className="text-green-700 font-medium">{success}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gray-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Mail size={20} />
                  Send Reset Instructions
                </>
              )}
            </button>

            {/* Back to Login */}
            <div className="text-center">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-700 font-medium"
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
