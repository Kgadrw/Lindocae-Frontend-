/**
 * Unified Add to Cart Helper
 * Works for both logged-in users (server) and guests (localStorage)
 * Provides consistent error handling and user feedback
 */

import { addToCartServer, isUserLoggedIn, getAuthToken } from './serverStorage';
import { getCurrentUserEmail } from '../components/Header';

export interface AddToCartResult {
  success: boolean;
  message: string;
  requiresLogin?: boolean;
}

/**
 * Unified function to add product to cart
 * Handles both logged-in users (server) and guests (localStorage)
 */
export async function addToCart(
  product: {
    _id?: string | number;
    id?: string | number;
    name: string;
    price: number;
    image?: string | string[];
  },
  quantity: number = 1
): Promise<AddToCartResult> {
  try {
    const productId = String(product._id || product.id || '');
    if (!productId) {
      return { success: false, message: 'Invalid product ID' };
    }

    // Handle logged-in users
    if (isUserLoggedIn() && getAuthToken()) {
      try {
        await addToCartServer({
          productId,
          quantity,
        });
        
        // Dispatch cart update event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cart-updated', {
            detail: { type: 'add', productId, quantity }
          }));
        }
        
        return {
          success: true,
          message: `${product.name} added to cart!`,
        };
      } catch (error: any) {
        console.error('Error adding to server cart:', error);
        return {
          success: false,
          message: error.message || 'Failed to add to cart. Please try again.',
        };
      }
    }

    // Handle guest users (localStorage)
    const email = getCurrentUserEmail();
    if (!email) {
      return {
        success: false,
        message: 'Please log in to add items to cart',
        requiresLogin: true,
      };
    }

    const cartKey = `cart:${email}`;
    const cartRaw = localStorage.getItem(cartKey);
    let cart: any[] = [];
    
    try {
      cart = cartRaw ? JSON.parse(cartRaw) : [];
    } catch {
      cart = [];
    }

    // Check if product already exists in cart
    const existingItem = cart.find(
      (item: any) => String(item.id || item.productId) === productId
    );

    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 1) + quantity;
    } else {
      cart.push({
        id: productId,
        productId: productId,
        name: product.name,
        price: product.price,
        image: Array.isArray(product.image) 
          ? product.image[0] 
          : (product.image || '/lindo.png'),
        quantity: quantity,
      });
    }

    localStorage.setItem(cartKey, JSON.stringify(cart));
    
    // Dispatch storage event for cart updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new StorageEvent('storage', { key: cartKey }));
      window.dispatchEvent(new CustomEvent('cart-updated', {
        detail: { type: 'add', productId, quantity }
      }));
    }

    return {
      success: true,
      message: `${product.name} added to cart!`,
    };
  } catch (error: any) {
    console.error('Error in addToCart:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}
