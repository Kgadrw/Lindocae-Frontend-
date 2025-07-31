"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUserEmail } from '../../components/getCurrentUserEmail';
import {
  fetchUserCart,
  getLocalCart,
  isUserLoggedIn,
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
  const [paymentMethod, setPaymentMethod] = useState('pesapal');
  const [shippingAddress, setShippingAddress] = useState('');
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
      const email = getCurrentUserEmail();
      if (!email) {
        router.push('/login');
      }
    }
  }, [router]);

  useEffect(() => {
    async function loadCart() {
      const email = getCurrentUserEmail();
      console.log('Checkout: Loading cart for email:', email);
      console.log('Checkout: Is user logged in:', isUserLoggedIn());
      
      if (!email) {
        setCartItems([]);
        return;
      }

      try {
        if (isUserLoggedIn()) {
          // Logged in user: fetch from server
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
        } else {
          // Guest user: use localStorage
          console.log('Checkout: Loading cart from localStorage...');
          const localCart = getLocalCart();
          console.log('Checkout: Local cart:', localCart);
          const convertedCart = localCart.map(item => ({
            id: item.productId,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: item.quantity,
          }));
          setCartItems(convertedCart);
        }
      } catch (err) {
        console.error('Error loading cart for checkout:', err);
        // Fallback to localStorage
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
    if (!paymentMethod || !shippingAddress || !customerPhone || !customerEmail || !customerFirstName || !customerLastName) {
      setOrderStatus({ error: 'Please fill in all required fields.' });
      setIsSubmitting(false);
      return;
    }

    try {
      const token = getAuthToken();
      
      // First create the order
      const orderBody = {
        paymentMethod,
        shippingAddress,
        customerEmail,
        customerPhone,
        customerName: `${customerFirstName} ${customerLastName}`,
      };

      const orderRes = await fetch('https://lindo-project.onrender.com/orders/createOrder', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(orderBody),
      });

      if (orderRes.status === 201) {
        const orderData = await orderRes.json();
        const orderId = orderData.order?._id || orderData.orderId || orderData._id;
        const redirectUrl = orderData.redirectUrl || orderData.order?.pesapalRedirectUrl;

        if (redirectUrl) {
          setPaymentRedirectUrl(redirectUrl);
          setOrderStatus({ success: 'Payment initiated successfully! Redirecting to payment gateway...' });
          
          // Clear cart after successful order placement
          try {
            if (isUserLoggedIn()) {
              await clearCartServer();
            } else {
              const email = getCurrentUserEmail();
              if (email) {
                saveLocalCart([]);
              }
            }
            console.log('Cart cleared after successful order placement');
          } catch (clearError) {
            console.error('Error clearing cart:', clearError);
          }
          
          // Redirect to Pesapal payment page
          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 2000);
        } else {
          setOrderStatus({ error: 'Payment gateway not available. Please try again.' });
        }
      } else if (orderRes.status === 401) {
        setOrderStatus({ error: 'Please log in to complete your order.' });
        // Redirect to login page
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        const data = await orderRes.json().catch(() => ({}));
        setOrderStatus({ error: data.message || 'Failed to place order.' });
      }
    } catch (err) {
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
              <div>
                <label className="block text-xs text-gray-700 mb-1">Payment Method</label>
                <div className="flex gap-4 items-center mt-2">
                  <button
                    type="button"
                    className={`rounded-lg p-1 flex flex-col items-center justify-center transition-all bg-white shadow-none ${paymentMethod === 'pesapal' ? 'ring-2 ring-green-400' : ''}`}
                    onClick={() => setPaymentMethod('pesapal')}
                  >
                    <img src="/pesapal.jpg" alt="Pesapal" className="w-12 h-12 object-contain" />
                    <span className="mt-1 text-xs font-semibold text-green-700">Pesapal</span>
                  </button>
                </div>
              </div>
              
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
                <input
                  type="text"
                  value={shippingAddress}
                  onChange={e => setShippingAddress(e.target.value)}
                  placeholder="e.g. Kigali, Rwanda"
                  required
                  className="border border-gray-300 px-3 py-2 w-full text-xs font-medium text-gray-900 rounded"
                />
              </div>
              {orderStatus.error && <div className="text-red-600 text-xs font-semibold mt-1">{orderStatus.error}</div>}
              {orderStatus.success && <div className="text-green-600 text-xs font-semibold mt-1">{orderStatus.success}</div>}
              <button
                type="submit"
                className="w-full rounded bg-green-600 text-white py-2 font-bold text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
                disabled={cartItems.length === 0 || isSubmitting}
              >
                {isSubmitting ? 'Initializing Payment...' : 'Pay with Pesapal'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; 