"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity?: number;
}

// Helper to format RWF with thousands separator
function formatRWF(amount: number) {
  return amount.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [shippingAddress, setShippingAddress] = useState('');
  const [orderStatus, setOrderStatus] = useState<{ success?: string; error?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const email = localStorage.getItem('userEmail') || '';
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
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderStatus({});
    setIsSubmitting(true);
    if (!paymentMethod || !shippingAddress) {
      setOrderStatus({ error: 'Please provide payment method and shipping address.' });
      setIsSubmitting(false);
      return;
    }
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
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
        // Optionally clear cart
        const email = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : '';
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
                      {item.image && (
                        <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-black text-base">{item.name}</div>
                      <div className="text-xs text-gray-500">Qty: {item.quantity || 1}</div>
                    </div>
                    <div className="font-bold text-black text-base">{formatRWF(item.price)} RWF</div>
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
                    className={`rounded-lg p-1 flex flex-col items-center justify-center transition-all bg-white shadow-none ${paymentMethod === 'mtn' ? 'ring-2 ring-yellow-400' : ''}`}
                    onClick={() => setPaymentMethod('mtn')}
                  >
                    <img src="/mtn.jpg" alt="MTN" className="w-12 h-12 object-contain" />
                    <span className="mt-1 text-xs font-semibold text-yellow-700">MTN</span>
                  </button>
                  <button
                    type="button"
                    className={`rounded-lg p-1 flex flex-col items-center justify-center transition-all bg-white shadow-none ${paymentMethod === 'airtel' ? 'ring-2 ring-red-400' : ''}`}
                    onClick={() => setPaymentMethod('airtel')}
                  >
                    <img src="/airtel.png" alt="Airtel" className="w-12 h-12 object-contain" />
                    <span className="mt-1 text-xs font-semibold text-red-700">Airtel</span>
                  </button>
                </div>
              </div>
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
                className="w-full rounded bg-blue-700 text-white py-2 font-bold text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-blue-800 transition-colors"
                disabled={cartItems.length === 0 || isSubmitting}
              >
                {isSubmitting ? 'Placing Order...' : 'Place Order'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; 