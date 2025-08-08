"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  fetchUserCart,
  getLocalCart,
  clearCartServer,
  saveLocalCart
} from '../../utils/serverStorage';

// Utility: get auth token from localStorage
function getAuthToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

interface Product {
  id: string | number;
  name: string;
  price: number;
  image: string;
  quantity?: number;
}

// Helper to format RWF with thousands separator
function formatRWF(amount: number | undefined | null) {
  if (amount === undefined || amount === null) return '0';
  return amount.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('dpo');
  const [shippingProvince, setShippingProvince] = useState('');
  const [shippingDistrict, setShippingDistrict] = useState('');
  const [shippingSector, setShippingSector] = useState('');
  const [shippingCell, setShippingCell] = useState('');
  const [shippingVillage, setShippingVillage] = useState('');
  const [shippingStreet, setShippingStreet] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerFirstName, setCustomerFirstName] = useState('');
  const [customerLastName, setCustomerLastName] = useState('');
  const [orderStatus, setOrderStatus] = useState<{ success?: string; error?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentRedirectUrl, setPaymentRedirectUrl] = useState('');
  const [users, setUsers] = useState<any[]>([]); // Store users for header
  const router = useRouter();

  // Fetch users for header
  useEffect(() => {
    fetch('https://lindo-project.onrender.com/user/getAllUsers')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUsers(data);
        else if (data && Array.isArray(data.users)) setUsers(data.users);
        else setUsers([]);
      })
      .catch(() => setUsers([]));
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = getAuthToken();
      if (!token) {
        router.push('/login');
        return;
      }
      
      // Optional: Validate token with backend
      const validateToken = async () => {
        try {
          const response = await fetch('https://lindo-project.onrender.com/user/validate-token', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            // Token is invalid, redirect to login
            localStorage.removeItem('token');
            router.push('/login');
          }
        } catch (error) {
          console.error('Token validation error:', error);
          // If validation fails, still allow checkout but log the error
        }
      };
      
      validateToken();
    }
  }, [router]);

  useEffect(() => {
    async function loadCart() {
      const token = getAuthToken();
      console.log('Checkout: Loading cart for token:', token ? 'Present' : 'Missing');
      
      if (!token) {
        setCartItems([]);
        return;
      }

      try {
        // Always try to fetch from server when token is present
        console.log('Checkout: Fetching cart from server...');
        const serverCart = await fetchUserCart();
        console.log('Checkout: Server cart:', serverCart);
        const convertedCart = serverCart.map(item => ({
          id: item.productId,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity,
        }));
        setCartItems(convertedCart);
      } catch (err) {
        console.error('Error loading cart for checkout:', err);
        // Fallback to localStorage if server fetch fails
        const localCart = getLocalCart();
        const convertedCart = localCart.map(item => ({
          id: item.productId,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity,
        }));
        setCartItems(convertedCart);
      }
    }

    loadCart();
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderStatus({});
    setIsSubmitting(true);
    
    // Validate required fields
    if (!paymentMethod || !shippingProvince || !shippingDistrict || !shippingSector || !shippingCell || !shippingVillage || !shippingStreet || !customerPhone || !customerEmail || !customerFirstName || !customerLastName) {
      setOrderStatus({ error: 'Please fill in all required fields.' });
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
      const orderItems = cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity || 1,
        price: item.price || 0
      }));

      // Create structured shipping address from separate fields
      const structuredShippingAddress = {
        province: shippingProvince,
        district: shippingDistrict,
        sector: shippingSector,
        cell: shippingCell,
        village: shippingVillage,
        street: shippingStreet
      };

      // First, create the order
      const orderData = {
        paymentMethod: "dpo", // Updated to use DPO
        shippingAddress: structuredShippingAddress,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        customerName: `${customerFirstName} ${customerLastName}`,
        items: orderItems,
        totalAmount: totalAmount
      };

      console.log('Creating order with data:', orderData);

      const orderResponse = await fetch('https://lindo-project.onrender.com/orders/createOrder', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(orderData),
      });

      if (orderResponse.ok) {
        const orderResult = await orderResponse.json();
        console.log('Order created:', orderResult);

        const orderId = orderResult.order?._id || orderResult.orderId;
        
        // Now initialize DPO payment with order details
        const dpoPaymentData = {
          totalAmount: totalAmount,
          currency: "RWF",
          email: customerEmail,
          phone: customerPhone,
          firstName: customerFirstName,
          lastName: customerLastName,
          serviceDescription: `Payment for order ${orderId} - ${cartItems.length} item(s) from Lindocare`,
          callbackUrl: `${window.location.origin}/payment-success?orderId=${orderId}`
        };

        console.log('DPO Payment Data:', dpoPaymentData);

        // Initialize DPO payment
        const dpoResponse = await fetch('https://lindo-project.onrender.com/dpo/initialize/dpoPayment', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(dpoPaymentData),
        });

        if (dpoResponse.ok) {
          const dpoData = await dpoResponse.json();
          console.log('DPO Response:', dpoData);

          if (dpoData.redirectUrl) {
            setPaymentRedirectUrl(dpoData.redirectUrl);
            setOrderStatus({ success: 'Order created and payment initiated successfully! Redirecting to payment gateway...' });
            
            // Clear cart after successful order creation and payment initiation
            try {
              const token = getAuthToken();
              if (token) {
                // User is logged in, clear server cart
                await clearCartServer();
              } else {
                // Fallback to local cart clearing
                saveLocalCart([]);
              }
              console.log('Cart cleared after successful order creation');
            } catch (clearError) {
              console.error('Error clearing cart:', clearError);
            }
            
            // Store payment token and order details for verification later
            if (dpoData.token) {
              localStorage.setItem('dpoPaymentToken', dpoData.token);
              localStorage.setItem('pendingOrderAmount', totalAmount.toString());
              localStorage.setItem('pendingOrderId', orderId);
            }
            
            // Redirect to DPO payment page
            setTimeout(() => {
              window.location.href = dpoData.redirectUrl;
            }, 2000);
          } else {
            setOrderStatus({ error: 'Payment gateway not available. Please try again.' });
          }
        } else if (dpoResponse.status === 401) {
          setOrderStatus({ error: 'Please log in to complete your order.' });
          // Redirect to login page
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        } else {
          const errorData = await dpoResponse.json().catch(() => ({}));
          setOrderStatus({ error: errorData.message || 'Failed to initialize payment. Please try again.' });
        }
      } else if (orderResponse.status === 401) {
        setOrderStatus({ error: 'Please log in to complete your order.' });
        // Redirect to login page
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        const errorData = await orderResponse.json().catch(() => ({}));
        setOrderStatus({ error: errorData.message || 'Failed to create order. Please try again.' });
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setOrderStatus({ error: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-2">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow p-6 flex flex-col md:flex-row gap-8">
        {/* Left: Checkout summary and products */}
        <div className="flex-1 flex flex-col gap-4 border-r border-gray-200 pr-0 md:pr-8">
          <h1 className="text-2xl font-bold text-black mb-2">Checkout</h1>
          {cartItems.length === 0 ? (
            <>
              <div className="text-center text-gray-500 font-semibold mb-4">Your cart is empty.</div>
              <button
                className="w-full rounded border border-black text-black py-2 font-bold text-base bg-white hover:bg-gray-100 transition-colors"
                onClick={() => router.push('/all-products')}
              >
                Continue Shopping
              </button>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2 text-sm mb-4">
                <div className="flex justify-between"><span className="text-black font-medium">Subtotal</span><span className="text-black font-semibold">{formatRWF(subtotal)} RWF</span></div>
                <div className="flex justify-between"><span className="text-black font-medium">Estimated Shipping</span><span className="text-black font-semibold">0 RWF</span></div>
                <div className="flex justify-between"><span className="text-black font-medium">Taxes</span><span className="text-gray-400 font-normal">Calculated at checkout</span></div>
              </div>
              <div className="flex justify-between items-center text-lg font-bold mt-2 mb-4">
                <span className="text-black">Total</span>
                <span className="text-black">{formatRWF(subtotal)} RWF</span>
              </div>
              <div className="font-semibold text-black mb-2">Products to Checkout</div>
              <div className="flex flex-col gap-3">
                {cartItems.map((item, idx) => (
                  <div key={item.id || idx} className="flex items-center gap-3 border-b border-gray-100 pb-2 last:border-b-0">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.image && typeof item.image === 'string' && item.image.trim().length > 0 ? (
                        <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                      ) : (
                        <img src="/lindo.png" alt="No image" className="object-cover w-full h-full opacity-60" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-black text-base">{item.name}</div>
                      <div className="text-xs text-gray-500">Qty: {item.quantity || 1}</div>
                    </div>
                    <div className="font-bold text-black text-base">{formatRWF(item.price || 0)} RWF</div>
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
                  <label className="block text-xs text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={customerFirstName}
                    onChange={e => setCustomerFirstName(e.target.value)}
                    placeholder="John"
                    required
                    className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={customerLastName}
                    onChange={e => setCustomerLastName(e.target.value)}
                    placeholder="Doe"
                    required
                    className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 rounded"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  placeholder="customer@example.com"
                  required
                  className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 rounded"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="+254712345678"
                  required
                  className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 rounded"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-700 mb-1">Shipping Address *</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Province</label>
                    <input
                      type="text"
                      value={shippingProvince}
                      onChange={e => setShippingProvince(e.target.value)}
                      placeholder="Kigali City"
                      required
                      className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">District</label>
                    <input
                      type="text"
                      value={shippingDistrict}
                      onChange={e => setShippingDistrict(e.target.value)}
                      placeholder="Gasabo"
                      required
                      className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Sector</label>
                    <input
                      type="text"
                      value={shippingSector}
                      onChange={e => setShippingSector(e.target.value)}
                      placeholder="Kimironko"
                      required
                      className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Cell</label>
                    <input
                      type="text"
                      value={shippingCell}
                      onChange={e => setShippingCell(e.target.value)}
                      placeholder="Kicukiro"
                      required
                      className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Village</label>
                    <input
                      type="text"
                      value={shippingVillage}
                      onChange={e => setShippingVillage(e.target.value)}
                      placeholder="Nyabisindu"
                      required
                      className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Street</label>
                    <input
                      type="text"
                      value={shippingStreet}
                      onChange={e => setShippingStreet(e.target.value)}
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
              {orderStatus.error && <div className="text-red-600 text-xs font-semibold mt-1">{orderStatus.error}</div>}
              {orderStatus.success && <div className="text-green-600 text-xs font-semibold mt-1">{orderStatus.success}</div>}
              <button
                type="submit"
                className="w-full rounded bg-green-600 text-white py-2 font-bold text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
                disabled={cartItems.length === 0 || isSubmitting}
              >
                {isSubmitting ? 'Initializing Payment...' : 'Checkout'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; 