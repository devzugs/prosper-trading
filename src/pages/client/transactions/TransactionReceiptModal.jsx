import React, { useState, useEffect } from "react"; 
import { Link } from "react-router-dom";
import {      
    ArrowUpRight, ArrowDownLeft, Gift, TrendingUp, SlidersHorizontal,      
    ReceiptText, CheckCircle2, Clock3, RotateCcw, Loader2, Zap,
    X
} from "lucide-react"; 
import { supabase } from "../../../lib/supabaseClient"; 
import Modal from "../../../components/ui/Modal"; 
import CopyButton from "../../../components/ui/CopyButton"; 

const TYPE_CONFIG = {     
    deposit:        { label: "Deposit",        icon: ArrowDownLeft,      iconColor: "text-success", bgColor: "bg-success/10" },     
    withdrawal:     { label: "Withdrawal",     icon: ArrowUpRight,       iconColor: "text-danger",  bgColor: "bg-danger/10"  },     
    referral_bonus: { label: "Referral Bonus", icon: Gift,               iconColor: "text-accent",  bgColor: "bg-accent/10"  },     
    roi_payout:     { label: "ROI Payout",     icon: TrendingUp,         iconColor: "text-success", bgColor: "bg-success/10" },     
    adjustment:     { label: "ROI",            icon: SlidersHorizontal,  iconColor: "text-accent",  bgColor: "bg-accent/10"  },     
    fee:            { label: "Fee",            icon: ReceiptText,        iconColor: "text-danger",  bgColor: "bg-danger/10"  }, 
};

const STATUS_CONFIG = {     
    completed: { label: "Completed", className: "bg-success/10 text-success", icon: CheckCircle2 },     
    pending:   { label: "Pending",   className: "bg-warning/15 text-warning", icon: Clock3       },     
    reversed:  { label: "Rejected",  className: "bg-danger/10 text-danger",   icon: RotateCcw    }, 
};

const DetailRow = ({ label, value, copyable = false }) => {     
    if (!value) return null;     
    return (         
        <div className="flex justify-between items-center py-3 border-b border-border/30 last:border-0">             
            <span className="text-sm text-text-muted">{label}</span>             
            <div className="flex items-center gap-2">                 
                <span className="text-sm font-medium text-text-light truncate max-w-[180px] sm:max-w-[220px]">                     
                    {value}                 
                </span>                 
                {copyable && <CopyButton textToCopy={value} />}             
            </div>         
        </div>     
    ); 
};

const TransactionReceiptModal = ({ transaction, onClose }) => {     
    const [details, setDetails] = useState(null);     
    const [loading, setLoading] = useState(false);     
    
    useEffect(() => {         
        if (!transaction) return;         
        const fetchDeepDetails = async () => {             
            if (!transaction.reference_table || !transaction.reference_id) return;                          
            
            setLoading(true);             
            try {                 
                const { data, error } = await supabase                     
                    .from(transaction.reference_table)                     
                    .select("*")                     
                    .eq("id", transaction.reference_id)                     
                    .single();                                  
                if (!error && data) setDetails(data);             
            } catch (err) {                 
                console.error("Failed to fetch deeper transaction details");             
            }             
            setLoading(false);         
        };         
        fetchDeepDetails();     
    }, [transaction]);     
    
    if (!transaction) return null;     
    
    const cfg = TYPE_CONFIG[transaction.type] || TYPE_CONFIG.adjustment;     
    const TypeIcon = cfg.icon;     
    const statusCfg = STATUS_CONFIG[transaction.status] || STATUS_CONFIG.pending;     
    const StatusIcon = statusCfg.icon;          
    const amountNum = Number(transaction.amount);     
    const sign = amountNum > 0 ? "+" : "";     
    const amountColor = amountNum >= 0 ? "text-success" : "text-heading";     
    

    return (         
        <Modal isOpen={!!transaction} onClose={onClose} title="Transaction Details">                          
            {/* Header: Amount & Status */}             
            <div className="flex flex-col items-center justify-center p-8 bg-surface border-b border-border/50 relative">                 
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${cfg.bgColor}`}>                     
                    <TypeIcon size={24} className={cfg.iconColor} />                 
                </div>                                  
                <h2 className={`text-3xl font-bold tabular-nums tracking-tight mb-2 ${amountColor}`}>                     
                    {sign}{amountNum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 8 })} {transaction.currency}                 
                </h2>                                  
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusCfg.className}`}>                     
                    <StatusIcon size={12} />                     
                    {statusCfg.label}                 
                </span>             
            </div>             
            
            {/* Body */}             
            <div className="p-6">                 
                {transaction.status === "pending" ? (
                    <div className="bg-accent/5 border border-accent/20 rounded-xl p-6">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="bg-accent/20 p-3 rounded-full mb-3">
                                <Zap size={24} className="text-accent" />
                            </div>
                            <h4 className="text-lg font-semibold text-heading mb-1">Clear Pending Transaction</h4>
                            <p className="text-sm text-text-muted leading-relaxed max-w-sm">
                                This transaction is currently pending. You can fast track the clearing process by choosing one of the options below.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Link 
                                to='/deposit'
                                className="w-full bg-accent text-center text-secondary text-sm font-semibold py-3 px-4 rounded-lg hover:bg-accent/90 transition-colors"
                            >
                                Clear with 20% Fee
                            </Link>
                            <Link 
                                to='/referral'
                                className="w-full text-center bg-surface-alt border border-accent text-accent text-sm font-semibold py-3 px-4 rounded-lg hover:bg-accent/10 transition-colors"
                            >
                                Clear with 0-3 Referrals
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="bg-surface-alt rounded-xl border border-border p-1 px-4">                                          
                        <DetailRow                          
                            label="Date"                          
                            value={new Date(transaction.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}                      
                        />                     
                        <DetailRow                          
                            label="Time"                          
                            value={new Date(transaction.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}                      
                        />                     
                        <DetailRow                          
                            label="Type"                          
                            value={cfg.label}                      
                        />                                          
                        <DetailRow                          
                            label="Transaction ID"                          
                            value={transaction.id}                          
                            copyable                      
                        />                     
                        
                        {loading && (                         
                            <div className="flex justify-center py-4">                             
                                <Loader2 className="animate-spin text-accent text-sm" size={16} />                         
                            </div>                     
                        )}                     
                        
                        {!loading && details && transaction.reference_table === "deposits" && (                         
                            <>                             
                                <DetailRow label="Network" value={details.network} />                             
                                <DetailRow label="Deposit Address" value={details.deposit_address} copyable />                             
                                <DetailRow label="Tx Hash" value={details.tx_hash} copyable />                         
                            </>                     
                        )}                     
                        
                        {!loading && details && transaction.reference_table === "withdrawals" && (                         
                            <>                             
                                <DetailRow label="Method" value={details.method?.toUpperCase()} />                             
                                <DetailRow                                  
                                    label="Destination"                                  
                                    value={details.payment_details?.address || details.payment_details?.account_number || "External Wallet"}                                  
                                    copyable                              
                                />                         
                            </>                     
                        )}                     
                        
                        {transaction.note && (                         
                            <DetailRow label="Note" value={transaction.note} />                     
                        )}                 
                    </div>             
                )}
            </div>         
        </Modal>     
    ); 
};

export default TransactionReceiptModal;