import React from "react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import NOTIFICATIONS from "../../data/notification";
import useClickOutside from "../../hooks/UseClickOutside";
import { CircleUserRound, Settings, LogOut } from "lucide-react";

// ── User menu dropdown ────────────────────────────────────────────────────
const UserMenu = ({ open, onClose }) => {
  const ref = useRef(null);
  useClickOutside(ref, onClose);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-white/10 bg-surface-alt shadow-xl z-50 overflow-hidden"
    >
      {/* Identity */}
      <div className="border-b border-white/5 px-4 py-3">
        <p className="text-sm font-semibold text-white">M. Anderson</p>
        <p className="text-xs text-text-muted mt-0.5">Growth Plan · Active</p>
      </div>

      <ul className="py-1">
        {[
          { label: "Profile", icon: CircleUserRound, to: "/settings" },
          { label: "Settings", icon: Settings, to: "/settings" },
        ].map(({ label, icon: Icon, to }) => (
          <li key={label}>
            <Link
              to={to}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-light transition hover:bg-white/5 hover:text-white"
            >
              <Icon size={15} className="text-text-muted" />
              {label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="border-t border-white/5 py-1">
        <button 
          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-danger transition hover:bg-danger/5">
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </div>
  );
};

export default UserMenu;