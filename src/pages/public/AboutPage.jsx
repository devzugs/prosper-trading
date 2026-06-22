import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Users, ShieldCheck, Lock } from 'lucide-react';

const AboutPage = () => {
  return (
    <section className="min-h-screen bg-background py-16 px-6 lg:px-8">
      {/* ── Header Section with Fade Up Animation ── */}
      <div className="max-w-3xl mx-auto text-center mb-12 animate-[fade-up_0.8s_ease-out_forwards]">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-heading mb-4">
          About Prosper Trading
        </h1>
        <p className="font-body text-text-light text-base md:text-lg">
          Combining quantitative research, robust risk management, and institutional security to navigate digital assets with confidence.
        </p>
      </div>

      {/* ── Main Content Card (FAQ Style) ── */}
      <div className="max-w-4xl mx-auto bg-surface-alt rounded-xl shadow-lg border border-border p-8 md:p-12 animate-[fade-up_1s_ease-out_forwards] space-y-16">
        
        {/* Our Story / Introduction */}
        <div>
          <span className="text-accent font-semibold uppercase tracking-wider text-sm mb-2 block">
            Who We Are
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-5">
            Built for the next generation of investors
          </h2>
          <div className="text-text-light leading-relaxed space-y-5 text-[16px]">
            <p>
              Prosper Trading is a UK-registered investment firm (Company No. 14892021) established to bridge traditional financial discipline with the unparalleled growth opportunities of the digital asset space.
            </p>
            <p>
              We recognized early on that the cryptocurrency market required a shift from speculative trading to structured, institutional-grade asset management. Today, our team combines decades of market expertise, quantitative algorithmic research, and uncompromising AML/KYC compliance to provide a secure environment for our clients' capital.
            </p>
          </div>
        </div>

        <hr className="border-white/5" />

        {/* Core Principles */}
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-white mb-8">Our Core Principles</h3>
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Principle 1 */}
            <div className="flex gap-5">
              <div className="shrink-0">
                <div className="w-12 h-12 rounded-xl bg-surface border border-white/5 flex items-center justify-center">
                  <Target className="text-accent" size={24} />
                </div>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2 text-lg">Data-Driven Precision</h4>
                <p className="text-text-light text-sm leading-relaxed">
                  Every strategy is backed by fundamental research and algorithmic models. We rely on market data, not emotion, to capture sustainable alpha.
                </p>
              </div>
            </div>

            {/* Principle 2 */}
            <div className="flex gap-5">
              <div className="shrink-0">
                <div className="w-12 h-12 rounded-xl bg-surface border border-white/5 flex items-center justify-center">
                  <Lock className="text-accent" size={24} />
                </div>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2 text-lg">Risk-First Approach</h4>
                <p className="text-text-light text-sm leading-relaxed">
                  Capital preservation remains central to our philosophy. We deploy advanced risk modeling and active diversification to protect client portfolios.
                </p>
              </div>
            </div>

            {/* Principle 3 */}
            <div className="flex gap-5">
              <div className="shrink-0">
                <div className="w-12 h-12 rounded-xl bg-surface border border-white/5 flex items-center justify-center">
                  <ShieldCheck className="text-accent" size={24} />
                </div>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2 text-lg">Institutional Security</h4>
                <p className="text-text-light text-sm leading-relaxed">
                  From enterprise-grade encryption to continuous monitoring and strict GDPR compliance, your assets and personal data are rigorously protected.
                </p>
              </div>
            </div>

            {/* Principle 4 */}
            <div className="flex gap-5">
              <div className="shrink-0">
                <div className="w-12 h-12 rounded-xl bg-surface border border-white/5 flex items-center justify-center">
                  <Users className="text-accent" size={24} />
                </div>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2 text-lg">Absolute Transparency</h4>
                <p className="text-text-light text-sm leading-relaxed">
                  We believe in clear reporting and consistent communication, ensuring you have complete visibility into your investments at all times.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ── CTA Section ── */}
      <div className="max-w-3xl mx-auto mt-16 text-center animate-[fade-up_1.2s_ease-out_forwards]">
        <h3 className="text-2xl font-bold text-white mb-6">
          Ready to build your digital asset portfolio?
        </h3>
        <Link
          to="/dashboard"
          className="inline-flex items-center rounded-xl bg-accent px-8 py-3.5 font-body text-base font-bold text-secondary shadow-lg shadow-accent/20 transition hover:bg-accent-light"
        >
          Start Investing Now
        </Link>
      </div>
    </section>
  );
};

export default AboutPage;