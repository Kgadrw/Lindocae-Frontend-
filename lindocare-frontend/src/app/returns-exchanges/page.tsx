import React from 'react';
import Link from 'next/link';

const ReturnsExchangesPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Returns & Exchanges
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              We want you to be completely satisfied with your purchase. Our hassle-free return and exchange policy ensures your peace of mind.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">30-Day Returns</h3>
              <p className="text-gray-600">Return most items within 30 days of delivery</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Easy Exchanges</h3>
              <p className="text-gray-600">Exchange for different sizes or colors hassle-free</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Free Returns</h3>
              <p className="text-gray-600">Free return shipping for eligible items</p>
            </div>
          </div>
        </div>
      </section>

      {/* Return Policy Details */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              Return Policy
            </h2>
            
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">What Can Be Returned?</h3>
              
              <div className="space-y-6">
                <div className="border-l-4 border-blue-600 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">✅ Eligible Items</h4>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Unused items in original packaging</li>
                    <li>• Items with manufacturing defects</li>
                    <li>• Wrong size or color received</li>
                    <li>• Damaged items during shipping</li>
                    <li>• Items that don't match the description</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-red-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">❌ Non-Returnable Items</h4>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Used or worn items</li>
                    <li>• Personal care items (for hygiene reasons)</li>
                    <li>• Sale or clearance items (unless defective)</li>
                    <li>• Gift cards</li>
                    <li>• Items without original packaging</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Return Process */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              How to Return or Exchange
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Step 1: Contact Us</h3>
                <p className="text-gray-600 mb-4">
                  Email us at <a href="mailto:returns@lindocare.com" className="text-blue-600 hover:underline">returns@lindocare.com</a> or call us at <a href="tel:+250788123456" className="text-blue-600 hover:underline">+250 788 123 456</a> within 30 days of delivery.
                </p>
                <p className="text-gray-600">
                  Include your order number and reason for return/exchange.
                </p>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Step 2: Get Approval</h3>
                <p className="text-gray-600 mb-4">
                  We'll review your request and provide a return authorization number if approved.
                </p>
                <p className="text-gray-600">
                  For exchanges, we'll help you select the correct size or color.
                </p>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Step 3: Package & Ship</h3>
                <p className="text-gray-600 mb-4">
                  Securely package the item in its original packaging with the return authorization number clearly visible.
                </p>
                <p className="text-gray-600">
                  Use the provided return shipping label or ship to our address.
                </p>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Step 4: Refund/Exchange</h3>
                <p className="text-gray-600 mb-4">
                  Once we receive and inspect the item, we'll process your refund or ship your exchange within 3-5 business days.
                </p>
                <p className="text-gray-600">
                  Refunds are issued to the original payment method.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Exchange Information */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              Exchange Information
            </h2>
            
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Size Exchanges</h3>
                  <p className="text-gray-600 mb-4">
                    Need a different size? We offer free size exchanges for clothing and shoes. Simply contact us with your order number and desired size.
                  </p>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Available sizes depend on current stock</li>
                    <li>• No additional shipping charges</li>
                    <li>• Processed within 2-3 business days</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Color/Product Exchanges</h3>
                  <p className="text-gray-600 mb-4">
                    Want a different color or product? We can exchange for items of equal or lesser value.
                  </p>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Equal value exchanges are free</li>
                    <li>• Upgrades require payment of difference</li>
                    <li>• Subject to current availability</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shipping Information */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              Shipping & Processing Times
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Return Shipping</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• Free return shipping for defective items</li>
                  <li>• Customer pays return shipping for change of mind</li>
                  <li>• Return shipping label provided for approved returns</li>
                  <li>• Track your return with provided tracking number</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Processing Times</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• Return processing: 3-5 business days</li>
                  <li>• Refund processing: 5-10 business days</li>
                  <li>• Exchange shipping: 2-3 business days</li>
                  <li>• Credit card refunds: 7-14 business days</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-3">How long do I have to return an item?</h3>
                <p className="text-gray-600">
                  You have 30 days from the date of delivery to return most items. Some items may have different return windows.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Do I need the original packaging?</h3>
                <p className="text-gray-600">
                  Yes, items must be returned in their original packaging and unused condition to be eligible for a full refund.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Can I exchange for a different product?</h3>
                <p className="text-gray-600">
                  Yes, you can exchange for a different product of equal or lesser value. For items of higher value, you'll need to pay the difference.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-3">What if my item arrives damaged?</h3>
                <p className="text-gray-600">
                  Contact us immediately with photos of the damage. We'll provide a free return shipping label and process a full refund or replacement.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-3">How will I receive my refund?</h3>
                <p className="text-gray-600">
                  Refunds are issued to the original payment method used for the purchase. Credit card refunds may take 7-14 business days to appear on your statement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Need Help with Returns?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Our customer service team is here to help you with any questions about returns or exchanges
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white bg-opacity-10 rounded-xl p-6">
              <div className="text-3xl mb-4">📧</div>
              <h3 className="text-xl font-bold mb-2">Email Us</h3>
              <a href="mailto:returns@lindocare.com" className="text-blue-200 hover:text-white">
                returns@lindocare.com
              </a>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-xl p-6">
              <div className="text-3xl mb-4">📞</div>
              <h3 className="text-xl font-bold mb-2">Call Us</h3>
              <a href="tel:+250788123456" className="text-blue-200 hover:text-white">
                +250 788 123 456
              </a>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-xl p-6">
              <div className="text-3xl mb-4">💬</div>
              <h3 className="text-xl font-bold mb-2">Live Chat</h3>
              <p className="text-blue-200">
                Available 24/7
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReturnsExchangesPage; 