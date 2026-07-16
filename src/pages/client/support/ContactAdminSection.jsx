import React from "react";
import { MessageSquare } from "lucide-react";

const ContactAdminSection = ({ adminPhone = "+1234567890" }) => {
  return (
    <div className="bg-surface-alt flex flex-col items-center justify-between gap-4 rounded-xl border border-border p-6 text-center sm:flex-row sm:text-left">
      <div>
        <h3 className="mb-1 text-base font-semibold text-heading">
          Contact Support
        </h3>
        <p className="text-xs text-text-muted">
          Need help right away? Send a direct text message to our admin team for a faster resolution.
        </p>
      </div>

      <a
        href={`sms:${adminPhone}`}
        className="my-transition flex shrink-0 items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-secondary shadow-lg shadow-accent/20 hover:bg-accent-light"
      >
        <MessageSquare size={16} />
        Text Admin
      </a>
    </div>
  );
};

export default ContactAdminSection;