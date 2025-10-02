"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addToCartServer,
  clearCartServer,
  fetchUserCart,
  fetchUserCartWithProducts,
  getAuthToken,
  getLocalCart,
  isUserLoggedIn,
  saveLocalCart,
} from "../../utils/serverStorage";
import { normalizeImageUrl } from "../../utils/image";
import AddressSelector, { AddressData } from "../../components/ui/AddressSelector";
import { getUserInfo } from "../../utils/userInfo";

interface Product {
  id: string | number;
  name: string;
  price: number;
  image: string | string[];
  quantity?: number;
}

// Helper to format RWF with thousands separator
function formatRWF(amount: number | undefined | null) {
  if (amount === undefined || amount === null) return "0";
  return amount.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState<Product[]>([]);
  // Single payment method - no selection needed
  const paymentMethod = "momo";

  // Address data using the new structure
  const [addressData, setAddressData] = useState<AddressData>({
    province: '',
    district: '',
    sector: '',
    cell: '',
    village: '',
    street: ''
  });

  // Customer info
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  
  // Form validation errors
  const [addressErrors, setAddressErrors] = useState<Partial<Record<keyof AddressData, string>>>({});
  const [customerErrors, setCustomerErrors] = useState<{name?: string, email?: string, phone?: string}>({});
  const [orderStatus, setOrderStatus] = useState<{ success?: string; error?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(true);
  const router = useRouter();

  // Load user information automatically if logged in
  useEffect(() => {
    async function loadUserInfo() {
      if (isUserLoggedIn()) {
        try {
          const userInfo = await getUserInfo();
          if (userInfo) {
            console.log('Auto-populated user info:', userInfo);
            // Auto-populate name and email fields
            if (userInfo.fullName) {
              setCustomerName(userInfo.fullName);
            }
            if (userInfo.email) {
              setCustomerEmail(userInfo.email);
            }
            if (userInfo.phone) {
              setCustomerPhone(userInfo.phone);
            }
          }

          // Try to fetch user address information
          try {
            const token = getAuthToken();
            if (token) {
              const addressResponse = await fetch(
                "https://lindo-project.onrender.com/user/address",
                {
                  method: "GET",
                  headers: {
                    'accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                  },
                }
              );

              if (addressResponse.ok) {
                const addressData = await addressResponse.json();
                console.log('Fetched user address:', addressData);
                
                // Pre-populate address if available
                if (addressData.address) {
                  setAddressData({
                    province: addressData.address.province || '',
                    district: addressData.address.district || '',
                    sector: addressData.address.sector || '',
                    cell: addressData.address.cell || '',
                    village: addressData.address.village || '',
                    street: addressData.address.street || ''
                  });
                }
              }
            }
          } catch (addressError) {
            console.log('No saved address found or error fetching address:', addressError);
            // This is not critical, user can still enter address manually
          }
        } catch (error) {
          console.error('Error loading user info:', error);
        }
      }
      setIsLoadingUserInfo(false);
    }

    loadUserInfo();
  }, []);

  // Load cart
  useEffect(() => {
    async function loadCart() {
      try {
        if (isUserLoggedIn()) {
          // User is logged in, fetch from server
          console.log("Checkout: User logged in, fetching cart from server...");

          let serverCart;
          try {
            serverCart = await fetchUserCartWithProducts();
            console.log("Checkout: Server cart with products fetched successfully:", serverCart);
          } catch (productsError) {
            console.warn("Checkout: Failed to fetch cart with products, falling back to basic cart:", productsError);
            serverCart = await fetchUserCart();
            console.log("Checkout: Basic server cart fetched as fallback:", serverCart);
          }

          if (serverCart && serverCart.length > 0) {
            const convertedCart = serverCart.map((item: any) => ({
              id:
                typeof item.productId === "object"
                  ? (item.productId as any)._id ||
                    (item.productId as any).id ||
                    String(item.productId)
                  : String(item.productId),
              name: item.name || "Product",
              price: item.price || 0,
              image: item.image || "/lindo.png",
              quantity: item.quantity || 1,
            }));
            setCartItems(convertedCart);
            console.log("Checkout: Cart items set from server:", convertedCart);
          } else {
            setCartItems([]);
            console.log("Checkout: Server cart is empty");
          }
        } else {
          // Guest: load from localStorage
          console.log("Checkout: User not logged in, loading cart from localStorage...");
          const localCart = getLocalCart();
          const convertedCart = localCart.map((item: any) => ({
            id:
              typeof item.productId === "object"
                ? (item.productId as any)._id ||
                  (item.productId as any).id ||
                  String(item.productId)
                : String(item.productId),
            name: item.name || "Product",
            price: item.price || 0,
            image: item.image || "/lindo.png",
            quantity: item.quantity || 1,
          }));
          setCartItems(convertedCart);
          console.log("Checkout: Cart items set from localStorage:", convertedCart);
        }
      } catch (err) {
        console.error("Error loading cart for checkout:", err);

        if (isUserLoggedIn()) {
          console.log("Checkout: Server fetch failed, trying localStorage fallback...");
          try {
            const localCart = getLocalCart();
            const convertedCart = localCart.map((item: any) => ({
              id:
                typeof item.productId === "object"
                  ? (item.productId as any)._id ||
                    (item.productId as any).id ||
                    String(item.productId)
                  : String(item.productId),
              name: item.name || "Product",
              price: item.price || 0,
              image: item.image || "/lindo.png",
              quantity: item.quantity || 1,
            }));
            setCartItems(convertedCart);
            console.log("Checkout: Fallback to localStorage successful:", convertedCart);
          } catch (localError) {
            console.error("Checkout: Both server and localStorage failed:", localError);
            setCartItems([]);
          }
        } else {
          setCartItems([]);
        }
      } finally {
        setIsLoadingCart(false);
      }
    }

    loadCart();
  }, []);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  // Validation functions
  const validateCustomerInfo = () => {
    const errors: {name?: string, email?: string, phone?: string} = {};
    
    // Validate phone number (required for all users)
    if (!customerPhone.trim()) errors.phone = "Phone number is required";
    
    // For guest users, ensure name and email are present
    if (!isUserLoggedIn()) {
      if (!customerName.trim()) errors.name = "Name is required";
      if (!customerEmail.trim()) errors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(customerEmail)) errors.email = "Invalid email format";
    }
    
    setCustomerErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateAddress = () => {
    const newAddressErrors: Partial<Record<keyof AddressData, string>> = {};
    
    if (!addressData.province) newAddressErrors.province = "Province is required";
    if (!addressData.district) newAddressErrors.district = "District is required";
    if (!addressData.sector) newAddressErrors.sector = "Sector is required";
    if (!addressData.cell) newAddressErrors.cell = "Cell is required";
    if (!addressData.village) newAddressErrors.village = "Village is required";
    if (!addressData.street.trim()) newAddressErrors.street = "Street address is required";
    
    setAddressErrors(newAddressErrors);
    return Object.keys(newAddressErrors).length === 0;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderStatus({});
    setIsSubmitting(true);

    // Final validation
    if (!validateCustomerInfo() || !validateAddress()) {
      setOrderStatus({ error: "Please complete all required fields correctly." });
      setIsSubmitting(false);
      return;
    }

    try {
      // Step 1: Create Order
     const orderData = {
        paymentMethod: paymentMethod,
        shippingAddress: {
  province: addressData.province,
  district: addressData.district,
  sector: addressData.sector,
  cell: addressData.cell,
  village: addressData.village,
  street: addressData.street,
          customerName: customerName,
          customerEmail: customerEmail,
          customerPhone: customerPhone
        },
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        customerName: customerName
      };

      console.log("Creating order:", orderData);

      // Get auth token if available
      const token = getAuthToken();
      const headers: Record<string, string> = {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const orderResponse = await fetch(
        "https://lindo-project.onrender.com/orders/createOrder",
        {
          method: "POST",
          headers,
          body: JSON.stringify(orderData),
        }
      );

      console.log("Order response status:", orderResponse.status);

      if (!orderResponse.ok) {
        // Handle order creation error
        let errorData: any = {};
        let responseText = "";
        try {
          responseText = await orderResponse.text();
          if (responseText) {
            errorData = JSON.parse(responseText);
          }
        } catch (parseError) {
          errorData = { message: responseText || "Unknown error" };
        }

        console.error("Order creation error:", orderResponse.status, errorData);
        setOrderStatus({ 
          error: errorData.message || `Failed to create order (${orderResponse.status}). Please try again.`,
        });
        setIsSubmitting(false);
        return;
      }

      const orderResult = await orderResponse.json();
      console.log("Order created successfully:", orderResult);
      const orderId = orderResult.order?._id || orderResult.orderId;

      // Save address for future use (for logged-in users)
      if (isUserLoggedIn()) {
        try {
          const token = getAuthToken();
          if (token) {
            await fetch(
              "https://lindo-project.onrender.com/user/address",
              {
                method: "POST",
                headers: {
                  'accept': 'application/json',
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                  address: addressData
                }),
              }
            );
            console.log('Address saved for future use');
          }
        } catch (addressSaveError) {
          console.log('Could not save address (not critical):', addressSaveError);
        }
      }
        
        // Clear cart after successful order creation
        try {
          if (isUserLoggedIn()) await clearCartServer();
          else saveLocalCart([]);
          setCartItems([]);
      } catch (error) {
        console.warn("Failed to clear cart:", error);
      }

      // MTN Mobile Money - Simplified checkout
      setOrderStatus({ 
        success: `Order completed successfully! Order ID: ${orderId}. Your order has been processed and will be delivered to the provided address. You'll receive confirmation via email/SMS.` 
      });
      
      // Store order details for reference
      localStorage.setItem("pendingOrderId", String(orderId || ""));
      localStorage.setItem("pendingOrderAmount", String(subtotal));
      localStorage.setItem("momoCode", "*182*8*1*079559#");
      
      // Redirect to success page after a delay for MTN payments
      setTimeout(() => {
        router.push('/payment-success?method=momo&orderId=' + orderId);
      }, 3000);
    } catch (err) {
      console.error("Checkout error:", err);
      setOrderStatus({ error: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/cart')}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4 font-medium transition-colors group"
          >
            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Cart
          </button>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-8 h-8 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h1 className="text-3xl font-bold text-blue-700">Secure Checkout</h1>
            </div>
            <p className="text-gray-600">Complete your order with MTN Mobile Money payment</p>
            {!isUserLoggedIn() && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>New to Lindo?</strong> You can register quickly during checkout - we only need your name, email, and password. 
                  We'll collect your delivery address here.
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="flex flex-col lg:flex-row">
            {/* Left: Order Summary */}
            <div className="lg:w-2/5 bg-blue-50 p-6 border-r border-gray-200 lg:sticky lg:top-6 lg:self-start">
              <div className="flex items-center mb-4">
                <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <h2 className="text-xl font-bold text-blue-700">Order Summary</h2>
              </div>
              {isLoadingCart ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="animate-spin w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                  <p className="font-medium">Loading your cart...</p>
                </div>
              ) : cartItems.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-gray-300">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <div className="text-gray-500 mb-4 font-medium">Your cart is empty</div>
                  <button
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 font-semibold shadow-md"
                    onClick={() => router.push("/all-products")}
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <>
                  {/* Order Items */}
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {cartItems.map((item, idx) => (
                      <div key={`cart-${String((item as any)?.id ?? "")}-${idx}`} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                          {(() => {
                            let image = "";
                            if (Array.isArray(item.image) && item.image.length > 0) image = item.image[0];
                            else if (typeof item.image === "string") image = item.image;
                            image = normalizeImageUrl(image);

                            return image && image.trim().length > 0 ? (
                              <img src={image} alt={item.name} className="object-cover w-full h-full" />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xl">
                                📦
                              </div>
                            );
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 text-sm truncate">{item.name || "Product"}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Qty: {item.quantity || 1}</span>
                            <span className="text-xs text-gray-400">×</span>
                            <span className="text-xs text-gray-600">{formatRWF(item.price || 0)} RWF</span>
                          </div>
                        </div>
                        <div className="font-bold text-blue-600 text-sm whitespace-nowrap">
                          {formatRWF((item.price || 0) * (item.quantity || 1))} RWF
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Price Summary */}
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          Subtotal
                        </span>
                        <span className="font-semibold text-gray-700">{formatRWF(subtotal)} RWF</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                          </svg>
                          Shipping
                        </span>
                        <span className="font-semibold text-green-600 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Free
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t-2 border-blue-100 pt-3 mt-2">
                        <span className="text-gray-900">Total</span>
                        <span className="text-blue-600 text-xl">{formatRWF(subtotal)} RWF</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right: Checkout Form */}
            <div className="lg:w-3/5 p-6 bg-white">
              {cartItems.length > 0 && (
                <form onSubmit={handleCheckout} className="space-y-6">
                  {/* Customer Information */}
                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                    <h2 className="text-xl font-bold text-blue-700 mb-4 flex items-center">
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                      Customer Information
                    </h2>
                      
                      {/* Guest User Fields - Name & Email */}
                      {!isUserLoggedIn() && (
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Full Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={customerName}
                                onChange={(e) => {
                                  setCustomerName(e.target.value);
                                  if (customerErrors.name) {
                                    setCustomerErrors(prev => ({ ...prev, name: undefined }));
                                  }
                                }}
                                placeholder="John Doe"
                                className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-all duration-200 font-medium ${
                                  customerErrors.name 
                                    ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                                    : customerName.trim()
                                      ? 'border-green-400 bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100'
                                      : 'border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                                }`}
                              />
                              {customerErrors.name && (
                                <p className="mt-1 text-xs text-red-600">{customerErrors.name}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-800 mb-2">
                                Email Address <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="email"
                                value={customerEmail}
                                onChange={(e) => {
                                  setCustomerEmail(e.target.value);
                                  if (customerErrors.email) {
                                    setCustomerErrors(prev => ({ ...prev, email: undefined }));
                                  }
                                }}
                                placeholder="john@example.com"
                                className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-all duration-200 font-medium ${
                                  customerErrors.email 
                                    ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                                    : customerEmail.trim() && /\S+@\S+\.\S+/.test(customerEmail)
                                      ? 'border-green-400 bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100'
                                      : 'border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                                }`}
                              />
                              {customerErrors.email && (
                                <p className="mt-1 text-xs text-red-600">{customerErrors.email}</p>
                              )}
                          </div>
                        </div>
                      )}
                      
                    {/* Phone Number */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center">
                          <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          Phone Number <span className="text-red-500 ml-1">*</span>
                        </label>
                          <input
                            type="tel"
                            value={customerPhone}
                            onChange={(e) => {
                              setCustomerPhone(e.target.value);
                              if (customerErrors.phone) {
                                setCustomerErrors(prev => ({ ...prev, phone: undefined }));
                              }
                            }}
                            placeholder="e.g., +250788123456"
                        className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-all duration-200 ${
                              customerErrors.phone 
                                ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                                : customerPhone.trim()
                                  ? 'border-green-400 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100'
                                  : 'border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                            }`}
                          />
                          {customerErrors.phone && (
                        <p className="mt-1 text-xs text-red-600">{customerErrors.phone}</p>
                          )}
                        </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-300">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        Delivery Address
                      </h2>
                      {isUserLoggedIn() && (addressData.province || addressData.district) && (
                        <div className="flex items-center text-sm text-green-600 bg-green-100 px-3 py-1 rounded-full">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          From Account
                          </div>
                        )}
                      </div>
                          <AddressSelector
                            value={addressData}
                            onChange={setAddressData}
                            errors={addressErrors}
                            required={true}
                            disabled={isSubmitting}
                          />
                    {isUserLoggedIn() && (addressData.province || addressData.district) && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start">
                          <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="text-sm text-blue-800 font-medium">Address Pre-filled</p>
                            <p className="text-xs text-blue-600">We've loaded your saved address. You can modify it if needed.</p>
                          </div>
                        </div>
                    </div>
                  )}
                      </div>
                      
                  {/* Payment Method */}
                  <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                    <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center">
                      <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Payment Method
                    </h2>
                    
                    {/* Single Payment Method Display */}
                    <div className="flex items-center p-4 bg-white border-2 border-green-300 rounded-xl">
                      <img src="/mtn.jpg" alt="MTN" className="w-10 h-10 rounded mr-4" />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 text-lg">MTN Mobile Money</div>
                        <div className="text-sm text-gray-600">Quick and secure payment</div>
                      </div>
                      <div className="px-3 py-1 bg-green-600 text-white text-sm rounded-full font-medium">
                        Selected
                      </div>
                    </div>
                    
                    {/* Payment Instructions */}
                    <div className="mt-4 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm mb-2">How to Complete Payment:</h4>
                          <div className="space-y-2 text-xs text-gray-700">
                            <div className="flex items-start">
                              <span className="bg-yellow-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">1</span>
                              <span>Complete your order with address details below</span>
                            </div>
                            <div className="flex items-start">
                              <span className="bg-yellow-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">2</span>
                              <span>Order will be processed immediately</span>
                            </div>
                            <div className="flex items-start">
                              <span className="bg-yellow-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">3</span>
                              <span>Payment via: <strong>*182*8*1*079559#</strong></span>
                            </div>
                            <div className="flex items-start">
                              <span className="bg-yellow-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">4</span>
                              <span>Amount: <strong>{formatRWF(subtotal)} RWF</strong></span>
                            </div>
                            <div className="mt-3 p-2 bg-green-100 rounded border border-green-300">
                              <p className="text-xs font-medium text-green-800">
                                <strong>✓ Quick Checkout:</strong> Your order will be completed immediately. Payment can be made at your convenience.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                      <button
                        type="submit"
                      className={`group flex items-center px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl ${
                          isSubmitting
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700 transform hover:scale-105 hover:shadow-2xl'
                        }`}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin w-6 h-6 border-3 border-white border-t-transparent rounded-full mr-3"></div>
                            <span>Processing Order...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            Complete Order
                            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </>
                        )}
                      </button>
                  </div>
                  
                  {/* Status Messages */}
                  {orderStatus.error && (
                    <div className="mt-6 p-5 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-md">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3 flex-1">
                          <h3 className="text-sm font-bold text-red-800 mb-1">Error</h3>
                          <p className="text-sm text-red-700">{orderStatus.error}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {orderStatus.success && (
                    <div className="mt-6 p-5 bg-green-50 border-l-4 border-green-500 rounded-lg shadow-md">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3 flex-1">
                          <h3 className="text-sm font-bold text-green-800 mb-1">Success!</h3>
                          <p className="text-sm text-green-700">{orderStatus.success}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
