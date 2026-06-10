import { ShieldCheck } from "lucide-react";

const SecuritySection = () => {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left Side */}
          <div>
            <div className="inline-flex items-center gap-2 text-accent mb-4">
              <ShieldCheck size={18} />
              <span className="font-medium">
                Institutional-Grade Security
              </span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
              Your capital deserves
              <span className="text-accent"> enterprise-level protection.</span>
            </h2>

            <p className="text-text-light mt-6 text-lg leading-relaxed">
              Security is integrated into every layer of our investment
              infrastructure. From account protection to portfolio management,
              we maintain strict operational standards designed to safeguard
              client assets and sensitive information.
            </p>
          </div>

          {/* Right Side */}
          <div className="space-y-8">
            <div className="border-l-2 border-accent pl-6">
              <h3 className="text-xl font-semibold text-white">
                Advanced Encryption
              </h3>
              <p className="text-text-light mt-2">
                Industry-standard encryption secures account data and platform
                communications.
              </p>
            </div>

            <div className="border-l-2 border-accent pl-6">
              <h3 className="text-xl font-semibold text-white">
                Multi-Factor Authentication
              </h3>
              <p className="text-text-light mt-2">
                Additional verification layers help protect investor accounts
                against unauthorized access.
              </p>
            </div>

            <div className="border-l-2 border-accent pl-6">
              <h3 className="text-xl font-semibold text-white">
                Continuous Monitoring
              </h3>
              <p className="text-text-light mt-2">
                Round-the-clock monitoring and proactive threat detection help
                maintain platform integrity.
              </p>
            </div>

            <div className="border-l-2 border-accent pl-6">
              <h3 className="text-xl font-semibold text-white">
                Risk Controls
              </h3>
              <p className="text-text-light mt-2">
                Disciplined portfolio oversight and risk management frameworks
                support long-term capital preservation.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default SecuritySection;