"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, Home, ShoppingBag, RefreshCw } from 'lucide-react';

const PaymentCancelPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear stored payment data on cancel
    const paymentToken = localStorage.getItem('dpoPaymentToken');
    const pendingAmount = localStorage.getItem('pendingOrderAmount');
    const pendingOrderId = localStorage.getItem('pendingOrderId');
    
    if (paymentToken) {
      // Store cancellation details
      setOrderDetails({
        orderId: searchParams.get('orderId') || searchParams.get('order_id') || pendingOrderId || 'N/A',
        paymentId: paymentToken,
        reason: searchParams.get('reason') || searchParams.get('cancel_reason') || 'User cancelled',
        amount: pendingAmount,
        status: 'cancelled'
      });
      
      // Clear stored payment data
      localStorage.removeItem('dpoPaymentToken');
      localStorage.removeItem('pendingOrderAmount');
      localStorage.removeItem('pendingOrderId');
    } else {
      // Fallback: get details from URL parameters
      const orderId = searchParams.get('orderId') || searchParams.get('order_id');
      const paymentId = searchParams.get('paymentId') || searchParams.get('payment_id');
      const reason = searchParams.get('reason') || searchParams.get('cancel_reason');
      
      if (orderId || paymentId) {
        setOrderDetails({
          orderId,
          paymentId,
          reason,
          status: 'cancelled'
        });
      }
    }
    
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {/* Cancel Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>

        {/* Cancel Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Payment Cancelled
        </h1>
        
        <p className="text-gray-600 mb-6">
          Your payment was cancelled. No charges have been made to your account. You can try again or contact us if you need assistance.
        </p>

        {/* Order Details */}
        {orderDetails && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Order Details</h3>
            <div className="text-sm text-gray-600 space-y-1">
              {orderDetails.orderId && orderDetails.orderId !== 'N/A' && (
                <p><span className="font-medium">Order ID:</span> {orderDetails.orderId}</p>
              )}
              {orderDetails.paymentId && (
                <p><span className="font-medium">Payment ID:</span> {orderDetails.paymentId}</p>
              )}
              {orderDetails.amount && (
                <p><span className="font-medium">Amount:</span> {parseInt(orderDetails.amount).toLocaleString()} RWF</p>
              )}
              <p><span className="font-medium">Status:</span> <span className="text-red-600 font-semibold">Cancelled</span></p>
              {orderDetails.reason && (
                <p><span className="font-medium">Reason:</span> {orderDetails.reason}</p>
              )}
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-yellow-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-900 mb-2">Need Help?</h3>
          <ul className="text-sm text-yellow-800 space-y-1 text-left">
            <li>• Check your payment method details</li>
            <li>• Ensure you have sufficient funds</li>
            <li>• Contact our support team for assistance</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/checkout"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
            Try Again
          </Link>
          
          <Link
            href="/all-products"
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            <ShoppingBag className="h-5 w-5" />
            Continue Shopping
          </Link>
          
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            <Home className="h-5 w-5" />
            Back to Home
          </Link>
        </div>

        {/* Support Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Having trouble? Contact our support team at{' '}
            <a href="mailto:support@lindocare.com" className="text-green-600 hover:underline">
              support@lindocare.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelPage;
