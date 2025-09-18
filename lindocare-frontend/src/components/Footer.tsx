'use client';

import React, { useEffect, useState } from 'react';
import { Instagram, Facebook, Youtube } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);

  useEffect(() => {
    fetch('https://lindo-project.onrender.com/category/getAllCategories')
      .then(res => res.json())
      .then(data => {
        let cats = [];
        if (Array.isArray(data)) cats = data;
        else if (data && Array.isArray(data.categories)) cats = data.categories;
        setCategories(cats.slice(-4).reverse());
      })
      .catch(() => setCategories([]));
  }, []);

  return (
    <footer className="bg-white py-6 md:py-10 px-4 md:px-6 text-gray-700 border-t border-gray-200">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        {/* Customer Service */}
        <div>
          <h3 className="font-bold text-lg mb-3">Customer Service</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/returns-exchanges" className="hover:underline">Returns & Exchanges</Link></li>
            <li><Link href="/faqs" className="hover:underline">FAQs</Link></li>
            
          </ul>
        </div>

        {/* Shop Categories */}
        <div>
          <h3 className="font-bold text-lg mb-3">Shop</h3>
          <ul className="space-y-2 text-sm">
            {categories.length > 0 ? (
              categories.map(cat => (
                <li key={cat._id}>
                  <Link href={`/all-products?category=${encodeURIComponent(cat.name)}`} className="hover:underline">{cat.name}</Link>
                </li>
              ))
            ) : (
              <>
                <li><Link href="/all-products?category=Strollers" className="hover:underline">Strollers</Link></li>
                <li><Link href="/all-products?category=Nursery" className="hover:underline">Nursery</Link></li>
                <li><Link href="/all-products?category=Maternity" className="hover:underline">Maternity</Link></li>
                <li><Link href="/all-products?category=Gift%20Cards" className="hover:underline">Gift Cards</Link></li>
              </>
            )}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className="font-bold text-lg mb-3">Company</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about-us" className="hover:underline">About Us</Link></li>
            <li><Link href="/careers" className="hover:underline">Careers</Link></li>
            <li><Link href="/sustainability" className="hover:underline">Sustainability</Link></li>
            <li><Link href="/blog" className="hover:underline">Blog</Link></li>
          </ul>
        </div>

        {/* Follow Us */}
        <div>
          <h3 className="font-bold text-lg mb-3">Follow Us</h3>
          <div className="flex gap-3 mb-4 justify-center md:justify-start">
            <a href="https://www.instagram.com/lindocare/" aria-label="Instagram" className="hover:text-lindo-yellow">
              <Instagram size={24} strokeWidth={2} />
            </a>
            <a href="https://www.facebook.com/lindocare/" aria-label="Facebook" className="hover:text-lindo-yellow">
              <Facebook size={24} strokeWidth={2} />
            </a>
            <a href="https://www.youtube.com/lindocare/" aria-label="YouTube" className="hover:text-lindo-yellow">
              <Youtube size={24} strokeWidth={2} />
            </a>
          </div>

          {/* Contact Info */}
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-semibold">Tel:</span>{" "}
              <a href="tel:+250795575622" className="hover:underline">+250 795 575 622</a>
            </div>
            <div>
              <span className="font-semibold">Email:</span>{" "}
              <a href="mailto:hello@lindocare.com" className="hover:underline">hello@lindocare.com</a>
            </div>
            <div>
              <span className="font-semibold">Address:</span> Unify Buildings, Behind T 2000 Hotel, Kigali, Rwanda
            </div>
          </div>
        </div>
      </div>

      {/* Payment + Map Section */}
      <div className="max-w-7xl mx-auto mt-10 flex flex-col lg:flex-row justify-between items-start gap-6">
        {/* Payment info */}
        <div className="flex flex-col items-start gap-4">
          <h3 className="font-semibold text-gray-800">We Accept</h3>
          <div className="flex gap-4 items-center">
            <Image src="/mtn.jpg" alt="MTN" width={60} height={24} className="object-contain" />
            <Image src="/airtel.png" alt="Airtel" width={60} height={24} className="object-contain" />
            <Image src="/dpo.png" alt="DPO Payment Gateway" width={80} height={24} className="object-contain" />
          </div>
          <p className="text-sm text-gray-600 mt-1">Secure payments via DPO Payment Gateway, including bank cards.</p>
        </div>

        {/* Embedded Google Map */}
        <div className="flex-1 w-full lg:w-auto">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d63800.373419208256!2d30.017908500813974!3d-1.9434416141741286!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e6!4m5!1s0x19dca5bad4fbd373%3A0xe9b0424afd612b26!2sUZA%20Solutions%20Ltd%2C%20KN%202%20Street%2C%20Kigali!3m2!1d-1.9435278999999999!2d30.0591084!4m5!1s0x19dca5bad4fbd373%3A0xe9b0424afd612b26!2sUZA%20Solutions%20Ltd%2C%20KN%202%20Street%2C%20Kigali!3m2!1d-1.9435278999999999!2d30.0591084!5e0!3m2!1sen!2srw!4v1756977434049!5m2!1sen!2srw"
            width="100%"
            height="250"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center text-xs text-gray-700 mt-8 font-normal">
        © 2025 Lindocare. All rights reserved.<br />
        <Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link> | <Link href="/terms-of-use" className="hover:underline">Terms of Use</Link>
      </div>
    </footer>
  );
};

export default Footer;
