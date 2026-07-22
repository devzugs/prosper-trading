import React, { useState, useEffect } from "react";
import { AlertTriangle, LoaderCircle, X } from "lucide-react";

export default function ConfirmDeleteModal({ open, onClose, onConfirm, loading }) {
  const [password, setPassword] = useState("");

  // Reset input when modal toggles
  useEffect(() => {
    if (!open) setPassword("");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface-alt p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        
        <button 
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 text-text-muted transition-colors hover:text-text disabled:opacity-50"
        >
          <X size={20} />
        </button>

        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-danger/10">
            <AlertTriangle className="h-7 w-7 text-danger" />
          </div>
          <h3 className="font-heading text-xl font-bold text-heading">Delete Account</h3>
          <p className="mt-2 text-sm leading-relaxed text-text-light">
            This action cannot be undone. All your portfolio data, transaction history, and API keys will be permanently deleted.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text">
              Confirm with your password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="Enter your current password"
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none transition-colors focus:border-danger disabled:opacity-60"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl border border-border bg-transparent py-3 text-sm font-semibold text-text transition-colors hover:bg-surface disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(password)}
              disabled={loading || !password}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-danger py-3 text-sm font-semibold text-white transition-colors hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
              {loading ? "Deleting..." : "Permanently Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}