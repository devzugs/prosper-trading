import React, { useState, useRef, useEffect } from "react";
import { Send, Clock } from "lucide-react";

const INITIAL_MESSAGES = [
  { id: 1, from: "support", text: "Welcome to Prosper Trading support! How can we help you today?", time: "Just now" },
];

const LiveChatSection = () => {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const messagesEnd = useRef(null);

  const scrollToBottom = () => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      from: "user",
      text: input,
      time: "Just now",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Mock: auto-reply after a delay
    setTimeout(() => {
      const replies = [
        "Great question! Can you provide more details?",
        "I've forwarded your request to our team. For a proper response, they'll contact you shortly",
      ];
      const supportMessage = {
        id: messages.length + 2,
        from: "support",
        text: replies[Math.floor(Math.random() * replies.length)],
        time: "Just now",
      };
      setMessages((prev) => [...prev, supportMessage]);
    }, 2500);
  };

  return (
    <div className="bg-surface-alt rounded-xl border border-border overflow-hidden flex flex-col h-96">
      {/* Header */}
      <div className="flex items-center gap-2 px-6 py-4 border-b border-border/60 bg-surface">
        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
        <div>
          <p className="text-sm font-semibold text-heading">Live Support</p>
          <p className="text-xs text-text-muted">We're online, average response: 2 min</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs rounded-lg px-4 py-2.5 ${
                msg.from === "user"
                  ? "bg-accent text-secondary"
                  : "bg-surface border border-border/60 text-text-light"
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.text}</p>
              <p className={`text-xs mt-1 ${msg.from === "user" ? "text-accent-light/70" : "text-text-muted"}`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEnd} />
      </div>

      {/* Input */}
      <div className="border-t border-border/60 px-6 py-4">
        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-md border border-border bg-surface px-4 py-2 text-sm text-text outline-none my-transition focus:border-accent placeholder:text-text-muted/50"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="rounded-lg bg-accent px-3 py-2 text-secondary my-transition hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={14} />
          </button>
        </form>

        <p className="flex items-center gap-1.5 text-[10px] text-text-muted mt-2">
          <Clock size={11} />
          Outside business hours? We'll respond when we're back.
        </p>
      </div>
    </div>
  );
};

export default LiveChatSection;