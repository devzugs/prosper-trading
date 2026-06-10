import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-background pt-16 pb-8 font-body">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Info */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-heading font-bold text-white mb-4">
              Prosper Trading
            </h3>
            <p className="text-text-light text-sm leading-relaxed mb-6">
              A UK-registered investment firm providing institutional-grade digital asset management services to qualified investors worldwide.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm text-text-light">
              <li>
                <Link to="/" className="hover:text-accent transition">Investment Plans</Link>
              </li>
              <li>
                <Link to="/" className="hover:text-accent transition">Our Philosophy</Link>
              </li>
              <li>
                <Link to="/" className="hover:text-accent transition">Security Measures</Link>
              </li>
              <li>
                <Link to="/" className="hover:text-accent transition">Track Record</Link>
              </li>
            </ul>
          </div>

          {/* Compliance */}
          <div>
            <h4 className="text-white font-semibold mb-6">Compliance</h4>
            <ul className="space-y-3 text-sm text-text-light">
              <li>GDPR Compliant</li>
              <li>AML/KYC Certified</li>
              <li>UK Company No. 14892021</li>
              <li>
                <Link to="/" className="hover:text-accent transition">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/" className="hover:text-accent transition">Terms of Service</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-6">Contact Us</h4>
            <ul className="space-y-3 text-sm text-text-light">
              <li>London, United Kingdom</li>
              <li>investors@prospertrading.com</li>
              <li>+44 20 7123 4567</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 text-center  text-xs text-text-muted">
          <p>&copy; {new Date().getFullYear()} Prosper Trading. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;