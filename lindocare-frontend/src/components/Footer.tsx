'use client';

import React, { useEffect, useState } from 'react';
import { Instagram, Facebook, Youtube } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  useEffect(() => {
    fetch('https://lindo-project.onrender.com/category/getAllCategories')
      .then(res => res.json())
      .then(data => {
        let cats = [];
        if (Array.isArray(data)) cats = data;
        else if (data && Array.isArray(data.categories)) cats = data.categories;
        setCategories(cats.slice(-4).reverse()); // latest 4
      })
      .catch(() => setCategories([]));
  }, []);

  return (
    <footer className="hidden md:block bg-white py-8 px-4 text-gray-700 border-t border-gray-300">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-bold mb-2">Customer Service</h3>
          <ul className="space-y-1 text-sm font-normal">
            <li><a href="#" className="hover:underline">Shipping Info</a></li>
            <li><a href="/returns-exchanges" className="hover:underline">Returns & Exchanges</a></li>
            <li><a href="#" className="hover:underline">FAQs</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-2">Shop</h3>
          <ul className="space-y-1 text-sm font-normal">
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
        <div> 
          <h3 className="font-bold mb-2">Company</h3>
          <ul className="space-y-1 text-sm font-normal">
            <li><Link href="/about-us" className="hover:underline">About Us</Link></li>
            <li><Link href="/careers" className="hover:underline">Careers</Link></li>
            <li><Link href="/sustainability" className="hover:underline">Sustainability</Link></li>
            
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-2">Follow Us</h3>
          <div className="flex gap-3 mb-2">
            <a href="https://www.instagram.com/lindocare/" aria-label="Instagram" className="hover:text-lindo-yellow"><Instagram size={24} strokeWidth={2} /></a>
            <a href="https://www.facebook.com/lindocare/" aria-label="Facebook" className="hover:text-lindo-yellow"><Facebook size={24} strokeWidth={2} /></a>
            <a href="https://www.youtube.com/lindocare/" aria-label="YouTube" className="hover:text-lindo-yellow"><Youtube size={24} strokeWidth={2} /></a>
          </div>
          <p className="text-xs font-normal mb-3">Stay connected for the latest updates</p>
          <div className="space-y-1 text-xs font-normal">
            <div className="flex gap-4">
              <span>📞 <a href="tel:+250785064255" className="hover:underline">+250 785 064 255</a></span>
              <span>📧 <a href="mailto:hello@lindocare.com" className="hover:underline">hello@lindocare.com</a></span>
            </div>
            <div>📍 Unify Buildings, Behind T 2000 Hotel <br /> Kigali, Rwanda</div>
          </div>
        </div>
      </div>
      <div className="text-center text-xs text-gray-700 mt-8 font-normal">
        © 2025 Lindocare. All rights reserved.<br />
        <Link href="/terms-conditions" className="hover:underline">Privacy Policy</Link> | <Link href="/terms-conditions" className="hover:underline">Terms of Use</Link>
      </div>
    </footer>
  );
};

export default Footer; 