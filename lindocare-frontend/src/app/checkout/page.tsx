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
  const [paymentMethod, setPaymentMethod] = useState("dpo");
  
  // Step management
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
  
  // Form validation errors
  const [addressErrors, setAddressErrors] = useState<Partial<Record<keyof AddressData, string>>>({});
  const [customerErrors, setCustomerErrors] = useState<{name?: string, email?: string, phone?: string}>({});

  const [orderStatus, setOrderStatus] = useState<{ success?: string; error?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentRedirectUrl, setPaymentRedirectUrl] = useState("");
  const [users, setUsers] = useState<any[]>([]); // optional (kept as in your original)
  const [isLoadingCart, setIsLoadingCart] = useState(true);
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

  // Step validation functions
  const validateCustomerInfo = () => {
    const errors: {name?: string, email?: string, phone?: string} = {};
    if (!customerName.trim()) errors.name = "Name is required";
    if (!customerEmail.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(customerEmail)) errors.email = "Invalid email format";
    if (!customerPhone.trim()) errors.phone = "Phone number is required";
    
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

  const handleNextStep = () => {
    console.log('handleNextStep called, currentStep:', currentStep);
    setOrderStatus({}); // Clear any previous errors
    
    if (currentStep === 1) {
      console.log('Validating customer info:', { customerName, customerEmail, customerPhone });
      if (validateCustomerInfo()) {
        console.log('Customer info valid, moving to step 2');
        setCurrentStep(2);
      } else {
        console.log('Customer info invalid');
        setOrderStatus({ error: "Please fill in all customer information correctly." });
      }
    } else if (currentStep === 2) {
      console.log('Validating address info:', addressData);
      if (validateAddress()) {
        console.log('Address info valid, moving to step 3');
        setCurrentStep(3);
      } else {
        console.log('Address info invalid');
        setOrderStatus({ error: "Please complete all address fields." });
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
    if (!validateCustomerInfo() || !validateAddress() || !paymentMethod) {
      setOrderStatus({ error: "Please complete all steps correctly." });
      setIsSubmitting(false);
      return;
    }

    try {
      const token = getAuthToken();

      // Calculate total amount from cart items
      const totalAmount = cartItems.reduce((sum, item) => {
        const itemTotal = (item.price || 0) * (item.quantity || 1);
        return sum + itemTotal;
      }, 0);

      // Prepare order items for the API
      const orderItems = cartItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity || 1,
        price: item.price || 0,
      }));

      // Prepare order data with new address structure
     const orderData = {
  paymentMethod: paymentMethod || "dpo",
  province: addressData.province,
  district: addressData.district,
  sector: addressData.sector,
  cell: addressData.cell,
  village: addressData.village,
  street: addressData.street,
  customerEmail,
  customerPhone,
  customerName,
  items: orderItems,
  totalAmount,
};

      console.log("Order data being sent to API (formatted):", orderData);
      console.log("Cart items:", cartItems);
      console.log("Total amount calculated:", totalAmount);

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

      if (orderResponse.ok) {
        const orderResult = await orderResponse.json();
        console.log("Order created:", orderResult);

        const orderId = orderResult.order?._id || orderResult.orderId;

        // Prepare name for DPO init from full name safely
        const [firstNameRaw, ...restName] = customerName.trim().split(/\s+/);
        const firstName = firstNameRaw || "Customer";
        const lastName = restName.join(" ") || firstName;

        if (paymentMethod === "dpo") {
          // Initialize DPO with derived names
          const dpoInitBody = {
            orderId: String(orderId || ""),
            totalAmount: totalAmount,
            currency: "RWF",
            email: customerEmail,
            phone: customerPhone,
            firstName,
            lastName,
            serviceDescription: `Payment for order ${orderId} - ${cartItems.length} item(s) from Lindocare`,
            callbackUrl: "https://lindocae-frontend.vercel.app/payment-success",
          };

          console.log("Initializing DPO with:", dpoInitBody);
          const dpoResponse = await fetch(
            "https://lindo-project.onrender.com/dpo/initialize/dpoPayment",
            {
              method: "POST",
              headers: {
                accept: "application/json",
                "Content-Type": "application/json",
              },
              body: JSON.stringify(dpoInitBody),
            }
          );

          if (dpoResponse.ok) {
            const dpoData = await dpoResponse.json();
            const redirectUrl = dpoData.redirectUrl || dpoData.paymentUrl;
            if (redirectUrl) {
              setPaymentRedirectUrl(redirectUrl);
              setOrderStatus({ success: "Order created! Redirecting to payment gateway..." });
              try {
                if (isUserLoggedIn()) await clearCartServer();
                else saveLocalCart([]);
                setCartItems([]);
              } catch {}
              if ((dpoData as any).token) {
                localStorage.setItem("dpoPaymentToken", (dpoData as any).token);
                localStorage.setItem("pendingOrderId", String(orderId || ""));
                localStorage.setItem("pendingOrderAmount", String(totalAmount));
              }
              setTimeout(() => {
                window.location.href = redirectUrl;
              }, 1500);
            } else {
              setOrderStatus({
                success: "Order created successfully. Proceed to payment from your orders page.",
              });
            }
          } else {
            const orderRedirectUrl =
              orderResult.pesapalRedirectUrl ||
              orderResult.redirectUrl ||
              orderResult.order?.redirectUrl;
            if (orderRedirectUrl) {
              setPaymentRedirectUrl(orderRedirectUrl);
              setOrderStatus({ success: "Order created! Redirecting to payment gateway..." });
              setTimeout(() => {
                window.location.href = orderRedirectUrl;
              }, 1500);
            } else {
              setOrderStatus({ error: "Payment initialization failed. Please try again." });
            }
          }
        } else {
          // Other payment methods rely on backend-provided redirect
          const redirectUrl =
            orderResult.pesapalRedirectUrl ||
            orderResult.redirectUrl ||
            orderResult.order?.redirectUrl;
          if (redirectUrl) {
            setPaymentRedirectUrl(redirectUrl);
            setOrderStatus({ success: "Order created! Redirecting to payment gateway..." });
            try {
              if (isUserLoggedIn()) await clearCartServer();
              else saveLocalCart([]);
              setCartItems([]);
            } catch {}
            setTimeout(() => {
              window.location.href = redirectUrl;
            }, 1500);
          } else {
            setOrderStatus({ success: "Order created successfully." });
          }
        }
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

        setOrderStatus({
          error:
            errorData.message || `Failed to create order (${orderResponse.status}). Please try again.`,
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
    <div className="min-h-screen bg-white py-6 px-4">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-700 mb-2">Secure Checkout</h1>
          <p className="text-gray-600">Complete your order in 3 simple steps</p>
          {/* Debug info - remove in production */}
        </div>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 md:space-x-8">
            {[1, 2, 3].map((step) => {
              const stepNames = ['Customer Info', 'Shipping Address', 'Payment'];
              const isCompleted = currentStep > step;
              const isActive = currentStep === step;
              
              return (
                <div key={step} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300
                      ${isCompleted 
                        ? 'bg-blue-600 text-white' 
                        : isActive 
                          ? 'bg-blue-700 text-white border-2 border-blue-700' 
                          : 'bg-gray-200 text-gray-500'
                      }
                    `}>
                      {isCompleted ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        step
                      )}
                    </div>
                    <span className={`mt-2 text-sm font-medium ${
                      isActive ? 'text-blue-700' : isCompleted ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {stepNames[step - 1]}
                    </span>
                  </div>
                  {step < 3 && (
                    <div className={`w-16 md:w-24 h-0.5 mx-4 transition-all duration-300 ${
                      currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="bg-white rounded-2xl  overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left: Order Summary */}
            <div className="lg:w-2/5 bg-white p-6 border-r border-gray-200">
              <h2 className="text-xl font-bold text-blue-700 mb-4">Order Summary</h2>
              {isLoadingCart ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                  Loading your cart...
                </div>
              ) : cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">Your cart is empty.</div>
                  <button
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={() => router.push("/all-products")}
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <>
                  {/* Order Items */}
                  <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                    {cartItems.map((item, idx) => (
                      <div key={`cart-${String((item as any)?.id ?? "")}-${idx}`} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-700">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {(() => {
                            let image = "";
                            if (Array.isArray(item.image) && item.image.length > 0) image = item.image[0];
                            else if (typeof item.image === "string") image = item.image;
                            image = normalizeImageUrl(image);

                            return image && image.trim().length > 0 ? (
                              <img src={image} alt={item.name} className="object-cover w-full h-full" />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                                📦
                              </div>
                            );
                          })()}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 text-sm">{item.name || "Product"}</div>
                          <div className="text-xs text-gray-500">Qty: {item.quantity || 1}</div>
                        </div>
                        <div className="font-semibold text-blue-600 text-sm">
                          {formatRWF(item.price || 0)} RWF
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Price Summary */}
                  <div className="border-t border-blue-700 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium text-gray-600">{formatRWF(subtotal)} RWF</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-blue-700 pt-2">
                      <span className="text-gray-900">Total</span>
                      <span className="text-blue-600">{formatRWF(subtotal)} RWF</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right: Step Content */}
            <div className="lg:w-3/5 p-6 bg-white">
              {cartItems.length > 0 && (
                <form onSubmit={handleCheckout}>
                  {/* Step 1: Customer Information */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-blue-700 mb-2">Customer Information</h2>
                        <p className="text-gray-600">Let us know how to contact you</p>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <input
                              type="text"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              placeholder="John Doe"
                              className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-lg outline-none transition-all duration-200 ${
                                customerErrors.name 
                                  ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                                  : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                              }`}
                            />
                            {customerErrors.name && (
                              <p className="mt-1 text-sm text-red-600">{customerErrors.name}</p>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <input
                              type="email"
                              value={customerEmail}
                              onChange={(e) => setCustomerEmail(e.target.value)}
                              placeholder="customer@example.com"
                              className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-lg outline-none transition-all duration-200 ${
                                customerErrors.email 
                                  ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                                  : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                              }`}
                            />
                            {customerErrors.email && (
                              <p className="mt-1 text-sm text-red-600">{customerErrors.email}</p>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number <span className="text-red-500">*</span>
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
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              placeholder="+2507XXXXXXXX"
                              className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-lg outline-none transition-all duration-200 ${
                                customerErrors.phone 
                                  ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                                  : 'border-gray-300 focus:border-lindo-blue focus:ring-2 focus:ring-blue-100'
                              }`}
                            />
                            {customerErrors.phone && (
                              <p className="mt-1 text-sm text-red-600">{customerErrors.phone}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Step 2: Shipping Address */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-blue-700 mb-2">Delivery  Address</h2>
                        <p className="text-gray-600">Where should we deliver your order?</p>
                      </div>
                      
                      <AddressSelector
                        value={addressData}
                        onChange={setAddressData}
                        errors={addressErrors}
                        required={true}
                        disabled={isSubmitting}
                      />
                    </div>
                  )}
                  
                  {/* Step 3: Payment Method */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Method</h2>
                        <p className="text-gray-600">Choose how you'd like to pay</p>
                      </div>
                      
                      <div className="max-w-md mx-auto">
                        <label className="flex items-center p-4 border-2 border-blue-600 bg-blue-50 rounded-lg cursor-pointer transition-all duration-200">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="dpo"
                            checked={paymentMethod === "dpo"}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="mr-3 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-600 rounded-lg">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-semibold text-blue-600">DPO Payment Gateway</div>
                              <div className="text-sm text-gray-600">Secure payment processing</div>
                            </div>
                          </div>
                        </label>
                      </div>
                      
                      {/* Order Review */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-3">Order Review</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Customer:</span>
                            <span className="font-medium">{customerName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium">{customerEmail}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-medium">{customerPhone}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Address:</span>
                            <span className="font-medium text-right">
                              {[addressData.street, addressData.village, addressData.cell, addressData.sector, addressData.district, addressData.province]
                                .filter(Boolean)
                                .join(', ') || 'Not specified'}
                            </span>
                          </div>
                          <div className="flex justify-between border-t pt-2 mt-2">
                            <span className="font-semibold text-gray-900">Total Amount:</span>
                            <span className="font-bold text-blue-600">{formatRWF(subtotal)} RWF</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Navigation Buttons */}
                  <div className="flex justify-between items-center pt-6  mt-8">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className={`px-6 py-2.5 border border-gray-300 rounded-lg font-medium transition-colors ${
                        currentStep === 1 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg'
                      }`}
                      disabled={currentStep === 1}
                    >
                      ← Previous
                    </button>
                    
                    {currentStep < totalSteps ? (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                      >
                        Next Step →
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className={`px-8 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
                          isSubmitting
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-yellow-400 text-blue-600 hover:bg-yellow-500 transform hover:scale-105'
                        }`}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                            <span>Processing...</span>
                          </div>
                        ) : (
                          'Complete Order'
                        )}
                      </button>
                    )}
                  </div>

                  
                  {/* Status Messages */}
                  {orderStatus.error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center text-red-700">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">{orderStatus.error}</span>
                      </div>
                    </div>
                  )}
                  {orderStatus.success && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center text-green-700">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">{orderStatus.success}</span>
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
