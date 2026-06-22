import React, { useState } from "react";
import { HelpCircle, MessageSquare, FileText, Clock } from "lucide-react";
import FAQSection from "../../../components/sections/FaqSection";
import ContactFormSection from "./ContactFormSection";
import SupportTicketsSection from "./SupportTicketsSection";
import LiveChatSection from "./LiveChatSection";

const TABS = [
  { id: "faq", label: "FAQs", icon: HelpCircle },
  { id: "contact", label: "Contact", icon: MessageSquare },
  { id: "live", label: "Live Chat", icon: Clock },
  { id: "tickets", label: "My Tickets", icon: FileText },
];

const SupportPage = () => {
  const [activeTab, setActiveTab] = useState("faq");
  const [tickets, setTickets] = useState([
    {
      id: "TKT-001",
      subject: "Deposit not received",
      category: "Deposit Problem",
      message: "I sent a Bitcoin transfer 2 hours ago but it hasn't appeared in my account yet.",
      status: "waiting",
      createdAt: "2 days ago",
      replies: [
        {
          from: "support",
          text: "Thank you for your inquiry. We've checked our system and found your transaction. It should be credited within the next 30 minutes. Please wait a bit longer and refresh your account.",
          time: "1 day ago",
        },
        {
          from: "user",
          text: "Thanks! I see it now. Appreciate the quick response.",
          time: "1 day ago",
        },
      ],
    },
    {
      id: "TKT-002",
      subject: "Password reset issue",
      category: "Account Issue",
      message: "I didn't receive the password reset email.",
      status: "open",
      createdAt: "3 hours ago",
      replies: [],
    },
  ]);

  const handleSubmitTicket = (form) => {
    const newTicket = {
      id: `TKT-${String(tickets.length + 1).padStart(3, "0")}`,
      subject: form.subject,
      category: form.category,
      message: form.message,
      status: "open",
      createdAt: "Just now",
      replies: [],
    };
    setTickets((prev) => [newTicket, ...prev]);
  };

  const handleDeleteTicket = (id) => {
    setTickets((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen">
      {/* ── Page header ── */}
      <div className="p-6 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-heading">Support Center</h1>
        <p className="text-sm text-text-muted mt-1">
          Find answers, submit a ticket, or chat with our support team.
        </p>
      </div>

      {/* ── Tab nav ── */}
      <div className="p-6 pt-0">
        <div className="flex gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden pb-2 -mx-6 px-6 mb-6">
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium shrink-0 my-transition
                  ${
                    isActive
                      ? "bg-accent text-secondary shadow-sm shadow-accent/20"
                      : "bg-surface-alt text-text-muted hover:text-text-light border border-border"
                  }`}
              >
                <Icon size={15} />
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Content ── */}
        <div key={activeTab} className="animate-[fade-up_0.3s_ease_forwards]">
          {activeTab === "faq" && <FAQSection />}

          {activeTab === "contact" && (
            <div className="space-y-6">
              <ContactFormSection onSubmit={handleSubmitTicket} />
            </div>
          )}

          {activeTab === "tickets" && <SupportTicketsSection tickets={tickets} onDelete={handleDeleteTicket} />}

          {activeTab === "live" && (
            <div className="space-y-4">
              <p className="text-sm text-text-light leading-relaxed">
                Chat directly with our support team for immediate help. Average response time is 2 minutes during business
                hours.
              </p>
              <LiveChatSection />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportPage;