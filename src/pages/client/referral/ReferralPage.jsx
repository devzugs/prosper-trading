// src/pages/client/referral/ReferralPage.jsx
import React from "react";
import { Gift } from "lucide-react";
import ReferralStats from "./ReferralStats";
import ReferralLinkCard from "./ReferralLinkCard";
import ReferralTiers from "./ReferralTiers";
import ReferredUsersTable from "./ReferredUsersTable";

const ReferralPage = () => {
  return (
    <div className="min-h-screen">
      {/* ── Page header ── */}
      <div className="p-6 pb-2 flex items-center gap-3">
        <span className="bg-accent/10 p-2.5 rounded-xl">
          <Gift size={22} className="text-accent" />
        </span>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-heading">Referral Program</h1>
          <p className="text-sm text-text-muted mt-0.5">
            Invite friends to Prosper Trading and earn a commission on every deposit they make.
          </p>
        </div>
      </div>

      <div className="p-6 space-y-8">
        <ReferralStats />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <ReferralLinkCard />
          </div>
          <div className="lg:col-span-3">
            <ReferralTiers />
          </div>
        </div>

        <ReferredUsersTable />
      </div>
    </div>
  );
};

export default ReferralPage;