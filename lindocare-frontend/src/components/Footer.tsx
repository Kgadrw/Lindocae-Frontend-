import React from 'react';
import { Instagram, Facebook, Youtube } from 'lucide-react';

const Footer = () => (
  <footer className="hidden md:block bg-white py-8 px-4 text-gray-700 border-t border-gray-300">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
      <div>
        <h3 className="font-bold mb-2">Customer Service</h3>
        <ul className="space-y-1 text-sm font-normal">
          <li><a href="#" className="hover:underline">Contact Us</a></li>
          <li><a href="#" className="hover:underline">Shipping Info</a></li>
          <li><a href="#" className="hover:underline">Returns & Exchanges</a></li>
          <li><a href="#" className="hover:underline">FAQs</a></li>
        </ul>
      </div>
      <div>
        <h3 className="font-bold mb-2">Shop</h3>
        <ul className="space-y-1 text-sm font-normal">
          <li><a href="#" className="hover:underline">Strollers</a></li>
          <li><a href="#" className="hover:underline">Nursery</a></li>
          <li><a href="#" className="hover:underline">Maternity</a></li>
          <li><a href="#" className="hover:underline">Gift Cards</a></li>
        </ul>
      </div>
      <div>
        <h3 className="font-bold mb-2">Company</h3>
        <ul className="space-y-1 text-sm font-normal">
          <li><a href="#" className="hover:underline">About Us</a></li>
          <li><a href="#" className="hover:underline">Careers</a></li>
          <li><a href="#" className="hover:underline">Sustainability</a></li>
          <li><a href="#" className="hover:underline">Press</a></li>
        </ul>
      </div>
      <div>
        <h3 className="font-bold mb-2">Follow Us</h3>
        <div className="flex gap-3 mb-2">
          <a href="#" aria-label="Instagram" className="hover:text-lindo-yellow"><Instagram size={24} strokeWidth={2} /></a>
          <a href="#" aria-label="Facebook" className="hover:text-lindo-yellow"><Facebook size={24} strokeWidth={2} /></a>
          <a href="#" aria-label="YouTube" className="hover:text-lindo-yellow"><Youtube size={24} strokeWidth={2} /></a>
        </div>
        <p className="text-xs font-normal">Stay connected for the latest updates</p>
      </div>
    </div>
    <div className="text-center text-xs text-gray-700 mt-8 font-normal">
      © 2025 Lindocare. All rights reserved.<br />
      <a href="#" className="hover:underline">Privacy Policy</a> | <a href="#" className="hover:underline">Terms of Use</a>
    </div>
  </footer>
);

export default Footer; 