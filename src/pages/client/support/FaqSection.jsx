import React, { useState } from "react";
import { Search } from "lucide-react";
import Accordion from "./Accordion";
import { FAQ_DATA } from "./faqData";

const FAQSection = () => {
  const [search, setSearch] = useState("");

  // Filter FAQ items by search query
  const filtered = Object.entries(FAQ_DATA).reduce((acc, [key, { title, items }]) => {
    const matches = items.filter(
      (item) =>
        item.question.toLowerCase().includes(search.toLowerCase()) ||
        item.answer.toLowerCase().includes(search.toLowerCase())
    );
    if (matches.length > 0) {
      acc.push({ title, items: matches });
    }
    return acc;
  }, []);

  const isEmpty = filtered.length === 0 && search.trim() !== "";

  return (
    <div className="space-y-6">
      {/* ── Search ── */}
      <div className="relative max-w-md">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search FAQs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-4 pl-10 py-2.5 text-sm text-text-light outline-none my-transition focus:border-accent placeholder:text-text-muted"
        />
      </div>

      {/* ── Results ── */}
      {isEmpty ? (
        <div className="py-12 text-center">
          <p className="text-sm text-text-muted">No FAQs match your search.</p>
          <button
            onClick={() => setSearch("")}
            className="mt-3 text-xs text-accent hover:text-accent-light font-medium my-transition"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {(filtered.length > 0 ? filtered : Object.entries(FAQ_DATA).map(([_, { title, items }]) => ({ title, items }))).map(
            ({ title, items }) => (
              <div key={title}>
                <h3 className="text-base font-semibold text-heading mb-3">{title}</h3>
                <Accordion items={items} />
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default FAQSection;