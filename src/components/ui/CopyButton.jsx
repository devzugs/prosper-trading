import React, { useState } from "react";
import { Copy, CheckCircle2 } from "lucide-react";

const CopyButton = ({ textToCopy, className = "" }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (e) => {
        e.stopPropagation(); // Prevent row click events if nested
        if (!textToCopy) return;
        
        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy text", err);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className={`inline-flex items-center justify-center p-1.5 rounded-md my-transition hover:bg-surface border border-transparent hover:border-border/50 ${className}`}
            title="Copy to clipboard"
        >
            {copied ? (
                <CheckCircle2 size={14} className="text-success" />
            ) : (
                <Copy size={14} className="text-text-muted hover:text-accent" />
            )}
        </button>
    );
};

export default CopyButton;