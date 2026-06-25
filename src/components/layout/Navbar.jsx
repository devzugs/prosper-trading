import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { PUBLIC_NAV } from "../../config/navigation";
import MobileNavigation from "./MobileNavigation";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#051427]/95 backdrop-blur-xl border-b border-white/5">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src="/prosper-logo.webp" alt="Prosper Trading" className="h-11 w-auto" />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold font-heading tracking-tight text-white">
                Prosper Trading
              </h1>
              <p className="text-xs font-body text-slate-400">
                Trade Smarter. Grow Faster.
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:block">
            <ul className="flex items-center gap-10">
              {PUBLIC_NAV.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="relative text-sm font-medium text-text-light transition hover:text-white after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-0 after:bg-accent after:transition-all hover:after:w-full"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <Link 
              to="/login"
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-text-light transition hover:border-accent hover:text-white">
              Login
            </Link>
            {/* Updated CTA */}
            <Link 
              to="/signup"
              className="rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-secondary shadow-lg shadow-accent/20 transition hover:bg-accent-light">
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden text-white hover:text-slate-300 transition p-2"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            <Menu size={28} />
          </button>
        </div>
      </header>
      <MobileNavigation isOpen={mobileMenuOpen} onClose={closeMobileMenu} links={PUBLIC_NAV} />
    </>
  );
}