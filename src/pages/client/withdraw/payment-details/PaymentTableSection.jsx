import PaymentTable from "./PaymentTable";

export default function PaymentTableSection({ payments, onDelete }) {
  return (
    <div className="w-[80%] m-auto mt-8">
      <h2 className="mb-4 text-xl font-bold text-heading">
        Uploaded Payment Details
      </h2>
      <PaymentTable payments={payments} onDelete={onDelete} />
    </div>
  );
}