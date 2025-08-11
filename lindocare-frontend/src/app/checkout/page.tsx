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

interface Product {
  id: string | number;
  name: string;
  price: number;
  image: string;
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
  const [shippingProvince, setShippingProvince] = useState("");
  const [shippingDistrict, setShippingDistrict] = useState("");
  const [shippingSector, setShippingSector] = useState("");
  const [shippingCell, setShippingCell] = useState("");
  const [shippingVillage, setShippingVillage] = useState("");
  const [shippingStreet, setShippingStreet] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerFirstName, setCustomerFirstName] = useState("");
  const [customerLastName, setCustomerLastName] = useState("");
  const [orderStatus, setOrderStatus] = useState<{
    success?: string;
    error?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentRedirectUrl, setPaymentRedirectUrl] = useState("");
  const [users, setUsers] = useState<any[]>([]); // Store users for header
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const router = useRouter();

  // Fetch users for header
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

  // No authentication required for checkout - users can checkout as guests

  useEffect(() => {
    async function loadCart() {
      try {
        if (isUserLoggedIn()) {
          // User is logged in, fetch from server
          console.log("Checkout: User logged in, fetching cart from server...");
          
          let serverCart;
          try {
            // Try to get cart with full product details first
            serverCart = await fetchUserCartWithProducts();
            console.log("Checkout: Server cart with products fetched successfully:", serverCart);
          } catch (productsError) {
            console.warn("Checkout: Failed to fetch cart with products, falling back to basic cart:", productsError);
            // Fallback to basic cart if product details fetch fails
            serverCart = await fetchUserCart();
            console.log("Checkout: Basic server cart fetched as fallback:", serverCart);
          }
          
          if (serverCart && serverCart.length > 0) {
          const convertedCart = serverCart.map((item) => ({
            id: item.productId,
              name: item.name || 'Product',
              price: item.price || 0,
              image: item.image || '/lindo.png',
              quantity: item.quantity || 1,
          }));
          setCartItems(convertedCart);
            console.log("Checkout: Cart items set from server:", convertedCart);
          } else {
            setCartItems([]);
            setLastCartRefresh(new Date());
            console.log("Checkout: Server cart is empty");
          }
        } else {
          // User not logged in, load from localStorage
          console.log("Checkout: User not logged in, loading cart from localStorage...");
          const localCart = getLocalCart();
          const convertedCart = localCart.map((item) => ({
            id: item.productId,
            name: item.name || 'Product',
            price: item.price || 0,
            image: item.image || '/lindo.png',
            quantity: item.quantity || 1,
          }));
          setCartItems(convertedCart);
          console.log("Checkout: Cart items set from localStorage:", convertedCart);
        }
      } catch (err) {
        console.error("Error loading cart for checkout:", err);
        
        // If server fetch fails and user is logged in, try localStorage as fallback
        if (isUserLoggedIn()) {
          console.log("Checkout: Server fetch failed, trying localStorage fallback...");
          try {
        const localCart = getLocalCart();
        const convertedCart = localCart.map((item) => ({
          id: item.productId,
              name: item.name || 'Product',
              price: item.price || 0,
              image: item.image || '/lindo.png',
              quantity: item.quantity || 1,
        }));
        setCartItems(convertedCart);
            console.log("Checkout: Fallback to localStorage successful:", convertedCart);
          } catch (localError) {
            console.error("Checkout: Both server and localStorage failed:", localError);
            setCartItems([]);
          }
        } else {
          // User not logged in, just set empty cart
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
        quantity: cartItems[0].quantity
      });
    }
  }, [cartItems]);



  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderStatus({});
    setIsSubmitting(true);

    // Validate required fields
    if (
      !paymentMethod ||
      !shippingProvince ||
      !shippingDistrict ||
      !shippingSector ||
      !shippingCell ||
      !shippingVillage ||
      !shippingStreet ||
      !customerPhone ||
      !customerEmail ||
      !customerFirstName ||
      !customerLastName
    ) {
      setOrderStatus({ error: "Please fill in all required fields." });
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

      // Create structured shipping address from separate fields
      const structuredShippingAddress = {
        province: shippingProvince,
        district: shippingDistrict,
        sector: shippingSector,
        cell: shippingCell,
        village: shippingVillage,
        street: shippingStreet,
      };

      // First, create the order using required API format
      const orderData = {
        paymentMethod: "DPO",
        shippingAddress: structuredShippingAddress,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        customerName: `${customerFirstName} ${customerLastName}`,
      };

      // Validate required fields per API format
      if (!orderData.customerEmail || !orderData.customerPhone || !customerFirstName || !customerLastName) {
        setOrderStatus({ error: "Please provide email, phone, first and last name." });
        setIsSubmitting(false);
        return;
      }

      console.log("Order data being sent to API (formatted):", orderData);
      console.log("Cart items:", cartItems);
      console.log("Total amount calculated:", totalAmount);

      // passing The Token in The Local Storage
      const stored = localStorage.getItem("userData");
      
      if (!stored) {
        setOrderStatus({ error: "User data not found. Please log in again." });
        setIsSubmitting(false);
        return;
      }

      let parsed;
      try {
        parsed = JSON.parse(stored); // back to object
      } catch (error) {
        console.error("Error parsing user data:", error);
        setOrderStatus({ error: "Invalid user data. Please log in again." });
        setIsSubmitting(false);
        return;
      }

      if (!parsed?.user?.tokens?.accessToken) {
        setOrderStatus({ error: "Access token not found. Please log in again." });
        setIsSubmitting(false);
        return;
      }

      const openLock = parsed.user.tokens.accessToken;
      console.log("Access token found:", openLock ? "Present" : "Missing");

      const orderResponse = await fetch(
        "https://lindo-project.onrender.com/orders/createOrder",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            // Only include Authorization header if token exists
            Authorization: `Bearer ${openLock}`,
          },
          body: JSON.stringify(orderData),
        }
      );

      console.log("Order response status:", orderResponse.status);

      if (orderResponse.ok) {
        const orderResult = await orderResponse.json();
        console.log("Order created:", orderResult);

        const orderId = orderResult.order?._id || orderResult.orderId;

        // If backend returns a redirect URL, use it directly (preferred flow)
        const redirectUrl = orderResult.dpoRedirectUrl || orderResult.order?.dpoRedirectUrl;

        if (redirectUrl) {
          setPaymentRedirectUrl(redirectUrl);
          setOrderStatus({
            success: "Order created! Redirecting to payment gateway...",
          });

          // Clear cart after successful order creation
          try {
            if (isUserLoggedIn()) {
              await clearCartServer();
              console.log("Server cart cleared after successful order creation");
            } else {
              saveLocalCart([]);
              console.log("Local cart cleared after successful order creation");
            }
            // Update local state to reflect empty cart
            setCartItems([]);
          } catch (clearError) {
            console.error("Error clearing cart:", clearError);
            setCartItems([]);
          }

          // Optional: store order metadata for later
          if (orderResult.dpoTransactionToken) {
            localStorage.setItem("dpoPaymentToken", orderResult.dpoTransactionToken);
            localStorage.setItem("pendingOrderId", orderId || "");
          }

          // Redirect to payment page
          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 1500);
        } else {
          // No redirect provided by createOrder: initialize DPO payment per spec
          const dpoInitBody = {
            orderId: String(orderId || ""),
            totalAmount: totalAmount,
            currency: "RWF",
            email: customerEmail,
            phone: customerPhone,
            firstName: customerFirstName,
            lastName: customerLastName,
            serviceDescription: `Payment for order ${orderId} - ${cartItems.length} item(s) from Lindocare`,
            callbackUrl: "https://lindocae-frontend.vercel.app/payment/success",
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
            console.log("DPO Response:", dpoData);

            if (dpoData.redirectUrl) {
              setPaymentRedirectUrl(dpoData.redirectUrl);
              setOrderStatus({
                success: "Order created! Redirecting to payment gateway...",
              });

              // Clear cart
              try {
                if (isUserLoggedIn()) {
                  await clearCartServer();
                } else {
                  saveLocalCart([]);
                }
                setCartItems([]);
              } catch (clearError) {
                console.error("Error clearing cart:", clearError);
                setCartItems([]);
              }

              // Store token if present
              if (dpoData.token) {
                localStorage.setItem("dpoPaymentToken", dpoData.token);
                localStorage.setItem("pendingOrderId", String(orderId || ""));
                localStorage.setItem("pendingOrderAmount", String(totalAmount));
              }

              setTimeout(() => {
                window.location.href = dpoData.redirectUrl;
              }, 1500);
            } else {
              setOrderStatus({ error: "Payment initialization failed. No redirect URL returned." });
            }
          } else {
            let errorData: any = {};
            let responseText = '';
            try {
              responseText = await dpoResponse.text();
              if (responseText) errorData = JSON.parse(responseText);
            } catch {
              errorData = { message: responseText || 'Unknown error' };
            }
            console.error("DPO init error:", {
              status: dpoResponse.status,
              statusText: dpoResponse.statusText,
              errorData,
            });
            setOrderStatus({ error: errorData.message || "Payment initialization failed. Please try again." });
          }
        }
      } else if (orderResponse.status === 401) {
        const errorText = await orderResponse.text();
        console.error("Order creation 401 error response:", errorText);
        setOrderStatus({
          error:
            "Authorization failed. Please log in and try again.",
        });
      } else {
        // Enhanced error handling to see exact API response
        let errorData: any = {};
        let responseText = '';
        try {
          responseText = await orderResponse.text();
          if (responseText) {
            errorData = JSON.parse(responseText);
          }
        } catch (parseError) {
          errorData = { message: responseText || 'Unknown error' };
        }
        
        console.error("Order creation error response:", {
          status: orderResponse.status,
          statusText: orderResponse.statusText,
          responseText,
          errorData
        });
        
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-2">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow p-6 flex flex-col md:flex-row gap-8">
        {/* Left: Checkout summary and products */}
        <div className="flex-1 flex flex-col gap-4 border-r border-gray-200 pr-0 md:pr-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold text-black">Checkout</h1>
          </div>
          {isLoadingCart ? (
            <div className="text-center text-gray-500 font-semibold mb-4">
              Loading your cart...
            </div>
          ) : cartItems.length === 0 ? (
            <>
              <div className="text-center text-gray-500 font-semibold mb-4">
                Your cart is empty.
              </div>
              <button
                className="w-full rounded border border-black text-black py-2 font-bold text-base bg-white hover:bg-gray-100 transition-colors"
                onClick={() => router.push("/all-products")}
              >
                Continue Shopping
              </button>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-black font-medium">Subtotal</span>
                  <span className="text-black font-semibold">
                    {formatRWF(subtotal)} RWF
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black font-medium">
                    Estimated Shipping
                  </span>
                  <span className="text-black font-semibold">0 RWF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black font-medium">Taxes</span>
                  <span className="text-gray-400 font-normal">
                    Calculated at checkout
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center text-lg font-bold mt-2 mb-4">
                <span className="text-black">Total</span>
                <span className="text-black">{formatRWF(subtotal)} RWF</span>
              </div>
              <div className="font-semibold text-black mb-2">
                Products to Checkout
              </div>
              <div className="flex flex-col gap-3">
                {cartItems.map((item, idx) => (
                  <div
                    key={`cart-${String((item as any)?.id ?? '')}-${idx}`}
                    className="flex items-center gap-3 border-b border-gray-100 pb-2 last:border-b-0"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.image ? (
                        // Handle both string and array image formats
                        typeof item.image === "string" ? (
                      item.image.trim().length > 0 ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="object-cover w-full h-full"
                              onError={(e) => {
                                // If image fails, just log the error but don't change the src
                                console.warn('Image failed to load:', item.image);
                              }}
                              onLoad={() => {
                                console.log('Image loaded successfully:', item.image);
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                              No Image
                            </div>
                          )
                        ) : Array.isArray(item.image) ? (
                          // Handle array of images - use first image if available
                          (item.image as any[]).length > 0 ? (
                            <img
                              src={(item.image as any[])[0]}
                              alt={item.name}
                              className="object-cover w-full h-full"
                              onError={(e) => {
                                console.warn('Array image failed to load:', (item.image as any[])[0]);
                              }}
                              onLoad={() => {
                                console.log('Array image loaded successfully:', (item.image as any[])[0]);
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                              No Image
                            </div>
                          )
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                            No Image
                          </div>
                        )
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-black text-base">
                        {item.name || 'Product'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Qty: {item.quantity || 1}
                      </div>
                    </div>
                    <div className="font-bold text-black text-base">
                      {formatRWF(item.price || 0)} RWF
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        {/* Right: Address and payment method form */}
        <div className="flex-1 flex flex-col gap-4 justify-center">
          {cartItems.length > 0 && (
            <form onSubmit={handleCheckout} className="flex flex-col gap-4">
              {/* Customer Information */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={customerFirstName}
                    onChange={(e) => setCustomerFirstName(e.target.value)}
                    placeholder="John"
                    required
                    className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={customerLastName}
                    onChange={(e) => setCustomerLastName(e.target.value)}
                    placeholder="Doe"
                    required
                    className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@example.com"
                  required
                  className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 rounded"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+254712345678"
                  required
                  className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 rounded"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-700 mb-1">
                  Shipping Address *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">
                      Province
                    </label>
                    <input
                      type="text"
                      value={shippingProvince}
                      onChange={(e) => setShippingProvince(e.target.value)}
                      placeholder="Kigali City"
                      required
                      className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">
                      District
                    </label>
                    <input
                      type="text"
                      value={shippingDistrict}
                      onChange={(e) => setShippingDistrict(e.target.value)}
                      placeholder="Gasabo"
                      required
                      className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">
                      Sector
                    </label>
                    <input
                      type="text"
                      value={shippingSector}
                      onChange={(e) => setShippingSector(e.target.value)}
                      placeholder="Kimironko"
                      required
                      className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">
                      Cell
                    </label>
                    <input
                      type="text"
                      value={shippingCell}
                      onChange={(e) => setShippingCell(e.target.value)}
                      placeholder="Kicukiro"
                      required
                      className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">
                      Village
                    </label>
                    <input
                      type="text"
                      value={shippingVillage}
                      onChange={(e) => setShippingVillage(e.target.value)}
                      placeholder="Nyabisindu"
                      required
                      className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">
                      Street
                    </label>
                    <input
                      type="text"
                      value={shippingStreet}
                      onChange={(e) => setShippingStreet(e.target.value)}
                      placeholder="Main Street"
                      required
                      className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 rounded"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Please fill in all address fields for accurate delivery
                </p>
              </div>
              {orderStatus.error && (
                <div className="text-red-600 text-xs font-semibold mt-1">
                  {orderStatus.error}
                </div>
              )}
              {orderStatus.success && (
                <div className="text-green-600 text-xs font-semibold mt-1">
                  {orderStatus.success}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded bg-green-600 text-white py-2 font-bold text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
                disabled={cartItems.length === 0 || isSubmitting}
              >
                {isSubmitting ? "Initializing Payment..." : "Checkout"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
