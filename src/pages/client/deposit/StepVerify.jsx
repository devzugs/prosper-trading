import React, { useState } from "react";
import { ChevronLeft, X, UploadCloud, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient"; 
import { useAuth } from "../../../context/AuthContext";

const StepVerify = ({ activeMethod, selectedCoin, amount, onBack, onReset }) => {
    const { user } = useAuth();

    const [txHash, setTxHash] = useState("");
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState(null);

    if (!selectedCoin) return null;

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const selected = e.target.files[0];
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
        
        if (!txHash) return setFeedback({ type: 'error', message: "Transaction hash is required." });
        if (!file) return setFeedback({ type: 'error', message: "Please upload a proof of payment." });

        setIsSubmitting(true);
        setFeedback(null);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`; 

            const { error: uploadError } = await supabase.storage
                .from('deposit-proofs')
                .upload(filePath, file);

            if (uploadError) throw new Error("Failed to upload proof: " + uploadError.message);

            const { error: dbError } = await supabase
                .from('deposits')
                .insert({
                    user_id: user.id,
                    coin: selectedCoin.name,
                    network: selectedCoin.network || activeMethod.label,
                    amount: parseFloat(amount), // Passed as a prop now
                    tx_hash: txHash,
                    proof_url: filePath,
                    status: 'pending'
                });

            if (dbError) {
                await supabase.storage.from('deposit-proofs').remove([filePath]);
                throw new Error("Failed to record deposit: " + dbError.message);
            }

            setFeedback({ type: 'success', message: "Deposit submitted successfully! Awaiting admin review." });
            
            setTimeout(() => {
                onReset();
            }, 3000);

        } catch (error) {
            setFeedback({ type: 'error', message: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="animate-[fade-up_0.4s_ease_forwards]">
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
                <span className="text-xs font-semibold text-text-light">Verify Payment</span>
            </div>

            <div className="bg-surface-alt border border-border rounded-xl p-4 mb-6">
                <p className="text-sm text-text-muted">You are verifying a deposit of <strong className="text-text-light">{amount} {selectedCoin.symbol}</strong> via {activeMethod.label}.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
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

                {feedback && (
                    <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${feedback.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                        {feedback.type === 'success' && <CheckCircle size={16} />}
                        {feedback.message}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting || feedback?.type === 'success'}
                    className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-secondary font-semibold text-sm py-3.5 rounded-xl my-transition disabled:opacity-70"
                >
                    {isSubmitting ? (
                        <><Loader2 size={16} className="animate-spin" /> Submitting...</>
                    ) : feedback?.type === 'success' ? "Submitted" : "Submit Proof"}
                </button>
            </form>

            <button
                type="button"
                onClick={onReset}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-transparent text-text-muted hover:text-text-light text-sm font-medium py-2 rounded-xl my-transition disabled:opacity-50"
            >
                <X size={14} />
                Cancel Deposit
            </button>
        </div>
    );
};

export default StepVerify;