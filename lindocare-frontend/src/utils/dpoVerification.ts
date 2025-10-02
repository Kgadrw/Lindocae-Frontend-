// DPO Payment Verification Utilities

const API_BASE = 'https://lindo-project.onrender.com';

export interface DPOVerificationResult {
  success: boolean;
  orderId?: string;
  paymentId?: string;
  amount?: number;
  status?: string;
  message?: string;
  details?: any;
  error?: string;
}

/**
 * Verify DPO payment using the provided token
 */
export async function verifyDPOPayment(token: string): Promise<DPOVerificationResult> {
  try {
    console.log('Verifying DPO payment with token:', token);

    const response = await fetch(`${API_BASE}/dpo/verify/dpoPayment`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    console.log('DPO verification response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('DPO verification response data:', data);

      return {
        success: true,
        orderId: data.orderId || data.order_id,
        paymentId: data.paymentId || data.payment_id || token,
        amount: data.amount,
        status: data.status || 'verified',
        message: data.message || 'Payment verified successfully',
        details: data
      };
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('DPO verification failed:', response.status, errorData);

      return {
        success: false,
        error: errorData.message || `Verification failed (${response.status})`,
        details: errorData
      };
    }
  } catch (error) {
    console.error('DPO verification error:', error);
    return {
      success: false,
      error: 'Network error during verification'
    };
  }
}

/**
 * Extract DPO token from URL parameters
 */
export function extractDPOTokenFromURL(searchParams: URLSearchParams): string | null {
  // Try different possible parameter names that DPO might use
  const possibleParams = [
    'token',
    'dpo_token',
    'payment_token',
    'reference',
    'ref',
    'transaction_id',
    'txn_id'
  ];

  for (const param of possibleParams) {
    const value = searchParams.get(param);
    if (value) {
      console.log(`Found DPO token in parameter '${param}':`, value);
      return value;
    }
  }

  return null;
}

/**
 * Get stored order details from localStorage
 */
export function getStoredOrderDetails(): {
  orderId: string | null;
  amount: string | null;
  dpoToken: string | null;
} {
  return {
    orderId: localStorage.getItem('pendingOrderId'),
    amount: localStorage.getItem('pendingOrderAmount'),
    dpoToken: localStorage.getItem('dpoPaymentToken')
  };
}

/**
 * Clear stored order details after successful verification
 */
export function clearStoredOrderDetails(): void {
  localStorage.removeItem('pendingOrderId');
  localStorage.removeItem('pendingOrderAmount');
  localStorage.removeItem('dpoPaymentToken');
}

/**
 * Store order details for later verification
 */
export function storeOrderDetails(orderId: string, amount: number, dpoToken?: string): void {
  localStorage.setItem('pendingOrderId', orderId);
  localStorage.setItem('pendingOrderAmount', String(amount));
  if (dpoToken) {
    localStorage.setItem('dpoPaymentToken', dpoToken);
  }
}
