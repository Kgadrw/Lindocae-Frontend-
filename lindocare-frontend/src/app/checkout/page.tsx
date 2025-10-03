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
  const [paymentMethod, setPaymentMethod] = useState("mtn");
  
  // Step management - 2 step checkout
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

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
            
            // Auto-populate address information
            if (userInfo.address) {
              setAddressData({
                province: userInfo.address.province || '',
                district: userInfo.address.district || '',
                sector: userInfo.address.sector || '',
                cell: userInfo.address.cell || '',
                village: userInfo.address.village || '',
                street: '' // Street is not stored in registration, so leave empty
              });
            }
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

  // Step validation functions - Now simplified since all info is auto-populated
  const validateCustomerInfo = () => {
    const errors: {name?: string, email?: string, phone?: string} = {};
    
    // All customer info is auto-populated, no validation needed
    
    setCustomerErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateAddress = () => {
    const newAddressErrors: Partial<Record<keyof AddressData, string>> = {};
    
    // Only street address is required - all other address fields are auto-populated
    if (!addressData.street.trim()) newAddressErrors.street = "Street address is required";
    
    setAddressErrors(newAddressErrors);
    return Object.keys(newAddressErrors).length === 0;
  };

  const validatePaymentInfo = () => {
    const errors: {senderName?: string, senderAddress?: string} = {};
    
    if (!senderName.trim()) errors.senderName = "Sender name is required";
    if (!senderAddress.trim()) errors.senderAddress = "Sender address is required";
    
    setPaymentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    console.log('handleNextStep called, currentStep:', currentStep);
    setOrderStatus({}); // Clear any previous errors
    
    if (currentStep === 1) {
      console.log('Validating address:', { addressData });
      const addressValid = validateAddress();
      
      if (addressValid) {
        console.log('Address valid, moving to payment step');
        setCurrentStep(2);
      } else {
        setOrderStatus({ error: "Please complete the delivery address field." });
      }
    }
  };

  const handlePrevStep = () => {
    console.log('handlePrevStep called, currentStep:', currentStep);
    setOrderStatus({}); // Clear any errors when going back
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
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

      // Step 2: Initialize DPO Payment
      const firstName = customerName.split(' ')[0] || customerName;
      const lastName = customerName.split(' ').slice(1).join(' ') || firstName;
      
      const dpoData = {
        orderId: orderId,
        totalAmount: subtotal,
        currency: "RWF",
        email: customerEmail,
        phone: customerPhone,
        firstName: firstName,
        lastName: lastName,
        serviceDescription: `Payment for order #${orderId}`,
        callbackUrl: `${window.location.origin}/payment-success`
      };

      console.log("Initializing DPO payment:", dpoData);

      const dpoResponse = await fetch(
        "https://lindo-project.onrender.com/dpo/initialize/dpoPayment",
        {
          method: "POST",
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dpoData),
        }
      );

      console.log("DPO response status:", dpoResponse.status);

      if (dpoResponse.ok) {
        const dpoResult = await dpoResponse.json();
        console.log("DPO payment initialized:", dpoResult);

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
              } catch {}
        
        // Store order details for reference
                localStorage.setItem("pendingOrderId", String(orderId || ""));
                localStorage.setItem("pendingOrderAmount", String(totalAmount));
        localStorage.setItem("momoCode", "*182*8*1*079559#");
      } else if (orderResponse.status === 401) {
        const errorText = await orderResponse.text();
        console.error("Order creation 401 error response:", errorText);
        setOrderStatus({
          error: "Authorization failed. Please log in and try again.",
        });
      } else {
        // Handle DPO initialization error
        let dpoErrorData: any = {};
        let dpoResponseText = "";
        try {
          dpoResponseText = await dpoResponse.text();
          if (dpoResponseText) {
            dpoErrorData = JSON.parse(dpoResponseText);
          }
        } catch (parseError) {
          dpoErrorData = { message: dpoResponseText || "Unknown error" };
        }

        console.error("DPO initialization error:", dpoResponse.status, dpoErrorData);
        setOrderStatus({
          error: `Order created but payment initialization failed: ${dpoErrorData.message || 'Unknown error'}. Please contact support.`,
        });
      }
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
            <p className="text-gray-600">Complete your order in 3 simple steps • MTN Mobile Money Payment</p>
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2 md:space-x-4">
            {[1, 2, 3].map((step) => {
              const stepNames = ['Delivery Info', 'Payment', 'Confirm'];
              const stepDescriptions = ['Contact & address', 'MTN Mobile Money', 'Payment details'];
              const isCompleted = currentStep > step;
              const isActive = currentStep === step;
              
              return (
                <div key={step} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 shadow-lg
                      ${isCompleted 
                        ? 'bg-green-500 text-white scale-105' 
                        : isActive 
                          ? 'bg-blue-600 text-white ring-4 ring-blue-200 scale-110' 
                          : 'bg-gray-200 text-gray-500'
                      }
                    `}>
                      {isCompleted ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        step
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <span className={`block text-sm font-semibold ${
                        isActive ? 'text-blue-700' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {stepNames[step - 1]}
                    </span>
                      <span className="block text-xs text-gray-500 mt-0.5">
                        {stepDescriptions[step - 1]}
                    </span>
                  </div>
                  </div>
                  {step < 3 && (
                    <div className={`w-8 md:w-16 h-1 mx-2 rounded-full transition-all duration-300 ${
                      currentStep > step ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
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
                  {/* Step 1: Street Address */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-950 mb-4">Delivery Address</h2>
                        <div>
                          <label className="block text-sm font-medium text-gray-950 mb-2">
                            Street Address *
                          </label>
                          <input
                            type="text"
                            value={addressData.street}
                            onChange={(e) => {
                              setAddressData(prev => ({ ...prev, street: e.target.value }));
                              if (addressErrors.street) {
                                setAddressErrors(prev => ({ ...prev, street: undefined }));
                              }
                            }}
                            placeholder="Enter your street address"
                            className={`w-full px-4 py-3 border rounded-lg outline-none transition-all ${
                              addressErrors.street 
                                ? 'border-red-400 bg-red-50 focus:border-red-500' 
                                : 'border-gray-300 focus:border-blue-500'
                            }`}
                          />
                          {addressErrors.street && (
                            <p className="mt-1 text-sm text-red-600">{addressErrors.street}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Payment Method */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-950 mb-4">Payment Method</h2>
                        
                        {/* Payment Options */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* MTN Mobile Money */}
                          <div 
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              paymentMethod === 'mtn' 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setPaymentMethod('mtn')}
                          >
                            <div className="flex items-center space-x-3">
                              <input
                                type="radio"
                                name="payment"
                                value="mtn"
                                checked={paymentMethod === 'mtn'}
                                onChange={() => setPaymentMethod('mtn')}
                                className="w-4 h-4 text-blue-600"
                              />
                              <img src="/mtn.jpg" alt="MTN" className="w-8 h-8 rounded" />
                              <span className="font-medium text-gray-950">MTN Mobile Money</span>
                            </div>
                          </div>

                          {/* DPO Payment */}
                          <div 
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              paymentMethod === 'dpo' 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setPaymentMethod('dpo')}
                          >
                            <div className="flex items-center space-x-3">
                              <input
                                type="radio"
                                name="payment"
                                value="dpo"
                                checked={paymentMethod === 'dpo'}
                                onChange={() => setPaymentMethod('dpo')}
                                className="w-4 h-4 text-blue-600"
                              />
                              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                                <span className="text-white font-bold text-xs">DPO</span>
                              </div>
                              <span className="font-medium text-gray-950">DPO Payment</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Payment Instructions */}
                        {paymentMethod === 'mtn' && (
                          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <h4 className="font-semibold text-gray-950 mb-2">How to Pay:</h4>
                            <div className="space-y-2 text-sm text-gray-950">
                              <p>1. Dial <strong>*182*8*1*079559#</strong> on your phone</p>
                              <p>2. Enter amount: <strong>{formatRWF(subtotal)} RWF</strong></p>
                              <p>3. Enter your MTN Mobile Money PIN</p>
                              <p>4. Confirm the transaction</p>
                            </div>
                          </div>
                        )}
                        
                        {paymentMethod === 'dpo' && (
                          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-gray-950">You will be redirected to DPO payment gateway to complete your payment.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Old step content removed */}
                  {false && (
                    <div className="space-y-6 animate-fade-in">
                      {/* Header */}
                      <div className="text-center mb-4">
                          <h2 className="text-2xl font-bold text-blue-700 mb-2">Delivery Information</h2>
                        {isUserLoggedIn() && customerName && customerEmail ? (
                          <div className="mt-3 inline-block">
                            <div className="bg-green-50 border border-green-400 rounded-lg p-2.5 px-4">
                              <div className="flex items-center justify-center text-sm">
                                <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                                <span className="text-gray-700">
                                  <strong className="text-green-700">Delivering to:</strong> {customerName} • {customerEmail}
                                </span>
                            </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-600">Enter your contact details and delivery address</p>
                          )}
                        </div>
                        
                      {/* Guest User Fields - Name & Email */}
                      {!isUserLoggedIn() && (
                        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-5">
                          <div className="flex items-start mb-4">
                            <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm text-yellow-800">
                              <strong>Guest Checkout:</strong> Please provide your contact information below
                            </p>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
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
                        </div>
                      )}
                      
                      {/* Phone Number - Hidden for all users */}
                      {false && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-300">
                          <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center">
                            <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            Phone Number <span className="text-red-500 ml-1">*</span>
                              </label>
                              <div className="relative">
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                </div>
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
                              className={`w-full pl-10 pr-10 py-2.5 border-2 rounded-lg outline-none transition-all duration-200 ${
                                    customerErrors.phone 
                                  ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                                  : customerPhone.trim()
                                    ? 'border-green-400 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100'
                                    : 'border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                                  }`}
                                />
                            {customerPhone.trim() && !customerErrors.phone && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                                {customerErrors.phone && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </div>
                                )}
                              </div>
                          {customerErrors.phone && (
                            <div className="mt-1.5 flex items-center text-xs text-red-600 bg-red-100 p-1.5 rounded">
                              <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              {customerErrors.phone}
                            </div>
                          )}
                          </div>
                      )}
                        
                        {/* Delivery Address Section - Hidden for all users */}
                        {false && (
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                          <AddressSelector
                            value={addressData}
                            onChange={setAddressData}
                            errors={addressErrors}
                            required={true}
                            disabled={isSubmitting}
                          />
                        </div>
                        )}
                        
                        {/* Street Address Input - Required for all users */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Street Address *
                          </label>
                          <input
                            type="text"
                            value={addressData.street}
                            onChange={(e) => {
                              setAddressData(prev => ({ ...prev, street: e.target.value }));
                              if (addressErrors.street) {
                                setAddressErrors(prev => ({ ...prev, street: undefined }));
                              }
                            }}
                            placeholder="Enter your street address"
                            className={`w-full px-4 py-2.5 border-2 rounded-lg outline-none transition-all duration-200 ${
                              addressErrors.street 
                                ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                                : addressData.street.trim()
                                  ? 'border-green-400 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100'
                                  : 'border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                            }`}
                          />
                          {addressErrors.street && (
                            <div className="mt-1.5 flex items-center text-xs text-red-600 bg-red-100 p-1.5 rounded">
                              <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              {addressErrors.street}
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                  
                  
                  {/* Step 3: Payment Confirmation - REMOVED */}
                  {false && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-blue-700 mb-2">Payment Confirmation</h2>
                        <p className="text-gray-600">Enter your payment details to complete the order</p>
                      </div>
                      
                      {/* Payment Confirmation Form */}
                      <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                        <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Payment Details
                        </h3>
                        
                         <div className="space-y-4">
                           <div>
                             <label className="block text-sm font-semibold text-gray-800 mb-2">
                               Sender Name <span className="text-red-500">*</span>
                             </label>
                          <input
                               type="text"
                               value={senderName}
                               onChange={(e) => {
                                 setSenderName(e.target.value);
                                 if (paymentErrors.senderName) {
                                   setPaymentErrors(prev => ({ ...prev, senderName: undefined }));
                                 }
                               }}
                               placeholder="Name of person who sent the money"
                               className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-all duration-200 ${
                                 paymentErrors.senderName 
                                   ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                                   : senderName.trim()
                                     ? 'border-green-400 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100'
                                     : 'border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                               }`}
                             />
                             {paymentErrors.senderName && (
                               <p className="mt-1 text-xs text-red-600">{paymentErrors.senderName}</p>
                             )}
                            </div>
                           
                            <div>
                             <label className="block text-sm font-semibold text-gray-800 mb-2">
                               Sender Address <span className="text-red-500">*</span>
                             </label>
                             <input
                               type="text"
                               value={senderAddress}
                               onChange={(e) => {
                                 setSenderAddress(e.target.value);
                                 if (paymentErrors.senderAddress) {
                                   setPaymentErrors(prev => ({ ...prev, senderAddress: undefined }));
                                 }
                               }}
                               placeholder="Address of person who sent the money"
                               className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-all duration-200 ${
                                 paymentErrors.senderAddress 
                                   ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                                   : senderAddress.trim()
                                     ? 'border-green-400 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100'
                                     : 'border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                               }`}
                             />
                             {paymentErrors.senderAddress && (
                               <p className="mt-1 text-xs text-red-600">{paymentErrors.senderAddress}</p>
                             )}
                            </div>
                          </div>
                      </div>
                      
                      {/* Order Summary */}
                      <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-300 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center">
                          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Order Summary
                        </h3>
                        <div className="space-y-3">
                          <div className="bg-white rounded-lg p-3 flex justify-between items-center shadow-sm">
                            <span className="text-gray-600">Total Amount</span>
                            <span className="font-bold text-blue-600 text-lg">{formatRWF(subtotal)} RWF</span>
                          </div>
                          <div className="bg-white rounded-lg p-3 flex justify-between items-center shadow-sm">
                            <span className="text-gray-600">Payment Method</span>
                            <span className="font-semibold text-gray-900 flex items-center">
                              <img src="/mtn.jpg" alt="MTN" className="w-5 h-5 rounded mr-2" />
                              MTN Mobile Money
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Navigation Buttons */}
                  <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all ${
                        currentStep === 1
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-950 border border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                      disabled={currentStep === 1}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </button>
                    
                    {currentStep < totalSteps ? (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
                      >
                        Next
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                          isSubmitting
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Processing...' : 'Complete Order'}
                      </button>
                    )}
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
