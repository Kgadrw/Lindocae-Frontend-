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
// AddressSelector removed - using registration address data
import { getUserInfo, getCurrentUserForOrder } from "../../utils/userInfo";

interface Product {
  id: string | number;
  name: string;
  price: number;
  image: string | string[];
  quantity?: number;
}

interface AddressData {
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
}

// Helper to format RWF with thousands separator
function formatRWF(amount: number | undefined | null) {
  if (amount === undefined || amount === null) return "0";
  return amount.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("dpo");
  
  // Step management - 2 step checkout
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  // Address data using the new structure
  const [addressData, setAddressData] = useState<AddressData>({
    province: '',
    district: '',
    sector: '',
    cell: '',
    village: ''
  });

  // Customer info
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  
  // Form validation errors
  // AddressErrors removed - using registration address data
  const [customerErrors, setCustomerErrors] = useState<{name?: string, email?: string, phone?: string}>({});
  const [orderStatus, setOrderStatus] = useState<{ success?: string; error?: string; showFallbackOptions?: boolean; orderId?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(true);
  const router = useRouter();

  // Load user information automatically if logged in
  useEffect(() => {
    async function loadUserInfo() {
      if (isUserLoggedIn()) {
        try {
          console.log('=== LOADING USER INFO ON PAGE LOAD ===');
          const userInfo = await getUserInfo();
          console.log('getUserInfo() result:', userInfo);
          if (userInfo) {
            console.log('Auto-populated user info from account:', userInfo);
            // Auto-populate name and email fields
            if (userInfo.fullName) {
              console.log('Setting customerName to:', userInfo.fullName);
              setCustomerName(userInfo.fullName);
            }
            if (userInfo.email) {
              console.log('Setting customerEmail to:', userInfo.email);
              setCustomerEmail(userInfo.email);
            }
            if (userInfo.phone) {
              console.log('Setting customerPhone to:', userInfo.phone);
              setCustomerPhone(userInfo.phone);
            }
            
            // Auto-populate address information from registration
            if (userInfo.address) {
              setAddressData({
                province: userInfo.address.province || '',
                district: userInfo.address.district || '',
                sector: userInfo.address.sector || '',
                cell: userInfo.address.cell || '',
                village: userInfo.address.village || ''
              });
            }
          } else {
            console.log('No user info from API, trying localStorage fallback');
            // Fallback: try to get basic info from localStorage
            const email = localStorage.getItem('userEmail');
            if (email) {
              setCustomerEmail(email);
              const name = localStorage.getItem(`userName:${email}`);
              if (name) {
                setCustomerName(name);
              }
              const phone = localStorage.getItem(`userPhone:${email}`);
              if (phone) {
                setCustomerPhone(phone);
              }
            }
          }
        } catch (error) {
          console.error('Error loading user info:', error);
          // Fallback: try to get basic info from localStorage
          const email = localStorage.getItem('userEmail');
          if (email) {
            setCustomerEmail(email);
            const name = localStorage.getItem(`userName:${email}`);
            if (name) {
              setCustomerName(name);
            }
            const phone = localStorage.getItem(`userPhone:${email}`);
            if (phone) {
              setCustomerPhone(phone);
            }
          }
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

  // Address validation removed - using registration address data

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
      console.log('Using registration address, moving to payment step');
        setCurrentStep(2);
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

    // Final validation - only validate customer info since address comes from registration
    if (!validateCustomerInfo()) {
      setOrderStatus({ error: "Please complete all required fields correctly." });
      setIsSubmitting(false);
      return;
    }

    // Ensure customer information is populated from user account
    if (isUserLoggedIn() && (!customerEmail || !customerName)) {
      setOrderStatus({ error: "Unable to retrieve user information. Please refresh the page and try again." });
      setIsSubmitting(false);
      return;
    }

    // Ensure user is logged in (required for order creation)
    if (!isUserLoggedIn()) {
      setOrderStatus({ error: "Please log in to place an order." });
      setIsSubmitting(false);
      return;
    }

    // Ensure we have cart items
    if (cartItems.length === 0) {
      setOrderStatus({ error: "Your cart is empty. Please add items before checkout." });
      setIsSubmitting(false);
      return;
    }

    try {
      // Step 1: Create Order
      // Prepare items for API (same format as cart page)
      const items = cartItems.map(item => ({
        productId: String(item.id),
        quantity: item.quantity || 1,
        price: item.price,
      }));

      // Validate items array
      if (items.length === 0) {
        setOrderStatus({ error: "No items in cart. Please add items before checkout." });
        setIsSubmitting(false);
        return;
      }

      // Check for invalid items
      const invalidItems = items.filter(item => !item.productId || !item.price || item.price <= 0);
      if (invalidItems.length > 0) {
        console.error("Invalid items found:", invalidItems);
        setOrderStatus({ error: "Some items in your cart have invalid data. Please refresh and try again." });
        setIsSubmitting(false);
        return;
      }

      // Validate shipping address - only required fields according to API spec
      if (!addressData.province || !addressData.district || !addressData.sector || !addressData.cell || !addressData.village) {
        setOrderStatus({ error: "Please complete your address information (province, district, sector, cell, village)." });
        setIsSubmitting(false);
        return;
      }

      // Fetch user account data for order details using unified system
      let userAccountData = null;
      try {
        console.log("=== FETCHING USER ACCOUNT DATA ===");
        userAccountData = await getCurrentUserForOrder();
        console.log("Fetched user account data:", userAccountData);
        console.log("Type of userAccountData:", typeof userAccountData);
        console.log("Is userAccountData null?", userAccountData === null);
        console.log("Is userAccountData undefined?", userAccountData === undefined);
      } catch (error) {
        console.error("Error fetching user account data:", error);
        console.error("Error details:", error.message);
      }

      // Use the correct API format with shippingAddress as an object (matching provided API spec)
      const orderData = {
        paymentMethod: paymentMethod,
        userId: userAccountData?.userId || "", // Link order to user account
        shippingAddress: {
          province: addressData.province || userAccountData?.address?.province || "",
          district: addressData.district || userAccountData?.address?.district || "",
          sector: addressData.sector || userAccountData?.address?.sector || "",
          cell: addressData.cell || userAccountData?.address?.cell || "",
          village: addressData.village || userAccountData?.address?.village || "",
          customerName: userAccountData?.fullName || customerName,
          customerEmail: userAccountData?.email || customerEmail,
          customerPhone: userAccountData?.phone || customerPhone
        }
      };

      // Final validation of order data
      if (!paymentMethod || items.length === 0) {
        setOrderStatus({ error: "Missing required order information. Please check your cart and payment method." });
        setIsSubmitting(false);
        return;
      }

      // Validate customer information in shipping address
      if (!orderData.shippingAddress.customerName || !orderData.shippingAddress.customerEmail || !orderData.shippingAddress.customerPhone) {
        setOrderStatus({ 
          error: "Missing customer information. Please ensure your profile is complete with name, email, and phone number." 
        });
        setIsSubmitting(false);
        return;
      }

      // Validate user account data with detailed logging
      console.log("=== USER ACCOUNT DATA VALIDATION ===");
      console.log("userAccountData exists:", !!userAccountData);
      if (userAccountData) {
        console.log("userAccountData.userId:", userAccountData.userId);
        console.log("userAccountData.email:", userAccountData.email);
        console.log("userAccountData.fullName:", userAccountData.fullName);
        console.log("userAccountData.phone:", userAccountData.phone);
        console.log("userAccountData.address:", userAccountData.address);
        console.log("Full userAccountData object:", userAccountData);
      }

      // Check what's missing
      const missingFields = [];
      if (!userAccountData) {
        missingFields.push("userAccountData is null/undefined");
      } else {
        if (!userAccountData.email) missingFields.push("email");
        if (!userAccountData.fullName) {
          missingFields.push("fullName");
        }
        if (!userAccountData.phone) missingFields.push("phone");
        if (!userAccountData.userId) missingFields.push("userId");
      }

      if (missingFields.length > 0) {
        console.error("Missing user account fields:", missingFields);
        
        // Try to use form data as fallback
        console.log("=== TRYING FORM DATA FALLBACK ===");
        console.log("customerName from form:", customerName);
        console.log("customerEmail from form:", customerEmail);
        console.log("customerPhone from form:", customerPhone);
        
        if (!customerName || !customerEmail) {
          setOrderStatus({ 
            error: `Missing required user account information: ${missingFields.join(", ")}. Please complete your profile or refresh the page.` 
          });
          setIsSubmitting(false);
          return;
        } else {
          console.log("Using form data as fallback for missing user account data");
          // Update userAccountData with form data
          userAccountData = {
            ...userAccountData,
            userId: userAccountData?.userId || '',
            fullName: customerName,
            email: customerEmail,
            phone: customerPhone,
            address: userAccountData?.address || {}
          };
        }
      }

      console.log("Creating order with items:", items);
      console.log("Items array length:", items.length);
      console.log("Items array details:", items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        productIdType: typeof item.productId
      })));
      console.log("Shipping address object:", orderData.shippingAddress);
      console.log("User account data used:", {
        name: userAccountData?.fullName,
        email: userAccountData?.email,
        phone: userAccountData?.phone,
        address: userAccountData?.address
      });
      console.log("Full order data:", orderData);

      // Get auth token - this is required for order creation
      const token = getAuthToken();
      console.log("Auth token available:", !!token);
      
      if (!token) {
        setOrderStatus({ error: "Authentication required. Please log in to place an order." });
        setIsSubmitting(false);
        return;
      }
      
      const headers: Record<string, string> = {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      console.log("Request headers:", headers);
      console.log("Request body:", JSON.stringify(orderData, null, 2));
      console.log("Request body size:", JSON.stringify(orderData).length, "characters");
      console.log("Shipping address validation:", {
        hasProvince: !!orderData.shippingAddress.province,
        hasDistrict: !!orderData.shippingAddress.district,
        hasSector: !!orderData.shippingAddress.sector,
        hasCell: !!orderData.shippingAddress.cell,
        hasVillage: !!orderData.shippingAddress.village,
        hasCustomerName: !!orderData.shippingAddress.customerName,
        hasCustomerEmail: !!orderData.shippingAddress.customerEmail,
        hasCustomerPhone: !!orderData.shippingAddress.customerPhone
      });
      
      console.log("Customer information in order:", {
        customerName: orderData.shippingAddress.customerName,
        customerEmail: orderData.shippingAddress.customerEmail,
        customerPhone: orderData.shippingAddress.customerPhone
      });

      console.log("=== ORDER DATA BEING SENT ===");
      console.log("Full orderData:", JSON.stringify(orderData, null, 2));
      console.log("Order data keys:", Object.keys(orderData));
      console.log("Shipping address keys:", Object.keys(orderData.shippingAddress));
      console.log("Shipping address values:", orderData.shippingAddress);
      
      // Pre-request validation
      console.log("=== PRE-REQUEST VALIDATION ===");
      const validationIssues = [];
      if (!orderData.paymentMethod) validationIssues.push("paymentMethod is missing");
      if (!orderData.userId) validationIssues.push("userId is missing");
      if (!orderData.shippingAddress.province) validationIssues.push("province is missing");
      if (!orderData.shippingAddress.district) validationIssues.push("district is missing");
      if (!orderData.shippingAddress.customerName) validationIssues.push("customerName is missing");
      if (!orderData.shippingAddress.customerEmail) validationIssues.push("customerEmail is missing");
      if (!orderData.shippingAddress.customerPhone) validationIssues.push("customerPhone is missing");
      
      if (validationIssues.length > 0) {
        console.error("Validation issues found:", validationIssues);
        setOrderStatus({ error: `Missing required fields: ${validationIssues.join(", ")}` });
        setIsSubmitting(false);
        return;
      }
      
      console.log("All validation checks passed");

      const orderResponse = await fetch(
        "https://lindo-project.onrender.com/orders/createOrder",
        {
          method: "POST",
          headers,
          body: JSON.stringify(orderData),
        }
      );

      console.log("Order response status:", orderResponse.status);
      console.log("Order response headers:", Object.fromEntries(orderResponse.headers.entries()));

      // Check for success (201 like cart page expects)
      if (orderResponse.status === 201) {
        const orderResult = await orderResponse.json();
        console.log("Order created successfully:", orderResult);
        const orderId = orderResult.order?._id || orderResult.orderId || orderResult._id;

      // Step 2: Initialize DPO Payment
      if (paymentMethod === "dpo") {
        // For DPO payment, initialize payment gateway
        console.log("DPO payment selected - initializing payment gateway");
        
        // Validate required fields before payment initialization
        if (!orderId) {
          setOrderStatus({ error: "Order ID is missing. Please try again." });
          setIsSubmitting(false);
          return;
        }
          
        if (subtotal <= 0) {
          setOrderStatus({ error: "Invalid order amount. Please try again." });
        setIsSubmitting(false);
        return;
      }

        // DPO API requires all these fields according to the error message
      const dpoData = {
        orderId: orderId,
        totalAmount: subtotal,
        currency: "RWF",
        serviceDescription: `Payment for order #${orderId}`,
        callbackUrl: `${window.location.origin}/payment-success`,
        email: userAccountData?.email || customerEmail,
        phone: userAccountData?.phone || customerPhone,
        firstName: userAccountData?.fullName?.split(' ')[0] || customerName?.split(' ')[0] || "Customer"
      };

        console.log("Initializing DPO payment with data:", dpoData);
        console.log("DPO API validation:", {
          orderId: orderId,
          totalAmount: subtotal,
          currency: "RWF",
          serviceDescription: `Payment for order #${orderId}`,
          callbackUrl: `${window.location.origin}/payment-success`,
          email: dpoData.email,
          phone: dpoData.phone,
          firstName: dpoData.firstName
        });
          
        // Validate all required DPO fields according to API specification
        const missingDpoFields = [];
        if (!dpoData.orderId) missingDpoFields.push("orderId");
        if (!dpoData.totalAmount || dpoData.totalAmount <= 0) missingDpoFields.push("totalAmount");
        if (!dpoData.currency) missingDpoFields.push("currency");
        if (!dpoData.serviceDescription) missingDpoFields.push("serviceDescription");
        if (!dpoData.callbackUrl) missingDpoFields.push("callbackUrl");
        if (!dpoData.email) missingDpoFields.push("email");
        if (!dpoData.phone) missingDpoFields.push("phone");
        if (!dpoData.firstName) missingDpoFields.push("firstName");
          
        if (missingDpoFields.length > 0) {
          console.error("Missing required DPO fields:", missingDpoFields);
          setOrderStatus({ 
            error: `Missing required fields for payment: ${missingDpoFields.join(", ")}. Please contact support.` 
          });
          setIsSubmitting(false);
          return;
        }

      console.log("=== DPO REQUEST DETAILS ===");
      console.log("DPO URL:", "https://lindo-project.onrender.com/dpo/initialize/dpoPayment");
      console.log("DPO Request Headers:", {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      });
      console.log("DPO Request Body:", JSON.stringify(dpoData, null, 2));

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

      console.log("=== DPO RESPONSE DETAILS ===");
      console.log("DPO response status:", dpoResponse.status);
      console.log("DPO response statusText:", dpoResponse.statusText);
      console.log("DPO response headers:", Object.fromEntries(dpoResponse.headers.entries()));

      if (dpoResponse.ok) {
        const dpoResult = await dpoResponse.json();
        console.log("DPO payment initialized:", dpoResult);

          // Check if we have the expected response format
          if (dpoResult.redirectUrl) {
            console.log("DPO payment successful, redirecting to:", dpoResult.redirectUrl);

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
            localStorage.setItem("pendingOrderAmount", String(subtotal));
            if (dpoResult.order && dpoResult.order.dpoTransactionToken) {
              localStorage.setItem("dpoToken", dpoResult.order.dpoTransactionToken);
            }
            
            // Redirect to DPO payment gateway
            window.location.href = dpoResult.redirectUrl;
            return;
          } else {
            console.error("Unexpected DPO response format:", dpoResult);
        setOrderStatus({
              error: "Payment initialization succeeded but received unexpected response format. Please contact support."
        });
          }
              
        } else {
          // Handle DPO initialization error
          console.log("=== DPO ERROR HANDLING ===");
          let dpoErrorData: any = {};
          let dpoResponseText = "";
          try {
            dpoResponseText = await dpoResponse.text();
            console.log("DPO error response text:", dpoResponseText);
            console.log("DPO error response length:", dpoResponseText.length);
            if (dpoResponseText) {
              try {
                dpoErrorData = JSON.parse(dpoResponseText);
                console.log("DPO error data parsed:", dpoErrorData);
              } catch (jsonError) {
                console.log("Failed to parse DPO error as JSON:", jsonError);
                dpoErrorData = { message: dpoResponseText, rawResponse: dpoResponseText };
              }
            } else {
              console.log("DPO error response is empty");
              dpoErrorData = { message: "Empty response from DPO server" };
            }
          } catch (parseError) {
            console.error("Error getting DPO response text:", parseError);
            dpoErrorData = { message: "Failed to get response from DPO server", parseError: parseError.message };
          }

          console.error("=== DPO INITIALIZATION ERROR SUMMARY ===");
          console.error("Status:", dpoResponse.status);
          console.error("Status Text:", dpoResponse.statusText);
          console.error("Error Data:", dpoErrorData);
          console.error("Request Data:", JSON.stringify(dpoData, null, 2));
          console.error("Response Text:", dpoResponseText);
          console.error("=== TROUBLESHOOTING INFO ===");
          console.error("This appears to be a server-side DPO API issue.");
          console.error("Possible causes:");
          console.error("1. DPO API credentials not configured");
          console.error("2. DPO service endpoint issues");
          console.error("3. Server authentication problems");
          console.error("4. DPO API rate limiting or restrictions");
          
          // Provide user-friendly error messages and fallback options
          let userErrorMessage = "";
          let showFallbackOptions = false;
          
          if (dpoResponse.status === 403 || dpoErrorData.message?.includes("403")) {
            userErrorMessage = "Payment service is temporarily unavailable. Your order has been created successfully!";
            showFallbackOptions = true;
          } else if (dpoResponse.status === 500 || dpoErrorData.message?.includes("Failed to initiate payment")) {
            userErrorMessage = "Payment gateway is experiencing issues. Your order has been created successfully!";
            showFallbackOptions = true;
          } else {
            userErrorMessage = `Payment initialization failed: ${dpoErrorData.message || 'Unknown error'} (Status: ${dpoResponse.status}). Your order has been created successfully!`;
            showFallbackOptions = true;
          }
          
          setOrderStatus({
            error: userErrorMessage,
            showFallbackOptions: showFallbackOptions,
            orderId: orderId
          });
        }
      }
        
        setIsSubmitting(false);
        return;
      }

      if (!orderResponse.ok) {
        // Handle order creation error
        let errorData: any = {};
        let responseText = "";
        try {
          responseText = await orderResponse.text();
          console.log("Order creation error response text:", responseText);
          console.log("Response text length:", responseText.length);
          console.log("Response text type:", typeof responseText);
          
          if (responseText && responseText.trim()) {
            try {
              errorData = JSON.parse(responseText);
              console.log("Parsed error data:", errorData);
            } catch (jsonParseError) {
              console.log("Failed to parse as JSON:", jsonParseError);
              errorData = { message: responseText };
            }
          } else {
            console.log("Empty response text");
            errorData = { message: `Server error (${orderResponse.status})` };
          }
        } catch (parseError) {
          console.log("Failed to get response text:", parseError);
          errorData = { message: `Network error (${orderResponse.status})` };
        }

        console.error("=== ORDER CREATION ERROR DETAILS ===");
        console.error("Status:", orderResponse.status);
        console.error("Status Text:", orderResponse.statusText);
        console.error("Error Data:", errorData);
        console.error("Request Data:", JSON.stringify(orderData, null, 2));
        console.error("Response Headers:", Object.fromEntries(orderResponse.headers.entries()));
        console.error("=== FIELD VALIDATION CHECK ===");
        console.error("paymentMethod:", orderData.paymentMethod);
        console.error("userId:", orderData.userId);
        console.error("shippingAddress.province:", orderData.shippingAddress.province);
        console.error("shippingAddress.district:", orderData.shippingAddress.district);
        console.error("shippingAddress.sector:", orderData.shippingAddress.sector);
        console.error("shippingAddress.cell:", orderData.shippingAddress.cell);
        console.error("shippingAddress.village:", orderData.shippingAddress.village);
        console.error("shippingAddress.customerName:", orderData.shippingAddress.customerName);
        console.error("shippingAddress.customerEmail:", orderData.shippingAddress.customerEmail);
        console.error("shippingAddress.customerPhone:", orderData.shippingAddress.customerPhone);
        setOrderStatus({
          error: errorData.message || `Failed to create order (${orderResponse.status}). Please try again.`,
        });
        setIsSubmitting(false);
        return;
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
            <p className="text-gray-600">Complete your order in 2 simple steps • Secure DPO Payment</p>
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2 md:space-x-4">
            {[1, 2].map((step) => {
              const stepNames = ['Delivery Info', 'Payment'];
              const stepDescriptions = ['Delivery Address', 'DPO Payment'];
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
                  {/* Step 1: Address Display */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-950 mb-4">Delivery Address</h2>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-2">Your registered address will be used for delivery:</p>
                          <div className="text-sm text-gray-800">
                            {addressData.province && addressData.district && addressData.sector && addressData.cell && addressData.village ? (
                              <span>
                                {[addressData.village, addressData.cell, addressData.sector, addressData.district, addressData.province]
                                  .filter(Boolean)
                                  .join(', ')}
                              </span>
                            ) : (
                              <span className="text-gray-500 italic">Loading your address...</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Payment Method */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-950 mb-4">Payment Method</h2>
                        
                        {/* Payment Method - DPO Only */}
                        <div className="p-4 border-2 border-blue-500 bg-blue-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <input
                                type="radio"
                                name="payment"
                                value="dpo"
                              checked={true}
                              readOnly
                                className="w-4 h-4 text-blue-600"
                              />
                              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                                <span className="text-white font-bold text-xs">DPO</span>
                              </div>
                            <span className="font-medium text-gray-950">DPO Payment Gateway</span>
                          </div>
                        </div>
                        
                        {/* Payment Instructions */}
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-semibold text-gray-950 mb-2">Payment Process:</h4>
                            <div className="space-y-2 text-sm text-gray-950">
                            <p>1. Click "Complete Order" to proceed</p>
                            <p>2. You will be redirected to DPO payment gateway</p>
                            <p>3. Complete your payment securely</p>
                            <p>4. Return to our site for confirmation</p>
                            </div>
                          </div>
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
                        {/* AddressSelector removed - using registration address data */}
                        
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
                          <h3 className="text-sm font-bold text-red-800 mb-1">Payment Issue</h3>
                          <p className="text-sm text-red-700">{orderStatus.error}</p>
                          
                          {/* Fallback Payment Options */}
                          {orderStatus.showFallbackOptions && (
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <h4 className="text-sm font-bold text-blue-800 mb-2">Alternative Payment Options:</h4>
                              <div className="space-y-2 text-sm text-blue-700">
                                <p><strong>Order ID:</strong> {orderStatus.orderId}</p>
                                <p><strong>Amount:</strong> {formatRWF(subtotal)} RWF</p>
                                <div className="mt-3 space-y-1">
                                  <p>1. <strong>Bank Transfer:</strong> Contact us for bank details</p>
                                  <p>2. <strong>Mobile Money:</strong> Use code *182*8*1*079559#</p>
                                  <p>3. <strong>Cash on Delivery:</strong> Pay when you receive your order</p>
                                </div>
                                <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded">
                                  <p className="text-xs text-yellow-800">
                                    <strong>Note:</strong> Please include your Order ID when making payment and contact our support team to confirm.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
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

