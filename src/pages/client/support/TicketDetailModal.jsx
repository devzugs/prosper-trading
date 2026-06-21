import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, Send } from "lucide-react";

const STATUS_CONFIG = {
  open: { label: "Open", className: "bg-accent/10 text-accent" },
  waiting: { label: "Waiting for Response", className: "bg-warning/15 text-warning" },
  resolved: { label: "Resolved", className: "bg-success/10 text-success" },
};

const TicketDetailModal = ({ ticket, onClose }) => {
  const [reply, setReply] = useState("");

  if (!ticket) return null;

  const statusCfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    // Mock: add reply to thread
    setReply("");
  };

  // 1. We define the modal content just like before
  // Notice we removed mt-40, increased z-index to z-[100], and changed to backdrop-blur-md
  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-2xl max-h-[95vh] rounded-2xl bg-surface shadow-2xl flex flex-col animate-pop-out">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border px-6 py-5 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h2 className="text-base font-semibold text-heading truncate">{ticket.subject}</h2>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusCfg.className}`}>
                {statusCfg.label}
              </span>
            </div>
            <p className="text-xs text-text-muted">
              Ticket #{ticket.id} · {ticket.category} · Created {ticket.createdAt}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-text-light my-transition hover:bg-surface-alt hover:text-heading shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div className="bg-surface-alt rounded-lg p-4 border border-border/60">
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm font-semibold text-heading">You</p>
              <p className="text-xs text-text-muted">{ticket.createdAt}</p>
            </div>
            <p className="text-sm text-text-light leading-relaxed">{ticket.message}</p>
          </div>

          {ticket.replies && ticket.replies.length > 0 ? (
            ticket.replies.map((r, i) => (
              <div key={i} className={`rounded-lg p-4 border border-border/60 ${r.from === "user" ? "bg-surface-alt ml-6" : "bg-accent/5"}`}>
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-semibold text-heading">{r.from === "user" ? "You" : "Support Team"}</p>
                  <p className="text-xs text-text-muted">{r.time}</p>
                </div>
                <p className="text-sm text-text-light leading-relaxed">{r.text}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-text-muted text-center py-4">No replies yet. Please wait for our team to respond.</p>
          )}
        </div>

        {/* Reply form */}
        {ticket.status !== "resolved" && (
          <div className="border-t border-border px-6 py-4 shrink-0">
            <p className="text-xs font-medium text-text-muted mb-3 uppercase">Add a reply</p>
            <form onSubmit={handleSendReply} className="flex items-end gap-2">
              <textarea
                rows={2}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your reply..."
                className="flex-1 rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none my-transition focus:border-accent placeholder:text-text-muted/50"
              />
              <button
                type="submit"
                disabled={!reply.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-secondary my-transition hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Send size={13} />
              </button>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-border/50 px-6 py-4 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-text my-transition hover:bg-surface-alt hover:text-heading"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  // 2. We use createPortal to mount it directly to the document body
  // We check for 'document' to ensure it doesn't break during Server-Side Rendering (like Next.js)
  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : null;
};

export default TicketDetailModal;