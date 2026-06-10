import React from "react";
import { useRef } from "react";
import useClickOutside from "../../hooks/UseClickOutside";
import NOTIFICATIONS from "../../data/notification";
import { X } from "lucide-react";

// ── Notification dropdown ─────────────────────────────────────────────────
const NotificationPanel = ({ open, onClose }) => {
  const ref = useRef(null);
  useClickOutside(ref, onClose);
  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-white/10 bg-surface-alt shadow-xl z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">Notifications</span>
          {unreadCount > 0 && (
            <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-secondary">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-text-muted transition hover:bg-white/5 hover:text-text-light"
        >
          <X size={14} />
        </button>
      </div>

      {/* List */}
      <ul>
        {NOTIFICATIONS.map((n) => (
          <li
            key={n.id}
            className={`flex gap-3 px-4 py-3.5 border-b border-white/5 last:border-0 transition hover:bg-white/3 cursor-pointer ${
              n.unread ? "bg-accent/4" : ""
            }`}
          >
            {/* Unread dot */}
            <div className="mt-1.5 shrink-0">
              <span
                className={`block h-2 w-2 rounded-full ${
                  n.unread ? "bg-accent" : "bg-transparent"
                }`}
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{n.title}</p>
              <p className="text-xs text-text-light mt-0.5 leading-relaxed">{n.body}</p>
              <p className="text-[11px] text-text-muted mt-1">{n.time}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="px-4 py-3 bg-surface-alt">
        <button className="w-full text-center text-xs font-medium text-accent transition hover:text-accent-light">
          View all notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationPanel;