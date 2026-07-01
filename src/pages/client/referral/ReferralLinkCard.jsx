import React from "react";
import { Link2 } from "lucide-react";
import CopyBtn from "../deposit/CopyBtn";

const ReferralLinkCard = ({ referralCode }) => {
  // Use window.location.origin to dynamically adapt to localhost or production
  const domain = window.location.origin;
  const referralLink = `${domain}/signup?ref=${referralCode || "loading..."}`;

  return (
    <div className="bg-surface-alt rounded-xl border border-border p-6">
      <div className="flex items-center gap-3 mb-5">
        <span className="bg-accent/10 p-2 rounded-lg">
          <Link2 size={18} className="text-accent" />
        </span>
        <div>
          <h3 className="text-base font-semibold text-heading">Your Referral Link</h3>
          <p className="text-xs text-text-muted mt-0.5">
            Share this link — you'll earn a commission on every deposit your referrals make.
          </p>
        </div>
      </div>

      <div className="bg-secondary border border-border rounded-lg px-4 py-3 flex items-center gap-3 overflow-hidden mb-3">
        <code className="text-sm text-accent font-mono flex-1 break-all leading-relaxed">
          {referralLink}
        </code>
        <CopyBtn text={referralLink} />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-text-muted">Referral code:</span>
        <span className="text-xs font-semibold text-heading bg-surface border border-border rounded-md px-2.5 py-1">
          {referralCode || "---"}
        </span>
        <CopyBtn text={referralCode || ""} />
      </div>
    </div>
  );
};

export default ReferralLinkCard;