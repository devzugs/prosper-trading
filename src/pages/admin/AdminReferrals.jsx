import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import ReferralStats from "../client/referral/ReferralStats";
import { formatReferralMoney as money } from "../client/referral/formatReferralMoney";

function ManageReferral({ referral, onClose, onDone }) {
  const [status, setStatus] = useState(referral.status);
  const [reason, setReason] = useState("");
  const [deposits, setDeposits] = useState([]);
  const [credits, setCredits] = useState([]);
  const [history, setHistory] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [depositId, setDepositId] = useState("");
  const [reversalReason, setReversalReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let live = true;
    const load = async () => {
      try {
        const results = await Promise.all([
          supabase.from("deposits").select("id,amount,coin,created_at").eq("user_id", referral.referred_id).eq("status", "approved").order("created_at", { ascending: false }),
          supabase.from("referral_commissions").select("id,deposit_id,amount,currency,rate,created_at,reversed_at,reversal_reason").eq("referral_id", referral.id).order("created_at", { ascending: false }),
          supabase.rpc("referral_dashboard", { p_user_id: referral.referrer_id }),
          supabase.from("referral_status_history").select("id,old_status,new_status,reason,created_at").eq("referral_id", referral.id).order("created_at", { ascending: false }).limit(20),
        ]);
        const failure = results.find(r => r.error)?.error;
        if (failure) throw failure;
        if (live) {
          setDeposits(results[0].data); setCredits(results[1].data); setDashboard(results[2].data); setHistory(results[3].data); setError("");
        }
      } catch (failure) { if (live) setError(failure.message); }
    };
    load();
    return () => { live = false; };
  }, [referral.id, referral.referred_id, referral.referrer_id, revision]);
  const run = async (name, args) => {
    setBusy(true); setError("");
    try {
      const { error: failure } = await supabase.rpc(name, args);
      if (failure) throw failure;
      setDepositId(""); setReason(""); setReversalReason(""); setRevision(v => v + 1); onDone();
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  };
  const tier = dashboard?.tiers.filter(t => dashboard.stats.activeReferrals >= t.minReferrals).at(-1);
  const eligible = deposits.filter(d => !credits.some(c => c.deposit_id === d.id));
  const chosen = eligible.find(d => d.id === depositId);
  return <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
    <section role="dialog" aria-modal="true" aria-labelledby="manage-referral" className="bg-surface rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto space-y-5">
      <div className="flex justify-between"><h2 id="manage-referral" className="text-xl text-heading font-bold">Manage referral: {referral.referredProfile?.full_name || "Member"}</h2><button aria-label="Close" disabled={busy} onClick={onClose}><X /></button></div>
      <p className="text-text-muted">Referrer: {referral.referrerProfile?.full_name || referral.referrerProfile?.email}</p>
      {error && <p role="alert" className="text-danger">{error} <button onClick={() => setRevision(v => v + 1)}>Retry loading</button></p>}
      {dashboard && <ReferralStats stats={dashboard.stats} />}
      <form className="space-y-3 border border-border rounded p-4" onSubmit={e => { e.preventDefault(); run("admin_set_referral_status", { p_referral_id: referral.id, p_status: status, p_reason: reason }); }}>
        <h3 className="font-semibold text-heading">Referral status</h3>
        <p className="text-sm text-text-muted">Activation qualifies this referral for deposit commissions and counts toward the referrer's tier. Inactivation keeps its history and earned commission.</p>
        <label className="block">Status <select value={status} onChange={e => setStatus(e.target.value)} className="bg-surface-alt border border-border p-2 rounded ml-2">{["pending", "active", "inactive"].map(s => <option key={s}>{s}</option>)}</select></label>
        <input required aria-label="Reason for status change" placeholder="Reason for status change" value={reason} onChange={e => setReason(e.target.value)} className="w-full bg-surface-alt border border-border p-2 rounded" />
        <button disabled={busy || status === referral.status || !reason.trim()} className="bg-accent text-secondary rounded px-4 py-2 disabled:opacity-40">Save status</button>
        <button type="button" disabled={busy || !reason.trim()} className="text-danger ml-4 disabled:opacity-40" onClick={() => run("admin_remove_referral", { p_referral_id: referral.id, p_reason: reason })}>Remove incorrect referral</button>
        <p className="text-xs text-text-muted">Removal is allowed only before any financial history exists. The reason and attribution remain in the admin audit trail.</p>
      </form>
      <form className="space-y-3 border border-border rounded p-4" onSubmit={e => { e.preventDefault(); run("admin_credit_referral_deposit", { p_referral_id: referral.id, p_deposit_id: depositId }); }}>
        <h3 className="font-semibold text-heading">Credit approved deposit commission</h3>
        <p className="text-sm text-text-muted">Current tier: {tier?.name || "Loading"} ({tier?.commission ?? "—"}%). The server applies the tier at credit time. Each approved deposit can be credited once.</p>
        <select required aria-label="Approved deposit" value={depositId} onChange={e => setDepositId(e.target.value)} className="w-full bg-surface-alt border border-border p-2 rounded">
          <option value="">{eligible.length ? "Select approved deposit" : "No uncredited approved deposits"}</option>
          {eligible.map(d => <option key={d.id} value={d.id}>{money({ [d.coin]: d.amount })} — {new Date(d.created_at).toLocaleDateString()} — {d.id.slice(0, 8)}</option>)}
        </select>
        {chosen && tier && <p>Estimated commission: {money({ [chosen.coin]: Number(chosen.amount) * tier.commission / 100 })}</p>}
        <button disabled={busy || referral.status !== "active" || !depositId || !dashboard} className="bg-accent text-secondary rounded px-4 py-2 disabled:opacity-40">{busy ? "Saving…" : "Credit commission"}</button>
        {referral.status !== "active" && <p className="text-warning text-sm">Activate this referral first.</p>}
      </form>
      <div><h3 className="font-semibold text-heading">Deposit commission history</h3>
        {!credits.length && <p className="text-text-muted">No deposit-linked credits yet. Earlier manual credits remain included in the earnings cards.</p>}
        {credits.some(c => !c.reversed_at) && <input aria-label="Commission reversal reason" placeholder="Reason if reversing a credit" value={reversalReason} onChange={e => setReversalReason(e.target.value)} className="w-full bg-surface-alt border border-border p-2 rounded" />}
        {credits.map(c => <div key={c.id} className="text-sm py-2 break-words">{new Date(c.created_at).toLocaleString()} · {money({ [c.currency]: c.amount })} · {c.rate}% · Deposit {c.deposit_id}
          {c.reversed_at ? <p className="text-text-muted">Reversed: {c.reversal_reason}</p> : <button disabled={busy || !reversalReason.trim()} className="text-danger ml-3 disabled:opacity-40" onClick={() => run("admin_reverse_referral_commission", { p_commission_id: c.id, p_reason: reversalReason })}>Reverse credit</button>}
        </div>)}
      </div>
      <div><h3 className="font-semibold text-heading">Recent status changes</h3>{history.map(h => <p key={h.id} className="text-sm py-2">{h.old_status} → {h.new_status}: {h.reason} · {new Date(h.created_at).toLocaleString()}</p>)}</div>
    </section>
  </div>;
}

export default function AdminReferrals() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [revision, setRevision] = useState(0);
  const [adding, setAdding] = useState(false);
  const [newRecord, setNewRecord] = useState({ code: "", email: "", reason: "" });
  const [saving, setSaving] = useState(false);
  const addRecord = async e => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const { error: failure } = await supabase.rpc("admin_add_referral", { p_referrer_code: newRecord.code, p_referred_email: newRecord.email, p_reason: newRecord.reason });
      if (failure) throw failure;
      setAdding(false); setNewRecord({ code: "", email: "", reason: "" }); setRevision(v => v + 1);
    } catch (failure) { setError(failure.message); }
    finally { setSaving(false); }
  };
  useEffect(() => {
    let live = true;
    const load = async () => {
      try {
        const all = [];
        for (let offset = 0; ; offset += 500) {
          const { data, error: failure } = await supabase.from("referrals").select("id,referrer_id,referred_id,status,created_at").order("created_at", { ascending: false }).order("id").range(offset, offset + 499);
          if (failure) throw failure;
          all.push(...data);
          if (data.length < 500) break;
        }
        const ids = [...new Set(all.flatMap(r => [r.referrer_id, r.referred_id]))];
        const profiles = [];
        for (let i = 0; i < ids.length; i += 100) {
          const { data, error: failure } = await supabase.from("profiles").select("id,full_name,email").in("id", ids.slice(i, i + 100));
          if (failure) throw failure;
          profiles.push(...data);
        }
        const byId = Object.fromEntries(profiles.map(p => [p.id, p]));
        if (live) { setReferrals(all.map(r => ({ ...r, referrerProfile: byId[r.referrer_id], referredProfile: byId[r.referred_id] }))); setError(""); }
      } catch (failure) { if (live) setError(failure.message); }
      finally { if (live) setLoading(false); }
    };
    load();
    const timer = setInterval(load, 15000);
    return () => { live = false; clearInterval(timer); };
  }, [revision]);
  const filtered = referrals.filter(r => [r.referrerProfile?.full_name, r.referrerProfile?.email, r.referredProfile?.full_name, r.referredProfile?.email].some(v => v?.toLowerCase().includes(search.toLowerCase())));
  const current = referrals.find(r => r.id === selected);
  return <div className="space-y-4">
    <div className="flex justify-between"><h1 className="text-xl font-bold text-heading">Referrals ({referrals.length})</h1><button className="text-accent" onClick={() => setRevision(v => v + 1)}>Refresh</button></div>
    <p className="text-text-muted text-sm">Manage referral records and deposit commissions. The client cards calculate automatically from these records.</p>
    <button className="text-accent" onClick={() => setAdding(v => !v)}>Add missing referral</button>
    {adding && <form onSubmit={addRecord} className="space-y-3 border border-border rounded p-4">
      <p className="text-sm text-text-muted">Attach an existing account that has no referrer. New accounts using a referral link are attached automatically.</p>
      {[['code', 'Referrer code'], ['email', 'Referred account email'], ['reason', 'Reason for correction']].map(([field, label]) => <input key={field} required type={field === 'email' ? 'email' : 'text'} aria-label={label} placeholder={label} value={newRecord[field]} onChange={e => setNewRecord(v => ({ ...v, [field]: e.target.value }))} className="w-full bg-surface-alt border border-border p-2 rounded" />)}
      <button disabled={saving} className="bg-accent text-secondary px-4 py-2 rounded">{saving ? 'Saving…' : 'Add referral record'}</button>
    </form>}
    <input aria-label="Search referrals" placeholder="Search referrer or referred user" value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-surface-alt border border-border p-3 rounded" />
    {error && <p role="alert" className="text-danger">{error}</p>}
    {loading ? <Loader2 className="animate-spin" /> : <div className="space-y-3">{filtered.map(r => <div key={r.id} className="bg-surface-alt border border-border rounded p-4 flex flex-wrap items-center justify-between gap-4">
      <div><p className="text-heading">{r.referrerProfile?.full_name || r.referrerProfile?.email || "Member"} → {r.referredProfile?.full_name || r.referredProfile?.email || "Member"}</p><p className="text-sm text-text-muted">{r.status} · Joined {new Date(r.created_at).toLocaleDateString()}</p></div>
      <button className="text-accent" onClick={() => setSelected(r.id)}>Manage</button>
    </div>)}{!filtered.length && <p>No referrals found.</p>}</div>}
    {current && <ManageReferral key={current.id} referral={current} onClose={() => setSelected(null)} onDone={() => setRevision(v => v + 1)} />}
  </div>;
}
