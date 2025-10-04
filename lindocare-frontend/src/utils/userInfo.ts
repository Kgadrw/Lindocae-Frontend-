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
  address?: {
    province?: string;
    district?: string;
    sector?: string;
    cell?: string;
    village?: string;
  };
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
          phone: user.phone || user.phoneNumber || user.customerPhone,
          avatar: user.avatar || user.image,
          address: {
            province: user.province,
            district: user.district,
            sector: user.sector,
            cell: user.cell,
            village: user.village
          }
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
      const province = localStorage.getItem(`userProvince:${email}`) || '';
      const district = localStorage.getItem(`userDistrict:${email}`) || '';
      const sector = localStorage.getItem(`userSector:${email}`) || '';
      const cell = localStorage.getItem(`userCell:${email}`) || '';
      const village = localStorage.getItem(`userVillage:${email}`) || '';
      
      return {
        email,
        firstName,
        lastName,
        fullName: firstName && lastName 
          ? `${firstName} ${lastName}` 
          : userName || email.split('@')[0],
        phone,
        address: {
          province,
          district,
          sector,
          cell,
          village
        }
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

// Get current user's token from API response
export async function getCurrentUserToken(): Promise<string | null> {
  const token = getAuthToken();
  if (!token) return null;

  try {
    // Get user ID from localStorage
    const userData = localStorage.getItem('userData');
    let userId = null;
    
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        userId = parsed.user?._id || parsed.user?.id;
      } catch (e) {
        console.log('Error parsing userData for token:', e);
      }
    }
    
    if (!userId) return token;

    const response = await fetch(`${API_BASE}/user/getUserById/${userId}`, {
      method: 'GET',
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const user = await response.json();
      
      if (user && user.tokens && user.tokens.accessToken) {
        console.log('Found current user token in API response');
        return user.tokens.accessToken;
      }
    }
  } catch (error) {
    console.error('Error getting current user token:', error);
  }

  return token; // Fallback to existing token
}

// Fetch user information from database using user ID
export async function fetchUserInfoFromDatabase(): Promise<UserInfo | null> {
  const token = getAuthToken();
  if (!token) return null;

  try {
    // First, try to get current user's ID from localStorage
    const userData = localStorage.getItem('userData');
    let userId = null;
    
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        userId = parsed.user?._id || parsed.user?.id;
      } catch (e) {
        console.log('Error parsing userData:', e);
      }
    }
    
    if (!userId) {
      console.log('No user ID found in localStorage');
      return null;
    }

    console.log('Fetching user by ID:', userId);

    // Get user by ID
    const response = await fetch(`${API_BASE}/user/getUserById/${userId}`, {
      method: 'GET',
      headers: {
        'accept': '*/*',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const user = await response.json();
      console.log('=== API RESPONSE FROM getUserById ===');
      console.log('Complete user object:', user);
      console.log('User address fields:', {
        province: user.province,
        district: user.district,
        sector: user.sector,
        cell: user.cell,
        village: user.village,
        street: user.street
      });
      console.log('=====================================');
      
      return {
        id: user._id || user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.firstName || user.lastName || user.name,
        email: user.email,
        phone: user.phone || user.phoneNumber || user.customerPhone,
        avatar: user.avatar || user.image,
        address: {
          province: user.province,
          district: user.district,
          sector: user.sector,
          cell: user.cell,
          village: user.village,
          street: user.street
        }
      };
    } else {
      console.error('Failed to fetch user by ID:', response.status, response.statusText);
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

// Get current user information for order linking
export async function getCurrentUserForOrder(): Promise<{
  userId: string;
  email: string;
  fullName: string;
  phone: string;
  address: any;
} | null> {
  try {
    console.log('=== GETTING CURRENT USER FOR ORDER ===');
    
    // First try to get from database
    const userInfo = await fetchUserInfoFromDatabase();
    if (userInfo && userInfo.id && userInfo.email) {
      console.log('Got user info from database:', userInfo);
      return {
        userId: userInfo.id,
        email: userInfo.email,
        fullName: userInfo.fullName || `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim(),
        phone: userInfo.phone || '',
        address: userInfo.address || {}
      };
    } else {
      console.log('No user info from database, trying localStorage fallback');
    }

    // Fallback to localStorage
    const userEmail = localStorage.getItem('userEmail');
    const userData = localStorage.getItem('userData');
    
    if (userEmail && userData) {
      try {
        const parsed = JSON.parse(userData);
        const user = parsed.user;
        if (user) {
          console.log('Got user info from localStorage:', user);
          return {
            userId: user._id || user.id || '',
            email: user.email || userEmail,
            fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || '',
            phone: user.phone || user.phoneNumber || user.customerPhone || '',
            address: {
              province: user.province || '',
              district: user.district || '',
              sector: user.sector || '',
              cell: user.cell || '',
              village: user.village || '',
              street: user.street || ''
            }
          };
        }
      } catch (e) {
        console.error('Error parsing userData:', e);
      }
    }

    console.log('No user information found');
    return null;
  } catch (error) {
    console.error('Error getting current user for order:', error);
    return null;
  }
}
