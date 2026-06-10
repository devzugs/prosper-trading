import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative border border-white/10 rounded-3xl p-10 lg:p-16 bg-primary overflow-hidden text-center">
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            <h2 className="animate-pop-out text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-white mb-6">
              Ready to Build Your Digital Asset Portfolio?
            </h2>
            <p className="animate-pop-out [animation-delay:150ms] text-blue-100 text-lg mb-10 leading-relaxed">
              Join qualified investors worldwide who trust Prosper Trading for institutional-grade digital asset management.
            </p>
            <div className="animate-pop-out [animation-delay:300ms]">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-3.5 font-body text-base font-bold text-secondary shadow-lg shadow-accent/20 transition hover:bg-accent-light"
              >
                Start Investing Now <ArrowRight size={20} />
              </Link>
              
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;