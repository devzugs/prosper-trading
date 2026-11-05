import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import ReferralStats from "./ReferralStats";
import ReferralLinkCard from "./ReferralLinkCard";
import ReferralTiers from "./ReferralTiers";
import ReferredUsersTable from "./ReferredUsersTable";
import { supabase } from "../../../lib/supabaseClient";
import { useAuth } from "../../../context/AuthContext";

export default function ReferralPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let disposed = false;
    let busy = false;
    setData(null);
    const refresh = async () => {
      if (!user?.id || busy) return;
      busy = true;
      try {
        const { data: result, error: failure } = await supabase.rpc("referral_dashboard", { p_offset: page * 25 });
        if (failure) throw failure;
        if (!disposed) { setData(result); setError(""); }
      } catch (failure) {
        if (!disposed) setError(failure.message || "Unable to load referrals.");
      } finally { busy = false; }
    };
    refresh();
    const timer = setInterval(refresh, 15000);
    window.addEventListener("focus", refresh);
    return () => { disposed = true; clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, [user?.id, page, revision]);

  return <div className="p-6 space-y-6">
    <div className="flex justify-between gap-3">
      <div><h1 className="text-2xl font-bold text-heading">Affiliate Program</h1>
        <p className="text-sm text-text-muted">Earn up to {data?.tiers?.at(-1)?.commission ?? 40}% on approved referral deposits, credited by an administrator.</p></div>
      <button onClick={() => setRevision(v => v + 1)} className="text-accent">Refresh</button>
    </div>
    {error && <p role="alert" className="text-danger">{error} Use Refresh to retry. Previously loaded figures may be out of date.</p>}
    {!data && !error && <Loader2 aria-label="Loading referrals" className="animate-spin text-accent" />}
    {data && <>
      <ReferralStats stats={data.stats} />
      <p className="text-xs text-text-muted">Approved referral commissions count toward total earnings, shown at current USD prices. Available referral earnings start at $0.00 and are set separately by an administrator.</p>
      <ReferralLinkCard referralCode={data.referralCode} />
      <ReferralTiers activeReferrals={data.stats.activeReferrals} tiers={data.tiers} />
      <ReferredUsersTable users={data.users.map(u => ({ ...u, initials: u.name.slice(0, 2).toUpperCase() }))} />
      {data.stats.totalReferrals > 25 && <div className="flex justify-between text-accent">
        <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</button>
        <span>Page {page + 1} of {Math.ceil(data.stats.totalReferrals / 25)}</span>
        <button disabled={(page + 1) * 25 >= data.stats.totalReferrals} onClick={() => setPage(p => p + 1)}>Next</button>
      </div>}
    </>}
  </div>;
}
