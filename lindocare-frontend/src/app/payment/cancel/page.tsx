"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function PaymentCancelPage() {
  const router = useRouter();

  const handleRetryPayment = () => {
    router.push('/checkout');
  };

  const handleContinueShopping = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
            <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h2>
          <p className="text-gray-600 mb-6">
            Your payment was cancelled. No charges have been made to your account.
          </p>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What happened?</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• You cancelled the payment process</p>
              <p>• Your order has been saved but not paid</p>
              <p>• You can complete the payment later</p>
              <p>• No charges were made to your account</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleRetryPayment}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Try Payment Again
            </button>
            <button
              onClick={handleContinueShopping}
              className="w-full bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}