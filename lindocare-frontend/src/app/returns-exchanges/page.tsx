import React from 'react';

const ReturnsExchangesPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Returns & Refunds Policy
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              At Lindo Care, we care about your baby’s comfort — and your satisfaction. If something isn’t right with your diaper order, we’re here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">⏳</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">7-Day Refunds</h3>
              <p className="text-gray-600">Request a full refund within 7 days of receiving your diaper order</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">30-Day Exchanges</h3>
              <p className="text-gray-600">Free exchanges or store credit within 30 days for size changes</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Easy Returns</h3>
              <p className="text-gray-600">Unopened, unused diapers in original packaging are eligible</p>
            </div>
          </div>
        </div>
      </section>

      {/* Return Window & Eligibility */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              Return Window & Eligibility
            </h2>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-blue-800 mb-4">Return Window</h3>
                  <ul className="text-gray-700 space-y-2 list-disc pl-6">
                    <li>You can request a full refund within <span className="font-semibold">7 days</span> of receiving your diaper order.</li>
                    <li>Free exchanges or store credit for size changes within <span className="font-semibold">30 days</span> of delivery.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-800 mb-4">Eligible Returns</h3>
                  <ul className="text-gray-700 space-y-2 list-disc pl-6">
                    <li>Unopened, unused, and in the original packaging</li>
                    <li>All labels/seals are intact</li>
                    <li>Order number or receipt provided</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Non-Returnable Diapers */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              Non-Returnable Diapers
            </h2>
            <div className="bg-gray-50 rounded-xl p-8 shadow-lg">
              <ul className="text-gray-700 space-y-2 list-disc pl-6">
                <li>The pack has been opened or used</li>
                <li>Purchased as a final sale or clearance item</li>
                <li>Part of a custom bundle</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Damaged or Incorrect Orders */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              Damaged or Incorrect Orders
            </h2>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <p className="text-gray-700 mb-4">If you receive damaged, defective, or incorrect diaper products, contact us within <span className="font-semibold">48 hours</span> of delivery.</p>
              <div className="mb-2">
                <span className="font-semibold">Email:</span> <a href="mailto:hello@lindocare.com" className="text-blue-700 hover:underline">hello@lindocare.com</a>
              </div>
              <ul className="text-gray-700 space-y-2 list-disc pl-6 mb-4">
                <li>Your order number</li>
                <li>A brief explanation</li>
                <li>A photo of the issue</li>
              </ul>
              <p className="text-gray-700">We’ll resolve it with a refund, replacement, or store credit — whichever works best for you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Refund Processing */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              Refund Processing
            </h2>
            <div className="bg-gray-50 rounded-xl p-8 shadow-lg">
              <ul className="text-gray-700 space-y-2 list-disc pl-6">
                <li>Once we receive and inspect your return:</li>
                <ul className="pl-8 list-disc">
                  <li>Refunds are processed within 7–14 business days</li>
                  <li>Funds are returned via your original payment method or Mobile Money</li>
                </ul>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How to Request a Return or Exchange */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              How to Request a Return or Exchange
            </h2>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <ol className="list-decimal pl-6 text-gray-700 mb-4 space-y-2">
                <li>Email us at <a href="mailto:hello@lindocare.com" className="text-blue-700 hover:underline">hello@lindocare.com</a></li>
                <li>Include your order number and reason for return</li>
                <li>If damaged, attach a photo</li>
                <li>Wait for confirmation before returning the product</li>
              </ol>
              <p className="text-gray-700">We’ll guide you through the process.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Need Help?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Our customer service team is here to help you with any questions about returns or exchanges
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white bg-opacity-90 rounded-xl p-6">
              <div className="text-3xl mb-4">📧</div>
              <h3 className="text-xl font-bold mb-2 text-blue-900">Email Us</h3>
              <a href="mailto:hello@lindocare.com" className="text-blue-800 font-bold hover:underline text-lg">
                hello@lindocare.com
              </a>
            </div>
            <div className="bg-white bg-opacity-90 rounded-xl p-6">
              <div className="text-3xl mb-4">📞</div>
              <h3 className="text-xl font-bold mb-2 text-blue-900">Call Us</h3>
              <a href="tel:+250795575622" className="text-blue-800 font-bold hover:underline text-lg">
                +250 795 575 622
              </a>
            </div>
            <div className="bg-white bg-opacity-90 rounded-xl p-6">
              <div className="text-3xl mb-4">📍</div>
              <h3 className="text-xl font-bold mb-2 text-blue-900">Location</h3>
              <p className="text-blue-800 font-bold text-lg">Kigali, Rwanda</p>
            </div>
          </div>
        </div>
      </section>

      {/* Thank You Section */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg text-gray-800 font-semibold">
            Thank you for choosing Lindo Care.<br />
            <span className="text-blue-800">Because your baby deserves the best — and so do you.</span>
          </p>
        </div>
      </section>
    </div>
  );
};

export default ReturnsExchangesPage; 