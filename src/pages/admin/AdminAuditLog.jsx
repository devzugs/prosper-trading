import React, { useEffect, useMemo, useState } from "react";
import { ScrollText, Loader2, CheckCircle2, XCircle, SlidersHorizontal, Gift, Search } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const KIND_META = {
  deposit_review:     { label: "Deposit reviewed",     icon: CheckCircle2 },
  withdrawal_review:  { label: "Withdrawal reviewed",  icon: XCircle },
  adjustment:         { label: "Balance adjustment",   icon: SlidersHorizontal },
  referral_bonus:     { label: "Referral credited",    icon: Gift },
};

const AdminAuditLog = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const [
        { data: deps },
        { data: wits },
        { data: txs },
      ] = await Promise.all([
        supabase
          .from("deposits")
          .select("id, user_id, amount, coin, status, reviewed_by, reviewed_at")
          .not("reviewed_by", "is", null)
          .order("reviewed_at", { ascending: false })
          .limit(100),
        supabase
          .from("withdrawals")
          .select("id, user_id, amount, currency, status, reviewed_by, reviewed_at")
          .not("reviewed_by", "is", null)
          .order("reviewed_at", { ascending: false })
          .limit(100),
        supabase
          .from("transactions")
          .select("id, user_id, type, amount, currency, status, created_by, created_at, note")
          .not("created_by", "is", null)
          .in("type", ["adjustment", "referral_bonus"])
          .order("created_at", { ascending: false })
          .limit(100),
      ]);

      const unified = [
        ...(deps || []).map((d) => ({
          id: `deposit-${d.id}`,
          kind: "deposit_review",
          adminId: d.reviewed_by,
          targetUserId: d.user_id,
          timestamp: d.reviewed_at,
          detail: `${d.status === "approved" ? "Approved" : "Rejected"} ${Number(d.amount).toLocaleString()} ${d.coin} deposit`,
          status: d.status,
        })),
        ...(wits || []).map((w) => ({
          id: `withdrawal-${w.id}`,
          kind: "withdrawal_review",
          adminId: w.reviewed_by,
          targetUserId: w.user_id,
          timestamp: w.reviewed_at,
          detail: `${w.status === "approved" ? "Approved" : "Rejected"} ${Number(w.amount).toLocaleString()} ${w.currency} withdrawal`,
          status: w.status,
        })),
        ...(txs || []).map((t) => ({
          id: `tx-${t.id}`,
          kind: t.type,
          adminId: t.created_by,
          targetUserId: t.user_id,
          timestamp: t.created_at,
          detail:
            t.type === "adjustment"
              ? `${Number(t.amount) >= 0 ? "Credited" : "Debited"} ${Math.abs(Number(t.amount)).toLocaleString()} ${t.currency}${t.note ? ` — "${t.note}"` : ""}`
              : `Credited ${Number(t.amount).toLocaleString()} ${t.currency} referral bonus`,
          status: t.status,
        })),
      ];

      const userIds = Array.from(new Set(unified.flatMap((e) => [e.adminId, e.targetUserId]).filter(Boolean)));
      const { data: profiles } = userIds.length
        ? await supabase.from("profiles").select("id, full_name, email").in("id", userIds)
        : { data: [] };
      const byId = Object.fromEntries((profiles || []).map((p) => [p.id, p]));

      const withNames = unified
        .map((e) => ({
          ...e,
          adminName: byId[e.adminId]?.full_name || byId[e.adminId]?.email || "Unknown admin",
          targetName: byId[e.targetUserId]?.full_name || byId[e.targetUserId]?.email || "Unknown user",
        }))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setEntries(withNames);
      setLoading(false);
    };

    load();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return entries;
    const q = search.toLowerCase();
    return entries.filter(
      (e) =>
        e.adminName.toLowerCase().includes(q) ||
        e.targetName.toLowerCase().includes(q) ||
        e.detail.toLowerCase().includes(q)
    );
  }, [entries, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-heading">Audit Log</h2>
          <p className="text-sm text-text-muted mt-1">
            Every admin-attributed action: deposit/withdrawal reviews, balance adjustments, referral credits.
          </p>
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search admin or user…"
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
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <ScrollText size={28} className="text-accent/40" />
            <p className="text-sm text-text-muted">No audit events{search ? " match your search" : " yet"}.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filtered.map((e) => {
              const meta = KIND_META[e.kind] || KIND_META.adjustment;
              const Icon = meta.icon;
              return (
                <div key={e.id} className="flex items-start gap-3 px-5 py-4">
                  <span className="bg-accent/10 p-2 rounded-lg shrink-0 mt-0.5">
                    <Icon size={14} className="text-accent" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-light">
                      <span className="font-semibold text-heading">{e.adminName}</span> — {meta.label.toLowerCase()} for{" "}
                      <span className="font-medium">{e.targetName}</span>
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">{e.detail}</p>
                  </div>
                  <span className="text-xs text-text-muted shrink-0 whitespace-nowrap">
                    {e.timestamp ? new Date(e.timestamp).toLocaleString() : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAuditLog;