import React, { useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, X, UploadCloud, CheckCircle, Loader2 } from "lucide-react";
import CopyBtn from "./CopyBtn"; // Assuming you have this
import ProviderButtons from "./ProviderButtons"; // Assuming you have this
import { supabase } from "../../../lib/supabaseClient"; 
import { useAuth } from "../../../context/AuthContext";

const StepDeposit = ({ activeMethod, selectedCoin, onBack, onReset }) => {
    const { user } = useAuth();
    const [logoErrors, setLogoErrors] = useState({});
    const providerCfg = activeMethod?.provider ? ProviderButtons[activeMethod.provider] : null;

    // --- New State for Phase 6 ---
    const [amount, setAmount] = useState("");
    const [txHash, setTxHash] = useState("");
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState(null); // { type: 'error' | 'success', message: '' }

    if (!selectedCoin) return null;

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const selected = e.target.files[0];
            // Basic validation: max 5MB
            if (selected.size > 5 * 1024 * 1024) {
                setFeedback({ type: 'error', message: "File is too large. Maximum size is 5MB." });
                setFile(null);
                return;
            }
            setFile(selected);
            setFeedback(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!amount || amount <= 0) return setFeedback({ type: 'error', message: "Please enter a valid amount." });
        if (!txHash) return setFeedback({ type: 'error', message: "Transaction hash is required." });
        if (!file) return setFeedback({ type: 'error', message: "Please upload a proof of payment." });

        setIsSubmitting(true);
        setFeedback(null);

        try {
            // 1. Upload the file to the secure bucket
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`; // Organize by user ID folder

            const { error: uploadError } = await supabase.storage
                .from('deposit-proofs')
                .upload(filePath, file);

            if (uploadError) throw new Error("Failed to upload proof: " + uploadError.message);

            // 2. Insert the pending deposit record
            const { error: dbError } = await supabase
                .from('deposits')
                .insert({
                    user_id: user.id,
                    coin: selectedCoin.name || 'Crypto', // Adjust based on your selectedCoin object structure
                    network: selectedCoin.network || activeMethod.label,
                    amount: parseFloat(amount),
                    tx_hash: txHash,
                    proof_url: filePath, // Storing the path, not a public URL
                    status: 'pending'
                });

            if (dbError) {
                // Optional cleanup: if DB fails, you might want to delete the uploaded file to save space
                await supabase.storage.from('deposit-proofs').remove([filePath]);
                throw new Error("Failed to record deposit: " + dbError.message);
            }

            setFeedback({ type: 'success', message: "Deposit submitted successfully! Awaiting admin review." });
            
            // Optional: reset form after 3 seconds or trigger onReset()
            setTimeout(() => {
                onReset();
            }, 3000);

        } catch (error) {
            console.error("Deposit submission error:", error);
            setFeedback({ type: 'error', message: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="animate-[fade-up_0.4s_ease_forwards]">
            {/* Header / Breadcrumbs */}
            <div className="flex items-center gap-3 mb-5">
                <button
                    onClick={onBack}
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 text-sm text-text-muted hover:text-accent my-transition disabled:opacity-50"
                >
                    <ChevronLeft size={15} />
                    Back
                </button>
                <span className="text-border">|</span>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${activeMethod.bg}`}>
                    {activeMethod.icon && React.createElement(activeMethod.icon, { size: 13, className: activeMethod.accent })}
                    <span className={`text-xs font-semibold ${activeMethod.accent}`}>{activeMethod.label}</span>
                </div>
                <ChevronRight size={12} className="text-text-muted" />
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-alt border border-border">
                    <span className="text-xs font-semibold text-text-light">{selectedCoin.name}</span>
                </div>
            </div>

            {/* Instruction / Address Box */}
            <div className="bg-surface-alt border border-border rounded-xl p-5 mb-6 text-center">
                <p className="text-sm text-text-muted mb-2">Send your {selectedCoin.name} to the address below:</p>
                <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-lg font-mono text-text-light break-all bg-background p-2 rounded-lg border border-border">
                        {/* Placeholder Address: You will replace this with dynamically generated/fetched addresses in the future */}
                        0x1234567890abcdef1234567890abcdef12345678
                    </span>
                    <CopyBtn text="0x1234567890abcdef1234567890abcdef12345678" />
                </div>
            </div>

            {/* Phase 6: Submission Form */}
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                
                {/* Amount Input */}
                <div>
                    <label className="block text-sm font-medium text-text-light mb-1">Amount Sent</label>
                    <input 
                        type="number" 
                        step="any"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={`e.g. 0.5 ${selectedCoin.name}`}
                        className="w-full bg-surface-alt border border-border rounded-lg px-4 py-2.5 text-text-light focus:outline-none focus:border-accent my-transition"
                        disabled={isSubmitting || feedback?.type === 'success'}
                        required
                    />
                </div>

                {/* Tx Hash Input */}
                <div>
                    <label className="block text-sm font-medium text-text-light mb-1">Transaction Hash</label>
                    <input 
                        type="text" 
                        value={txHash}
                        onChange={(e) => setTxHash(e.target.value)}
                        placeholder="Enter the TX hash or reference ID"
                        className="w-full bg-surface-alt border border-border rounded-lg px-4 py-2.5 text-text-light focus:outline-none focus:border-accent my-transition"
                        disabled={isSubmitting || feedback?.type === 'success'}
                        required
                    />
                </div>

                {/* File Upload */}
                <div>
                    <label className="block text-sm font-medium text-text-light mb-1">Proof of Payment</label>
                    <div className="relative w-full bg-surface-alt border border-dashed border-border hover:border-accent/50 rounded-lg p-4 flex flex-col items-center justify-center my-transition cursor-pointer">
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                            disabled={isSubmitting || feedback?.type === 'success'}
                            required
                        />
                        <UploadCloud size={24} className="text-text-muted mb-2" />
                        <span className="text-sm text-text-muted">
                            {file ? file.name : "Tap to upload screenshot (Max 5MB)"}
                        </span>
                    </div>
                </div>

                {/* Feedback Messages */}
                {feedback && (
                    <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${feedback.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                        {feedback.type === 'success' && <CheckCircle size={16} />}
                        {feedback.message}
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting || feedback?.type === 'success'}
                    className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-secondary font-semibold text-sm py-3.5 rounded-xl my-transition disabled:opacity-70"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Submitting...
                        </>
                    ) : feedback?.type === 'success' ? (
                        "Submitted"
                    ) : (
                        "I Have Paid"
                    )}
                </button>
            </form>

            <button
                type="button"
                onClick={onReset}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-transparent text-text-muted hover:text-text-light text-sm font-medium py-2 rounded-xl my-transition disabled:opacity-50"
            >
                <X size={14} />
                Start over
            </button>
        </div>
    );
};

export default StepDeposit;