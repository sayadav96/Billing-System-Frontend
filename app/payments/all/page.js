"use client";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [filters, setFilters] = useState({
    customer: "",
    modeOfPayment: "",
    paidTo: "",
    startDate: "",
    endDate: "",
  });
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [filters, page]);

  const fetchCustomers = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/customers`);
    const data = await res.json();
    setCustomers(data.customers || []);
  };

  const fetchPayments = async () => {
    const params = new URLSearchParams();

    if (filters.customer) params.append("customer", filters.customer);
    if (filters.modeOfPayment)
      params.append("modeOfPayment", filters.modeOfPayment);
    if (filters.paidTo) params.append("paidTo", filters.paidTo);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_DOMAIN}/api/payments?${params.toString()}`
    );
    const data = await res.json();

    // Show latest payments first
    const sorted = data.payments.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    setPayments(sorted || []);
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this payment?"
    );
    if (!confirm) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/payments/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setMessage("✅ Payment deleted successfully");
      fetchPayments();
    } catch {
      setMessage("❌ Failed to delete payment");
    }
  };

  const paginated = payments.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(payments.length / limit);

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow rounded mt-6">
      <h1 className="text-2xl font-bold mb-4">All Payments</h1>

      {message && <p className="text-blue-600 text-center mb-4">{message}</p>}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <select
          value={filters.customer}
          onChange={(e) => setFilters({ ...filters, customer: e.target.value })}
          className="p-2 border rounded"
        >
          <option value="">All Customers</option>
          {customers.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={filters.modeOfPayment}
          onChange={(e) =>
            setFilters({ ...filters, modeOfPayment: e.target.value })
          }
          className="p-2 border rounded"
        >
          <option value="">All Modes</option>
          <option value="cash">Cash</option>
          <option value="online">Online</option>
          <option value="cheque">Cheque</option>
          <option value="cash + online">Cash + Online</option>
          <option value="cash + cheque">Cash + Cheque</option>
          <option value="cheque + online">Cheque + Online</option>
        </select>

        <input
          type="text"
          placeholder="Paid To"
          value={filters.paidTo}
          onChange={(e) => setFilters({ ...filters, paidTo: e.target.value })}
          className="p-2 border rounded"
        />

        <input
          type="date"
          value={filters.startDate}
          onChange={(e) =>
            setFilters({ ...filters, startDate: e.target.value })
          }
          className="p-2 border rounded"
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          className="p-2 border rounded"
        />
      </div>

      {/* Payment cards */}
      <ul className="space-y-4">
        {paginated.map((p) => (
          <li key={p._id} className="border p-4 rounded bg-blue-50 relative">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{p.customer?.name || "Unknown"}</p>
                <p className="text-sm">
                  Date: {new Date(p.date).toLocaleDateString()}
                </p>
                <p className="text-sm">Amount: ₹{p.amount.toFixed(2)}</p>
                <p className="text-sm">Mode: {p.modeOfPayment}</p>
                <p className="text-sm">Paid To: {p.paidTo || "-"}</p>
                {p.notes && <p className="text-sm">Notes: {p.notes}</p>}
              </div>
              <button
                onClick={() => handleDelete(p._id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Pagination */}
      <div className="flex justify-center mt-6 gap-2">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-3 py-1">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
