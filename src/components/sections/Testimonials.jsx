import React from "react";
import { Quote } from "lucide-react";

const Testimonials = () => {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">

        {/* Section Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mt-4">
            Trusted by Investors Worldwide
          </h2>

          <p className="text-text-light mt-4 max-w-2xl mx-auto">
            Our commitment to disciplined investment strategies and risk
            management has helped clients build confidence in their financial
            future.
          </p>
        </div>

        {/* Featured Testimonial */}
        <div className="relative border border-white/10 rounded-3xl p-10 lg:p-14 bg-white/2 backdrop-blur-sm">

          <Quote
            size={48}
            className="absolute top-8 left-8 text-accent/30"
          />

          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xl lg:text-2xl leading-relaxed text-white font-medium">
              "The transparency, professionalism, and disciplined investment
              approach have exceeded my expectations. The team consistently
              communicates portfolio performance and market insights with
              clarity and precision."
            </p>

            <div className="mt-10">
              <h4 className="font-semibold text-lg">
                Michael Anderson
              </h4>

              <p className="text-text-light">
                Private Investor • New York
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-8 mt-12 pt-12 border-t border-white/10">
            <div className="text-center">
                <h3 className="text-3xl font-bold text-accent">4.9/5</h3>
                <p className="text-text-light mt-2">Client Rating</p>
            </div>

            <div className="text-center">
                <h3 className="text-3xl font-bold text-accent">5k+</h3>
                <p className="text-text-light mt-2">Investors Served</p>
            </div>

            <div className="text-center">
                <h3 className="text-3xl font-bold text-accent">98%</h3>
                <p className="text-text-light mt-2">Retention Rate</p>
            </div>
        </div>

        {/* Supporting Testimonials */}
        <div className="grid md:grid-cols-2 gap-8 mt-10">

          <div className="border-l-2 border-accent pl-6">
            <p className="text-text leading-relaxed">
              "Their risk management framework and market expertise provided
              the confidence I needed to diversify into digital assets."
            </p>

            <div className="mt-5">
              <h4 className="font-semibold">
                Sarah Mitchell
              </h4>

              <p className="text-text-light text-sm">
                Entrepreneur
              </p>
            </div>
          </div>

          <div className="border-l-2 border-accent pl-6">
            <p className="text-text leading-relaxed">
              "What stands out most is the consistent communication and
              data-driven investment process. Everything feels structured and
              transparent."
            </p>

            <div className="mt-5">
              <h4 className="font-semibold">
                David Chen
              </h4>

              <p className="text-text-light text-sm">
                Portfolio Client
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default Testimonials;