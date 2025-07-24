import React, { useState } from 'react';

const EmailSignupBanner: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Open user's email client to send to hello@lindocare.com
    window.location.href = `mailto:hello@lindocare.com?subject=Newsletter Signup&body=Email: ${email}`;
    setEmail('');
  };

  return (
    <section className="w-full mb-8">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-2xl mx-auto text-center shadow-lg">
        <h2 className="text-2xl font-bold text-blue-800 mb-2">
          Unlock <span className="text-3xl font-extrabold text-blue-900">10% OFF!</span>
        </h2>
        <p className="text-blue-700 mb-6">
          Gain early access to new products and exclusive deals.
        </p>
        
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="relative max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 bg-white text-blue-900 placeholder-gray-400"
              required
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg 
                className="w-5 h-5 text-gray-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                />
              </svg>
            </div>
          </div>
        </form>
        
        <p className="text-sm text-gray-600">
          By clicking the button you agree to the{' '}
          <a href="/privacy-policy" className="underline hover:text-blue-800 text-gray-700 font-medium">
            Privacy Policy
          </a>{' '}
          and{' '}
          <a href="/terms-conditions" className="underline hover:text-blue-800 text-gray-700 font-medium">
            Terms and Conditions
          </a>
        </p>
      </div>
    </section>
  );
};

export default EmailSignupBanner; 