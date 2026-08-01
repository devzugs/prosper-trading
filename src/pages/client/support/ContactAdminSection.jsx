import React from "react";
import { MessageCircle, Send } from "lucide-react";

const ContactAdminSection = ({
  adminPhone = "+1 (262) 215‑7836",
  telegramUsername = "infoadministrate",
}) => {
  // Remove any spaces or special characters for WhatsApp link
  const whatsappNumber = adminPhone.replace(/[^\d]/g, "");

  return (
    <div className="bg-surface-alt flex flex-col items-center justify-between gap-4 rounded-xl border border-border p-6 text-center sm:flex-row sm:text-left">
      <div>
        <h3 className="mb-1 text-base font-semibold text-heading">
          Contact Support
        </h3>
        <p className="text-xs text-text-muted">
          Need help right away? Reach out to our admin team on WhatsApp or
          Telegram for a faster resolution.
        </p>
      </div>

      <div className="flex shrink-0 gap-3">
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="my-transition flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-green-700"
        >
          <MessageCircle size={16} />
          WhatsApp
        </a>

        <a
          href={`https://t.me/${telegramUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          className="my-transition flex items-center gap-2 rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-sky-600"
        >
          <Send size={16} />
          Telegram
        </a>
      </div>
    </div>
  );
};

export default ContactAdminSection;