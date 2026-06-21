import React from "react";
import FAQSection from "../../components/sections/FaqSection";

const FaqPage = () => {
  return (
    <section className="min-h-screen bg-background py-16 px-6 lg:px-8">
      {/* ── Header Section with Fade Up Animation ── */}
      <div className="max-w-3xl mx-auto text-center mb-12 animate-[fade-up_0.8s_ease-out_forwards]">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-heading mb-4">
          Frequently Asked Questions
        </h1>
        <p className="font-body text-text-light text-base md:text-lg">
          Everything you need to know about deposits, withdrawals, trading plans, and securing your account.
        </p>
      </div>

      {/* ── FAQ Interactive Section ── */}
      <div className="max-w-3xl mx-auto bg-surface-alt rounded-xl shadow-lg border border-border p-6 md:p-8 animate-[fade-up_1s_ease-out_forwards]">
        <FAQSection />
      </div>
      
      {/* ── Support CTA ── */}
      <div className="max-w-3xl mx-auto mt-12 text-center animate-[fade-up_1.2s_ease-out_forwards]">
        <p className="text-text-muted text-sm">
          Still have questions?{" "}
          <a href="/support" className="text-accent hover:text-accent-light my-transition font-medium">
            Contact our support team
          </a>
        </p>
      </div>
    </section>
  );
};

export default FaqPage;