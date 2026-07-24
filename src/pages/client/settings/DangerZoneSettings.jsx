import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PauseCircle, Trash2, LoaderCircle, AlertCircle } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../lib/supabaseClient";
import SettingsCard from "./SettingsCard";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

const DangerZoneSettings = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
  const [deactivated, setDeactivated] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  
  const [loadingDeactivate, setLoadingDeactivate] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [error, setError] = useState("");

  const handleDeactivate = async () => {
    setError("");
    
    const password = prompt("To deactivate your account, please confirm with your password:");
    if (!password) return;

    try {
      setLoadingDeactivate(true);
      
      const { error } = await supabase.functions.invoke('deactivate-account', {
        body: { password }
      });

      if (error) throw new Error(error.message || "Failed to deactivate account.");

      setDeactivated(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingDeactivate(false);
    }
  };

  const handleReactivate = async () => {
    try {
      setLoadingDeactivate(true);
      const { error } = await supabase.functions.invoke('reactivate-account', { method: 'POST' });

      if (error) throw error;
      setDeactivated(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingDeactivate(false);
    }
  };

  const handleDelete = async (password) => {
    setError("");
    try {
      setLoadingDelete(true);
      
      const { error } = await supabase.functions.invoke('delete-account', {
        method: 'DELETE',
        body: { password }
      });

      if (error) throw new Error(error.message || "Failed to delete account. Incorrect password?");

      setModalOpen(false);
      await signOut(); 
      navigate("/login", { replace: true });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger animate-in fade-in">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <SettingsCard
        danger
        icon={PauseCircle}
        title="Deactivate Account"
        description="Temporarily disable your account. You can reactivate anytime by logging back in."
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-sm leading-relaxed text-text-light">
            While deactivated, your portfolio data stays intact, but trading, deposits, and
            withdrawals will be paused.
          </p>
          <button
            onClick={deactivated ? handleReactivate : handleDeactivate}
            disabled={loadingDeactivate}
            className={`my-transition flex shrink-0 items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60
              ${
                deactivated
                  ? "border-success/40 bg-success/10 text-success hover:bg-success/15"
                  : "border-warning/40 bg-warning/10 text-warning hover:bg-warning/15"
              }`}
          >
            {loadingDeactivate && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {deactivated ? "Reactivate Account" : "Deactivate Account"}
          </button>
        </div>

        {deactivated && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 px-4 py-3">
            <PauseCircle size={14} className="mt-0.5 shrink-0 text-warning" />
            <p className="text-xs leading-relaxed text-text-light">
              Your account is currently deactivated. Trading operations are suspended.
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-sm leading-relaxed text-text-light">
            This action is irreversible. Your portfolio data, transaction history, and personal
            information will be permanently erased.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="my-transition shrink-0 rounded-xl border border-danger/40 bg-danger/10 px-5 py-2.5 text-sm font-semibold text-danger hover:bg-danger/15"
          >
            Delete Account
          </button>
        </div>
      </SettingsCard>

      <ConfirmDeleteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleDelete}
        loading={loadingDelete}
      />
    </div>
  );
};

export default DangerZoneSettings;