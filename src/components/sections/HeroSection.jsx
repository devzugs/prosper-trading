import React from "react";
import { Link } from "react-router-dom";





export default function HeroSection () {
    return (
        <>
            <section className="flex min-h-[80vh] items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
                    
                    <h1 className="animate-pop-out mb-6 font-heading text-4xl font-bold sm:text-5xl lg:text-6xl">
                    Professional Digital Asset Management
                    </h1>
                    
                    <p className="animate-pop-out [animation-delay:150ms] opacity-0 mb-10 max-w-2xl font-body text-lg sm:text-xl">
                    Prosper Trading is a UK-registered investment firm providing institutional-grade digital asset 
                    management services to qualified investors worldwide.
                    </p>
                    
                    <div className="animate-pop-out [animation-delay:300ms] opacity-0 mb-12 flex flex-wrap justify-center gap-4">
                    <Link 
                        to="/Dashboard"
                        className="rounded-xl bg-accent px-8 py-3.5 font-body text-base font-bold text-secondary shadow-lg shadow-accent/20 transition hover:bg-accent-light"
                    >
                        Start Investing
                    </Link> 
                    <Link 
                        to="/"
                        className="rounded-xl border border-border px-8 py-3.5 font-body text-base font-medium text-text-light transition hover:border-accent hover:text-white"
                    >
                        Learn More
                    </Link>
                    </div>
                    
                    <div className="animate-pop-out [animation-delay:450ms] opacity-0 flex flex-wrap justify-center gap-3">
                    <span className="rounded bg-surface px-3 py-1.5 text-sm font-medium border border-white/5">GDPR Compliant</span>
                    <span className="rounded bg-surface px-3 py-1.5 text-sm font-medium border border-white/5">AML/KYC Certified</span>
                    <span className="rounded bg-surface px-3 py-1.5 text-sm font-medium border border-white/5">UK Company No. 14892021</span>
                    </div>
                </div>
            </section>
            
        </>

    )
}