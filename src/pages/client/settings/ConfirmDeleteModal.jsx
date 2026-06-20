import React, { useState } from "react";
import { X, TriangleAlert } from "lucide-react";

const ConfirmDeleteModal = ({ open, onClose, onConfirm }) => {
  const [confirmText, setConfirmText] = useState("");
  const canConfirm = confirmText.trim().toUpperCase() === "DELETE";

  if (!open) return null;

  const handleClose = () => {
    setConfirmText("");
    onClose?.();
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm?.();
    setConfirmText("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-surface shadow-2xl flex flex-col animate-pop-out">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-danger/10 p-2 text-danger">
              <TriangleAlert size={20} />
            </span>
            <h2 className="text-base font-semibold text-heading">Delete Account</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-2 text-text-light my-transition hover:bg-surface-alt hover:text-heading"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-text-light leading-relaxed">
            This will permanently close your account, cancel any active investment plans, and erase
            your data. This action cannot be undone.
          </p>

          <div>
            <label className="mb-1 block text-sm font-medium text-text-light">
              Type <span className="font-bold text-danger">DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full rounded-md border border-border bg-surface-alt px-4 py-2.5 text-sm text-text outline-none my-transition focus:border-danger placeholder:text-text-muted/50"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border/50 px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-text my-transition hover:bg-surface-alt hover:text-heading"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={handleConfirm}
            className="rounded-md bg-danger px-5 py-2.5 text-sm font-semibold text-white my-transition hover:bg-danger/90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;