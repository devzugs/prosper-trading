// src/pages/client/referral/ReferralLinkCard.jsx
import React from "react";
import { Link2, Mail, MessageCircle, Share2 } from "lucide-react";
import CopyBtn from "../deposit/CopyBtn";

const REFERRAL_CODE = "PROSPER-JAY284";
const REFERRAL_LINK = `https://prospertrading.com/signup?ref=${REFERRAL_CODE}`;

const ShareButton = ({ icon: Icon, label, href }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-light my-transition hover:border-accent/40 hover:text-white"
  >
    <Icon size={15} className="text-accent" />
    {label}
  </a>
);

const ReferralLinkCard = () => {
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
          {REFERRAL_LINK}
        </code>
        <CopyBtn text={REFERRAL_LINK} />
      </div>

      <div className="flex items-center gap-2 mb-5">
        <span className="text-xs text-text-muted">Referral code:</span>
        <span className="text-xs font-semibold text-heading bg-surface border border-border rounded-md px-2.5 py-1">
          {REFERRAL_CODE}
        </span>
        <CopyBtn text={REFERRAL_CODE} />
      </div>

      {/* <div className="grid grid-cols-3 gap-2">
        <ShareButton
          icon={Mail}
          label="Email"
          href={`mailto:?subject=Join%20Prosper%20Trading&body=${encodeURIComponent(
            `Join me on Prosper Trading: ${REFERRAL_LINK}`
          )}`}
        />
        <ShareButton
          icon={MessageCircle}
          label="WhatsApp"
          href={`https://wa.me/?text=${encodeURIComponent(`Join me on Prosper Trading: ${REFERRAL_LINK}`)}`}
        />
        <ShareButton
          icon={Share2}
          label="X / Twitter"
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join me on Prosper Trading: ${REFERRAL_LINK}`)}`}
        />
      </div> */}
    </div>
  );
};

export default ReferralLinkCard;