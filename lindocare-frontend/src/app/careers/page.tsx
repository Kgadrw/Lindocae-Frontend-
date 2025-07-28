import React from 'react';
import Link from 'next/link';

const CareersPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Join Our Team
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Help us make parenting easier for families across Rwanda. Be part of a team that's passionate about quality baby care.
            </p>
          </div>
        </div>
      </section>

      {/* Why Work With Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Why Work With Lindocare?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Join a team that's making a difference in families' lives every day
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🌟</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Meaningful Work</h3>
              <p className="text-gray-600">
                Help parents provide the best care for their children with quality products and expert guidance.
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Growth Opportunities</h3>
              <p className="text-gray-600">
                Build your career with a growing company that values learning and development.
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Supportive Team</h3>
              <p className="text-gray-600">
                Work with passionate professionals who support each other and celebrate success together.
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Competitive Benefits</h3>
              <p className="text-gray-600">
                Enjoy competitive salaries, flexible schedules, and opportunities for advancement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* No Current Openings */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Current Openings
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We're always looking for passionate individuals to join our team
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-12 shadow-lg text-center max-w-2xl mx-auto">
            <div className="text-6xl mb-6">📋</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              No Open Positions at the Moment
            </h3>
            <p className="text-lg text-gray-600 mb-8">
              We don't have any open positions right now, but we're always interested in hearing from talented individuals who are passionate about baby care and customer service.
            </p>
            <div className="bg-blue-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-blue-900 mb-3">Interested in Future Opportunities?</h4>
              <p className="text-blue-800 mb-4">
                Send us your resume and we'll keep it on file for when positions become available.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Types of Roles We Hire */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Types of Roles We Hire
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              When positions are available, we typically look for these types of roles
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="text-3xl mb-4">🛍️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sales & Customer Service</h3>
              <p className="text-gray-600">
                Help parents find the perfect products and provide excellent customer support.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="text-3xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Marketing & Digital</h3>
              <p className="text-gray-600">
                Help us grow our brand and reach more families through digital marketing.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="text-3xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Operations & Logistics</h3>
              <p className="text-gray-600">
                Manage inventory, shipping, and ensure smooth operations.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="text-3xl mb-4">💻</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Technology</h3>
              <p className="text-gray-600">
                Help us improve our website and digital platforms.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Business Development</h3>
              <p className="text-gray-600">
                Help us expand our reach and partnerships across Rwanda.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="text-3xl mb-4">👶</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Product Specialists</h3>
              <p className="text-gray-600">
                Become an expert in baby care products and provide expert advice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Stay Connected
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Send us your resume and we'll contact you when positions become available
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <div className="text-3xl mb-2">📧</div>
              <h3 className="text-lg font-semibold mb-2">Email Your Resume</h3>
              <a href="mailto:careers@lindocare.com" className="text-blue-100 hover:text-white transition-colors">
                careers@lindocare.com
              </a>
            </div>
            
            <div>
              <div className="text-3xl mb-2">📞</div>
              <h3 className="text-lg font-semibold mb-2">Call HR</h3>
              <a href="tel:+250785064255" className="text-blue-100 hover:text-white transition-colors">
                +250 785 064 255
              </a>
            </div>
          </div>
          
          <div className="bg-white text-blue-600 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-4">What to Include</h3>
            <ul className="text-left space-y-2 text-blue-800">
              <li>• Updated resume with relevant experience</li>
              <li>• Cover letter explaining your interest in Lindocare</li>
              <li>• Portfolio or work samples (if applicable)</li>
              <li>• Expected salary range</li>
              <li>• Available start date</li>
              <li>• Types of roles you're interested in</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      
    </div>
  );
};

export default CareersPage; 