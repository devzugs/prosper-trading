// Wraps client pages with Sidebar + DashboardTopBar
// Manages mobile sidebar open/close state at the layout level
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";
import DashboardTopBar from "../components/layout/DashboardTopBar";

// Derive a readable page title from the current pathname
const getPageTitle = (pathname) => {
  const segment = pathname.split("/").filter(Boolean).pop() ?? "overview";
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const ClientLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-background font-body">

      {/* ── Mobile overlay ─────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ────────────────────────────────────────── */}
      {/*
        Desktop: always visible, static in the flex row.
        Mobile:  fixed drawer, slides in from the left.
      */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 lg:static lg:z-auto lg:translate-x-0
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* ── Main column ────────────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">

        <DashboardTopBar
          title={title}
          onOpenMobileMenu={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default ClientLayout;