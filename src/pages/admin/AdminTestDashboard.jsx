import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Eye, Loader2, RefreshCcw, DollarSign, UploadCloud } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";

const AdminTestDashboard = () => {
  const { user } = useAuth();
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchPendingQueues = async () => {
    setLoading(true);
    
    // 1. Fetch Pending Deposits
    const { data: deps } = await supabase
      .from("deposits")
      .select(`
        id, amount, coin, network, tx_hash, proof_url, created_at,
        profiles ( full_name, email )
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    // 2. Resolve secure signed URLs for private deposit proofs
    const depositsWithImages = await Promise.all(
      (deps || []).map(async (dep) => {
        if (!dep.proof_url) return { ...dep, signedImageUrl: null };
        const { data } = await supabase.storage
          .from("deposit-proofs")
          .createSignedUrl(dep.proof_url, 3600); // URL valid for 1 hour
        return { ...dep, signedImageUrl: data?.signedUrl || null };
      })
    );
    setDeposits(depositsWithImages);

    // 3. Fetch Pending Withdrawals
    const { data: wits } = await supabase
      .from("withdrawals")
      .select(`
        id, amount, currency, method, payment_details, created_at,
        profiles ( full_name, email )
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    setWithdrawals(wits || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPendingQueues();
  }, []);

  // --- Handlers for Deposits ---
  const handleApproveDeposit = async (id) => {
    if (!window.confirm("Approve this deposit and add funds to the user's wallet?")) return;
    setProcessingId(id);
    
    // Calls the Phase 5 PostgreSQL RPC to ensure atomicity
    const { error } = await supabase.rpc("approve_deposit", { p_deposit_id: id });
    
    if (error) alert("Error approving deposit: " + error.message);
    else fetchPendingQueues();
    
    setProcessingId(null);
  };

  const handleRejectDeposit = async (id) => {
    if (!window.confirm("Reject this deposit?")) return;
    setProcessingId(id);
    
    const { error } = await supabase
      .from("deposits")
      .update({ status: "rejected" })
      .eq("id", id);
      
    if (error) alert("Error rejecting: " + error.message);
    else fetchPendingQueues();
    
    setProcessingId(null);
  };

  // --- Handlers for Withdrawals ---
  const handleApproveWithdrawal = async (id) => {
    if (!window.confirm("Mark withdrawal as complete and deduct from locked funds?")) return;
    setProcessingId(id);
    
    const { error } = await supabase.rpc("approve_withdrawal", { p_withdrawal_id: id });
    
    if (error) alert("Error approving withdrawal: " + error.message);
    else fetchPendingQueues();
    
    setProcessingId(null);
  };

  const handleRejectWithdrawal = async (id) => {
    if (!window.confirm("Reject withdrawal and refund the user's wallet?")) return;
    setProcessingId(id);
    
    const { error } = await supabase.rpc("reject_withdrawal", { p_withdrawal_id: id });
    
    if (error) alert("Error rejecting withdrawal: " + error.message);
    else fetchPendingQueues();
    
    setProcessingId(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen space-y-8 animate-[fade-in_0.4s_ease_out]">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-heading">Admin Command Center</h1>
          <p className="text-sm text-text-muted mt-1">Review and process pending financial transactions.</p>
        </div>
        <button onClick={fetchPendingQueues} className="p-2 rounded-lg bg-surface-alt border border-border hover:text-accent my-transition">
          <RefreshCcw size={18} className={loading ? "animate-spin text-accent" : ""} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin text-accent w-8 h-8" /></div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* DEPOSIT QUEUE */}
          <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="bg-surface-alt border-b border-border p-4 flex items-center gap-2">
              <UploadCloud size={18} className="text-emerald-500" />
              <h2 className="font-bold text-heading">Pending Deposits ({deposits.length})</h2>
            </div>
            <div className="divide-y divide-border/50 max-h-[600px] overflow-y-auto p-4 space-y-4">
              {deposits.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-10">No pending deposits.</p>
              ) : deposits.map(dep => (
                <div key={dep.id} className="bg-background border border-border rounded-xl p-4 flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-heading text-lg">${Number(dep.amount).toLocaleString()} <span className="text-sm text-text-muted font-normal uppercase">{dep.coin}</span></p>
                      <p className="text-sm text-text-light">{dep.profiles?.full_name} <span className="text-xs text-text-muted">({dep.profiles?.email})</span></p>
                      <p className="text-xs text-text-muted mt-1 font-mono">TX: {dep.tx_hash}</p>
                    </div>
                    <span className="text-xs text-text-muted">{new Date(dep.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  {dep.signedImageUrl ? (
                    <a href={dep.signedImageUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-accent hover:underline bg-accent/10 w-fit px-3 py-1.5 rounded-lg my-transition">
                      <Eye size={16} /> View Payment Proof
                    </a>
                  ) : (
                    <span className="text-sm text-danger">No proof uploaded</span>
                  )}

                  <div className="flex gap-2 pt-2 border-t border-border/50">
                    <button 
                      onClick={() => handleApproveDeposit(dep.id)}
                      disabled={processingId === dep.id}
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 py-2 rounded-lg text-sm font-bold my-transition disabled:opacity-50"
                    >
                      <CheckCircle size={16} /> Approve
                    </button>
                    <button 
                      onClick={() => handleRejectDeposit(dep.id)}
                      disabled={processingId === dep.id}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 py-2 rounded-lg text-sm font-bold my-transition disabled:opacity-50"
                    >
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WITHDRAWAL QUEUE */}
          <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="bg-surface-alt border-b border-border p-4 flex items-center gap-2">
              <DollarSign size={18} className="text-amber-500" />
              <h2 className="font-bold text-heading">Pending Withdrawals ({withdrawals.length})</h2>
            </div>
            <div className="divide-y divide-border/50 max-h-[600px] overflow-y-auto p-4 space-y-4">
              {withdrawals.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-10">No pending withdrawals.</p>
              ) : withdrawals.map(wit => (
                <div key={wit.id} className="bg-background border border-border rounded-xl p-4 flex flex-col gap-4">
                   <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-heading text-lg">${Number(wit.amount).toLocaleString()} <span className="text-sm text-text-muted font-normal uppercase">{wit.currency}</span></p>
                      <p className="text-sm text-text-light">{wit.profiles?.full_name} <span className="text-xs text-text-muted">({wit.profiles?.email})</span></p>
                      <p className="text-xs font-semibold text-accent uppercase tracking-wide mt-1">{wit.method} Transfer</p>
                    </div>
                    <span className="text-xs text-text-muted">{new Date(wit.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="bg-surface-alt rounded-lg p-3 border border-border/50">
                    <p className="text-xs font-semibold text-text-muted mb-2 uppercase">Payment Details:</p>
                    <pre className="text-xs text-text-light font-mono whitespace-pre-wrap break-all">
                      {JSON.stringify(wit.payment_details, null, 2)}
                    </pre>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-border/50">
                    <button 
                      onClick={() => handleApproveWithdrawal(wit.id)}
                      disabled={processingId === wit.id}
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 py-2 rounded-lg text-sm font-bold my-transition disabled:opacity-50"
                    >
                      <CheckCircle size={16} /> Mark Paid
                    </button>
                    <button 
                      onClick={() => handleRejectWithdrawal(wit.id)}
                      disabled={processingId === wit.id}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 py-2 rounded-lg text-sm font-bold my-transition disabled:opacity-50"
                    >
                      <XCircle size={16} /> Reject & Refund
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default AdminTestDashboard;