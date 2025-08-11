'use client';
import React, { useState, useEffect } from 'react';
import { Lock, Gift, Heart } from 'lucide-react';
import Image from 'next/image';
import { getCurrentUserEmail } from '../../components/Header';
import { useRouter } from 'next/navigation';
import {
  fetchUserCart,
  fetchUserCartWithProducts,
  addToCartServer,
  increaseCartItemQuantity,
  removeFromCartServer,
  reduceFromCartServer,
  clearCartServer,
  getLocalCart,
  saveLocalCart,
  isUserLoggedIn,
  syncLocalCartToServer,
  CartItem
} from '../../utils/serverStorage';

interface Product {
  id: string | number;
  name: string;
  price: number;
  image: string;
  quantity?: number;
  color?: string;
  size?: string;
  lowStock?: boolean;
  category?: number;
}

// Helper to format RWF with thousands separator
function formatRWF(amount: number | undefined | null) {
  if (amount === undefined || amount === null) return '0';
  return amount.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

// Helper to get the access token from userData
function getAccessToken(): string | null {
  try {
    if (typeof window === 'undefined') return null;  // Add this to avoid SSR errors
    const stored = localStorage.getItem('userData');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.user?.tokens?.accessToken || null;
    }
  } catch (error) {
    console.error('Error parsing userData:', error);
  }
  return null;
}


export default function CartPage() {
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [userEmail, setUserEmail] = useState('');
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [shippingAddress, setShippingAddress] = useState('');
  const [orderStatus, setOrderStatus] = useState<{ success?: string; error?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function loadCart() {
      setLoading(true);
      setError('');
      
      const email = getCurrentUserEmail();
      setUserEmail(email || '');

      console.log('Loading cart for email:', email);
      console.log('Is user logged in:', isUserLoggedIn());

      try {
        if (isUserLoggedIn() && getAccessToken()) {
          // Logged in user: fetch from server with full product details
          console.log('Fetching cart from server with product details...');
          let serverCart;
          try {
            // Try to get cart with full product details first
            serverCart = await fetchUserCartWithProducts();
            console.log('Server cart with products:', serverCart);
          } catch (productsError) {
            console.warn('Failed to load cart with products, falling back to basic cart:', productsError);
            // Fallback to basic cart if product details fetch fails
            serverCart = await fetchUserCart();
            console.log('Basic server cart as fallback:', serverCart);
          }
          const convertedCart = serverCart.map(item => ({
            id: item.productId,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: item.quantity,
            category: item.category,
          }));
          console.log('Converted cart items with product details:', convertedCart);
          setCartItems(convertedCart);
        } else {
          // Guest user: use localStorage
          console.log('Loading cart from localStorage...');
          const localCart = getLocalCart();
          console.log('Local cart:', localCart);
          const convertedCart = localCart.map(item => ({
            id: item.productId,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: item.quantity,
            category: item.category,
          }));
          setCartItems(convertedCart);
        }
      } catch (err) {
        console.error('Error loading cart:', err);
        setError('Failed to load cart. Please try again.');
        // Fallback to localStorage
        const localCart = getLocalCart();
        const convertedCart = localCart.map(item => ({
          id: item.productId,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity,
          category: item.category,
        }));
        setCartItems(convertedCart);
      } finally {
        setLoading(false);
      }
    }

    loadCart();
    
    // Listen for login events to sync local cart to server
    const handleLogin = async () => {
      if (isUserLoggedIn() && getAccessToken()) {
        await syncLocalCartToServer();
        loadCart(); // Reload cart after sync
      }
    };

    window.addEventListener('userLogin', handleLogin);
    window.addEventListener('storage', loadCart);
    
    return () => {
      window.removeEventListener('userLogin', handleLogin);
      window.removeEventListener('storage', loadCart);
    };
  }, []);

  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

  // Debug logging
  console.log('Cart page state:', {
    loading,
    error,
    userEmail,
    cartItems: cartItems.length,
    subtotal,
    isUserLoggedIn: isUserLoggedIn(),
    hasAccessToken: !!getAccessToken()
  });

  // Free shipping logic
  const freeShippingThreshold = 50;
  const remaining = Math.max(0, freeShippingThreshold - subtotal);
  const progress = Math.min(1, subtotal / freeShippingThreshold);

  // Remove from cart handler
  const handleRemove = async (id: string | number) => {
    if (!userEmail) return;

    try {
      if (isUserLoggedIn() && getAccessToken()) {
        // Logged in: remove from server
        await removeFromCartServer(String(id));
        // Refresh cart with full product details after removal
        try {
          const updatedServerCart = await fetchUserCartWithProducts();
          const updatedConvertedCart = updatedServerCart.map(item => ({
            id: item.productId,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: item.quantity,
            category: item.category,
          }));
          setCartItems(updatedConvertedCart);
        } catch (refreshError) {
          console.warn('Failed to refresh cart with products after removal, updating local state only:', refreshError);
          // Fallback to local state update
          setCartItems(prev => prev.filter(item => String(item.id) !== String(id)));
        }
      } else {
        // Guest: remove from localStorage
        const localCart = getLocalCart();
        const updatedCart = localCart.filter(item => String(item.productId) !== String(id));
        saveLocalCart(updatedCart);
        setCartItems(updatedCart.map(item => ({
          id: item.productId,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity,
          category: item.category,
        })));
      }
    } catch (err) {
      console.error('Error removing item from cart:', err);
      setError('Failed to remove item from cart. Please try again.');
    }
  };

  // Update quantity handler
  const handleQuantityChange = async (id: string | number, delta: number) => {
    if (!userEmail) return;

    const currentItem = cartItems.find(item => String(item.id) === String(id));
    if (!currentItem) return;

    const newQuantity = Math.max(1, (currentItem.quantity || 1) + delta);

    try {
      if (isUserLoggedIn() && getAccessToken()) {
        // Logged in: update on server using appropriate endpoints
        if (delta > 0) {
          // Increase quantity using increaseToCart endpoint
          await increaseCartItemQuantity(String(id), delta);
        } else {
          // Decrease quantity using reduceFromCart endpoint
          await reduceFromCartServer(String(id));
        }
        // Refresh cart with full product details after update
        try {
          const updatedServerCart = await fetchUserCartWithProducts();
          const updatedConvertedCart = updatedServerCart.map(item => ({
            id: item.productId,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: item.quantity,
            category: item.category,
          }));
          setCartItems(updatedConvertedCart);
        } catch (refreshError) {
          console.warn('Failed to refresh cart with products, updating local state only:', refreshError);
          // Fallback to local state update
          setCartItems(prev => prev.map(item => 
            String(item.id) === String(id) 
              ? { ...item, quantity: newQuantity }
              : item
          ));
        }
      } else {
        // Guest: update localStorage
        const localCart = getLocalCart();
        const updatedCart = localCart.map(item => 
          String(item.productId) === String(id)
            ? { ...item, quantity: newQuantity }
            : item
        );
        saveLocalCart(updatedCart);
        setCartItems(updatedCart.map(item => ({
          id: item.productId,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity,
          category: item.category,
        })));
      }
    } catch (err) {
      console.error('Error updating cart item quantity:', err);
      setError('Failed to update item quantity. Please try again.');
    }
  };

  // Checkout handler
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderStatus({});
    setIsSubmitting(true);
    try {
      const token = getAccessToken();
      if (!token) {
        setOrderStatus({ error: 'Please log in to place an order.' });
        setIsSubmitting(false);
        return;
      }

      // Prepare items for API
      const items = cartItems.map(item => ({
        productId: String(item.id),
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
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body),
      });
      if (res.status === 201) {
        setOrderStatus({ success: 'Order placed successfully!' });
        setShowCheckoutForm(false);
        // Optionally clear cart
        const email = getCurrentUserEmail();
        if (email) {
          await clearCartServer(); // Clear server cart
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
          {loading ? (
            <div className="text-black text-center py-12 text-lg font-semibold">Loading cart...</div>
          ) : error ? (
            <div className="text-red-600 text-center py-12 text-lg font-semibold">{error}</div>
          ) : cartItems.length === 0 ? (
            <div className="text-black text-center py-12 text-lg font-semibold">Your cart is empty.</div>
          ) : (
            cartItems.map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center sm:items-start">
                                 <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                   {item.image && typeof item.image === 'string' && item.image.trim().length > 0 ? (
                     <Image 
                       src={item.image} 
                       alt={item.name || 'Product'} 
                       width={96} 
                       height={96} 
                       className="object-cover w-full h-full"
                       onError={(e) => {
                         // If image fails to load, show placeholder
                         const target = e.target as HTMLImageElement;
                         target.style.display = 'none';
                         target.nextElementSibling?.classList.remove('hidden');
                       }}
                     />
                   ) : null}
                   <div className={`w-full h-full bg-gray-200 flex items-center justify-center ${item.image && item.image.trim().length > 0 ? 'hidden' : ''}`}>
                     <span className="text-gray-400 text-xs text-center">No Image</span>
                   </div>
                 </div>
                <div className="flex-1 flex flex-col gap-2 w-full">
                  <div className="font-semibold text-black text-base sm:text-lg">{item.name}</div>
                  {/* Optionally show color/size if present */}
                  {item.color && item.size && (
                    <div className="text-xs text-gray-500">Color: {item.color} &nbsp; Size: {item.size}</div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-black font-bold text-lg">{formatRWF(item.price || 0)} RWF</span>
                    <span className="text-gray-500 text-sm">× {item.quantity || 1}</span>
                    <span className="text-black font-bold text-lg ml-auto">
                      = {formatRWF((item.price || 0) * (item.quantity || 1))} RWF
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-2 w-full">
                    {/* Quantity controls */}
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                      <button
                        className="w-8 h-8 rounded-full border-2 border-gray-300 text-gray-600 flex items-center justify-center text-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 bg-white hover:bg-gray-100 hover:border-gray-400 transition-all"
                        onClick={() => handleQuantityChange(item.id, -1)}
                        disabled={(item.quantity || 1) <= 1}
                        aria-label="Decrease quantity"
                      >-</button>
                      <span className="font-semibold text-lg text-black mx-3 min-w-[32px] text-center">{item.quantity || 1}</span>
                      <button
                        className="w-8 h-8 rounded-full border-2 border-gray-300 text-gray-600 flex items-center justify-center text-lg font-bold active:scale-95 bg-white hover:bg-gray-100 hover:border-gray-400 transition-all"
                        onClick={() => handleQuantityChange(item.id, 1)}
                        aria-label="Increase quantity"
                      >+</button>
                    </div>
                    
                    {/* Product status and actions */}
                    <div className="flex items-center gap-3">
                      {item.lowStock ? (
                        <span className="flex items-center gap-1 text-orange-600 font-semibold text-sm">
                          <span className="w-2 h-2 rounded-full bg-orange-600 inline-block" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-green-600 font-semibold text-sm">
                          <span className="w-2 h-2 rounded-full bg-green-600 inline-block" />
                          In Stock
                        </span>
                      )}
                      <button 
                        className="text-red-500 hover:text-red-700 font-medium text-sm px-3 py-1 rounded-md hover:bg-red-50 transition-all" 
                        onClick={() => handleRemove(item.id)}
                      >
                        Remove
                      </button>
                    </div>
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