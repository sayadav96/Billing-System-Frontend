"use client";
import { useEffect, useState } from "react";

export default function AddPaymentPage() {
  const [customers, setCustomers] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [outstanding, setOutstanding] = useState(0);
  const [form, setForm] = useState({
    customer: "",
    amount: "",
    modeOfPayment: "cash",
    paidTo: "",
    notes: "",
  });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/customers`)
      .then((res) => res.json())
      .then((data) => setCustomers(data.customers || []));
  }, []);

  const handleCustomerSelect = async (id) => {
    setForm({ ...form, customer: id });

    const selectedCustomer = customers.find((c) => c._id === id);
    setOutstanding(selectedCustomer?.outstandingAmount || 0);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/payments?customer=${id}`
      );
      const data = await res.json();
      const sorted = (data.payments || [])
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
      setRecentPayments(sorted);
    } catch {
      setRecentPayments([]);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.customer || !form.amount || !form.modeOfPayment) {
      setMessage("❌ Please fill all required fields");
      return;
    }

    const payload = {
      ...form,
      amount: parseFloat(form.amount),
    };

    try {
      setSubmitting(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      setMessage("✅ Payment added successfully");
      setForm({
        customer: "",
        amount: "",
        modeOfPayment: "cash",
        paidTo: "",
        notes: "",
      });
      setRecentPayments([]);
      setOutstanding(0);
    } catch {
      setMessage("❌ Failed to add payment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded mt-6">
      {/* Show recent payments and outstanding */}
      {form.customer && (
        <div className="mt-6">
          <p className="font-semibold text-lg mb-2">
            Outstanding: ₹{outstanding.toFixed(2)}
          </p>

          <h3 className="font-bold mb-2">Last 5 Payments</h3>
          {recentPayments.length === 0 ? (
            <p className="text-gray-500 my-10">No payments found</p>
          ) : (
            <table className="w-full text-sm border rounded-t-2xl">
              <thead className="rounded-t-2xl">
                <tr className="bg-blue-100">
                  <th className="p-2 border" >Date</th>
                  <th className="p-2 border">Amount</th>
                  <th className="p-2 border">Mode</th>
                  <th className="p-2 border">Paid To</th>
                  <th className="p-2 border">Notes</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((p) => (
                  <tr key={p._id} className="text-center">
                    <td className="p-2 border">
                      {new Date(p.date).toLocaleDateString()}
                    </td>
                    <td className="p-2 border">₹{p.amount}</td>
                    <td className="p-2 border">{p.modeOfPayment}</td>
                    <td className="p-2 border">{p.paidTo || "-"}</td>
                    <td className="p-2 border">{p.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      <h1 className="text-2xl font-bold mb-4">Add Payment</h1>

      {message && <p className="mb-4 text-blue-600">{message}</p>}

      <div className="grid gap-4">
        <select
          name="customer"
          value={form.customer}
          onChange={(e) => handleCustomerSelect(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">Select Customer</option>
          {customers.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          name="amount"
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
          className="p-2 border rounded"
        />

        <select
          name="modeOfPayment"
          value={form.modeOfPayment}
          onChange={handleChange}
          className="p-2 border rounded"
        >
          <option value="cash">Cash</option>
          <option value="online">Online</option>
          <option value="cheque">Cheque</option>
          <option value="cash + online">Cash + Online</option>
          <option value="cash + cheque">Cash + Cheque</option>
          <option value="cheque + online">Cheque + Online</option>
        </select>

        <input
          name="paidTo"
          placeholder="Paid To"
          value={form.paidTo}
          onChange={handleChange}
          className="p-2 border rounded"
        />

        <input
          name="notes"
          placeholder="Notes"
          value={form.notes}
          onChange={handleChange}
          className="p-2 border rounded"
        />

        <button
          disabled={submitting}
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {submitting ? "Submitting..." : "Add Payment"}
        </button>
      </div>
    </div>
  );
}
