"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Home, ShoppingBag, Package } from 'lucide-react';
import { 
  verifyDPOPayment, 
  extractDPOTokenFromURL, 
  getStoredOrderDetails, 
  clearStoredOrderDetails,
  DPOVerificationResult 
} from '../../utils/dpoVerification';

const PaymentSuccessContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'failed'>('pending');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get stored order details
        const storedDetails = getStoredOrderDetails();
        
        // Get order ID from URL parameters first, then fallback to stored
        const urlOrderId = searchParams.get('orderId') || searchParams.get('order_id');
        const orderId = urlOrderId || storedDetails.orderId;
        
        // Check if this is an MTN Mobile Money payment
        const paymentMethod = searchParams.get('method');
        
        if (paymentMethod === 'momo') {
          // MTN Mobile Money - No verification needed, order is already complete
          console.log('MTN Mobile Money payment - order completed');
          setVerificationStatus('success');
          setOrderDetails({
            orderId: orderId || 'N/A',
            paymentId: 'MTN Mobile Money',
            amount: storedDetails.amount,
            status: 'completed',
            paymentMethod: 'momo'
          });
        } else {
          // DPO Payment - Verify with token
          const dpoToken = extractDPOTokenFromURL(searchParams) || storedDetails.dpoToken;
          
          if (dpoToken) {
            console.log('Verifying payment with DPO token:', dpoToken);
            
            // Verify the payment with DPO
            const verificationResult: DPOVerificationResult = await verifyDPOPayment(dpoToken);
            
            if (verificationResult.success) {
              setVerificationStatus('success');
              setOrderDetails({
                orderId: verificationResult.orderId || orderId || 'N/A',
                paymentId: verificationResult.paymentId || dpoToken,
                amount: verificationResult.amount || storedDetails.amount,
                status: 'success',
                verificationDetails: verificationResult.details,
                paymentMethod: 'dpo'
              });
              
              // Clear stored payment data after successful verification
              clearStoredOrderDetails();
            } else {
              setVerificationStatus('failed');
              setOrderDetails({
                orderId: orderId,
                paymentId: dpoToken,
                status: 'verification_failed',
                error: verificationResult.error || 'Payment verification failed',
                paymentMethod: 'dpo'
              });
            }
          } else {
            // Fallback: get details from URL parameters without verification
            console.log('No DPO token found, using URL parameters only');
            if (orderId) {
              setOrderDetails({
                orderId,
                paymentId: searchParams.get('paymentId') || searchParams.get('payment_id') || 'N/A',
                amount: storedDetails.amount,
                status: 'success',
                paymentMethod: 'unknown'
              });
            }
            setVerificationStatus('success');
          }
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setVerificationStatus('failed');
        setOrderDetails({
          status: 'verification_error',
          error: 'Failed to verify payment'
        });
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {orderDetails?.paymentMethod === 'momo' ? 'Order Completed!' : 'Payment Successful!'}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {orderDetails?.paymentMethod === 'momo' 
            ? 'Thank you for your order! Your order has been processed and will be delivered to the provided address. Payment can be made via MTN Mobile Money at your convenience.'
            : 'Thank you for your purchase! Your order has been confirmed and will be processed shortly.'
          }
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
              <p><span className="font-medium">Status:</span> <span className="text-green-600 font-semibold">Confirmed</span></p>
            </div>
          </div>
        )}

        {/* Verification Status */}
        {verificationStatus === 'pending' && (
          <div className="bg-yellow-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-900 mb-2">Verifying Payment</h3>
            <p className="text-sm text-yellow-800">Please wait while we verify your payment...</p>
          </div>
        )}

        {verificationStatus === 'failed' && (
          <div className="bg-red-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-red-900 mb-2">Payment Verification Failed</h3>
            <p className="text-sm text-red-800">
              {orderDetails?.error || 'We encountered an issue verifying your payment. Please contact support.'}
            </p>
          </div>
        )}

        {/* Next Steps */}
        {verificationStatus === 'success' && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">What's Next?</h3>
            {orderDetails?.paymentMethod === 'momo' ? (
              <div className="space-y-3">
                <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 text-sm mb-2">Payment Instructions:</h4>
                  <div className="text-sm text-yellow-700 space-y-1">
                    <p>• Dial <strong>*182*8*1*079559#</strong> on your phone</p>
                    <p>• Enter amount: <strong>{orderDetails.amount ? parseInt(orderDetails.amount).toLocaleString() : 'N/A'} RWF</strong></p>
                    <p>• Complete payment at your convenience</p>
                  </div>
                </div>
                <ul className="text-sm text-blue-800 space-y-1 text-left">
                  <li>• You'll receive an email confirmation shortly</li>
                  <li>• We'll notify you when your order ships</li>
                  <li>• Track your order in your account dashboard</li>
                </ul>
              </div>
            ) : (
              <ul className="text-sm text-blue-800 space-y-1 text-left">
                <li>• You'll receive an email confirmation shortly</li>
                <li>• We'll notify you when your order ships</li>
                <li>• Track your order in your account dashboard</li>
              </ul>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
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
            Need help? Contact our support team at{' '}
            <a href="mailto:support@lindocare.com" className="text-green-600 hover:underline">
              support@lindocare.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

const PaymentSuccessPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
};

export default PaymentSuccessPage;
