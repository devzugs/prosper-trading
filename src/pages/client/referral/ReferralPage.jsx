import React, { useState, useEffect } from "react";
import ReferralStats from "./ReferralStats";
import ReferralLinkCard from "./ReferralLinkCard";
import ReferralTiers from "./ReferralTiers";
import ReferredUsersTable from "./ReferredUsersTable";
import { supabase } from "../../../lib/supabaseClient";
import { useAuth } from "../../../context/AuthContext";
import { Loader2 } from "lucide-react";

const ReferralPage = () => {
  const { user, profile } = useAuth();
  const [referredUsers, setReferredUsers] = useState([]);
  const [stats, setStats] = useState({ totalReferrals: 0, totalEarned: 0, activeReferrals: 0, pendingPayouts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchReferralsData = async () => {
      const { data: refs, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching referrals:", error);
        setLoading(false);
        return;
      }

      const referredIds = refs.map(r => r.referred_id);
      let profilesMap = {};
      
      if (referredIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', referredIds);
          
        profilesMap = (profiles || []).reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
      }

      // Aligning this payload exactly with ReferredUsersTable expectations
      const combinedUsers = refs.map(r => {
        const name = profilesMap[r.referred_id]?.full_name || "Unknown User";
        return {
          id: r.id,
          name: name,
          initials: name.substring(0, 2).toUpperCase(),
          status: r.status || 'pending',
          plan: 'Standard', // Expand this logic when you add investment plans
          joinedDate: r.created_at,
          totalDeposited: 0, // Placeholder until deposit ledger joining is implemented
          commissionEarned: r.commission_amount || 0
        };
      });

      setReferredUsers(combinedUsers);

      const { data: txs } = await supabase
        .from('transactions')
        .select('amount, status')
        .eq('user_id', user.id)
        .eq('type', 'referral_bonus')
        .in('status', ['completed', 'pending']);

      const totalEarned = (txs || [])
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const pendingPayouts = (txs || [])
        .filter(t => t.status === 'pending')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      setStats({
        totalReferrals: combinedUsers.length,
        totalEarned,
        activeReferrals: combinedUsers.filter(u => u.status === 'active').length,
        pendingPayouts
      });
      
      setLoading(false);
    };

    fetchReferralsData();
  }, [user]);

  return (
    <div className="min-h-screen">
      <div className="p-6 pb-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-heading">Affiliate Program</h1>
        <p className="text-sm text-text-muted mt-1">Invite friends and earn up to 15% of their trading fees.</p>
      </div>

      <div className="p-6 space-y-6">
        {loading ? (
          <div className="flex justify-center p-10"><Loader2 className="animate-spin text-accent" /></div>
        ) : (
          <>
            <ReferralStats stats={stats} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pass the new short code instead of UUID */}
              <div className="lg:col-span-2">
                <ReferralLinkCard referralCode={profile?.referral_code} />
              </div>
              <div className="lg:col-span-1">
                <ReferralTiers activeReferrals={stats.activeReferrals} />
              </div>
            </div>
            <ReferredUsersTable users={referredUsers} />
          </>
        )}
      </div>
    </div>
  );
};

export default ReferralPage;