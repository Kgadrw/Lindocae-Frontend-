// Utility functions to fetch user information from localStorage and database

const API_BASE = 'https://lindo-project.onrender.com';

export interface UserInfo {
  id?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

// Get user information from localStorage
export function getUserInfoFromStorage(): UserInfo | null {
  if (typeof window === 'undefined') return null;

  try {
    // Try to get from userData first (more comprehensive)
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsed = JSON.parse(userData);
      const user = parsed.user;
      
      if (user) {
        return {
          id: user._id || user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : user.firstName || user.lastName || user.name,
          email: user.email,
          phone: user.phone || user.phoneNumber,
          avatar: user.avatar || user.image
        };
      }
    }

    // Fallback to individual localStorage items
    const email = localStorage.getItem('userEmail');
    if (email) {
      const firstName = localStorage.getItem(`firstName:${email}`) || '';
      const lastName = localStorage.getItem(`lastName:${email}`) || '';
      const userName = localStorage.getItem(`userName:${email}`) || '';
      const phone = localStorage.getItem(`userPhone:${email}`) || '';
      
      return {
        email,
        firstName,
        lastName,
        fullName: firstName && lastName 
          ? `${firstName} ${lastName}` 
          : userName || email.split('@')[0],
        phone
      };
    }

    return null;
  } catch (error) {
    console.error('Error parsing user info from storage:', error);
    return null;
  }
}

// Get authentication token
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    // Try userData first
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsed = JSON.parse(userData);
      const token = parsed.user?.tokens?.accessToken;
      if (token) return token;
    }

    // Fallback to direct token storage
    return localStorage.getItem('accessToken') || localStorage.getItem('token');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

// Fetch user information from database using token
export async function fetchUserInfoFromDatabase(): Promise<UserInfo | null> {
  const token = getAuthToken();
  if (!token) return null;

  try {
    // Try to get user profile from API
    const response = await fetch(`${API_BASE}/user/profile`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const userData = await response.json();
      const user = userData.user || userData;

      return {
        id: user._id || user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.firstName || user.lastName || user.name,
        email: user.email,
        phone: user.phone || user.phoneNumber,
        avatar: user.avatar || user.image
      };
    }

    // If profile endpoint doesn't exist, try to get from token payload
    if (token.split('.').length === 3) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.userId || payload.sub,
        email: payload.email,
        fullName: payload.name || payload.firstName || payload.email?.split('@')[0]
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching user info from database:', error);
    return null;
  }
}

// Get comprehensive user information (localStorage + database)
export async function getUserInfo(): Promise<UserInfo | null> {
  // First try localStorage (faster)
  const storageInfo = getUserInfoFromStorage();
  
  try {
    // Then try to fetch from database for most up-to-date info
    const dbInfo = await fetchUserInfoFromDatabase();
    
    // Merge information, preferring database data where available
    if (storageInfo && dbInfo) {
      return {
        ...storageInfo,
        ...dbInfo, // Database info takes precedence
      };
    }
    
    return dbInfo || storageInfo;
  } catch (error) {
    console.error('Error fetching user info:', error);
    // Return localStorage info as fallback
    return storageInfo;
  }
}

// Save user purchase information to database
export async function saveUserPurchaseInfo(purchaseData: {
  userName: string;
  userEmail: string;
  cartItems: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  phone: string;
  address: {
    province: string;
    district: string;
    sector: string;
    cell: string;
    village: string;
    street: string;
  };
  totalAmount: number;
}): Promise<{ success: boolean; orderId?: string; error?: string }> {
  const token = getAuthToken();
  
  try {
    const response = await fetch(`${API_BASE}/orders/savePurchaseInfo`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        customerName: purchaseData.userName,
        customerEmail: purchaseData.userEmail,
        customerPhone: purchaseData.phone,
        address: purchaseData.address,
        products: purchaseData.cartItems,
        totalAmount: purchaseData.totalAmount,
        timestamp: new Date().toISOString(),
        status: 'pending_payment'
      }),
    });

    if (response.ok) {
      const result = await response.json();
      return {
        success: true,
        orderId: result.orderId || result._id || result.id
      };
    } else {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || 'Failed to save purchase information'
      };
    }
  } catch (error) {
    console.error('Error saving user purchase info:', error);
    return {
      success: false,
      error: 'Network error while saving purchase information'
    };
  }
}

// Check if user is logged in
export function isUserLoggedIn(): boolean {
  const token = getAuthToken();
  const userInfo = getUserInfoFromStorage();
  return !!(token && userInfo?.email);
}
