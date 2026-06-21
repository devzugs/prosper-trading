import React, { useState } from "react";
import { Send, Check, AlertCircle } from "lucide-react";

const CATEGORIES = [
  "General Inquiry",
  "Account Issue",
  "Security Concern",
  "Deposit Problem",
  "Withdrawal Issue",
  "Trading & Portfolio",
  "Technical Support",
  "Other",
];

const ContactFormSection = ({ onSubmit }) => {
  const [form, setForm] = useState({
    category: CATEGORIES[0],
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const update = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.subject.trim()) {
      setError("Please enter a subject.");
      return;
    }
    if (!form.message.trim()) {
      setError("Please write your message.");
      return;
    }

    onSubmit?.(form);
    setSubmitted(true);
    setForm({ category: CATEGORIES[0], subject: "", message: "" });
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="bg-surface-alt rounded-xl border border-border p-6">
      <h3 className="text-base font-semibold text-heading mb-1">Contact Support</h3>
      <p className="text-xs text-text-muted mb-5">
        We typically respond within 24 hours. For urgent issues, use live chat.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-text-light">Category</label>
            <select
              value={form.category}
              onChange={update("category")}
              className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none my-transition focus:border-accent [&>option]:bg-surface"
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-text-light">Subject</label>
            <input
              type="text"
              value={form.subject}
              onChange={update("subject")}
              placeholder="Brief description of your issue"
              className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none my-transition focus:border-accent placeholder:text-text-muted/50"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-text-light">Message</label>
          <textarea
            rows={4}
            value={form.message}
            onChange={update("message")}
            placeholder="Tell us more details about your issue so we can help you better."
            className="w-full rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none my-transition focus:border-accent placeholder:text-text-muted/50"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2">
            <AlertCircle size={13} className="text-danger shrink-0 mt-0.5" />
            <p className="text-xs text-text-light">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          {submitted && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-success">
              <Check size={14} />
              Ticket submitted
            </span>
          )}
          <button
            type="submit"
            disabled={submitted}
            className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-secondary shadow-lg shadow-accent/20 my-transition hover:bg-accent-light disabled:opacity-60"
          >
            <Send size={14} />
            Send Message
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactFormSection;