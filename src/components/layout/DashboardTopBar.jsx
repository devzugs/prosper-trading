import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  Bell,
  Search,
  Plus,
  ChevronDown,
  Clock3,
  ShieldCheck,
} from "lucide-react";

import NOTIFICATIONS from "../../data/notification";
import MobileSearchOverlay from "../topbar/MobileSearchOverlay";
import NotificationPanel from "../topbar/NotificationPanel";
import UserMenu from "../topbar/UserMenu";

const DashboardTopBar = ({
  title = "Overview",
  onOpenMobileMenu,
  user = {
    name: "Michael Anderson",
    verified: true,
  },
}) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [time, setTime] = useState(new Date());

  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <>
      <MobileSearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      <header className="sticky top-0 z-40 border-b border-white/5 bg-background/95 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">

          {/* LEFT */}
          <div className="flex items-center gap-4 min-w-0">

            <button
              onClick={onOpenMobileMenu}
              className="shrink-0 rounded-lg p-2 text-text-light transition hover:bg-white/5 hover:text-white lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={22} />
            </button>
            {/* Page Title */}
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold text-white">
                {title}
              </h1>
            </div>
          </div>

          {/* CENTER SEARCH */}
          <div className="relative hidden md:block flex-1 max-w-md">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />

            <input
              type="text"
              placeholder="Search assets, wallets, transactions..."
              className="
                w-full rounded-lg border border-white/10 bg-surface-alt
                py-2 pl-9 pr-14 text-sm text-text-light
                outline-none transition
                focus:border-accent
                focus:bg-surface
                focus:text-white
                placeholder:text-text-muted
              "
            />

            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">
              ⌘K
            </span>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2">

            {/* Mobile Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="rounded-lg p-2 text-text-light transition hover:bg-white/5 hover:text-white md:hidden"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Deposit CTA */}
            <Link
              to="/dashboard/deposit"
              className="
                hidden sm:inline-flex
                items-center gap-2
                rounded-xl
                bg-accent
                px-4 py-2
                text-sm font-bold
                text-secondary
                shadow-lg shadow-accent/20
                transition
                hover:bg-accent-light
              "
            >
              <Plus size={15} />
              Deposit
            </Link>

            <div className="mx-1 hidden sm:block h-6 w-px bg-white/10" />

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifOpen((v) => !v);
                  setUserOpen(false);
                }}
                className="
                  relative rounded-lg p-2
                  text-text-light
                  transition
                  hover:bg-white/5
                  hover:text-white
                "
                aria-label={`${unreadCount} unread notifications`}
              >
                <Bell size={20} />

                {unreadCount > 0 && (
                  <span
                    className="
                      absolute
                      -right-1
                      -top-1
                      flex
                      h-[18px]
                      min-w-[18px]
                      items-center
                      justify-center
                      rounded-full
                      bg-accent
                      px-1
                      text-[10px]
                      font-bold
                      text-secondary
                    "
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              <NotificationPanel
                open={notifOpen}
                onClose={() => setNotifOpen(false)}
              />
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setUserOpen((v) => !v);
                  setNotifOpen(false);
                }}
                className="
                  flex items-center gap-3
                  rounded-lg px-2 py-1.5
                  text-text-light
                  transition
                  hover:bg-white/5
                  hover:text-white
                "
                aria-label="User menu"
              >
                <div
                  className="
                    flex h-9 w-9
                    items-center justify-center
                    rounded-full
                    bg-accent/15
                    text-xs font-bold
                    text-accent
                  "
                >
                  {initials}
                </div>

                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-sm font-medium text-white">
                    {user.name}
                  </span>

                  {user.verified && (
                    <div className="flex items-center gap-1">
                      <ShieldCheck
                        size={12}
                        className="text-green-400"
                      />
                      <span className="text-xs text-text-muted">
                        Verified Investor
                      </span>
                    </div>
                  )}
                </div>

                <ChevronDown
                  size={14}
                  className={`hidden sm:block text-text-muted transition-transform ${
                    userOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <UserMenu
                open={userOpen}
                onClose={() => setUserOpen(false)}
              />
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default DashboardTopBar;