import React from 'react';
import Link from 'next/link';

const SustainabilityPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Our Commitment to Sustainability
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Caring for the environment while caring for your family. We're committed to making a positive impact on our planet and communities.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Environmental Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                At Lindocare, we believe that caring for families means caring for the planet they'll inherit. Our sustainability initiatives focus on reducing our environmental footprint while providing the highest quality baby care products.
              </p>
              <p className="text-lg text-gray-600">
                We're committed to sourcing eco-friendly materials, reducing waste, and supporting sustainable practices throughout our supply chain. Every decision we make considers the impact on future generations.
              </p>
            </div>
            <div className="bg-blue-100 rounded-2xl p-8">
              <div className="text-center">
                <div className="text-6xl mb-4">🌱</div>
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Green Future</h3>
                <p className="text-blue-800">
                  Building a sustainable future for the next generation of families in Rwanda and beyond.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainability Pillars */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Our Sustainability Pillars
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We focus on four key areas to create a positive environmental and social impact
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-4xl mb-4">♻️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Eco-Friendly Products</h3>
              <p className="text-gray-600">
                We prioritize products made from sustainable materials, biodegradable packaging, and non-toxic ingredients that are safe for babies and the environment.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Sustainable Packaging</h3>
              <p className="text-gray-600">
                Our packaging is designed to minimize waste, using recyclable materials and reducing plastic usage wherever possible.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Green Logistics</h3>
              <p className="text-gray-600">
                We optimize our delivery routes and work with partners who share our commitment to reducing carbon emissions.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Community Impact</h3>
              <p className="text-gray-600">
                We support local communities through education programs, charitable initiatives, and partnerships that benefit families across Rwanda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Eco-Friendly Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Our Eco-Friendly Product Range
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Discover products that are good for your baby and the planet
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="text-3xl mb-4">🧴</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Natural Baby Care</h3>
              <p className="text-gray-600">
                Organic and natural baby care products free from harmful chemicals and made with sustainable ingredients.
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="text-3xl mb-4">👕</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Organic Clothing</h3>
              <p className="text-gray-600">
                Baby clothes made from organic cotton and other sustainable fabrics that are gentle on sensitive skin.
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="text-3xl mb-4">🍼</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Reusable Products</h3>
              <p className="text-gray-600">
                Eco-friendly alternatives to disposable items, reducing waste and saving money in the long run.
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="text-3xl mb-4">🧸</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sustainable Toys</h3>
              <p className="text-gray-600">
                Educational toys made from natural materials and sustainable wood, promoting eco-conscious play.
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="text-3xl mb-4">🛏️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Green Nursery</h3>
              <p className="text-gray-600">
                Furniture and bedding made from sustainable materials, creating a healthy environment for your baby.
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="text-3xl mb-4">🌿</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Plant-Based Products</h3>
              <p className="text-gray-600">
                Products derived from natural, plant-based ingredients that are safe for babies and biodegradable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Initiatives */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Our Community Initiatives
            </h2>
            <p className="text-xl max-w-3xl mx-auto">
              Making a positive impact in communities across Rwanda
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white bg-opacity-10 rounded-xl p-6">
              <div className="text-3xl mb-4">📚</div>
              <h3 className="text-xl font-bold mb-3 text-blue-700">Education Programs</h3>
              <p className="text-blue-700">
                Supporting early childhood education initiatives and providing resources to families in need.
              </p>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-xl p-6">
              <div className="text-3xl mb-4">🏥</div>
              <h3 className="text-xl font-bold mb-3 text-blue-700">Health Partnerships</h3>
              <p className="text-blue-700">
                Collaborating with healthcare providers to improve maternal and child health outcomes.
              </p>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-xl p-6">
              <div className="text-3xl mb-4">🌱</div>
              <h3 className="text-xl font-bold mb-3 text-blue-700">Environmental Education</h3>
              <p className="text-blue-700">
                Teaching families about sustainable practices and environmental conservation.
              </p>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-xl p-6">
              <div className="text-3xl mb-4">🤝</div>
              <h3 className="text-xl font-bold mb-3 text-blue-700">Local Partnerships</h3>
              <p className="text-blue-700">
                Working with local artisans and businesses to support the Rwandan economy.
              </p>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-xl p-6">
              <div className="text-3xl mb-4">💝</div>
              <h3 className="text-xl font-bold mb-3 text-blue-700">Charitable Giving</h3>
              <p className="text-blue-700">
                Donating products and resources to families who need support during challenging times.
              </p>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-xl p-6">
              <div className="text-3xl mb-4">🌟</div>
              <h3 className="text-xl font-bold mb-3 text-blue-700">Volunteer Programs</h3>
              <p className="text-blue-700">
                Encouraging our team to participate in community service and environmental clean-up activities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Future Goals */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Our Sustainability Goals
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We're committed to continuous improvement and setting ambitious targets for environmental impact
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">2025 Targets</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 text-xl">✓</span>
                  <span>100% recyclable packaging by end of 2025</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 text-xl">✓</span>
                  <span>50% reduction in carbon footprint</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 text-xl">✓</span>
                  <span>Expand eco-friendly product range by 75%</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 text-xl">✓</span>
                  <span>Partner with 10 local sustainable suppliers</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Long-term Vision</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 text-xl">🎯</span>
                  <span>Carbon neutral operations by 2030</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 text-xl">🎯</span>
                  <span>Zero waste to landfill</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 text-xl">🎯</span>
                  <span>100% sustainable product sourcing</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 text-xl">🎯</span>
                  <span>Expand community programs across Rwanda</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Join Our Sustainable Journey
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Every purchase supports our commitment to sustainability and community impact
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/all-products"
              className="bg-white text-blue-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Shop Eco-Friendly Products
            </Link>
            <Link 
              href="/about-us"
              className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-500 transition-colors"
            >
              Learn More About Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      
    </div>
  );
};

export default SustainabilityPage; 