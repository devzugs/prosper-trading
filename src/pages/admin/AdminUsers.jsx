import React, { useEffect, useMemo, useState } from "react";
import { Search, Wallet, SlidersHorizontal, Loader2, X, TrendingUp } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import useCryptoData from "../../hooks/UseCryptoData";
import { calculateTotalROI, calculateTotalDaysActive } from "../../lib/roiCalculator";

const CURRENCIES = ["USD", "BTC", "ETH", "USDT"];

const AdjustBalanceModal = ({ user, onClose, onDone }) => {
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const parsed = Number(amount);
    if (!amount || Number.isNaN(parsed) || parsed === 0) {
      setError("Enter a non-zero amount. Use a negative number to deduct.");
      return;
    }
    if (!reason.trim()) {
      setError("A reason is required — it's recorded on the ledger for audit purposes.");
      return;
    }

    setSubmitting(true);
    const { error: rpcError } = await supabase.rpc("adjust_balance", {
      p_target_user_id: user.id,
      p_currency: currency,
      p_amount: parsed,
      p_reason: reason.trim(),
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
          <h2 className="text-lg font-bold text-heading">Adjust Balance</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-light">
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-text-light mb-1">{user.full_name || "—"}</p>
        <p className="text-xs text-text-muted mb-5">{user.email}</p>

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
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">
              Amount <span className="normal-case font-normal text-text-muted">(negative to deduct)</span>
            </label>
            <input
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 50 or -50"
              className="mt-1 w-full bg-surface-alt border border-border rounded-lg px-3 py-2 text-sm text-text-light placeholder:text-text-muted focus:outline-none focus:border-accent/50"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Why is this adjustment being made? This is recorded on the ledger."
              className="mt-1 w-full bg-surface-alt border border-border rounded-lg px-3 py-2 text-sm text-text-light placeholder:text-text-muted focus:outline-none focus:border-accent/50 resize-none"
            />
          </div>

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
              Apply Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};



export const handleUpdateUserPlan = async (userId, newPlan) => {
    
    const { data, error } = await supabase
        .from('profiles')
        .update({
            active_plan: newPlan,
            // Reset the start date so the ROI calculation starts fresh from today
            plan_start_date: new Date().toISOString() 
        })
        .eq('id', userId)
        .select();

    if (error) {
        console.error("Error updating user plan:", error.message);
        return { success: false, error: error.message };
    }

    return { success: true, data };
};



const UpdatePlanModal = ({ user, onClose, onDone }) => {
  const [plan, setPlan] = useState(user.active_plan || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // Fetch live crypto prices to calculate accurate USD deposit value
  const { coins } = useCryptoData("bitcoin,ethereum,tether,binancecoin,solana,usd-coin");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // 1. Fetch user's approved deposits to calculate their base deposit value
      const { data: deposits, error: depError } = await supabase
        .from("deposits")
        .select("amount, coin")
        .eq("user_id", user.id)
        .eq("status", "approved");

      if (depError) throw depError;

      // 2. Calculate the total USD base value of their deposits
      const getUsdValue = (amount, currencySymbol) => {
        const amt = Number(amount || 0);
        const sym = (currencySymbol || "USD").toLowerCase();
        if (sym === "usd" || sym === "usdt") return amt;
        
        const liveCoin = coins?.find(c => c.symbol.toLowerCase() === sym || c.id.toLowerCase() === sym);
        return liveCoin ? amt * liveCoin.current_price : amt;
      };

      const baseDepositValue = (deposits || []).reduce((sum, dep) => sum + getUsdValue(dep.amount, dep.coin), 0);

      // 3. Snapshot the current ROI and Days before resetting
      const currentPlan = user.active_plan;
      const currentStartDate = user.plan_start_date;
      const pastROI = user.accumulated_roi || 0;
      const pastDays = user.accumulated_days || 0;

      // Calculate what they've earned on the CURRENT plan + what they already had accumulated
      const newAccumulatedROI = calculateTotalROI(baseDepositValue, currentPlan, currentStartDate, pastROI);
      const newAccumulatedDays = calculateTotalDaysActive(currentStartDate, pastDays);

      // 4. Update the database with the new plan and the newly calculated historical snapshots
      const newPlanValue = plan === "" ? null : plan;
      const newDateValue = plan === "" ? null : new Date().toISOString();

      const { error: dbError } = await supabase
        .from("profiles")
        .update({
          active_plan: newPlanValue,
          plan_start_date: newDateValue,
          accumulated_roi: newAccumulatedROI,
          accumulated_days: newAccumulatedDays,
        })
        .eq("id", user.id);

      if (dbError) throw dbError;

      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface w-full max-w-md rounded-2xl border border-border shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-heading">Update Investment Plan</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-light my-transition">
            <X size={18} />
          </button>
        </div>
        
        <p className="text-sm text-text-light mb-1">{user.full_name || "Unknown User"}</p>
        <p className="text-xs text-text-muted mb-5">{user.email}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">Select Plan</label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="mt-1 w-full bg-surface-alt border border-border rounded-lg px-3 py-2 text-sm text-text-light focus:outline-none focus:border-accent/50"
            >
              <option value="">None (Inactive)</option>
              <option value="starter">Starter Plan (20%)</option>
              <option value="growth">Growth Plan (40%)</option>
              <option value="elite">Elite Plan (60%)</option>
              <option value="supreme">Supreme Plan (80%)</option>
            </select>
          </div>
          
          <div className="bg-surface-alt p-3 rounded-lg border border-border/50 space-y-1">
             <p className="text-xs text-text-light flex justify-between">
               <span>Current Accumulated ROI:</span>
               <span className="font-mono text-success">${Number(user.accumulated_roi || 0).toFixed(2)}</span>
             </p>
             <p className="text-xs text-text-light flex justify-between">
               <span>Current Days Active:</span>
               <span className="font-mono text-accent">{user.accumulated_days || 0}</span>
             </p>
          </div>

          <p className="text-xs text-text-muted">
            Updating the plan will snapshot their current ROI and active days into their historical total, then reset the <code className="text-accent">plan_start_date</code> to right now.
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
              Save Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [walletsByUser, setWalletsByUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalUser, setModalUser] = useState(null);
  const [planModalUser, setPlanModalUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    const [{ data: profiles, error: profilesError }, { data: wallets, error: walletsError }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, email, role, kyc_status, referral_code, created_at, active_plan, plan_start_date, accumulated_roi, accumulated_days")
        .order("created_at", { ascending: false }),
      supabase.from("wallets").select("user_id, currency, cached_balance"),
    ]);

    if (profilesError) console.error("Error fetching users:", profilesError.message);
    if (walletsError) console.error("Error fetching wallets:", walletsError.message);

    const grouped = {};
    (wallets || []).forEach((w) => {
      if (!grouped[w.user_id]) grouped[w.user_id] = [];
      grouped[w.user_id].push(w);
    });

    setUsers(profiles || []);
    setWalletsByUser(grouped);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        (u.full_name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.referral_code || "").toLowerCase().includes(q)
    );
  }, [users, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-heading">Users</h2>
          <p className="text-sm text-text-muted mt-1">{users.length} registered accounts</p>
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search name, email, referral code…"
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
                  <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">User</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Role / KYC</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Balances</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Joined</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-sm text-text-muted">
                      No users match your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr key={u.id} className="border-b border-border/50 last:border-0 hover:bg-surface my-transition">
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-heading">{u.full_name || "—"}</p>
                        <p className="text-xs text-text-muted">{u.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                          u.role === "admin" ? "bg-accent/10 text-accent" : "bg-surface text-text-muted"
                        }`}>
                          {u.role}
                        </span>
                        <p className="text-xs text-text-muted mt-1 capitalize">{u.kyc_status}</p>
                      </td>
                      <td className="px-5 py-4">
                        {(walletsByUser[u.id] || []).length === 0 ? (
                          <span className="text-xs text-text-muted flex items-center gap-1">
                            <Wallet size={12} /> No wallets
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {walletsByUser[u.id].map((w) => (
                              <span key={w.currency} className="text-xs bg-surface border border-border rounded-md px-2 py-0.5 tabular-nums">
                                {Number(w.cached_balance).toLocaleString("en-US", { maximumFractionDigits: 8 })} {w.currency}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-text-muted">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-right flex flex-col items-end gap-2">
                        <button
                          onClick={() => setModalUser(u)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent/80 my-transition"
                        >
                          <SlidersHorizontal size={13} />
                          Adjust Balance
                        </button>
                        <button
                          onClick={() => setPlanModalUser(u)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500 hover:text-emerald-400 my-transition"
                        >
                          <TrendingUp size={13} />
                          Update Plan
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

      {modalUser && (
        <AdjustBalanceModal
          user={modalUser}
          onClose={() => setModalUser(null)}
          onDone={() => {
            setModalUser(null);
            fetchUsers();
          }}
        />
      )}
      {planModalUser && (
        <UpdatePlanModal
          user={planModalUser}
          onClose={() => setPlanModalUser(null)}
          onDone={() => {
            setPlanModalUser(null);
            fetchUsers(); // Refresh the list
          }}
        />
      )}
    </div>
  );
};

export default AdminUsers;