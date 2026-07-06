import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  UploadCloud,
  DollarSign,
  Wallet,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const StatCard = ({ label, value, icon: Icon, hint }) => (
  <div className="bg-surface-alt rounded-xl border border-border p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="bg-accent/10 p-1.5 rounded-md">
        <Icon size={16} className="text-accent" />
      </span>
    </div>
    <p className="text-2xl font-bold text-heading">{value}</p>
    {hint && <p className="text-xs text-text-muted mt-1">{hint}</p>}
  </div>
);

const AdminOverview = () => {
  const [loading, setLoading] = useState(true);
  const [pendingDeposits, setPendingDeposits] = useState(0);
  const [pendingWithdrawals, setPendingWithdrawals] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [balancesByCurrency, setBalancesByCurrency] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const [
        { count: depCount },
        { count: witCount },
        { count: userCount },
        { data: wallets },
        { data: recents },
      ] = await Promise.all([
        supabase.from("deposits").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("withdrawals").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("wallets").select("currency, cached_balance"),
        supabase
          .from("profiles")
          .select("id, full_name, email, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      setPendingDeposits(depCount || 0);
      setPendingWithdrawals(witCount || 0);
      setTotalUsers(userCount || 0);
      setRecentUsers(recents || []);

      // Platform balance has to be grouped by currency — summing BTC + USD + USDT
      // together as one number would be meaningless (same mistake as the old
      // withdrawal-form bug). No aggregate RPC exists yet, so reduce client-side.
      const totals = (wallets || []).reduce((acc, w) => {
        acc[w.currency] = (acc[w.currency] || 0) + Number(w.cached_balance);
        return acc;
      }, {});
      setBalancesByCurrency(
        Object.entries(totals).sort((a, b) => b[1] - a[1])
      );

      setLoading(false);
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-accent w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/admin/approvals">
          <StatCard label="Pending Deposits" value={pendingDeposits} icon={UploadCloud} hint="Awaiting review" />
        </Link>
        <Link to="/admin/approvals">
          <StatCard label="Pending Withdrawals" value={pendingWithdrawals} icon={DollarSign} hint="Awaiting review" />
        </Link>
        <Link to="/admin/users">
          <StatCard label="Total Users" value={totalUsers} icon={Users} hint="Registered accounts" />
        </Link>
        <StatCard
          label="Currencies Held"
          value={balancesByCurrency.length}
          icon={Wallet}
          hint="Across all wallets"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Platform balance by currency ── */}
        <div className="bg-surface-alt rounded-xl border border-border overflow-hidden">
          <div className="border-b border-border p-4">
            <h2 className="font-bold text-heading">Total Platform Balance</h2>
            <p className="text-xs text-text-muted mt-0.5">Sum of every user's cached wallet balance, by currency.</p>
          </div>
          <div className="divide-y divide-border/50">
            {balancesByCurrency.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-8">No wallet balances yet.</p>
            ) : (
              balancesByCurrency.map(([currency, total]) => (
                <div key={currency} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm font-semibold text-heading uppercase">{currency}</span>
                  <span className="text-sm font-bold text-text-light tabular-nums">
                    {total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Recent signups ── */}
        <div className="bg-surface-alt rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between border-b border-border p-4">
            <div>
              <h2 className="font-bold text-heading">Recent Signups</h2>
              <p className="text-xs text-text-muted mt-0.5">Last 5 registered accounts.</p>
            </div>
            <Link to="/admin/users" className="text-xs text-accent hover:text-accent/80 font-medium flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-border/50">
            {recentUsers.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-8">No users yet.</p>
            ) : (
              recentUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-heading truncate">{u.full_name || "—"}</p>
                    <p className="text-xs text-text-muted truncate">{u.email}</p>
                  </div>
                  <span className="text-xs text-text-muted shrink-0 ml-3">
                    {new Date(u.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;