import { useState } from "react";
import { Plus } from "lucide-react";
import UploadPaymentModal from "./UploadPaymentModal";

export default function PaymentUploadCard({ onSubmit }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-surface p-7 w-[80%] m-auto border border-dashed border-accent rounded-2xl">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-1.5 text-text-muted my-transition hover:text-accent"
      >
        <Plus size={16} />
        Upload payment details
      </button>

      <UploadPaymentModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={(data) => {
          onSubmit?.(data);
          setOpen(false);
        }}
      />
    </div>
  );
}