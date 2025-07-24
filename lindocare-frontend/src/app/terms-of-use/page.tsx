"use client";
import React, { useState } from "react";
import emailjs from "emailjs-com";

// Initialize EmailJS with your public key
emailjs.init("0t7uS81N1_DAuGVjE");

const TERMS_TEXT = `
Last updated: 23 July 2025

Welcome to Lindocare. These Terms and Conditions ("Terms") govern your use of our website and services. By accessing or purchasing from our site (www.lindocare.rw), you agree to these Terms. Please read them carefully.

1. About Us
Lindocare is a Rwandan-based company dedicated to providing high-quality baby care products, including diapers, baby wipes, baby lotions, and more. Our services are primarily available through our online platform.

2. Eligibility
By using our website, you confirm that you are at least 18 years old or have the consent of a legal guardian. Purchases made by minors must be supervised.

3. Product Information
We strive to ensure all product descriptions, prices, and images are accurate and up to date. However, we do not guarantee that product details are always error-free. If you encounter an issue, please contact our support team.

4. Orders & Payments
Orders can be placed through our website and will be confirmed via email or SMS.

All prices are listed in Rwandan Francs (RWF).

We accept various forms of payment, including Mobile Money and card payments.

Lindocare reserves the right to cancel or refuse any order if fraud or payment issues are suspected.

5. Shipping & Delivery
We offer delivery services within Rwanda. Delivery times and fees may vary by location.

Estimated delivery time is 1–3 business days within Kigali and up to 5 business days in other regions.

Delays may occur due to unforeseen circumstances.

6. Returns & Refunds
You may request a return or exchange within 7 days of receiving the product, provided the product is unused, unopened, and in its original packaging.

Refunds are processed only after the returned item is inspected and approved.

Certain items (e.g., opened diapers, used personal care products) may not be eligible for return for hygiene reasons.

7. Privacy
We respect your privacy. Your personal information is collected only to process orders and enhance your shopping experience. We do not share your data with third parties except as required for order fulfillment. Read our Privacy Policy for more.

8. Intellectual Property
All content on our website, including logos, text, images, and design, is the property of Lindocare and protected by Rwandan intellectual property laws. You may not use or reproduce any content without written permission.

9. Limitation of Liability
Lindocare is not liable for any indirect or consequential damages arising from the use of our products or services. All products should be used as directed and under adult supervision.

10. Changes to Terms
We may update these Terms from time to time. Continued use of our site after any changes constitutes your acceptance of the new Terms.

11. Governing Law
These Terms shall be governed by and interpreted under the laws of the Republic of Rwanda. Any disputes shall be resolved in Rwandan courts.

12. Contact Us
For any questions about these Terms, please contact us at:

  Email: lindocare@gmail.com
  Phone: +250 785 064 255
  Address: Kigali, Rwanda
  Downtown , Unify House , 4th floor behind T-2000
`;

const TermsOfUsePage = () => {
  const [question, setQuestion] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSent(false);
    if (!question.trim() || !email.trim()) return;
    setLoading(true);
    try {
      await emailjs.send("service_15gmamg", "template_jxbea9r", {
        user_email: email,
        user_question: question,
      });
      setSent(true);
      setQuestion("");
      setEmail("");
    } catch (err) {
      setError("Failed to send your question. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-2 pt-2 pb-2">
      <h1 className="text-3xl font-bold text-blue-900 mb-6 text-center">Terms of Use & Terms and Conditions</h1>
      <div className="prose prose-blue max-w-none text-gray-900 whitespace-pre-line prose-p:my-2">
        {TERMS_TEXT}
      </div>
      <div className="mt-8 border-t pt-6 flex flex-col items-center">
        <div className="w-full max-w-2xl border border-gray-200 rounded-xl p-6 bg-transparent">
          <h2 className="text-xl font-semibold mb-2 text-blue-900">Any question?</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <label htmlFor="email" className="font-medium text-gray-800">Your Email</label>
            <input
              id="email"
              type="email"
              className="border border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-200 w-full text-gray-900 placeholder-gray-500"
              placeholder="e.g. youremail@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ fontWeight: 500 }}
              disabled={loading}
            />
            <label htmlFor="question" className="font-medium text-gray-800">Your Question</label>
            <textarea
              id="question"
              className="border border-gray-300 rounded-lg p-3 min-h-[100px] text-base focus:outline-none focus:ring-2 focus:ring-blue-200 w-full text-gray-900 placeholder-gray-500"
              placeholder="Type your question here..."
              value={question}
              onChange={e => setQuestion(e.target.value)}
              required
              style={{ fontWeight: 500 }}
              disabled={loading}
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow hover:bg-blue-700 transition text-lg disabled:opacity-60"
              disabled={!question.trim() || !email.trim() || loading}
            >
              {loading ? "Sending..." : "Send"}
            </button>
            {sent && (
              <div className="text-green-600 text-base mt-2 text-center">Thank you! Your question has been sent.</div>
            )}
            {error && (
              <div className="text-red-600 text-base mt-2 text-center">{error}</div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUsePage; 