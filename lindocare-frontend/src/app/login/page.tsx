"use client";
import React, { useState } from "react";
import { Eye, EyeOff, CheckCircle, XCircle, User, Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

const LoginPage: React.FC = () => {
  const router = useRouter();

  // Form state
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Email and password are required.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("https://lindo-project.onrender.com/user/Login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 200 && data?.user) {
        // Store user data in localStorage
        localStorage.setItem("userData", JSON.stringify(data));
        localStorage.setItem("userEmail", email);

        const name = `${data.user.firstName || ""} ${data.user.lastName || ""}`.trim() || data.user.email || email;
        localStorage.setItem(`userName:${email}`, name);

        // Store profile picture if available
        if (data.user.image) {
          localStorage.setItem(`userImage:${email}`, data.user.image);
        }

        // Store address information if available
        if (data.user.province) {
          localStorage.setItem(`userProvince:${email}`, data.user.province);
        }
        if (data.user.district) {
          localStorage.setItem(`userDistrict:${email}`, data.user.district);
        }
        if (data.user.sector) {
          localStorage.setItem(`userSector:${email}`, data.user.sector);
        }
        if (data.user.cell) {
          localStorage.setItem(`userCell:${email}`, data.user.cell);
        }
        if (data.user.village) {
          localStorage.setItem(`userVillage:${email}`, data.user.village);
        }

        // Trigger updates in other tabs/components
        try {
          window.dispatchEvent(new StorageEvent("storage", { key: "userEmail" }));
        } catch (e) {
          localStorage.setItem("userEmail", email);
        }

        setSuccess("Login successful! Redirecting...");
        setEmail("");
        setPassword("");

        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else if (res.status === 401) {
        setError("Invalid email or password");
      } else if (res.status === 404) {
        setError("User not found");
      } else {
        setError(data?.message || "Server error. Please try again later.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <User size={32} className="text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
            </div>
            <p className="text-gray-600">Sign in to your Lindo account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
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
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
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
              className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Signing In...
                </>
              ) : (
                <>
                  <User size={20} />
                  Sign In
                </>
              )}
            </button>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/register")}
                  className="text-blue-600 hover:text-blue-700 font-semibold underline"
                >
                  Create Account
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
