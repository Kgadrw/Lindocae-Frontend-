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
  
  // Step management - Reorganized flow: Payment → Address → Confirmation
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

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
  
  // Payment confirmation info
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  
  // Form validation errors
  const [addressErrors, setAddressErrors] = useState<Partial<Record<keyof AddressData, string>>>({});
  const [customerErrors, setCustomerErrors] = useState<{name?: string, email?: string, phone?: string}>({});

  const [orderStatus, setOrderStatus] = useState<{ success?: string; error?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentRedirectUrl, setPaymentRedirectUrl] = useState("");
  const [users, setUsers] = useState<any[]>([]); // optional (kept as in your original)
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(true);
  const router = useRouter();

  // Fetch users for header (unchanged; safe to remove if unused)
  useEffect(() => {
    fetch("https://lindo-project.onrender.com/user/getAllUsers")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
        else if (data && Array.isArray(data.users)) setUsers(data.users);
        else setUsers([]);
      })
      .catch(() => setUsers([]));
  }, []);

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

  // Debug: Log cart items whenever they change
  useEffect(() => {
    console.log("Checkout: Cart items updated:", cartItems);
    console.log("Checkout: Cart items length:", cartItems.length);
    if (cartItems.length > 0) {
      console.log("Checkout: First cart item details:", {
        id: cartItems[0].id,
        name: cartItems[0].name,
        price: cartItems[0].price,
        image: cartItems[0].image,
        quantity: cartItems[0].quantity,
      });
    }
  }, [cartItems]);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  // Step validation functions - Now simplified since name/email are auto-populated
  const validateCustomerInfo = () => {
    const errors: {name?: string, email?: string, phone?: string} = {};
    
    // Validate phone number (only required field for logged-in users)
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
    if (!addressData.street.trim()) newAddressErrors.street = "Street address is required";
    
    setAddressErrors(newAddressErrors);
    return Object.keys(newAddressErrors).length === 0;
  };

  const validatePaymentInfo = () => {
    // No validation needed for payment info since we removed the fields
    return true;
  };

  const handleNextStep = () => {
    console.log('handleNextStep called, currentStep:', currentStep);
    setOrderStatus({}); // Clear any previous errors
    
    if (currentStep === 1) {
      // Step 1: Payment Method Selection - No validation needed, MTN is default
      console.log('Payment method selected, moving to address step');
      setCurrentStep(2);
    } else if (currentStep === 2) {
      console.log('Validating customer info and address:', { customerName, customerEmail, customerPhone, addressData });
      const customerValid = validateCustomerInfo();
      const addressValid = validateAddress();
      
      if (customerValid && addressValid) {
        console.log('All info valid, moving to confirmation step');
        setCurrentStep(3);
      } else {
        if (!customerValid) {
          setOrderStatus({ error: "Please fill in all customer information correctly." });
        } else if (!addressValid) {
          setOrderStatus({ error: "Please complete all delivery address fields." });
        }
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
      setOrderStatus({ error: "Please complete all steps correctly." });
      setIsSubmitting(false);
      return;
    }

    // Additional validation to ensure all required fields are filled
    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      setOrderStatus({ error: "Please fill in all customer information fields." });
      setIsSubmitting(false);
      return;
    }

    if (!addressData.province || !addressData.district || !addressData.street.trim()) {
      setOrderStatus({ error: "Please complete all required address fields (Province, District, Street)." });
      setIsSubmitting(false);
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      setOrderStatus({ error: "Your cart is empty. Please add items before checkout." });
      setIsSubmitting(false);
      return;
    }

    // Validate subtotal
    if (!subtotal || subtotal <= 0) {
      setOrderStatus({ error: "Invalid order total. Please refresh and try again." });
      setIsSubmitting(false);
      return;
    }

    try {
      const token = getAuthToken();

      // Prepare order items for the API
      const orderItems = cartItems.map((item) => {
        // Validate each item has required fields
        if (!item.id || !item.price || item.price <= 0 || !item.quantity || item.quantity <= 0) {
          throw new Error(`Invalid cart item: ${item.name || 'Unknown item'}. Please refresh and try again.`);
        }
        
        return {
          productId: String(item.id),
          quantity: Number(item.quantity),
          price: Number(item.price),
        };
      });

      // Prepare shipping address in the format backend expects
      const shippingAddress = {
        province: addressData.province,
        district: addressData.district,
        sector: addressData.sector?.trim() || "",
        cell: addressData.cell?.trim() || "",
        village: addressData.village?.trim() || "",
        street: addressData.street.trim(),
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
      };

      // Prepare order data matching backend schema
      const orderData = {
        paymentMethod: "mobile_money", // Backend expects this format
        shippingAddress: shippingAddress,
        items: orderItems,
        totalAmount: Number(subtotal), // Ensure it's a number
        status: "pending",
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        momoCode: "*182*8*1*079559#"
      };

      console.log("Order data being sent to API (formatted):", orderData);
      console.log("Cart items:", cartItems);
      console.log("Total amount calculated:", subtotal);

      // Optional auth token from localStorage (include if present)
      let openLock: string | null = null;
      try {
        const stored = localStorage.getItem("userData");
        if (stored) {
          const parsed = JSON.parse(stored);
          openLock = parsed?.user?.tokens?.accessToken || null;
        }
      } catch {
        console.warn("Could not parse user token; proceeding without Authorization header.");
      }
      console.log("Access token present:", !!openLock);

      const orderResponse = await fetch(
        "https://lindo-project.onrender.com/orders/createOrder",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            ...(openLock ? { Authorization: `Bearer ${openLock}` } : {}),
          },
          body: JSON.stringify(orderData),
        }
      );

      console.log("Order response status:", orderResponse.status);
      console.log("Order response headers:", Object.fromEntries(orderResponse.headers.entries()));

      if (orderResponse.ok) {
        const orderResult = await orderResponse.json();
        console.log("Order created:", orderResult);

        const orderId = orderResult.order?._id || orderResult.orderId;

        // Prepare name for DPO init from full name safely
        const [firstNameRaw, ...restName] = customerName.trim().split(/\s+/);
        const firstName = firstNameRaw || "Customer";
        const lastName = restName.join(" ") || firstName;

        // MTN Mobile Money payment processing
        setOrderStatus({ 
          success: `Order created successfully! Please send ${formatRWF(subtotal)} RWF to *182*8*1*079559# and complete payment confirmation.` 
        });
        
        // Clear cart after successful order creation
        try {
          if (isUserLoggedIn()) await clearCartServer();
          else saveLocalCart([]);
          setCartItems([]);
        } catch {}
        
        // Store order details for reference
        localStorage.setItem("pendingOrderId", String(orderId || ""));
        localStorage.setItem("pendingOrderAmount", String(subtotal));
        localStorage.setItem("momoCode", "*182*8*1*079559#");
      } else if (orderResponse.status === 401) {
        const errorText = await orderResponse.text();
        console.error("Order creation 401 error response:", errorText);
        setOrderStatus({
          error: "Authorization failed. Please log in and try again.",
        });
      } else {
        // Enhanced error handling to see exact API response
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

        console.error(
          "Order creation error status:",
          orderResponse.status,
          orderResponse.statusText
        );
        console.error("Order creation error body (text):", responseText || "<empty body>");
        console.error("Order creation error parsed object:", errorData);

        // Provide more specific error messages
        let errorMessage = "Failed to create order. Please try again.";
        if (orderResponse.status === 500) {
          errorMessage = "Server error occurred. The backend service may be temporarily unavailable. Please try again later.";
        } else if (orderResponse.status === 404) {
          errorMessage = "Order creation endpoint not found. Please contact support.";
        } else if (orderResponse.status === 401) {
          errorMessage = "Authentication failed. Please log in again.";
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }

        setOrderStatus({
          error: errorMessage,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-6 px-4">
      <div className="w-full max-w-7xl mx-auto">
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
            <p className="text-gray-600">Complete your order in 3 simple steps • Choose Payment → Enter Address → Confirm</p>
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2 md:space-x-4">
            {[1, 2, 3].map((step) => {
              const stepNames = ['Payment Method', 'Delivery Info', 'Confirmation'];
              const stepDescriptions = ['Choose payment', 'Contact & address', 'Review & confirm'];
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
        
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-white">
          <div className="flex flex-col lg:flex-row">
            {/* Left: Order Summary */}
            <div className="lg:w-2/5 bg-gradient-to-br from-blue-50 to-purple-50 p-6 border-r-2 border-blue-200 lg:sticky lg:top-6 lg:self-start">
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
                    {/* Trust Badges */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Secure
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-blue-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                          </svg>
                          Free Delivery
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right: Step Content */}
            <div className="lg:w-3/5 p-6 bg-white">
              {cartItems.length > 0 && (
                <form onSubmit={handleCheckout}>
                  {/* Step 1: Payment Method Selection */}
                  {currentStep === 1 && (
                    <div className="animate-fade-in">
                      {/* Header */}
                      <div className="text-center mb-4">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-2">Choose Payment Method</h2>
                        <p className="text-gray-600">Select how you'd like to pay for your order</p>
                      </div>
                      
                      {/* MTN Mobile Money Payment Card - Compact */}
                      <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-4 rounded-xl text-white shadow-lg border-2 border-white cursor-pointer" onClick={() => setPaymentMethod("mtn")}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <img src="/mtn.jpg" alt="MTN" className="w-10 h-10 rounded-lg mr-3 border border-white shadow-sm" />
                            <div>
                              <h3 className="text-lg font-bold">MTN Mobile Money</h3>
                              <p className="text-yellow-100 text-sm">Fast & Secure Payment</p>
                            </div>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${paymentMethod === "mtn" ? "bg-white" : ""}`}>
                            {paymentMethod === "mtn" && (
                              <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            )}
                              </div>
                            </div>
                        
                        <div className="bg-white rounded-lg p-3 shadow-lg">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                              <div className="text-sm font-semibold mb-1 text-gray-600">Total Amount</div>
                              <div className="text-xl font-bold text-blue-600">{formatRWF(subtotal)} RWF</div>
                          </div>
                            <div className="text-center">
                              <div className="text-sm font-semibold mb-1 text-gray-600">USSD Code</div>
                              <div className="text-lg font-mono font-bold bg-blue-50 px-2 py-1 rounded text-blue-600 border border-blue-200">
                                *182*8*1*079559#
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 flex items-center justify-center">
                          <div className="bg-black bg-opacity-20 rounded-lg px-3 py-1">
                            <span className="text-white font-semibold text-sm">✓ Selected Payment Method</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Step 2: Delivery Information */}
                  {currentStep === 2 && (
                    <div className="animate-fade-in">
                      {/* Header */}
                      <div className="text-center mb-4">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-2">Delivery Information</h2>
                        <p className="text-gray-600">Enter your contact details and delivery address</p>
                      </div>
                      
                      {/* Guest User Fields - Compact */}
                      {!isUserLoggedIn() && (
                        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-4">
                          <div className="flex items-start mb-3">
                            <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div>
                              <p className="text-sm text-yellow-800 font-semibold">Guest Checkout</p>
                              <p className="text-xs text-yellow-700">Please provide your contact information</p>
                          </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-800 mb-1">
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
                                className={`w-full px-3 py-2 border rounded-lg outline-none transition-all duration-200 text-sm ${
                                  customerErrors.name 
                                    ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                                    : customerName.trim()
                                      ? 'border-green-400 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100'
                                      : 'border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                                }`}
                              />
                              {customerErrors.name && (
                                <p className="mt-1 text-xs text-red-600">{customerErrors.name}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-800 mb-1">
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
                                className={`w-full px-3 py-2 border rounded-lg outline-none transition-all duration-200 text-sm ${
                                  customerErrors.email 
                                    ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                                    : customerEmail.trim() && /\S+@\S+\.\S+/.test(customerEmail)
                                      ? 'border-green-400 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100'
                                      : 'border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                                }`}
                              />
                              {customerErrors.email && (
                                <p className="mt-1 text-xs text-red-600">{customerErrors.email}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Contact Information */}
                      <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 mb-4">
                        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                          <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          Contact Information
                        </h3>
                        <div>
                          <label className="block text-xs font-medium text-gray-800 mb-1">
                            Phone Number <span className="text-red-500">*</span>
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
                            placeholder="+250788123456"
                            className={`w-full px-3 py-2 border rounded-lg outline-none transition-all duration-200 text-sm ${
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
                        
                      {/* Delivery Address Section - Compact */}
                      <div className="bg-green-50 border border-green-300 rounded-lg p-4">
                          <AddressSelector
                            value={addressData}
                            onChange={setAddressData}
                            errors={addressErrors}
                            required={true}
                            disabled={isSubmitting}
                          />
                        </div>
                    </div>
                  )}
                  
                  {/* Step 3: Order Confirmation */}
                  {currentStep === 3 && (
                    <div className="animate-fade-in">
                      <div className="text-center mb-4">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent mb-2">Order Confirmation</h2>
                        <p className="text-gray-600">Review your order and complete payment</p>
                      </div>
                      
                      
                      {/* Order Summary */}
                      <div className="bg-green-50 border border-green-300 rounded-lg p-4 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center">
                          <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Order Summary
                        </h3>
                        <div className="space-y-3">
                          <div className="bg-white rounded-lg p-3 shadow-sm">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <span className="text-gray-600 text-sm font-medium">Customer</span>
                                <div className="font-bold text-gray-900">{customerName}</div>
                              </div>
                              <div>
                                <span className="text-gray-600 text-sm font-medium">Email</span>
                                <div className="font-semibold text-gray-900 text-sm">{customerEmail}</div>
                            </div>
                              <div>
                                <span className="text-gray-600 text-sm font-medium">Phone</span>
                                <div className="font-semibold text-gray-900 text-sm">{customerPhone}</div>
                          </div>
                              <div>
                                <span className="text-gray-600 text-sm font-medium">Payment Method</span>
                                <div className="font-semibold text-gray-900 text-sm flex items-center">
                                  <img src="/mtn.jpg" alt="MTN" className="w-4 h-4 rounded mr-1" />
                                  MTN Mobile Money
                          </div>
                        </div>
                      </div>
                    </div>
                          
                          <div className="bg-white rounded-lg p-3 shadow-sm">
                            <span className="text-gray-600 text-sm font-medium block mb-1">Delivery Address</span>
                            <div className="font-semibold text-gray-900 text-sm">
                              {[addressData.street, addressData.village, addressData.cell, addressData.sector, addressData.district, addressData.province]
                                .filter(Boolean)
                                .join(', ') || 'Not specified'}
                      </div>
                           </div>
                           
                          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 shadow-lg">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-white text-lg">Total Amount</span>
                              <span className="font-bold text-white text-2xl">{formatRWF(subtotal)} RWF</span>
                           </div>
                         </div>
                      </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Navigation Buttons */}
                  <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-8">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className={`group flex items-center px-6 py-3 border-2 rounded-xl font-semibold transition-all duration-200 ${
                        currentStep === 1 
                          ? 'text-gray-400 border-gray-200 cursor-not-allowed bg-gray-50' 
                          : 'text-gray-700 border-gray-300 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 shadow-sm hover:shadow-md'
                      }`}
                      disabled={currentStep === 1}
                    >
                      <svg className={`w-5 h-5 mr-2 transition-transform ${currentStep > 1 ? 'group-hover:-translate-x-1' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </button>
                    
                    {currentStep < totalSteps ? (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="group flex items-center px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        {currentStep === 1 ? 'Continue to Address' : currentStep === 2 ? 'Continue to Confirmation' : 'Complete Order'}
                        <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className={`group flex items-center px-8 py-3.5 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl ${
                          isSubmitting
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700 transform hover:scale-105 hover:shadow-2xl'
                        }`}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin w-5 h-5 border-3 border-white border-t-transparent rounded-full mr-3"></div>
                            <span>Processing Payment...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Complete Order
                            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  
                  {/* Status Messages */}
                  {orderStatus.error && (
                    <div className="mt-6 p-5 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-md animate-fade-in">
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
                    <div className="mt-6 p-5 bg-green-50 border-l-4 border-green-500 rounded-lg shadow-md animate-fade-in">
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
