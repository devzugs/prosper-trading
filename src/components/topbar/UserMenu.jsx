import React, { useRef } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import useClickOutside from "../../hooks/UseClickOutside";
import { CircleUserRound, Settings, LogOut } from "lucide-react";
import UserIdentity from "../user/UserIdentity";
import { useAuth } from "../../context/AuthContext";

const UserMenu = ({ open, onClose }) => {
  const ref = useRef(null);
  useClickOutside(ref, onClose);
  
  const { signOut } = useAuth();
  const navigate = useNavigate(); 

  if (!open) return null;

  const handleSignOut = async () => {
    try {
      await signOut();
      onClose();
      navigate("/"); 
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-white/10 bg-surface-alt shadow-xl z-50 overflow-hidden"
    >
      {/* Identity */}
      <div className="border-b border-white/5 px-4 py-3">
        <p className="text-sm font-semibold text-white">
          <UserIdentity />
        </p>
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
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-danger transition hover:bg-danger/5"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </div>
  );
};

export default UserMenu;