import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Settings } from "lucide-react";
import { APP_SIDEBAR_NAV } from "../../config/navigation";
import NavItem from "./NavItem";
import UserFooter from "./UserFooter";


const Sidebar = () => {
  return (
    <aside className="flex h-screen w-75 shrink-0 flex-col border-r border-white/5 bg-surface-alt md:bg-background font-body">

      {/* Logo */}
      <div className="border-b border-white/5 px-5 py-5">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/prosper-logo.webp"
            alt="Prosper Trading"
            className="h-9 w-auto"
          />
          <div>
            <p className="text-sm font-bold font-heading tracking-tight text-white leading-tight">
              Prosper Trading
            </p>
            <p className="text-[11px] font-body text-text-muted leading-tight mt-0.5">
              Trade Smarter. Grow Faster.
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {APP_SIDEBAR_NAV.map(({ section, items }) => (
          <div key={section}>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              {section}
            </p>
            <ul className="space-y-1">
              {items.map((item) => (
                <NavItem key={item.to} item={item} />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <UserFooter />

    </aside>
  );
};

export default Sidebar;