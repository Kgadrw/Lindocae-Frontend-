import React from "react";
import Link from "next/link";
import { User, Shield, Heart, Handshake, Home, Phone, Mail, MapPin } from "lucide-react";

const AboutUsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <section className="relative w-full h-[300px] md:h-[300px]">
        <div
          className="absolute inset-0 bg-contain bg-center"
          style={{ backgroundImage: "url('/about.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 opacity-70"></div>
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-4 sm:px-6 lg:px-8 text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            About Lindocare
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Your trusted partner in baby care, providing quality products and expert guidance for every step of your parenting journey.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                At Lindocare, we believe every parent deserves access to the highest quality baby care products and expert guidance. Our mission is to make parenting easier, safer, and more enjoyable by providing carefully curated products that meet the highest standards of safety and quality.
              </p>
              <p className="text-lg text-gray-600">
                We understand that every child is unique, and every family has different needs. That's why we offer a comprehensive range of products, from essential baby care items to premium nursery furniture, all backed by our commitment to excellence and customer satisfaction.
              </p>
            </div>

            <div className="relative rounded-2xl p-8 overflow-hidden">
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/quality.jpg')" }}
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-blue-600 opacity-60"></div>

              {/* Content */}
              <div className="relative z-10 text-center text-white">
                <User className="mx-auto mb-4 w-12 h-12" />
                <h3 className="text-2xl font-bold mb-4">Quality First</h3>
                <p>
                  Every product in our collection is carefully selected to ensure the highest standards of safety, quality, and functionality for your little ones.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Our Values
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              These core values guide everything we do at Lindocare
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <Shield className="mx-auto mb-4 w-12 h-12 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">Safety First</h3>
              <p className="text-gray-600">
                Every product we offer meets or exceeds international safety standards. Your child's safety is our top priority.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <Heart className="mx-auto mb-4 w-12 h-12 text-pink-500" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quality Care</h3>
              <p className="text-gray-600">
                We believe in providing products that not only meet your needs but exceed your expectations for quality and durability.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg text-center">
              <Handshake className="mx-auto mb-4 w-12 h-12 text-green-500" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">Expert Support</h3>
              <p className="text-gray-600">
                Our team of parenting experts is here to guide you through every step of your parenting journey with personalized advice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            <div className="bg-gray-100 rounded-2xl p-8 text-center">
              <Home className="mx-auto mb-4 w-12 h-12 text-blue-700" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h3>
              <p className="text-gray-700">
                Founded with a passion for helping parents, Lindocare began as a small family business and has grown into a trusted name in baby care across Rwanda.
              </p>
            </div>

            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Journey
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Lindocare was born from a simple belief: that every parent deserves access to the best baby care products and expert guidance. What started as a small family business has grown into a trusted partner for thousands of families across Rwanda.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                We've built our reputation on quality, safety, and exceptional customer service. Our team of parenting experts is always ready to help you make the best choices for your family.
              </p>
              <p className="text-lg text-gray-600">
                Today, we're proud to serve families throughout Rwanda, providing everything from essential baby care items to premium nursery furniture, all backed by our commitment to excellence.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative py-16 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/touch.jpg')" }}
        />
        <div className="absolute inset-0 bg-blue-600 opacity-70"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Get in Touch
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Have questions about our products or need parenting advice? We're here to help!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <Phone className="inline-block mr-2 w-5 h-5" />
              <h3 className="text-lg font-semibold mb-2 inline">Call Us</h3>
              <p>
                <a href="tel:+250785064255" className="text-blue-100 hover:text-white transition-colors">
                  +250 785 064 255
                </a>
              </p>
            </div>

            <div>
              <Mail className="inline-block mr-2 w-5 h-5" />
              <h3 className="text-lg font-semibold mb-2 inline">Email Us</h3>
              <p>
                <a href="mailto:hello@lindocare.com" className="text-blue-100 hover:text-white transition-colors">
                  hello@lindocare.com
                </a>
              </p>
            </div>

            <div>
              <MapPin className="inline-block mr-2 w-5 h-5" />
              <h3 className="text-lg font-semibold mb-2 inline">Visit Us</h3>
              <p className="text-blue-100">
                Unify Buildings, Behind T 2000 Hotel
              </p>
            </div>
          </div>

          <Link 
            href="/all-products"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
          >
            Shop Our Products
          </Link>
        </div>
      </section>

    </div>
  );
};

export default AboutUsPage;
