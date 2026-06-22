import React from 'react';
import { Mail, MapPin, Clock } from 'lucide-react';

const ContactPage = () => {
  const contactDetails = [
    {
      title: "Email Support",
      content: "support@prospertrading.com",
      subtext: "",
      icon: Mail,
      href: "mailto:support@prospertrading.com"
    }, 
    {
      title: "UK Headquarters",
      content: "London, United Kingdom",
      subtext: "Company No. 14892021",
      icon: MapPin,
    },
    {
      title: "Market Coverage",
      content: "24/7 Digital Asset Monitoring",
      subtext: "Support: Mon-Fri, 9:00 AM - 6:00 PM (GMT)",
      icon: Clock,
    }
  ]; 

  return (
    <section className="min-h-screen bg-background py-16 px-6 lg:px-8">
      {/* ── Header Section with Fade Up Animation ── */}
      <div className="max-w-3xl mx-auto text-center mb-12 animate-[fade-up_0.8s_ease-out_forwards]">
        <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-heading mb-4">
          Contact Our Team
        </h1>
        <p className="font-body text-text-light text-base md:text-lg">
          Whether you are a prospective investor or an existing client, our support team is available to assist you with your digital asset portfolio.
        </p>
      </div>

      {/* ── Main Content Card ── */}
      {/* Increased max-width for larger screens (max-w-5xl, xl:max-w-6xl) */}
      <div className="w-full max-w-5xl xl:max-w-6xl mx-auto bg-surface-alt rounded-xl shadow-lg border border-border p-8 md:p-12 lg:p-16 animate-[fade-up_1s_ease-out_forwards]">
        
        <div className="flex flex-col items-center text-center">
          
          {/* Header Info */}
          <div className="max-w-2xl mb-12 lg:mb-16">
            <span className="text-accent font-semibold uppercase tracking-wider text-sm lg:text-base mb-2 block">
              Get in Touch
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
              We're here to help
            </h2>
            <p className="text-text-light leading-relaxed text-[16px] lg:text-lg">
              Prosper Trading operates with strict institutional standards. Reach out to our dedicated support and account management teams for swift, secure assistance.
            </p>
          </div>

          {/* Contact Details Grid */}
          {/* Made w-full and added progressive responsive columns (1 -> 2 -> 3) */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 text-left">
            {contactDetails.map((detail, index) => {
              const Icon = detail.icon;

              return (
                <div 
                  key={index} 
                  className="group rounded-2xl border border-white/5 bg-surface/40 p-6 lg:p-8 hover:bg-surface/60 transition h-full"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-surface border border-white/10 flex items-center justify-center shrink-0 group-hover:border-accent/40 transition">
                      <Icon className="text-accent lg:w-6 lg:h-6" size={22} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold text-lg lg:text-xl mb-1">
                        {detail.title}
                      </h4>
                      
                      {/* Render as link if href exists, otherwise render as text */}
                      {detail.href ? (
                        <a
                          href={detail.href}
                          className="text-text-light hover:text-accent transition text-sm lg:text-base break-words block"
                        >
                          {detail.content}
                        </a>
                      ) : (
                        <p className="text-text-light text-sm lg:text-base break-words">
                          {detail.content}
                        </p>
                      )}

                      {/* Render subtext if it exists */}
                      {detail.subtext && (
                        <p className="text-text-light/70 text-xs lg:text-sm mt-2">
                          {detail.subtext}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>  

        </div>
      </div>

      {/* ── FAQ CTA Section ── */}
      <div className="max-w-3xl mx-auto mt-16 text-center animate-[fade-up_1.2s_ease-out_forwards]">
        <p className="text-text-muted text-sm md:text-base lg:text-lg">
          Looking for immediate answers?{" "}
          <a href="/faq" className="text-accent hover:text-accent-light transition font-medium">
            Check our Frequently Asked Questions
          </a>
        </p>
      </div>
    </section>
  );
};

export default ContactPage;