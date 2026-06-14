import { useState } from "react";
import UploadPaymentModal from "./UploadPaymentModal";
import PaymentTable from "./PaymentTable";

const PaymentDetailsPage = () => {
  const [open, setOpen] = useState(false);
  const [payments, setPayments] = useState([]);

  const handleSubmit = (data) => {
    setPayments((prev) => [
      ...prev,
      { id: crypto.randomUUID(), ...data },
    ]);
  };

  const handleDelete = (id) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <>
      {/* Page heading */}
      <div className="p-6 pb-4 mb-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-heading">
          Payment Details
        </h1>
      </div>

      {/* Upload trigger */}
      <div className="bg-surface p-7 w-[80%] m-auto border border-dashed border-accent rounded-2xl">
        <p
          className="text-center cursor-pointer hover:text-accent my-transition"
          onClick={() => setOpen(true)}
        >
          + Upload payment details
        </p>
        <UploadPaymentModal
          open={open}
          onClose={() => setOpen(false)}
          onSubmit={handleSubmit}
        />
      </div>

      {/* Uploaded payment methods table */}
      <div className="w-[80%] m-auto mt-8">
        <h2 className="mb-4 text-xl font-bold text-heading">
          Uploaded Payment Details
        </h2>
        <PaymentTable payments={payments} onDelete={handleDelete} />
      </div>
    </>
  );
};

export default PaymentDetailsPage;