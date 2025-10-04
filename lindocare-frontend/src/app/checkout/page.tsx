"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  fetchUserCartWithProducts,
  clearCartServer, 
  getLocalCart,
  saveLocalCart,
  isUserLoggedIn,
  getAuthToken 
} from "../../utils/serverStorage";
import { getUserInfo } from "../../utils/userInfo";

// Types
interface Product {
  id: string | number;
  name: string;
  price: number;
  image: string | string[];
  quantity: number;
}

interface AddressData {
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
}

interface OrderStatus {
  success?: string;
  error?: string;
  orderId?: string;
  showAlternativePayment?: boolean;
}

// Helper function to format RWF currency
function formatRWF(amount: number): string {
  return amount.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export default function CheckoutPage() {
  // State management
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>({});
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  
  // Customer information
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  
  // Address information
  const [addressData, setAddressData] = useState<AddressData>({
    province: "",
    district: "",
    sector: "",
    cell: "",
    village: ""
  });
  
  // Payment method
  const [paymentMethod, setPaymentMethod] = useState("dpo");
  
  const router = useRouter();

  // Test server connectivity
  const testServerConnection = async (): Promise<boolean> => {
    try {
      // Try a simple GET request to test connectivity
      const response = await fetch("https://lindo-project.onrender.com/", {
        method: "GET",
        headers: { 'accept': 'application/json' },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000)
      });
      return response.ok || response.status < 500; // Accept any response that's not a server error
        } catch (error) {
      console.log("Server connectivity test failed:", error);
      return false;
    }
  };

  // Load cart items and user information
  useEffect(() => {
    loadCartAndUserInfo();
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setConnectionStatus('checking');
    const isConnected = await testServerConnection();
    setConnectionStatus(isConnected ? 'connected' : 'disconnected');
  };

  const loadCartAndUserInfo = async () => {
    try {
      setLoading(true);
      
      // Load cart items
      let items: Product[] = [];
      if (isUserLoggedIn()) {
        // Load from server for logged-in users
        const serverCart = await fetchUserCartWithProducts();
        items = serverCart.map(item => ({
          id: typeof item.productId === 'object' ? (item.productId as any)._id : String(item.productId),
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity
        }));
          } else {
        // Load from localStorage for guest users
          const localCart = getLocalCart();
        items = localCart.map(item => ({
          id: String(item.productId),
          name: item.name || 'Product',
            price: item.price || 0,
          image: item.image || '/lindo.png',
          quantity: item.quantity
          }));
        }

      setCartItems(items);
      
      // Load user information if logged in
        if (isUserLoggedIn()) {
        const userInfo = await getUserInfo();
        if (userInfo) {
          setCustomerName(userInfo.fullName || "");
          setCustomerEmail(userInfo.email || "");
          setCustomerPhone(userInfo.phone || "");
          
          // Auto-populate address if available
          console.log("User info loaded:", userInfo);
          console.log("User address from API:", userInfo.address);
          if (userInfo.address) {
            const newAddressData = {
              province: userInfo.address.province || "",
              district: userInfo.address.district || "",
              sector: userInfo.address.sector || "",
              cell: userInfo.address.cell || "",
              village: userInfo.address.village || ""
            };
            console.log("Setting address data:", newAddressData);
            setAddressData(newAddressData);
        } else {
            console.log("No address data found in user info");
          }
        }
      }
    } catch (error) {
      console.error("Error loading cart and user info:", error);
      setOrderStatus({ error: "Failed to load cart items. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setOrderStatus({});

    try {
      // Validate required fields
      if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
        setOrderStatus({ error: "Please fill in all required customer information." });
      setIsSubmitting(false);
      return;
    }

      if (!addressData.province || !addressData.district || !addressData.sector || !addressData.cell || !addressData.village) {
        setOrderStatus({ error: "Please fill in all address fields." });
      setIsSubmitting(false);
      return;
    }

    if (cartItems.length === 0) {
        setOrderStatus({ error: "Your cart is empty." });
      setIsSubmitting(false);
      return;
    }

      // Step 1: Create Order
      const orderData = {
        paymentMethod: paymentMethod,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        shippingAddress: {
          province: addressData.province,
          district: addressData.district,
          sector: addressData.sector,
          cell: addressData.cell,
          village: addressData.village
        },
        items: cartItems.map(item => ({
          productId: String(item.id),
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: total
      };

      console.log("=== ORDER CREATION DEBUG ===");
      console.log("Creating order with data:", orderData);
      console.log("Address data being sent:", addressData);
      console.log("Shipping address in orderData:", orderData.shippingAddress);
      console.log("Customer info being sent:", {
        name: customerName.trim(),
        email: customerEmail.trim(),
        phone: customerPhone.trim()
      });
      console.log("=============================");

      const token = getAuthToken();
      if (!token) {
        setOrderStatus({ error: "Authentication required. Please log in again." });
        setIsSubmitting(false);
        return;
      }
      
      console.log("Making order creation request to:", "https://lindo-project.onrender.com/orders/createOrder");
      console.log("Request data:", orderData);
      console.log("Auth token available:", !!token);

      const orderResponse = await fetch("https://lindo-project.onrender.com/orders/createOrder", {
        method: "POST",
        headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      }).catch(error => {
        console.error("Network error during order creation:", error);
        throw new Error(`Network error: ${error.message}`);
      });

      if (orderResponse.status !== 201) {
        const errorData = await orderResponse.json().catch(() => ({}));
        setOrderStatus({ error: errorData.message || "Failed to create order. Please try again." });
        setIsSubmitting(false);
        return;
      }
      
        const orderResult = await orderResponse.json();
        const orderId = orderResult.order?._id || orderResult.orderId || orderResult._id;

        if (!orderId) {
        setOrderStatus({ error: "Order created but no order ID received. Please contact support." });
          setIsSubmitting(false);
          return;
        }
          
      console.log("Order created successfully:", orderResult);

      // Step 2: Initialize DPO Payment (if DPO is selected)
      if (paymentMethod === "dpo") {
        // Get the correct callback URL based on environment
        const getCallbackUrl = () => {
          const origin = window.location.origin;
          // Use production URL for DPO callbacks if in development
          if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return "https://lindocae-frontend.vercel.app/payment/success";
          }
          return `${origin}/payment/success`;
        };

      const dpoData = {
        orderId: orderId,
          totalAmount: total,
        currency: "RWF",
        serviceDescription: `Payment for order #${orderId}`,
          callbackUrl: getCallbackUrl()
      };

        console.log("Initializing DPO payment with data:", dpoData);
        console.log("Making DPO request to:", "https://lindo-project.onrender.com/dpo/initialize/dpoPayment");
        console.log("Current origin:", window.location.origin);
        console.log("Callback URL being used:", dpoData.callbackUrl);

        const dpoResponse = await fetch("https://lindo-project.onrender.com/dpo/initialize/dpoPayment", {
          method: "POST",
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(dpoData)
        }).catch(error => {
          console.error("Network error during DPO initialization:", error);
          throw new Error(`DPO network error: ${error.message}`);
        });

      console.log("DPO response status:", dpoResponse.status);
      console.log("DPO response headers:", Object.fromEntries(dpoResponse.headers.entries()));

      if (dpoResponse.ok) {
        const dpoResult = await dpoResponse.json();
        console.log("DPO payment initialized:", dpoResult);

          if (dpoResult.redirectUrl) {
            // Clear cart after successful order creation
            try {
              if (isUserLoggedIn()) {
                await clearCartServer();
              } else {
                saveLocalCart([]);
              }
              setCartItems([]);
            } catch (cartError) {
              console.log("Could not clear cart:", cartError);
            }
        
        // Store order details for reference
            localStorage.setItem("pendingOrderId", String(orderId));
            localStorage.setItem("pendingOrderAmount", String(total));
            
            // Redirect to DPO payment gateway
            window.location.href = dpoResult.redirectUrl;
            return;
          } else {
            setOrderStatus({ error: "Payment initialization succeeded but received unexpected response format." });
          }
        } else {
          // Enhanced DPO error handling
          console.error("=== DPO INITIALIZATION ERROR DETAILS ===");
          console.error("Response status:", dpoResponse.status);
          console.error("Response statusText:", dpoResponse.statusText);
          console.error("Response headers:", Object.fromEntries(dpoResponse.headers.entries()));

          let errorData: any = {};
          let responseText = "";

          try {
            responseText = await dpoResponse.text();
            console.error("Raw response text:", responseText);
            console.error("Response text length:", responseText.length);

            if (responseText && responseText.trim()) {
              try {
                errorData = JSON.parse(responseText);
                console.error("Parsed error data:", errorData);
              } catch (jsonError) {
                console.error("Failed to parse JSON:", jsonError);
                errorData = { message: responseText, rawResponse: responseText };
              }
            } else {
              console.error("Empty response text");
              errorData = { message: `Server error (${dpoResponse.status})` };
            }
          } catch (textError) {
            console.error("Failed to get response text:", textError);
            errorData = { message: `Network error (${dpoResponse.status})` };
          }

          console.error("Final error data:", errorData);
          console.error("DPO request that failed:", {
            url: "https://lindo-project.onrender.com/dpo/initialize/dpoPayment",
            method: "POST",
            headers: {
              'accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token ? token.substring(0, 20) + '...' : 'NO_TOKEN'}`
            },
            body: dpoData
          });

          // Determine error message based on status and content
          let errorMessage = "Payment initialization failed";
          if (dpoResponse.status === 401) {
            errorMessage = "Authentication failed. Please log in again.";
          } else if (dpoResponse.status === 403) {
            if (errorData.message?.includes("403")) {
              errorMessage = "DPO payment service configuration issue. Please contact support or try alternative payment methods.";
          } else {
              errorMessage = "Access denied. Please check your permissions.";
            }
          } else if (dpoResponse.status === 500) {
            if (errorData.message?.includes("403")) {
              errorMessage = "DPO payment service is temporarily unavailable due to configuration issues. Please use alternative payment methods.";
            } else {
              errorMessage = "Server error. Please try again later.";
            }
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else {
            errorMessage = `Payment initialization failed (Status: ${dpoResponse.status})`;
          }
          
          setOrderStatus({
            error: `${errorMessage}. Your order has been created successfully!`,
            orderId: orderId,
            showAlternativePayment: true
          });
        }
      } else {
        // Non-DPO payment method - just show success
        setOrderStatus({
          success: `Order created successfully! Order ID: ${orderId}. You can now proceed with payment.`,
            orderId: orderId
          });
      }

    } catch (error) {
      console.error("Checkout error:", error);
      
      // Provide more specific error messages based on error type
      let errorMessage = "An unexpected error occurred. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes("Network error")) {
          errorMessage = "Network connection failed. Please check your internet connection and try again.";
        } else if (error.message.includes("Failed to fetch")) {
          errorMessage = "Unable to connect to the server. Please check your internet connection and try again.";
          } else {
          errorMessage = error.message;
        }
      }
      
      setOrderStatus({ error: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
  return (
      <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
            </div>
                </div>
              );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Add some items to your cart before checking out.</p>
                  <button
            onClick={() => router.push("/")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
                              </div>
                            );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order securely</p>
          
          {/* Connection Status */}
                        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form - Hidden but kept in code */}
          <div className="bg-white rounded-lg shadow-md p-6" style={{ display: 'none' }}>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Information</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your full name"
                    />
                        </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your email"
                    />
                        </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your phone number"
                    />
                        </div>
                      </div>
                  </div>
                  
              {/* Address Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Province *
                    </label>
                    <input
                      type="text"
                      value={addressData.province}
                      onChange={(e) => setAddressData(prev => ({ ...prev, province: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter province"
                    />
                    </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      District *
                    </label>
                    <input
                      type="text"
                      value={addressData.district}
                      onChange={(e) => setAddressData(prev => ({ ...prev, district: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter district"
                    />
                    </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sector *
                    </label>
                    <input
                      type="text"
                      value={addressData.sector}
                      onChange={(e) => setAddressData(prev => ({ ...prev, sector: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter sector"
                    />
                      </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cell *
                    </label>
                    <input
                      type="text"
                      value={addressData.cell}
                      onChange={(e) => setAddressData(prev => ({ ...prev, cell: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter cell"
                    />
                    </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Village *
                    </label>
                    <input
                      type="text"
                      value={addressData.village}
                      onChange={(e) => setAddressData(prev => ({ ...prev, village: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter village"
                    />
                  </div>
            </div>
                          </div>

              {/* Payment Method */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                              <input
                                type="radio"
                                name="payment"
                                value="dpo"
                      checked={paymentMethod === "dpo"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mr-3">
                                <span className="text-white font-bold text-xs">DPO</span>
                              </div>
                      <span className="font-medium">DPO Payment Gateway</span>
                          </div>
                  </label>
                  
                  <label className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="bank_transfer"
                      checked={paymentMethod === "bank_transfer"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-xs">🏦</span>
                            </div>
                      <span className="font-medium">Bank Transfer</span>
                          </div>
                  </label>
                  
                  <label className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value="mobile_money"
                      checked={paymentMethod === "mobile_money"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-xs">📱</span>
                      </div>
                      <span className="font-medium">Mobile Money</span>
                    </div>
                  </label>
                            </div>
                            </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Processing..." : "Complete Order"}
              </button>
            </form>
                        </div>
                        
          {/* Order Summary - Left Side */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
            
            {/* Customer Information Display */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Name:</span>
                  <p className="text-gray-900">{customerName || "Not provided"}</p>
                          </div>
                            <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <p className="text-gray-900">{customerEmail || "Not provided"}</p>
                              </div>
                            <div>
                  <span className="font-medium text-gray-700">Phone:</span>
                  <p className="text-gray-900">{customerPhone || "Not provided"}</p>
                              </div>
                            </div>
                        </div>

            {/* Address Information Display */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Delivery Address</h3>
              <div className="text-sm text-gray-900">
                {addressData.province && addressData.district && addressData.sector && addressData.cell && addressData.village ? (
                  <p>{addressData.village}, {addressData.cell}, {addressData.sector}, {addressData.district}, {addressData.province}</p>
                ) : (
                  <p className="text-gray-500">Address not provided</p>
                )}
                              </div>
                              </div>

            {/* Payment Method Display - Hidden but kept in code */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg" style={{ display: 'none' }}>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Payment Method</h3>
              <div className="flex items-center">
                {paymentMethod === "dpo" && (
                  <>
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-xs">DPO</span>
                            </div>
                    <span className="font-medium text-gray-900">DPO Payment Gateway</span>
                  </>
                          )}
                {paymentMethod === "bank_transfer" && (
                  <>
                    <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-xs">🏦</span>
                          </div>
                    <span className="font-medium text-gray-900">Bank Transfer</span>
                  </>
                )}
                {paymentMethod === "mobile_money" && (
                  <>
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-xs">📱</span>
                    </div>
                    <span className="font-medium text-gray-900">Mobile Money</span>
                  </>
                )}
                      </div>
                            </div>
                           
            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                    {Array.isArray(item.image) ? (
                      <img
                        src={item.image[0] || "/lindo.png"}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <img
                        src={item.image || "/lindo.png"}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                             )}
                            </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-950">Qty: {item.quantity}</p>
                          </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatRWF(item.price * item.quantity)} RWF</p>
                      </div>
                          </div>
              ))}
                          </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-950">Subtotal</span>
                <span className="font-medium text-gray-950">{formatRWF(subtotal)} RWF</span>
                        </div>
              <div className="flex justify-between">
                <span className="text-gray-950">Shipping</span>
                <span className="font-medium text-gray-950">Free</span>
                      </div>
              <div className="flex justify-between text-lg font-semibold border-t pt-2">
                <span className="text-gray-950">Total</span>
                <span className="text-gray-950">{formatRWF(total)} RWF</span>
                    </div>
                  </div>
                  
            {/* Order Status Messages */}
                  {orderStatus.error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                        <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        </div>
                        <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <p className="text-sm text-red-700 mt-1">{orderStatus.error}</p>
                    {orderStatus.orderId && (
                      <p className="text-sm text-red-700 mt-1">Order ID: {orderStatus.orderId}</p>
                    )}
                    <div className="mt-3 space-y-2">
                      <button
                        onClick={() => {
                          setOrderStatus({});
                          setIsSubmitting(false);
                        }}
                        className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors mr-2"
                      >
                        Try Again
                      </button>
                      
                      {orderStatus.showAlternativePayment && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <h4 className="text-sm font-semibold text-blue-800 mb-2">Alternative Payment Options:</h4>
                              <div className="space-y-2 text-sm text-blue-700">
                                <p><strong>Order ID:</strong> {orderStatus.orderId}</p>
                            <p><strong>Amount:</strong> {formatRWF(total)} RWF</p>
                            <div className="mt-2 space-y-1">
                                  <p>1. <strong>Bank Transfer:</strong> Contact us for bank details</p>
                                  <p>2. <strong>Mobile Money:</strong> Use code *182*8*1*079559#</p>
                                  <p>3. <strong>Cash on Delivery:</strong> Pay when you receive your order</p>
                                </div>
                            <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded">
                                  <p className="text-xs text-yellow-800">
                                    <strong>Note:</strong> Please include your Order ID when making payment and contact our support team to confirm.
                                  </p>
                                </div>
                            <div className="mt-2 p-2 bg-orange-100 border border-orange-300 rounded">
                              <p className="text-xs text-orange-800">
                                <strong>Technical Info:</strong> DPO payment gateway is experiencing configuration issues. This is a backend configuration problem that needs to be resolved by the development team.
                              </p>
                            </div>
                            <div className="mt-3 space-y-2">
                              <button
                                onClick={() => {
                                  setPaymentMethod("bank_transfer");
                                  setOrderStatus({});
                                  setIsSubmitting(false);
                                }}
                                className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors mr-2"
                              >
                                Use Bank Transfer Instead
                              </button>
                              <button
                                onClick={() => {
                                  setOrderStatus({
                                    success: `Order completed successfully! Order ID: ${orderStatus.orderId}. Please use one of the alternative payment methods above to complete your payment.`
                                  });
                                }}
                                className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                              >
                                Complete Order
                              </button>
                            </div>
                              </div>
                            </div>
                          )}
                    </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {orderStatus.success && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex">
                        <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Success</h3>
                    <p className="text-sm text-green-700 mt-1">{orderStatus.success}</p>
                    {orderStatus.orderId && (
                      <p className="text-sm text-green-700 mt-1">Order ID: {orderStatus.orderId}</p>
                    )}
                        </div>
                      </div>
                    </div>
                  )}

            {/* Complete Order Button - Within Order Summary */}
            <div className="mt-6">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Processing..." : "Complete Order"}
              </button>
              
            </div>
          </div>

          {/* Right Side Content */}
          <div className="space-y-6">
            {/* MTN MoMo Payment Instructions - Non-functioning UI */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Alternative Payment</h2>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center mr-3 overflow-hidden">
                    <img
                      src="/mtn.jpg"
                      alt="MTN Logo"
                      className="w-full h-full object-cover rounded-full"
                    />
        </div>
                  <h3 className="text-lg font-semibold text-gray-900">MTN MoMo Pay</h3>
                </div>
                <p className="text-sm text-gray-700 mb-4">
                  You can also manually pay using MTN Mobile Money
                </p>
                <div className="bg-gray-100 p-3 rounded-lg mb-4">
                  <p className="text-sm font-medium text-gray-800 mb-1">Dial this code:</p>
                  <p className="text-lg font-bold text-blue-600">*182*8*079559#</p>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="mb-2"><strong>Instructions:</strong></p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Dial the code above</li>
                    <li>Follow the voice prompts</li>
                    <li>Enter the amount: <strong>{formatRWF(total)} RWF</strong></li>
                    <li>Enter your PIN to confirm</li>
                    <li>Contact us with your order ID for confirmation</li>
                  </ol>
                </div>
                <div className="mt-4 p-2 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-xs text-blue-800">
                    <strong>Note:</strong> This is a manual payment option. Please include your Order ID when making payment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
