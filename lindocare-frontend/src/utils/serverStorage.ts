// Server-side storage utilities for cart and wishlist management

const API_BASE = 'https://lindo-project.onrender.com';

// Get authentication token
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

// Get user email
export function getUserEmail(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('userEmail');
  }
  return null;
}

// Get user ID from token (if available)
export function getUserIdFromToken(): string | null {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Simple token parsing - in production, you might want to decode JWT
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId || payload.sub || null;
      } catch {
        return null;
      }
    }
  }
  return null;
}

// Check if user is logged in
export function isUserLoggedIn(): boolean {
  return !!(getAuthToken() && getUserEmail());
}

// ==================== CART MANAGEMENT ====================

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  category?: number;
}

// Fetch user's cart from server
export async function fetchUserCart(): Promise<CartItem[]> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('User not authenticated');
  }

  try {
    const response = await fetch(`${API_BASE}/cart/getCartByUserId`, {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch cart from server');
    }

    const data = await response.json();
    const items = (data.cart && data.cart.items) ? data.cart.items : [];
    
    // Convert server cart items to local format
    return items.map((item: any) => ({
      productId: String(item.productId || item._id),
      name: item.name || 'Product',
      price: item.price || 0,
      image: item.image || '/lindo.png',
      quantity: item.quantity || 1,
      category: item.category,
    }));
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
}

// Add item to cart on server
export async function addToCartServer(product: CartItem): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('User not authenticated');
  }

  try {
    const response = await fetch(`${API_BASE}/cart/addToCart`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        productId: product.productId,
        quantity: product.quantity,
        price: product.price,
        name: product.name,
        image: product.image,
        category: product.category,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to add item to cart');
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
}

// Update cart item quantity on server
export async function updateCartItemQuantity(productId: string, quantity: number): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('User not authenticated');
  }

  try {
    const response = await fetch(`${API_BASE}/cart/updateCartItem`, {
      method: 'PUT',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        productId,
        quantity,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update cart item');
    }
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
}

// Remove item from cart on server
export async function removeFromCartServer(productId: string): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('User not authenticated');
  }

  try {
    const response = await fetch(`${API_BASE}/cart/removeFromCart`, {
      method: 'DELETE',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        productId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to remove item from cart');
    }
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
}

// Clear entire cart on server
export async function clearCartServer(): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('User not authenticated');
  }

  try {
    const response = await fetch(`${API_BASE}/cart/clearCart`, {
      method: 'DELETE',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to clear cart');
    }
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
}

// ==================== WISHLIST MANAGEMENT ====================

export interface WishlistProduct {
  _id?: string;
  id?: string | number;
  name: string;
  price: number;
  oldPrice?: number;
  image?: string[] | string;
  rating?: number;
  reviews?: number;
  tags?: string[];
  delivery?: string[];
  categoryId?: string;
}

// Fetch user's wishlist from server
export async function fetchUserWishlist(): Promise<WishlistProduct[]> {
  const token = getAuthToken();
  const userId = getUserIdFromToken();
  
  if (!token || !userId) {
    throw new Error('User not authenticated');
  }

  try {
    const response = await fetch(`${API_BASE}/wishlist/getUserWishlistProducts/${userId}`, {
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch wishlist from server');
    }

    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error;
  }
}

// Toggle product in wishlist on server
export async function toggleWishlistProduct(productId: string): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('User not authenticated');
  }

  try {
    const response = await fetch(`${API_BASE}/wishlist/toggleWishlistProduct`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ productId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to toggle wishlist product');
    }
  } catch (error) {
    console.error('Error toggling wishlist product:', error);
    throw error;
  }
}

// Add product to wishlist on server
export async function addToWishlistServer(productId: string): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('User not authenticated');
  }

  try {
    const response = await fetch(`${API_BASE}/wishlist/addToWishlist`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ productId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to add product to wishlist');
    }
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
}

// Remove product from wishlist on server
export async function removeFromWishlistServer(productId: string): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('User not authenticated');
  }

  try {
    const response = await fetch(`${API_BASE}/wishlist/removeFromWishlist`, {
      method: 'DELETE',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ productId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to remove product from wishlist');
    }
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
}

// ==================== FALLBACK TO LOCALSTORAGE ====================

// Fallback functions for when user is not logged in
export function getLocalCart(): CartItem[] {
  const email = getUserEmail();
  if (!email) return [];

  try {
    const cartRaw = localStorage.getItem(`cart:${email}`);
    if (!cartRaw) return [];

    const parsedCart = JSON.parse(cartRaw);
    return Array.isArray(parsedCart) ? parsedCart.filter((item: any) => 
      item && typeof item === 'object' && 
      (item.productId || item.id) && 
      item.name && 
      typeof item.price === 'number'
    ).map((item: any) => ({
      productId: item.productId || item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: item.quantity || 1,
      category: item.category,
    })) : [];
  } catch {
    return [];
  }
}

export function saveLocalCart(cart: CartItem[]): void {
  const email = getUserEmail();
  if (!email) return;

  localStorage.setItem(`cart:${email}`, JSON.stringify(cart));
  window.dispatchEvent(new StorageEvent('storage', { key: `cart:${email}` }));
}

export function getLocalWishlist(): string[] {
  const email = getUserEmail();
  if (!email) return [];

  try {
    const wishlistRaw = localStorage.getItem(`wishlist:${email}`);
    if (!wishlistRaw) return [];

    const parsedWishlist = JSON.parse(wishlistRaw);
    return Array.isArray(parsedWishlist) ? parsedWishlist.map(String) : [];
  } catch {
    return [];
  }
}

export function saveLocalWishlist(wishlist: string[]): void {
  const email = getUserEmail();
  if (!email) return;

  localStorage.setItem(`wishlist:${email}`, JSON.stringify(wishlist));
  window.dispatchEvent(new StorageEvent('storage', { key: `wishlist:${email}` }));
}

// ==================== SYNC UTILITIES ====================

// Sync local cart to server when user logs in
export async function syncLocalCartToServer(): Promise<void> {
  if (!isUserLoggedIn()) return;

  const localCart = getLocalCart();
  if (localCart.length === 0) return;

  try {
    // Add each local cart item to server
    for (const item of localCart) {
      await addToCartServer(item);
    }
    
    // Clear local cart after successful sync
    const email = getUserEmail();
    if (email) {
      localStorage.removeItem(`cart:${email}`);
    }
    
    console.log('Successfully synced local cart to server');
  } catch (error) {
    console.error('Failed to sync local cart to server:', error);
  }
}

// Sync local wishlist to server when user logs in
export async function syncLocalWishlistToServer(): Promise<void> {
  if (!isUserLoggedIn()) return;

  const localWishlist = getLocalWishlist();
  if (localWishlist.length === 0) return;

  try {
    // Add each local wishlist item to server
    for (const productId of localWishlist) {
      await addToWishlistServer(productId);
    }
    
    // Clear local wishlist after successful sync
    const email = getUserEmail();
    if (email) {
      localStorage.removeItem(`wishlist:${email}`);
    }
    
    console.log('Successfully synced local wishlist to server');
  } catch (error) {
    console.error('Failed to sync local wishlist to server:', error);
  }
} 