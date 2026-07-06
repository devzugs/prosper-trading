import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, ClipboardList, Users, Gift, ScrollText } from "lucide-react";

const TABS = [
  { to: "/admin",            label: "Overview",   icon: LayoutDashboard, end: true },
  { to: "/admin/approvals",  label: "Approvals",  icon: ClipboardList },
  { to: "/admin/users",      label: "Users",      icon: Users },
  { to: "/admin/referrals",  label: "Referrals",  icon: Gift },
  { to: "/admin/audit-log",  label: "Audit Log",  icon: ScrollText },
];

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-background font-body">
      <div className="border-b border-border bg-surface-alt">
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-heading">Admin Command Center</h1>
          <p className="text-sm text-text-muted mt-1 mb-4">
            Manage approvals, users, referrals, and platform activity.
          </p>

          <nav className="flex gap-1 overflow-x-auto -mb-px">
            {TABS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 whitespace-nowrap my-transition ${
                    isActive
                      ? "border-accent text-accent"
                      : "border-transparent text-text-muted hover:text-text-light hover:border-border"
                  }`
                }
              >
                <Icon size={15} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;