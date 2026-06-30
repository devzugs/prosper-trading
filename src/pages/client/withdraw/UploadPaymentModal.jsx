import { useState } from "react";
import { CreditCard, Landmark, Bitcoin, X } from "lucide-react";
import CreditCardFields from "./payment-details/CreditCardFields";
import WireTransferFields from "./payment-details/WireTransferFields";
import CryptoFields from "./payment-details/CryptoFields";


export default function UploadPaymentModal({ open, onClose, onSubmit }) {
  const [activeTab, setActiveTab] = useState("card");

  const [formData, setFormData] = useState({
    cardHolder: "", cardNumber: "", expiry: "", cvv: "",
    bankName: "", accountName: "", accountNumber: "", swiftCode: "",
    network: "", walletAddress: "",
  });

  if (!open) return null;

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({ type: activeTab, data: formData });
    onClose?.();
  };

  const tabs = [
    { id: "card", label: "Credit Card", icon: CreditCard },
    { id: "wire", label: "Wire Transfer", icon: Landmark },
    { id: "crypto", label: "Crypto Address", icon: Bitcoin },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-(--radius-xl) bg-surface shadow-2xl animate-pop-out flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-heading">
              Upload Payment Method
            </h2>
            <p className="text-sm text-text-muted mt-1">
              Add a new payment destination
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-text-light my-transition hover:bg-surface-alt hover:text-heading"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-border p-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-medium my-transition
                  ${
                    activeTab === tab.id
                      ? "bg-primary text-white shadow-sm"
                      : "bg-surface-alt text-text-muted hover:bg-border hover:text-text"
                  }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col flex-1">
          
          {/* Dynamic Field Injection */}
          <div className="flex-1">
            {activeTab === "card" && (
              <CreditCardFields formData={formData} updateField={updateField} />
            )}
            {activeTab === "wire" && (
              <WireTransferFields formData={formData} updateField={updateField} />
            )}
            {activeTab === "crypto" && (
              <CryptoFields formData={formData} updateField={updateField} />
            )}
          </div>

          {/* Footer Actions */}
          <div className="mt-3 flex justify-end gap-3 pt-3 border-t border-border/50">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-5 py-3 font-medium text-text my-transition hover:bg-surface-alt hover:text-heading"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-primary px-5 py-3 font-medium text-white my-transition hover:bg-primary-light shadow-md"
            >
              Save Payment Method
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}