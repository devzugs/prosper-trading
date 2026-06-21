import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

// ── Collapsible accordion item ─────────────────────────────────────────────────
const AccordionItem = ({ id, question, answer, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className=" p-3 border-b border-border/60 last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start gap-3 py-4 text-left hover:bg-white/2 my-transition group"
      >
        <ChevronDown
          size={18}
          className={`mt-0.5 shrink-0 text-accent my-transition ${open ? "rotate-180" : ""}`}
        />
        <span className="flex-1 text-sm font-semibold text-heading group-hover:text-accent my-transition">
          {question}
        </span>
      </button>

      {open && (
        <div className="animate-[fade-up_0.3s_ease_forwards] pl-7 pb-4 pr-4">
          <p className="text-sm text-text-light leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
};

const Accordion = ({ items }) => {
  return (
    <div className="bg-surface-alt rounded-xl border border-border overflow-hidden">
      {items.map((item, i) => (
        <AccordionItem key={i} {...item} />
      ))}
    </div>
  );
};

export default Accordion;