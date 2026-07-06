import React, { useEffect, useMemo, useState } from "react";
import { Gift, Loader2, X, Search } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const CURRENCIES = ["USD", "BTC", "ETH", "USDT"];

const STATUS_STYLES = {
  pending:  "bg-warning/15 text-warning",
  active:   "bg-success/10 text-success",
  inactive: "bg-surface text-text-muted",
};

const CreditReferralModal = ({ referral, onClose, onDone }) => {
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const parsed = Number(amount);
    if (!amount || Number.isNaN(parsed) || parsed <= 0) {
      setError("Enter a positive commission amount.");
      return;
    }

    setSubmitting(true);
    const { error: rpcError } = await supabase.rpc("credit_referral", {
      p_referral_id: referral.id,
      p_currency: currency,
      p_amount: parsed,
    });
    setSubmitting(false);

    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    onDone();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface w-full max-w-md rounded-2xl border border-border shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-heading">Credit Referral Commission</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-light">
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-text-light mb-1">
          Referrer: <span className="font-semibold">{referral.referrerProfile?.full_name || referral.referrerProfile?.email || "—"}</span>
        </p>
        <p className="text-xs text-text-muted mb-5">
          Referred: {referral.referredProfile?.full_name || referral.referredProfile?.email || "—"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="mt-1 w-full bg-surface-alt border border-border rounded-lg px-3 py-2 text-sm text-text-light focus:outline-none focus:border-accent/50"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">Commission Amount</label>
            <input
              type="number"
              step="any"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 25"
              className="mt-1 w-full bg-surface-alt border border-border rounded-lg px-3 py-2 text-sm text-text-light placeholder:text-text-muted focus:outline-none focus:border-accent/50"
            />
          </div>

          <p className="text-xs text-text-muted">
            This credits the referrer's wallet, logs a completed <code>referral_bonus</code> transaction,
            and marks the referral <code>active</code>.
          </p>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-border text-sm font-semibold text-text-light hover:border-accent/40 my-transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2 rounded-lg bg-accent text-secondary text-sm font-bold hover:bg-accent/90 my-transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Credit Commission
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminReferrals = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalReferral, setModalReferral] = useState(null);

  const fetchReferrals = async () => {
    setLoading(true);

    const { data: refs, error: refsError } = await supabase
      .from("referrals")
      .select("id, referrer_id, referred_id, status, commission_amount, created_at")
      .order("created_at", { ascending: false });

    if (refsError) {
      console.error("Error fetching referrals:", refsError.message);
      setLoading(false);
      return;
    }

    // referrals has two FKs into auth.users (referrer_id, referred_id) — rather
    // than rely on PostgREST to disambiguate an embed for both, just resolve
    // every profile referenced in one batched query and merge client-side.
    const ids = Array.from(new Set((refs || []).flatMap((r) => [r.referrer_id, r.referred_id])));
    const { data: profiles } = ids.length
      ? await supabase.from("profiles").select("id, full_name, email").in("id", ids)
      : { data: [] };

    const byId = Object.fromEntries((profiles || []).map((p) => [p.id, p]));

    setReferrals(
      (refs || []).map((r) => ({
        ...r,
        referrerProfile: byId[r.referrer_id],
        referredProfile: byId[r.referred_id],
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return referrals;
    const q = search.toLowerCase();
    return referrals.filter((r) =>
      [r.referrerProfile?.full_name, r.referrerProfile?.email, r.referredProfile?.full_name, r.referredProfile?.email]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q))
    );
  }, [referrals, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-heading">Referrals</h2>
          <p className="text-sm text-text-muted mt-1">{referrals.length} total referral relationships</p>
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search referrer or referred user…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-surface-alt border border-border rounded-lg pl-8 pr-4 py-2 text-sm text-text-light placeholder:text-text-muted focus:outline-none focus:border-accent/50 w-full sm:w-72"
          />
        </div>
      </div>

      <div className="bg-surface-alt rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-accent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Referrer</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Referred User</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Commission Earned</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Date</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-sm text-text-muted">
                      No referrals match your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id} className="border-b border-border/50 last:border-0 hover:bg-surface my-transition">
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-heading">{r.referrerProfile?.full_name || "—"}</p>
                        <p className="text-xs text-text-muted">{r.referrerProfile?.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-text-light">{r.referredProfile?.full_name || "—"}</p>
                        <p className="text-xs text-text-muted">{r.referredProfile?.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[r.status] || STATUS_STYLES.inactive}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right text-sm font-bold text-heading tabular-nums">
                        ${Number(r.commission_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-4 text-right text-sm text-text-muted">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setModalReferral(r)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent/80 my-transition"
                        >
                          <Gift size={13} />
                          Credit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalReferral && (
        <CreditReferralModal
          referral={modalReferral}
          onClose={() => setModalReferral(null)}
          onDone={() => {
            setModalReferral(null);
            fetchReferrals();
          }}
        />
      )}
    </div>
  );
};

export default AdminReferrals;