import React, { useState } from "react";
import { PauseCircle, Trash2 } from "lucide-react";
import SettingsCard from "./SettingsCard";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

const DangerZoneSettings = () => {
  const [deactivated, setDeactivated] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);

  return (
    <div className="space-y-6">
      <SettingsCard
        danger
        icon={PauseCircle}
        title="Deactivate Account"
        description="Temporarily disable your account. You can reactivate anytime by logging back in."
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-text-light leading-relaxed max-w-md">
            While deactivated, your portfolio data stays intact, but trading, deposits, and
            withdrawals will be paused.
          </p>
          <button
            onClick={() => setDeactivated((v) => !v)}
            className={`shrink-0 rounded-xl border px-5 py-2.5 text-sm font-semibold my-transition
              ${
                deactivated
                  ? "border-success/40 bg-success/10 text-success hover:bg-success/15"
                  : "border-warning/40 bg-warning/10 text-warning hover:bg-warning/15"
              }`}
          >
            {deactivated ? "Reactivate Account" : "Deactivate Account"}
          </button>
        </div>

        {deactivated && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 px-4 py-3">
            <PauseCircle size={14} className="text-warning shrink-0 mt-0.5" />
            <p className="text-xs text-text-light leading-relaxed">
              Your account is currently deactivated. Sign in again at any time to reactivate it.
            </p>
          </div>
        )}
      </SettingsCard>

      <SettingsCard
        danger
        icon={Trash2}
        title="Delete Account"
        description="Permanently delete your account and all associated data."
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-text-light leading-relaxed max-w-md">
            This action is irreversible. Your portfolio data, transaction history, and personal
            information will be permanently erased.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            disabled={deleted}
            className="shrink-0 rounded-xl border border-danger/40 bg-danger/10 px-5 py-2.5 text-sm font-semibold text-danger my-transition hover:bg-danger/15 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {deleted ? "Account Deleted" : "Delete Account"}
          </button>
        </div>
      </SettingsCard>

      <ConfirmDeleteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={() => {
          setDeleted(true);
          setModalOpen(false);
        }}
      />
    </div>
  );
};

export default DangerZoneSettings;