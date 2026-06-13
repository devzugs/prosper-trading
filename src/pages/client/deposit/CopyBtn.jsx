import { useState } from "react";
import { CheckCheck, 
         Copy,
 } from "lucide-react"; 

// ─── Copy button ──────────────────────────────────────────────────────────────
const CopyBtn = ({ text }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border my-transition
                ${copied
                    ? "bg-success/10 border-success/30 text-success"
                    : "bg-surface border-border text-text-muted hover:border-accent/40 hover:text-accent"
                }`}
        >
            {copied ? <CheckCheck size={13} /> : <Copy size={13} />}
            {copied ? "Copied!" : "Copy"}
        </button>
    );
};

export default CopyBtn;