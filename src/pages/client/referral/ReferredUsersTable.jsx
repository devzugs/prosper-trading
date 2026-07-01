import React from "react";
import { Users } from "lucide-react";

const fmt = (n) => `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// Missing Configuration injected here
const STATUS_META = {
  active:  { label: "Active",  className: "bg-success/10 text-success" },
  pending: { label: "Pending", className: "bg-warning/10 text-warning" },
  inactive:{ label: "Inactive",className: "bg-danger/10 text-danger" }
};

const ReferredUsersTable = ({ users = [] }) => {
  const isEmpty = users.length === 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl sm:text-2xl font-bold text-heading">Your Referrals</h2>
        {!isEmpty && (
          <p className="text-xs text-text-muted">
            {users.length} referral{users.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 bg-surface-alt rounded-xl border border-border border-dashed text-center">
          <div className="bg-accent/10 p-4 rounded-full mb-3">
            <Users size={24} className="text-accent/50" />
          </div>
          <p className="text-sm font-semibold text-heading mb-1">No referrals yet</p>
          <p className="text-xs text-text-muted max-w-[260px]">
            Share your referral link to start earning commissions on your friends' deposits.
          </p>
        </div>
      ) : (
        <div className="bg-surface-alt rounded-xl border border-border overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["Investor", "Plan", "Joined", "Deposited", "Commission", "Status"].map((h, i) => (
                    <th
                      key={h}
                      className={`px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wider ${
                        i === 0 ? "text-left" : "text-right"
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => {
                  // Fallback safely if status is missing
                  const statusCfg = STATUS_META[u.status] || STATUS_META.pending;
                  return (
                    <tr
                      key={u.id}
                      className={`border-b border-border/50 last:border-0 hover:bg-surface my-transition ${
                        i % 2 !== 0 ? "bg-secondary/20" : ""
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold shrink-0">
                            {u.initials}
                          </div>
                          <p className="text-sm font-semibold text-heading">{u.name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm text-text-light">{u.plan}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm text-text-light">{formatDate(u.joinedDate)}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm font-medium text-heading">{fmt(u.totalDeposited)}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm font-bold text-success">{fmt(u.commissionEarned)}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${statusCfg.className}`}>
                          {statusCfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards (Fixed _users bug) */}
          <div className="flex flex-col divide-y divide-border/50 md:hidden">
            {users.map((u) => {
              const statusCfg = STATUS_META[u.status] || STATUS_META.pending;
              return (
                <div key={u.id} className="flex items-center gap-4 p-4">
                  <div className="w-9 h-9 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold shrink-0">
                    {u.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-heading truncate">{u.name}</p>
                    <p className="text-xs text-text-muted">
                      {u.plan} · {formatDate(u.joinedDate)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-success">{fmt(u.commissionEarned)}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${statusCfg.className}`}>
                      {statusCfg.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferredUsersTable;