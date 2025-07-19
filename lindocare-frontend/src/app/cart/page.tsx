'use client';
import React, { useState, useEffect } from 'react';
import { Lock, Gift, Heart } from 'lucide-react';
import Image from 'next/image';
import { getCurrentUserEmail } from '../../components/Header';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity?: number;
  color?: string;
  size?: string;
  lowStock?: boolean;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [userEmail, setUserEmail] = useState('');
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    function loadCart() {
      if (typeof window !== 'undefined') {
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

  useEffect(() => {
    // Example: fetch related products from API based on cart items
    // fetch('/api/related-products?cart=' + encodeURIComponent(JSON.stringify(cartItems)))
    //   .then(res => res.json())
    //   .then(data => setRelatedProducts(data));
    // For now, leave empty or use mock data
    setRelatedProducts([]);
  }, [cartItems]);

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

  return (
    <div className="px-2 sm:px-4 md:px-8 lg:px-16 py-4 md:py-10 flex flex-col gap-6 sm:gap-8">
      {/* Cart Title */}
      <div className="flex flex-col items-center gap-2">
        <Lock size={32} className="text-black mb-1" />
        <h1 className="text-2xl font-bold text-black">Your Cart</h1>
        <p className="text-gray-600 text-sm">Precious items for your little one</p>
      </div>
      {/* Free Shipping Progress */}
      <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 flex flex-col gap-2">
        {subtotal >= freeShippingThreshold ? (
          <span className="text-sm text-black font-semibold">🎉 Congratulations! You qualify for <span className="text-black font-bold">FREE Shipping</span>!</span>
        ) : (
          <span className="text-sm text-black">You&apos;re <span className="text-black font-semibold">${remaining.toFixed(2)}</span> away from FREE Shipping!</span>
        )}
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-black transition-all duration-300" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
      {/* Cart Items and Order Summary */}
      <div className="flex flex-col gap-6 lg:gap-8 lg:flex-row">
        {/* Cart Items */}
        <div className="flex-1 flex flex-col gap-4">
          {cartItems.length === 0 ? (
            <div className="text-black text-center py-12 text-lg font-semibold">Your cart is empty.</div>
          ) : (
            cartItems.map((item, idx) => (
              <div key={`${item.id ?? 'noid'}-${idx}`} className="bg-white rounded-xl shadow p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center sm:items-start">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {typeof item.image === 'string' && item.image.trim().length > 0 ? (
                    <Image src={item.image} alt={item.name} width={96} height={96} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">?</div>
                  )}
                </div>
                <div className="flex-1 flex flex-col gap-2 w-full">
                  <div className="font-semibold text-black text-base sm:text-lg">{item.name}</div>
                  {/* Optionally show color/size if present */}
                  {item.color && item.size && (
                    <div className="text-xs text-gray-500">Color: {item.color} &nbsp; Size: {item.size}</div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-black font-bold text-lg">${item.price.toFixed(2)}</span>
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
                      <span className="flex items-center gap-1 ml-2 sm:ml-4 text-gray-600 font-semibold"><span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />In Stock</span>
                    )}
                    <button className="text-gray-400 hover:text-red-400 ml-2" onClick={() => handleRemove(item.id)}>Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
          {/* Gift Message */}
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 sm:p-4 flex items-center gap-2">
            <Gift size={20} className="text-black" />
            <span className="text-black text-sm">This is a gift. Add a message.</span>
          </div>
        </div>
        {/* Order Summary: always below on mobile, right on desktop */}
        <div className="w-full max-w-md mx-auto lg:mx-0 lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-xl shadow p-4 sm:p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-black font-bold text-lg">
              <span className="w-3 h-3 bg-black rounded-full inline-block" />
              Order Summary
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between"><span className="text-black font-medium">Subtotal</span><span className="text-black font-semibold">${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-black font-medium">Estimated Shipping</span><span className="text-black font-semibold">$5.99</span></div>
              <div className="flex justify-between"><span className="text-black font-medium">Taxes</span><span className="text-gray-400 font-normal">Calculated at checkout</span></div>
            </div>
            <div className="flex gap-2 mt-2">
              <input type="text" placeholder="Promo code" className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm" />
              <button className="rounded bg-black hover:bg-gray-800 text-white px-3 py-1 text-sm font-semibold transition-colors">Apply</button>
            </div>
            <div className="flex justify-between items-center text-lg font-bold mt-2">
              <span className="text-black">Total</span>
              <span className="text-black">${(subtotal + 5.99).toFixed(2)}</span>
            </div>
            <button className="w-full rounded bg-black text-white py-2 font-bold text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors" disabled={cartItems.length === 0}>Proceed to Checkout</button>
            <button className="w-full rounded border border-black text-black py-2 font-bold text-base bg-white mt-1 hover:bg-gray-100 transition-colors">Continue Shopping</button>
            {cartItems.length === 0 && (
              <div className="text-center text-gray-400 font-semibold mt-2">Add products to your cart to proceed.</div>
            )}
          </div>
        </div>
      </div>
      {/* Recommendations */}
      <div className="flex flex-col items-center gap-4 mt-8">
        <div className="flex items-center gap-2 text-black text-lg font-semibold">
          <Heart size={20} fill="#000" className="text-black" />
          Related Products
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 pb-2">
          {relatedProducts.length === 0 ? (
            <div className="text-gray-400 text-center col-span-4">No related products yet.</div>
          ) : (
            relatedProducts.map((item, idx) => (
              <div key={`${item.id ?? 'noid'}-${idx}`} className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 mb-2">
                  {typeof item.image === 'string' && item.image.trim().length > 0 ? (
                    <Image src={item.image} alt={item.name} width={96} height={96} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">?</div>
                  )}
                </div>
                <div className="font-medium text-black text-center text-sm mb-1">{item.name}</div>
                <div className="text-black font-bold text-base">${item.price.toFixed(2)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 