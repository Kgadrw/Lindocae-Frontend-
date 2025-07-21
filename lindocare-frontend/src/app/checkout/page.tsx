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

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState<Product[]>([]);
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-2">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6 flex flex-col gap-4">
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
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between"><span className="text-black font-medium">Subtotal</span><span className="text-black font-semibold">${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-black font-medium">Estimated Shipping</span><span className="text-black font-semibold">$5.99</span></div>
              <div className="flex justify-between"><span className="text-black font-medium">Taxes</span><span className="text-gray-400 font-normal">Calculated at checkout</span></div>
            </div>
            <div className="flex justify-between items-center text-lg font-bold mt-2">
              <span className="text-black">Total</span>
              <span className="text-black">${(subtotal + 5.99).toFixed(2)}</span>
            </div>
            <button
              className="w-full rounded bg-black text-white py-2 font-bold text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
              disabled={cartItems.length === 0}
              onClick={() => alert('Checkout functionality coming soon!')}
            >
              Proceed to Checkout
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage; 