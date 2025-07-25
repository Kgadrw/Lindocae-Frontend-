'use client';
import React, { useState, useEffect } from 'react';
import { Lock, Gift, Heart } from 'lucide-react';
import Image from 'next/image';
import { getCurrentUserEmail } from '../../components/Header';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity?: number;
  color?: string;
  size?: string;
  lowStock?: boolean;
  category?: number; // Added category property
}

// Utility: get auth token from localStorage
function getAuthToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

// Utility: fetch cart from server
async function fetchUserCartFromServer(token: string) {
  const res = await fetch('https://lindo-project.onrender.com/cart/getCartByUserId', {
    headers: {
      'accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch server cart');
  return res.json();
}

// Helper to format RWF with thousands separator
function formatRWF(amount: number) {
  return amount.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [userEmail, setUserEmail] = useState('');
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [shippingAddress, setShippingAddress] = useState('');
  const [orderStatus, setOrderStatus] = useState<{ success?: string; error?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadCart() {
      if (typeof window !== 'undefined') {
        const token = getAuthToken();
        if (token) {
          // Logged in: fetch cart from server
          try {
            const data = await fetchUserCartFromServer(token);
            const items = (data.cart && data.cart.items) ? data.cart.items : [];
            // Convert server cart items to local Product[] format
            const cartItems = items.map((item: unknown) => {
              const cartItem = item as {
                productId: number;
                name: string;
                price: number;
                image: string;
                quantity: number;
                category?: number; // Ensure category is included
              };
              return {
                id: String(cartItem.productId),
                name: cartItem.name || '', // Optionally fetch product name if not present
                price: cartItem.price || 0,
                image: cartItem.image || '/lindo.png', // Optionally fetch product image if not present
                quantity: cartItem.quantity || 1,
                category: cartItem.category, // Ensure category is included
              };
            });
            setCartItems(cartItems);
            // Optionally sync to localStorage for UI
            const email = getCurrentUserEmail();
            if (email) {
              localStorage.setItem(`cart:${email}`, JSON.stringify(cartItems));
            }
            return;
          } catch (err) {
            // Fallback to localStorage if server fetch fails
          }
        }
        // Guest or server fetch failed: use localStorage
        const email = getCurrentUserEmail();
        setUserEmail(email);
        if (!email) {
          setCartItems([]);
          return;
        }
        const cartRaw = localStorage.getItem(`cart:${email}`);
        try {
          setCartItems(cartRaw ? JSON.parse(cartRaw) : []);
        } catch {
          setCartItems([]);
        }
      }
    }
    loadCart();
    window.addEventListener('storage', loadCart);
    return () => window.removeEventListener('storage', loadCart);
  }, []);

  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  // Free shipping logic
  const freeShippingThreshold = 50;
  const remaining = Math.max(0, freeShippingThreshold - subtotal);
  const progress = Math.min(1, subtotal / freeShippingThreshold);

  // Remove from cart handler
  const handleRemove = (id: number) => {
    if (!userEmail) return;
    const cartKey = `cart:${userEmail}`;
    const cartRaw = localStorage.getItem(cartKey);
    let cart = [];
    try {
      cart = cartRaw ? JSON.parse(cartRaw) : [];
    } catch {
      cart = [];
    }
    const updated = cart.filter((item: Product) => item.id !== id);
    localStorage.setItem(cartKey, JSON.stringify(updated));
    setCartItems(updated);
    window.dispatchEvent(new StorageEvent('storage', { key: cartKey }));
  };

  // Update quantity handler
  const handleQuantityChange = (id: number, delta: number) => {
    if (!userEmail) return;
    const cartKey = `cart:${userEmail}`;
    const cartRaw = localStorage.getItem(cartKey);
    let cart = [];
    try {
      cart = cartRaw ? JSON.parse(cartRaw) : [];
    } catch {
      cart = [];
    }
    const idx = cart.findIndex((item: Product) => item.id === id);
    if (idx > -1) {
      cart[idx].quantity = Math.max(1, (cart[idx].quantity || 1) + delta);
      if (cart[idx].quantity === 0) {
        cart.splice(idx, 1);
      }
      localStorage.setItem(cartKey, JSON.stringify(cart));
      setCartItems([...cart]);
      window.dispatchEvent(new StorageEvent('storage', { key: cartKey }));
    }
  };

  // Checkout handler
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderStatus({});
    setIsSubmitting(true);
    try {
      const token = getAuthToken();
      // Prepare items for API
      const items = cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity || 1,
        price: item.price,
      }));
      const body = {
        paymentMethod,
        shippingAddress,
        items,
      };
      const res = await fetch('https://lindo-project.onrender.com/orders/createOrder', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      if (res.status === 201) {
        setOrderStatus({ success: 'Order placed successfully!' });
        setShowCheckoutForm(false);
        // Optionally clear cart
        const email = getCurrentUserEmail();
        if (email) {
          localStorage.setItem(`cart:${email}`, JSON.stringify([]));
          setCartItems([]);
        }
      } else {
        const data = await res.json().catch(() => ({}));
        setOrderStatus({ error: data.message || 'Failed to place order.' });
      }
    } catch (err) {
      setOrderStatus({ error: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-2 sm:px-4 md:px-8 lg:px-16 py-4 md:py-10 flex flex-col gap-6 sm:gap-8">
      {/* Cart Title */}
      <div className="flex flex-col items-center gap-2">
        <Lock size={32} className="text-black mb-1" />
        <h1 className="text-2xl font-bold text-black">Your Cart</h1>
        <p className="text-gray-600 text-sm">Precious items for your little one</p>
      </div>
      {/* Cart Items and Order Summary */}
      <div className="flex flex-col gap-6 lg:gap-8 lg:flex-row">
        {/* Cart Items */}
        <div className="flex-1 flex flex-col gap-4">
          {cartItems.length === 0 ? (
            <div className="text-black text-center py-12 text-lg font-semibold">Your cart is empty.</div>
          ) : (
            cartItems.map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center sm:items-start">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {typeof item.image === 'string' && item.image.trim().length > 0 ? (
                    <Image src={item.image} alt={item.name} width={96} height={96} className="object-cover w-full h-full" />
                  ) : (
                    (() => { console.warn('Cart item missing image:', item); return null; })() ||
                    <Image src="/lindo.png" alt="No image" width={96} height={96} className="object-cover w-full h-full opacity-60" style={{ width: 'auto', height: 'auto' }} />
                  )}
                </div>
                <div className="flex-1 flex flex-col gap-2 w-full">
                  <div className="font-semibold text-black text-base sm:text-lg">{item.name}</div>
                  {/* Optionally show color/size if present */}
                  {item.color && item.size && (
                    <div className="text-xs text-gray-500">Color: {item.color} &nbsp; Size: {item.size}</div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-black font-bold text-lg">{formatRWF(item.price)} RWF</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-4 text-xs mt-1 w-full">
                    {/* Quantity controls */}
                    <button
                      className="w-9 h-9 sm:w-7 sm:h-7 rounded-full border-2 border-black text-black flex items-center justify-center text-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 bg-white hover:bg-gray-100"
                      onClick={() => handleQuantityChange(item.id, -1)}
                      disabled={(item.quantity || 1) <= 1}
                      aria-label="Decrease quantity"
                    >-</button>
                    <span className="font-semibold text-base text-black mx-2 min-w-[24px] text-center">{item.quantity || 1}</span>
                    <button
                      className="w-9 h-9 sm:w-7 sm:h-7 rounded-full border-2 border-black text-black flex items-center justify-center text-lg font-bold active:scale-95 bg-white hover:bg-gray-100"
                      onClick={() => handleQuantityChange(item.id, 1)}
                      aria-label="Increase quantity"
                    >+</button>
                    {/* Product status */}
                    {item.lowStock ? (
                      <span className="flex items-center gap-1 ml-2 sm:ml-4 text-black font-semibold"><span className="w-2 h-2 rounded-full bg-black inline-block" />Low Stock</span>
                    ) : (
                      <span className="flex items-center gap-1 ml-2 sm:ml-4 text-green-600 font-semibold"><span className="w-2 h-2 rounded-full bg-green-600 inline-block" />In Stock</span>
                    )}
                    <button className="text-red-500 hover:text-red-700 ml-2" onClick={() => handleRemove(item.id)}>Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {/* Order Summary: always below on mobile, right on desktop */}
        <div className="w-full max-w-md mx-auto lg:mx-0 lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-xl shadow p-4 sm:p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-black font-bold text-lg">
              <span className="w-3 h-3 bg-black rounded-full inline-block" />
              Order Summary
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between"><span className="text-black font-medium">Subtotal</span><span className="text-black font-semibold">{formatRWF(subtotal)} RWF</span></div>
              <div className="flex justify-between"><span className="text-black font-medium">Estimated Shipping</span><span className="text-black font-semibold">0 RWF</span></div>
              <div className="flex justify-between"><span className="text-black font-medium">Taxes</span><span className="text-gray-400 font-normal">Calculated at checkout</span></div>
            </div>
            <div className="flex justify-between items-center text-lg font-bold mt-2">
              <span className="text-black">Total</span>
              <span className="text-black">{formatRWF(subtotal)} RWF</span>
            </div>
            <button
              className="w-full rounded bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 font-bold text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed hover:from-blue-600 hover:to-blue-800 transition-all shadow"
              disabled={cartItems.length === 0}
              onClick={() => router.push('/checkout')}
            >
              Proceed to Checkout
            </button>
            {/* Payment Method Selection */}
            <div className="flex flex-col items-center gap-2 mt-2">
              <span className="text-sm text-gray-700 font-medium mb-1">Choose Payment Method:</span>
              <div className="flex gap-4 items-start">
                <button
                  type="button"
                  className={`rounded-lg p-1 flex flex-col items-center justify-center transition-all bg-white shadow-none`}
                  onClick={() => setPaymentMethod('mtn')}
                  style={{ boxShadow: paymentMethod === 'mtn' ? '0 0 0 2px #FFD600' : 'none' }}
                >
                  <img src="/mtn.jpg" alt="MTN" className="w-10 h-10 object-contain" />
                  <span className="mt-1 text-xs font-semibold text-yellow-700">MTN</span>
                </button>
                <button
                  type="button"
                  className={`rounded-lg p-1 flex flex-col items-center justify-center transition-all bg-white shadow-none`}
                  onClick={() => setPaymentMethod('airtel')}
                  style={{ boxShadow: paymentMethod === 'airtel' ? '0 0 0 2px #E60000' : 'none' }}
                >
                  <img src="/airtel.png" alt="Airtel" className="w-10 h-10 object-contain" />
                  <span className="mt-1 text-xs font-semibold text-red-700">Airtel</span>
                </button>
              </div>
            </div>
            {cartItems.length === 0 && (
              <div className="text-center text-gray-400 font-semibold mt-2">Add products to your cart to proceed.</div>
            )}
            {/* Checkout Form Inline */}
            {showCheckoutForm && (
              <div className="mt-4 bg-white border border-blue-100 rounded-xl shadow p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-lg font-semibold">Checkout</h4>
                  <button
                    className="text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
                    onClick={() => setShowCheckoutForm(false)}
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={handleCheckout} className="flex flex-col gap-3">
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">Shipping Address</label>
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
                    className="bg-blue-700 text-white px-4 py-2 text-xs font-semibold shadow hover:bg-blue-800 transition-all mt-2 rounded"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Placing Order...' : 'Place Order'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 