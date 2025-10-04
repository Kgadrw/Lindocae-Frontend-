"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface VerificationStatus {
  status: 'loading' | 'success' | 'failed' | 'error';
  message: string;
  orderId?: string;
  paymentId?: string;
  amount?: string;
  details?: any;
}

export default function PaymentSuccessPage() {
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    status: 'loading',
    message: 'Verifying payment...'
  });
  
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    verifyPayment();
  }, []);

    const verifyPayment = async () => {
      try {
        // Get order details from localStorage and URL parameters
        const pendingAmount = localStorage.getItem('pendingOrderAmount');
        const pendingOrderId = localStorage.getItem('pendingOrderId');
        
        // Get order ID from URL parameters first, then fallback to localStorage
        const urlOrderId = searchParams.get('orderId') || searchParams.get('order_id');
        const orderId = urlOrderId || pendingOrderId;
        
      // Get DPO token from URL parameters
      const dpoToken = searchParams.get('token') || searchParams.get('TransToken');

      if (dpoToken && orderId) {
        // Verify payment with DPO
        console.log('Verifying DPO payment with token:', dpoToken);

        try {
          // Get auth token for verification (if user is logged in)
          const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');

          const verifyResponse = await fetch('https://lindo-project.onrender.com/dpo/verify/dpoPayment', {
            method: 'POST',
            headers: {
              'accept': 'application/json',
              'Content-Type': 'application/json',
              ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
            },
            body: JSON.stringify({ token: dpoToken }),
          });

          if (verifyResponse.ok) {
            const verifyData = await verifyResponse.json();
            console.log('Payment verification response:', verifyData);

            if (verifyData.success) {
              setVerificationStatus({
                status: 'success',
                message: 'Payment verified successfully!',
                orderId: orderId,
                paymentId: dpoToken,
                amount: pendingAmount,
                details: verifyData.details
              });
            } else {
              setVerificationStatus({
                status: 'failed',
                message: verifyData.message || 'Payment verification failed',
                orderId: orderId,
                paymentId: dpoToken
              });
            }
          } else {
            const errorData = await verifyResponse.json().catch(() => ({}));
            setVerificationStatus({
              status: 'failed',
              message: errorData.message || 'Payment verification failed',
              orderId: orderId,
              paymentId: dpoToken
            });
          }
        } catch (verifyError) {
          console.error('Payment verification error:', verifyError);
          setVerificationStatus({
            status: 'error',
            message: 'Failed to verify payment. Please contact support.',
            orderId: orderId,
            paymentId: dpoToken
          });
        }
      } else {
        // No token available, just show success
        setVerificationStatus({
          status: 'success',
          message: 'Payment completed successfully!',
          orderId: orderId || 'N/A',
          paymentId: dpoToken || 'N/A',
          amount: pendingAmount
        });
      }
        
        // Clear stored payment data
        localStorage.removeItem('pendingOrderAmount');
        localStorage.removeItem('pendingOrderId');
      } catch (error) {
        console.error('Payment verification error:', error);
      setVerificationStatus({
        status: 'error',
        message: 'An unexpected error occurred. Please contact support.'
      });
    }
  };

  const handleContinueShopping = () => {
    router.push('/');
  };

  const handleViewOrders = () => {
    router.push('/profile');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {verificationStatus.status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
              <p className="text-gray-600">{verificationStatus.message}</p>
            </>
          )}

          {verificationStatus.status === 'success' && (
            <>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-6">{verificationStatus.message}</p>
              
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium">{verificationStatus.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment ID:</span>
                    <span className="font-medium">{verificationStatus.paymentId}</span>
                  </div>
                  {verificationStatus.amount && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">{verificationStatus.amount} RWF</span>
                    </div>
                  )}
                </div>
        </div>

              <div className="space-y-3">
                <button
                  onClick={handleContinueShopping}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={handleViewOrders}
                  className="w-full bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  View My Orders
                </button>
              </div>
            </>
          )}

          {verificationStatus.status === 'failed' && (
            <>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
              <p className="text-gray-600 mb-6">{verificationStatus.message}</p>
              
              {verificationStatus.orderId && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-medium">{verificationStatus.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment ID:</span>
                      <span className="font-medium">{verificationStatus.paymentId}</span>
                    </div>
            </div>
          </div>
        )}

              <div className="space-y-3">
                <button
                  onClick={() => router.push('/checkout')}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Try Again
                </button>
                <button
                  onClick={handleContinueShopping}
                  className="w-full bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Continue Shopping
                </button>
          </div>
            </>
          )}

          {verificationStatus.status === 'error' && (
            <>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
                <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
          </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Error</h2>
              <p className="text-gray-600 mb-6">{verificationStatus.message}</p>
              
        <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Retry Verification
                </button>
                <button
                  onClick={handleContinueShopping}
                  className="w-full bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
            Continue Shopping
                </button>
        </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}