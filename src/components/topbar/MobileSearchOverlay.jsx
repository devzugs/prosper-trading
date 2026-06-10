import React from "react";
import { useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

// ── Mobile search overlay ─────────────────────────────────────────────────
const MobileSearchOverlay = ({ open, onClose }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md md:hidden">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
        <Search size={18} className="shrink-0 text-text-muted" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search transactions, plans…"
          className="flex-1 bg-transparent text-base text-white placeholder-text-muted outline-none"
        />
        <button
          onClick={onClose}
          className="shrink-0 rounded-lg p-1.5 text-text-light transition hover:bg-white/5 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 px-4 py-6 text-sm text-text-muted">
        Type to search…
      </div>
    </div>
  );
};

export default MobileSearchOverlay;