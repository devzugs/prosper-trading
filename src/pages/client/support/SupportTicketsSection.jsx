import React, { useState } from "react";
import { ChevronRight, Trash2, MessageSquare } from "lucide-react";
import TicketDetailModal from "./TicketDetailModal";

const STATUS_CONFIG = {
  open: { label: "Open", className: "bg-accent/10 text-accent" },
  waiting: { label: "Waiting for Response", className: "bg-warning/15 text-warning" },
  resolved: { label: "Resolved", className: "bg-success/10 text-success" },
};

const SupportTicketsSection = ({ tickets = [], onDelete = () => {} }) => {
  const [selected, setSelected] = useState(null);

  const isEmpty = tickets.length === 0;

  return (
    <>
      <div className="bg-surface-alt rounded-xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
          <p className="text-sm font-semibold text-heading">
            {isEmpty ? "No support tickets yet" : `${tickets.length} ticket${tickets.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* List */}
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="bg-accent/10 p-4 rounded-full mb-3">
              <MessageSquare size={24} className="text-accent/50" />
            </div>
            <p className="text-sm font-medium text-heading mb-1">No support requests yet</p>
            <p className="text-xs text-text-muted">
              Submit a message above to get help from our support team.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {tickets.map((ticket) => {
              const statusCfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
              return (
                <li
                  key={ticket.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-surface/50 my-transition group"
                >
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="text-sm font-semibold text-heading truncate group-hover:text-accent my-transition">
                        {ticket.subject}
                      </h4>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusCfg.className}`}>
                        {statusCfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted">
                      Ticket #{ticket.id} · {ticket.category} · {ticket.createdAt}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setSelected(ticket)}
                      className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-light my-transition hover:border-accent hover:text-accent"
                    >
                      <ChevronRight size={13} />
                    </button>
                    <button
                      onClick={() => onDelete(ticket.id)}
                      className="rounded-md border border-border/50 p-1.5 text-text-muted hover:text-danger hover:border-danger/40 my-transition"
                      title="Delete ticket"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <TicketDetailModal ticket={selected} onClose={() => setSelected(null)} />
    </>
  );
};

export default SupportTicketsSection;