// Server-side storage utilities for cart and wishlist management

const API_BASE = 'https://lindo-project.onrender.com';

// Get authentication token from userData
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('userData');
      if (stored) {
        const parsed = JSON.parse(stored);
        const token = parsed.user?.tokens?.accessToken || null;
        console.log('getAuthToken result:', { 
          hasUserData: !!stored, 
          hasUser: !!parsed.user, 
          hasTokens: !!parsed.user?.tokens, 
          hasAccessToken: !!token,
          tokenPreview: token ? token.substring(0, 20) + '...' : null
        });
        return token;
      } else {
        console.log('getAuthToken: No userData in localStorage');
      }
    } catch (error) {
      console.error('Error parsing userData:', error);
    }
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
    const token = getAuthToken();
    if (token) {
      try {
        // Check if token is a JWT (has 3 parts separated by dots)
        if (token.split('.').length === 3) {
          // Simple token parsing - in production, you might want to decode JWT
          const payload = JSON.parse(atob(token.split('.')[1]));
          const userId = payload.userId || payload.sub || null;
          console.log('getUserIdFromToken JWT result:', { 
            isJWT: true, 
            payloadKeys: Object.keys(payload), 
            userId 
          });
          return userId;
        } else {
          // If not JWT, try to get userId from userData
          const stored = localStorage.getItem('userData');
          if (stored) {
            const parsed = JSON.parse(stored);
            const userId = parsed.user?.id || parsed.user?._id || null;
            console.log('getUserIdFromToken userData result:', { 
              isJWT: false, 
              hasUserData: !!stored, 
              userKeys: parsed.user ? Object.keys(parsed.user) : [], 
              userId 
            });
            return userId;
          }
        }
      } catch (error) {
        console.log('Could not parse token for userId, trying userData fallback');
        // Fallback: try to get userId from userData
        try {
          const stored = localStorage.getItem('userData');
          if (stored) {
            const parsed = JSON.parse(stored);
            const userId = parsed.user?.id || parsed.user?._id || null;
            console.log('getUserIdFromToken fallback result:', { 
              error: error.message, 
              hasUserData: !!stored, 
              userKeys: parsed.user ? Object.keys(parsed.user) : [], 
              userId 
            });
            return userId;
          }
        } catch (fallbackError) {
          console.error('Error parsing userData for userId:', fallbackError);
        }
      }
    } else {
      console.log('getUserIdFromToken: No token available');
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
  quantity: number;
  // Optional fields for local storage fallback
  name?: string;
  price?: number;
  image?: string;
  category?: number;
}

// Fetch user's cart from server
export async function fetchUserCart(): Promise<CartItem[]> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('User not authenticated');
  }

  try {
    // Try to get userId from token first
    const userId = getUserIdFromToken();
    
    console.log('Fetching cart with:', { token: token.substring(0, 20) + '...', userId });
    
    let response;
    let endpoint;
    if (userId) {
      // If we have userId, use the specific endpoint
      endpoint = `${API_BASE}/cart/getCartByUserId/${userId}`;
      response = await fetch(endpoint, {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    } else {
      // If no userId, try a generic endpoint that uses token for authentication
      endpoint = `${API_BASE}/cart/getCartByUserId`;
      response = await fetch(endpoint, {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    }
    
    console.log('Cart API response:', { endpoint, status: response.status, statusText: response.statusText });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Cart API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        errorData
      });
      throw new Error(errorData.message || `Failed to fetch cart from server (${response.status}: ${response.statusText})`);
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

// Add item to cart on server - updated to match API specification
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
      }),
    });

    if (!response.ok) {
      let errorData: any = {};
      let responseText = '';
      try {
        responseText = await response.text();
        if (responseText) {
          errorData = JSON.parse(responseText);
        }
      } catch (parseError) {
        errorData = { message: responseText || 'Unknown error' };
      }
      
      console.error('Add to cart API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        errorData,
        productId: product.productId,
        quantity: product.quantity
      });
      
      throw new Error(errorData.message || 'Failed to add item to cart');
    }
    
    console.log('Product added to cart successfully:', { productId: product.productId, quantity: product.quantity });
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
      let errorData: any = {};
      let responseText = '';
      try {
        responseText = await response.text();
        if (responseText) {
          errorData = JSON.parse(responseText);
        }
      } catch (parseError) {
        errorData = { message: responseText || 'Unknown error' };
      }
      
      console.error('Update cart quantity API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        errorData,
        productId,
        quantity
      });
      
      throw new Error(errorData.message || 'Failed to update cart item');
    }
    
    console.log('Cart item quantity updated successfully:', { productId, quantity });
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
      let errorData: any = {};
      let responseText = '';
      try {
        responseText = await response.text();
        if (responseText) {
          errorData = JSON.parse(responseText);
        }
      } catch (parseError) {
        errorData = { message: responseText || 'Unknown error' };
      }
      
      console.error('Remove from cart API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        errorData,
        productId
      });
      
      throw new Error(errorData.message || 'Failed to remove item from cart');
    }
    
    console.log('Cart item removed successfully:', { productId });
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
      let errorData: any = {};
      let responseText = '';
      try {
        responseText = await response.text();
        if (responseText) {
          errorData = JSON.parse(responseText);
        }
      } catch (parseError) {
        errorData = { message: responseText || 'Unknown error' };
      }
      
      console.error('Clear cart API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        errorData
      });
      
      throw new Error(errorData.message || 'Failed to clear cart');
    }
    
    console.log('Cart cleared successfully');
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
  
  if (!token) {
    throw new Error('User not authenticated');
  }

  try {
    // Get userId from token
    const userId = getUserIdFromToken();
    
    if (!userId) {
      console.warn('No userId found in token, cannot fetch wishlist');
      return [];
    }
    
    console.log('Fetching wishlist for userId:', userId);
    
    // Use the correct API endpoint
    const endpoint = `${API_BASE}/wishlist/getUserWishlistProducts/${userId}`;
    const response = await fetch(endpoint, {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    
    console.log('Wishlist API response:', { endpoint, status: response.status, statusText: response.statusText });

    if (!response.ok) {
      let errorData: any = {};
      let responseText = '';
      try {
        responseText = await response.text();
        if (responseText) {
          errorData = JSON.parse(responseText);
        }
      } catch (parseError) {
        if (!suppressWishlistErrors) {
          console.log('Could not parse error response as JSON, using text:', responseText);
        }
        errorData = { message: responseText || 'Unknown error' };
      }
      
      // Only log errors if not suppressed
      if (!suppressWishlistErrors) {
      console.error('Wishlist API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
          errorData,
          endpoint
        });
      }
      
      // If it's a 404 or 500 error, the endpoint might not exist yet
      if (response.status === 404 || response.status === 500) {
        if (!suppressWishlistErrors) {
          console.warn('Wishlist endpoint might not be implemented yet, returning empty array');
        }
        // Set suppression flag to reduce future error noise
        setWishlistErrorSuppression(true);
        return [];
      }
      
      throw new Error(errorData.message || `Failed to fetch wishlist from server (${response.status}: ${response.statusText})`);
    }

    const data = await response.json();
    console.log('Wishlist API success response:', data);
    
    // Check if the response has the expected structure
    if (!data || typeof data !== 'object') {
      console.warn('Wishlist API returned invalid data structure:', data);
      return [];
    }
    
    // Check if the response has products array
    if (!data.products || !Array.isArray(data.products)) {
      console.warn('Wishlist API response missing products array:', data);
      // If the endpoint exists but returns empty object, it might not be fully implemented
      if (Object.keys(data).length === 0) {
        console.warn('Wishlist endpoint returned empty object - endpoint might not be fully implemented yet');
        return [];
      }
      return [];
    }
    
    return data.products;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    
    // If it's a network error or the endpoint doesn't exist, return empty array instead of throwing
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      console.warn('Network error or endpoint not available, returning empty wishlist');
      return [];
    }
    
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
      let errorData: any = {};
      let responseText = '';
      try {
        responseText = await response.text();
        if (responseText) {
          errorData = JSON.parse(responseText);
        }
      } catch (parseError) {
        errorData = { message: responseText || 'Unknown error' };
      }
      
      // Only log errors if not suppressed
      if (!suppressWishlistErrors) {
        console.error('Toggle wishlist API Error:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          errorData
        });
      }
      
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
      let errorData: any = {};
      let responseText = '';
      try {
        responseText = await response.text();
        if (responseText) {
          errorData = JSON.parse(responseText);
        }
      } catch (parseError) {
        errorData = { message: responseText || 'Unknown error' };
      }
      
      // Only log errors if not suppressed
      if (!suppressWishlistErrors) {
        console.error('Add to wishlist API Error:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          errorData
        });
      }
      
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
      let errorData: any = {};
      let responseText = '';
      try {
        responseText = await response.text();
        if (responseText) {
          errorData = JSON.parse(responseText);
        }
      } catch (parseError) {
        errorData = { message: responseText || 'Unknown error' };
      }
      
      // Only log errors if not suppressed
      if (!suppressWishlistErrors) {
        console.error('Remove from wishlist API Error:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          errorData
        });
      }
      
      throw new Error(errorData.message || 'Failed to remove product from wishlist');
    }
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
}

// Global flag to suppress non-critical wishlist errors
let suppressWishlistErrors = false;

// Set this to true when we know wishlist endpoints are not working
export function setWishlistErrorSuppression(suppress: boolean) {
  suppressWishlistErrors = suppress;
}

// Fetch user wishlist with multiple fallback strategies
export async function fetchUserWishlistWithFallback(): Promise<WishlistProduct[]> {
  try {
    // First try: server wishlist
    const serverWishlist = await fetchUserWishlist();
    if (serverWishlist && serverWishlist.length > 0) {
      console.log('Successfully fetched wishlist from server');
      return serverWishlist;
    }
    
    // Second try: local storage fallback
    const email = getUserEmail();
    if (email) {
      const localWishlist = getLocalWishlist();
      if (localWishlist && localWishlist.length > 0) {
        console.log('Using local wishlist as fallback');
        // Convert local wishlist IDs to mock products for display
        return localWishlist.map(id => ({
          id: id,
          name: `Product ${id}`,
          price: 0,
          image: '',
        }));
      }
    }
    
    console.log('No wishlist data available from any source');
    return [];
  } catch (error) {
    console.error('All wishlist strategies failed:', error);
    
    // Final fallback: try local storage
    try {
      const email = getUserEmail();
      if (email) {
        const localWishlist = getLocalWishlist();
        if (localWishlist && localWishlist.length > 0) {
          console.log('Using local wishlist as final fallback');
          return localWishlist.map(id => ({
            id: id,
            name: `Product ${id}`,
            price: 0,
            image: '',
          }));
        }
      }
    } catch (localError) {
      console.error('Local wishlist fallback also failed:', localError);
    }
    
    return [];
  }
}

// Check if wishlist endpoints are available
export async function checkWishlistEndpointsAvailable(): Promise<boolean> {
  try {
    const token = getAuthToken();
    if (!token) return false;
    
    // Try to fetch wishlist to see if endpoints work
    const wishlist = await fetchUserWishlist();
    return true; // If we get here, the endpoint is working
  } catch (error) {
    console.log('Wishlist endpoints check failed:', error);
    return false;
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

// Fetch user cart with full product details
export async function fetchUserCartWithProducts(): Promise<CartItem[]> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('User not authenticated');
  }

  try {
    // First, get the basic cart items
    const basicCartItems = await fetchUserCart();
    console.log('Basic cart items fetched:', basicCartItems);
    
    if (!basicCartItems || basicCartItems.length === 0) {
      return [];
    }

    // Now fetch full product details for each cart item
    const enrichedCartItems: CartItem[] = [];
    
    for (const cartItem of basicCartItems) {
      try {
        // Fetch full product details using productId
        const productResponse = await fetch(`${API_BASE}/product/getProductById/${cartItem.productId}`, {
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (productResponse.ok) {
          const productData = await productResponse.json();
          console.log('Product details fetched for:', cartItem.productId, productData);
          console.log('Product image field:', {
            images: productData.images,
            image: productData.image,
            finalImage: productData.images && Array.isArray(productData.images) && productData.images.length > 0 
              ? productData.images[0] 
              : productData.image || cartItem.image || '/lindo.png'
          });
          
          // Enrich cart item with full product details
          const finalImageUrl = (() => {
            // Handle image URL construction like in vendor dashboard
            let imageUrl = '';
            if (productData.images && Array.isArray(productData.images) && productData.images.length > 0) {
              imageUrl = productData.images[0].startsWith('http')
                ? productData.images[0]
                : `https://lindo-project.onrender.com/${productData.images[0]}`;
            } else if (productData.image && typeof productData.image === 'string') {
              imageUrl = productData.image.startsWith('http')
                ? productData.image
                : `https://lindo-project.onrender.com/${productData.image}`;
            } else {
              // No fallback to lindo.png - return empty string if no image
              imageUrl = '';
            }
            return imageUrl;
          })();
          
          console.log('Image URL construction for product:', cartItem.productId, {
            originalImages: productData.images,
            originalImage: productData.image,
            finalImageUrl: finalImageUrl
          });
          
          enrichedCartItems.push({
            productId: cartItem.productId,
            quantity: cartItem.quantity,
            name: productData.name || cartItem.name || 'Product',
            price: productData.price || cartItem.price || 0,
            image: finalImageUrl,
            category: productData.categoryId || cartItem.category,
          });
        } else {
          console.warn('Failed to fetch product details for:', cartItem.productId, {
            status: productResponse.status,
            statusText: productResponse.statusText
          });
          // Use basic cart item as fallback
          enrichedCartItems.push(cartItem);
        }
      } catch (productError) {
        console.error('Error fetching product details for:', cartItem.productId, productError);
        // Use basic cart item as fallback
        enrichedCartItems.push(cartItem);
      }
    }

    console.log('Enriched cart items:', enrichedCartItems);
    return enrichedCartItems;
  } catch (error) {
    console.error('Error fetching cart with products:', error);
    throw error;
  }
} 