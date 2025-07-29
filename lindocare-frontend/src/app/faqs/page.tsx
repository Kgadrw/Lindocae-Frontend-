'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import Link from 'next/link';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQItem = ({ faq, isOpen, toggleOpen }: { faq: FAQItem; isOpen: boolean; toggleOpen: () => void }) => (
  <div className="border-b border-gray-200">
    <button
      onClick={toggleOpen}
      className="w-full py-6 px-8 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
    >
      <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
      {isOpen ? (
        <ChevronUp className="text-gray-500 flex-shrink-0" size={20} />
      ) : (
        <ChevronDown className="text-gray-500 flex-shrink-0" size={20} />
      )}
    </button>
    {isOpen && (
      <div className="pb-6 px-8">
        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
      </div>
    )}
  </div>
);

const FAQsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openItems, setOpenItems] = useState<string[]>([]);

  const faqs: FAQItem[] = [
    // Product Questions
    {
      id: 'product-1',
      question: 'What age range are your products suitable for?',
      answer: 'Our products are designed for babies and children from newborn to 6 years old. We offer age-appropriate items including strollers, car seats, nursery furniture, feeding essentials, and developmental toys. Each product clearly indicates the recommended age range.',
      category: 'products'
    },
    {
      id: 'product-2',
      question: 'Are your products safe and certified?',
      answer: 'Yes, all our products meet or exceed international safety standards. We carry products that are CE certified, ASTM compliant, and follow strict safety guidelines. We only stock items from reputable brands that prioritize child safety.',
      category: 'products'
    },
    {
      id: 'product-3',
      question: 'Do you offer organic baby products?',
      answer: 'Yes, we have a selection of organic baby products including clothing, bedding, and feeding items. These products are made from natural materials and are free from harmful chemicals. Look for the organic label on our website.',
      category: 'products'
    },
    {
      id: 'product-4',
      question: 'Can I get advice on choosing the right products?',
      answer: 'Absolutely! Our team of parenting experts is available to help you choose the right products for your child. You can contact us via phone, email, or visit our store for personalized recommendations based on your child\'s age and needs.',
      category: 'products'
    },

    // Shipping & Delivery
    {
      id: 'shipping-1',
      question: 'How long does shipping take?',
      answer: 'Standard shipping within Rwanda takes 2-3 business days. Express shipping is available for next-day delivery in Kigali. For rural areas, delivery may take 3-5 business days. International shipping is not currently available.',
      category: 'shipping'
    },
    {
      id: 'shipping-2',
      question: 'What are your shipping costs?',
      answer: 'Free shipping is available for orders over 50,000 RWF. Standard shipping costs 3,000 RWF for orders under this amount. Express shipping costs 5,000 RWF. Shipping costs are calculated at checkout.',
      category: 'shipping'
    },
    {
      id: 'shipping-3',
      question: 'Do you ship to all areas in Rwanda?',
      answer: 'Yes, we ship to all provinces in Rwanda. Delivery times vary by location - Kigali and major cities receive faster delivery, while rural areas may take longer. We partner with reliable delivery services to ensure safe delivery.',
      category: 'shipping'
    },
    {
      id: 'shipping-4',
      question: 'Can I track my order?',
      answer: 'Yes, you will receive a tracking number via email once your order ships. You can track your order status through our website or by contacting our customer service team.',
      category: 'shipping'
    },

    // Returns & Exchanges
    {
      id: 'returns-1',
      question: 'What is your return policy?',
      answer: 'We accept returns within 30 days of purchase for unused items in original packaging. Safety items like car seats and cribs must be returned within 7 days. Personalized items and sale items are final sale. Please contact us to initiate a return.',
      category: 'returns'
    },
    {
      id: 'returns-2',
      question: 'How do I return an item?',
      answer: 'To return an item, contact our customer service team within 30 days of purchase. We\'ll provide you with a return authorization and shipping label. Returns are processed within 5-7 business days of receiving the item.',
      category: 'returns'
    },
    {
      id: 'returns-3',
      question: 'Can I exchange an item for a different size or color?',
      answer: 'Yes, we offer exchanges for different sizes or colors if the item is in unused condition with original packaging. Exchanges are subject to availability. Contact our customer service team to arrange an exchange.',
      category: 'returns'
    },
    {
      id: 'returns-4',
      question: 'What if my item arrives damaged?',
      answer: 'If your item arrives damaged, please contact us immediately with photos of the damage. We\'ll arrange for a replacement or refund at no cost to you. Damaged items should be reported within 48 hours of delivery.',
      category: 'returns'
    },

    // Payment & Security
    {
      id: 'payment-1',
      question: 'What payment methods do you accept?',
      answer: 'We accept mobile money (MTN Mobile Money, Airtel Money), bank transfers, and cash on delivery. We also accept major credit cards through our secure payment gateway. All payments are processed securely.',
      category: 'payment'
    },
    {
      id: 'payment-2',
      question: 'Is my payment information secure?',
      answer: 'Yes, we use industry-standard SSL encryption to protect your payment information. We never store your credit card details on our servers. All transactions are processed through secure payment gateways.',
      category: 'payment'
    },
    {
      id: 'payment-3',
      question: 'Do you offer installment payments?',
      answer: 'Yes, we offer installment payment options for purchases over 100,000 RWF. You can choose to pay in 2-6 monthly installments. Contact our customer service team to arrange installment payments.',
      category: 'payment'
    },
    {
      id: 'payment-4',
      question: 'Can I get a refund if I\'m not satisfied?',
      answer: 'We want you to be completely satisfied with your purchase. If you\'re not happy with your order, contact us within 30 days for a full refund or exchange. We\'ll work with you to ensure your satisfaction.',
      category: 'payment'
    },

    // Customer Service
    {
      id: 'service-1',
      question: 'How can I contact customer service?',
      answer: 'You can reach our customer service team by phone at +250 785 064 255, email at hello@lindocare.com, or visit our store at Unify Buildings, Behind T 2000 Hotel, Kigali. We\'re available Monday-Saturday, 8 AM-6 PM.',
      category: 'service'
    },
    {
      id: 'service-2',
      question: 'Do you offer gift wrapping?',
      answer: 'Yes, we offer beautiful gift wrapping for an additional 2,000 RWF. You can add gift wrapping during checkout. We also offer personalized gift messages that will be included with your order.',
      category: 'service'
    },
    {
      id: 'service-3',
      question: 'Can I place a custom order?',
      answer: 'Yes, we accept custom orders for special occasions or specific requirements. Custom orders may take 2-4 weeks to fulfill. Contact our customer service team to discuss your custom order needs.',
      category: 'service'
    },
    {
      id: 'service-4',
      question: 'Do you have a loyalty program?',
      answer: 'Yes, we have a loyalty program that rewards our regular customers. Earn points with every purchase and redeem them for discounts on future orders. Sign up for our newsletter to learn more about our loyalty program.',
      category: 'service'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Questions' },
    { id: 'products', name: 'Products' },
    { id: 'shipping', name: 'Shipping & Delivery' },
    { id: 'returns', name: 'Returns & Exchanges' },
    { id: 'payment', name: 'Payment & Security' },
    { id: 'service', name: 'Customer Service' }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Find answers to common questions about our products, shipping, returns, and more.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Results Count */}
          <div className="text-gray-600 mb-6">
            {filteredFaqs.length} question{filteredFaqs.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredFaqs.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {filteredFaqs.map(faq => (
                <FAQItem
                  key={faq.id}
                  faq={faq}
                  isOpen={openItems.includes(faq.id)}
                  toggleOpen={() => toggleItem(faq.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤔</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No questions found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search terms or browse all categories.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Still Have Questions?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Can't find what you're looking for? Our customer service team is here to help!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="text-3xl mb-2">📞</div>
              <h3 className="text-lg font-semibold mb-2">Call Us</h3>
              <a href="tel:+250785064255" className="text-blue-100 hover:text-white transition-colors">
                +250 785 064 255
              </a>
            </div>
            
            <div>
              <div className="text-3xl mb-2">📧</div>
              <h3 className="text-lg font-semibold mb-2">Email Us</h3>
              <a href="mailto:hello@lindocare.com" className="text-blue-100 hover:text-white transition-colors">
                hello@lindocare.com
              </a>
            </div>
            
            <div>
              <div className="text-3xl mb-2">📍</div>
              <h3 className="text-lg font-semibold mb-2">Visit Us</h3>
              <p className="text-blue-100">
                Unify Buildings, Behind T 2000 Hotel
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/all-products"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Shop Our Products
            </Link>
            <Link 
              href="/returns-exchanges"
              className="inline-block border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Returns & Exchanges
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQsPage; 