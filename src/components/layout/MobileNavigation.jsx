import React from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

export default function MobileNavigation({ isOpen, onClose }) {
  const navLinks = [
    "About Us",
    "Trading",
    "FAQ",
    "Contact Us",
  ];

  useEffect(() => {
    if(isOpen) {
        document.body.classList.add('overflow-hidden');
    }else {
        document.body.classList.remove('overflow-hidden');
    }
  }, [isOpen])

  

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

        {/* Drawer */}
        <nav
          className={`fixed top-0 right-0 z-50 h-screen w-[320px] max-w-[85vw] 
          border-l border-white/10
          bg-secondary
          shadow-2xl
          transition-all duration-300 ease-in-out
          lg:hidden
          ${
            isOpen 
              ? "translate-x-0 opacity-100 visible" 
              : "translate-x-full opacity-0 invisible"
          }`}
        >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h2 className="font-bold text-white">
              Prosper Trading
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Menu"
            className="
              rounded-lg
              p-2
              text-slate-400
              transition
              hover:bg-white/5
              hover:text-white
            "
          >
            <X size={22} />
          </button>
        </div>

        {/* Links */}
        <ul className="py-4">
          {navLinks.map((item) => (
            <li key={item}>
              <Link
                to={`/${item.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={onClose}
                className="
                  group
                  flex
                  items-center
                  justify-between
                  px-6
                  py-4
                  text-base
                  font-medium
                  text-slate-300
                  transition-all
                  hover:bg-white/5
                  hover:text-white
                "
              >
                {item}

                <span
                  className="
                    h-0.5
                    w-0
                    bg-primary
                    transition-all
                    duration-300
                    group-hover:w-6
                  "
                />
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA Area */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-secondary p-6">
          <div className="space-y-3">
            <button
              className="w-full rounded-xl border border-border px-5 py-3 text-sm font-medium text-text-light transition hover:border-accent hover:text-white"
            >
              Login
            </button>

            <button
              className="w-full rounded-xl bg-accent px-5 py-3 text-sm font-bold text-secondary shadow-lg shadow-accent/20 transition hover:bg-accent-light"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}