import { useState, useEffect } from "react";
import UploadPaymentModal from "../UploadPaymentModal"; // Check your relative import path
import PaymentTable from "./PaymentTable";
import { supabase } from "../../../../lib/supabaseClient";
import { useAuth } from "../../../../context/AuthContext";
import { Loader2 } from "lucide-react";

const PaymentDetailsPage = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch saved methods on load
  useEffect(() => {
    if (!user) return;
    
    const fetchMethods = async () => {
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) console.error("Error fetching methods:", error);
      else setPayments(data || []);
      
      setLoading(false);
    };

    fetchMethods();
  }, [user]);

  // 2. Insert new method into Supabase
  const handleSubmit = async (payload) => {
    // payload from modal looks like: { type: 'card', data: { ...fields } }
    const { data: newMethod, error } = await supabase
      .from("payment_methods")
      .insert({
        user_id: user.id,
        method: payload.type, // 'card', 'wire', or 'crypto' (matches your DB constraint)
        label: payload.type.toUpperCase() + " Destination", // You can refine this labeling
        details: payload.data // The JSON blob of the fields
      })
      .select()
      .single();

    if (error) {
      alert("Failed to save payment method: " + error.message);
      return;
    }
    
    setPayments((prev) => [newMethod, ...prev]);
  };

  // 3. Delete from Supabase
  const handleDelete = async (id) => {
    const { error } = await supabase
      .from("payment_methods")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id); // Security: ensure they own it

    if (error) {
      alert("Failed to delete: " + error.message);
    } else {
      setPayments((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <>
      <div className="p-6 pb-4 mb-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-heading">
          Payment Details
        </h1>
      </div>

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

      <div className="w-[80%] m-auto mt-8">
        <h2 className="mb-4 text-xl font-bold text-heading">
          Saved Payment Details
        </h2>
        {loading ? (
           <div className="flex justify-center p-6 text-accent"><Loader2 className="animate-spin" /></div>
        ) : (
           <PaymentTable payments={payments} onDelete={handleDelete} />
        )}
      </div>
    </>
  );
};

export default PaymentDetailsPage;