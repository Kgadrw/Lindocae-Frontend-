"use client";
import React, { useState } from "react";
import { Eye, EyeOff, CheckCircle, XCircle, Upload, User, MapPin, Phone, Mail, Lock, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

const RegisterPage: React.FC = () => {
  const router = useRouter();

  // Form state
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Address state
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [selectedCell, setSelectedCell] = useState<string>("");
  const [selectedVillage, setSelectedVillage] = useState<string>("");
  const [street, setStreet] = useState<string>("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!firstName || !lastName || !email || !password || !gender || !customerPhone) {
      setError("All required fields must be filled.");
      setLoading(false);
      return;
    }

    if (!selectedProvince || !selectedDistrict || !selectedSector || !selectedCell || !selectedVillage) {
      setError("Please complete your address information.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("gender", gender);
      formData.append("customerPhone", customerPhone);
      formData.append("role", "user");
      formData.append("province", selectedProvince);
      formData.append("district", selectedDistrict);
      formData.append("sector", selectedSector);
      formData.append("cell", selectedCell);
      formData.append("village", selectedVillage);
      formData.append("street", street);
      
      if (image) {
        formData.append("image", image);
      }

      const res = await fetch("https://lindo-project.onrender.com/user/register", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 201 && data?.user) {
        setSuccess("Registration successful! Redirecting to login...");
        
        // Save address information to localStorage for future use
        if (data.user.email) {
          localStorage.setItem(`userProvince:${data.user.email}`, selectedProvince);
          localStorage.setItem(`userDistrict:${data.user.email}`, selectedDistrict);
          localStorage.setItem(`userSector:${data.user.email}`, selectedSector);
          localStorage.setItem(`userCell:${data.user.email}`, selectedCell);
          localStorage.setItem(`userVillage:${data.user.email}`, selectedVillage);
        }
        
        // Clear form
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setGender("");
        setCustomerPhone("");
        setImage(null);
        setSelectedProvince("");
        setSelectedDistrict("");
        setSelectedSector("");
        setSelectedCell("");
        setSelectedVillage("");

        // Redirect to login after success
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else if (res.status === 400) {
        setError(data?.message || "Email already exists or invalid data");
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
      <div className="w-full max-w-6xl">
        <div className="bg-white rounded-2xl shadow-xl p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <UserPlus size={32} className="text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
            </div>
            <p className="text-gray-900">Join Lindo for the best baby care experience</p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-6">
            {/* Personal Information and Address Information Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="bg-blue-50 p-8 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 mb-4">
                  <User size={20} className="text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your first name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your last name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Gender *
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="+250 123 456 789"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-purple-50 p-8 rounded-xl border border-purple-200">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin size={20} className="text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Address Information</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Province *
                    </label>
                    <input
                      type="text"
                      value={selectedProvince}
                      onChange={(e) => setSelectedProvince(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter your province"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      District *
                    </label>
                    <input
                      type="text"
                      value={selectedDistrict}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter your district"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Sector *
                    </label>
                    <input
                      type="text"
                      value={selectedSector}
                      onChange={(e) => setSelectedSector(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter your sector"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Cell *
                    </label>
                    <input
                      type="text"
                      value={selectedCell}
                      onChange={(e) => setSelectedCell(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter your cell"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Village *
                    </label>
                    <input
                      type="text"
                      value={selectedVillage}
                      onChange={(e) => setSelectedVillage(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter your village"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Street Address */}
            <div className="bg-blue-50 p-8 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={20} className="text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Street Address</h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your street address (e.g., KG 123 St)"
                  />
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-green-50 p-8 rounded-xl border border-green-200">
              <div className="flex items-center gap-2 mb-4">
                <Mail size={20} className="text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Create a strong password"
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

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Profile Picture (Optional)
                  </label>
                  <label className="flex items-center gap-3 w-full border-2 border-dashed border-gray-300 rounded-lg px-4 py-3 cursor-pointer hover:border-gray-400 transition-colors">
                    <Upload size={20} className="text-gray-500" />
                    <span className="text-gray-600">
                      {image ? image.name : "Click to upload profile picture"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImage(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>


            {/* Error and Success Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <XCircle size={20} className="text-red-500" />
                <span className="text-red-900 font-medium">{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle size={20} className="text-green-500" />
                <span className="text-green-900 font-medium">{success}</span>
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
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Create Account
                </>
              )}
            </button>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-gray-900">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="text-blue-600 hover:text-blue-700 font-semibold underline"
                >
                  Sign In
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
