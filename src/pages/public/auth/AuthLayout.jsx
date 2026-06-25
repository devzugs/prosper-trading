import {
  ShieldCheck,
  TrendingUp,
  Wallet,
  BarChart3,
} from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <main className="min-h-screen bg-background font-body">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Marketing Panel */}
        <section className="relative hidden overflow-hidden border-r border-border lg:flex">
          <div className="flex w-full flex-col justify-between bg-secondary p-12">
            <div>
              <div className="mb-10 flex items-center gap-3">
                <div className="rounded-xl bg-accent p-3">
                  <TrendingUp className="h-6 w-6 text-secondary" />
                </div>

                <div>
                  <h1 className="font-heading text-xl font-bold text-heading">
                    Prosper Trading
                  </h1>
                  <p className="text-sm text-text-light">
                    Premium Investment Platform
                  </p>
                </div>
              </div>

              <h2 className="max-w-lg font-heading text-5xl font-bold leading-tight text-heading">
                Grow Your Wealth With Confidence.
              </h2>

              <p className="mt-6 max-w-md text-lg text-text-light">
                Secure investment opportunities, transparent performance,
                and intelligent portfolio growth.
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-surface-alt p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-accent" />
                    <span className="text-sm text-text-light">
                      Average Returns
                    </span>
                  </div>

                  <p className="text-3xl font-bold text-heading">15%</p>
                </div>

                <div className="rounded-xl border border-border bg-surface-alt p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-accent" />
                    <span className="text-sm text-text-light">
                      Assets Managed
                    </span>
                  </div>

                  <p className="text-3xl font-bold text-heading">$25M+</p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface-alt p-6">
                <div className="mb-4 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-success" />
                  <span className="font-medium text-heading">
                    Security First
                  </span>
                </div>

                <p className="text-sm text-text-light">
                  Advanced account protection, KYC verification, and secure
                  transaction monitoring.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Form Panel */}
        <section className="flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md animate-pop-out">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}