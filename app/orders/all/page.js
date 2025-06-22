"use client";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({
    customer: "",
    billedBy: "",
    isReturn: "",
    startDate: "",
    endDate: "",
  });
  const [customers, setCustomers] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [filters, page]);

  const fetchCustomers = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/customers`);
    const data = await res.json();
    setCustomers(data.customers || []);
  };

  const fetchOrders = async () => {
    const params = new URLSearchParams();

    if (filters.customer) params.append("customer", filters.customer);
    if (filters.billedBy) params.append("billedBy", filters.billedBy);
    if (filters.isReturn !== "") params.append("isReturn", filters.isReturn);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_DOMAIN}/api/orders?${params.toString()}`
    );
    const data = await res.json();

    const sorted = data.orders.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    setOrders(sorted || []);
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this order?"
    );
    if (!confirm) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/orders/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) throw new Error();
      setMessage("✅ Order deleted successfully");
      fetchOrders();
    } catch {
      setMessage("❌ Failed to delete order");
    }
  };

  const paginatedOrders = orders.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(orders.length / limit);

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow rounded mt-6">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>

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

        <input
          type="text"
          placeholder="Billed By"
          value={filters.billedBy}
          onChange={(e) => setFilters({ ...filters, billedBy: e.target.value })}
          className="p-2 border rounded"
        />

        <select
          value={filters.isReturn}
          onChange={(e) => setFilters({ ...filters, isReturn: e.target.value })}
          className="p-2 border rounded"
        >
          <option value="">All Orders</option>
          <option value="false">Regular</option>
          <option value="true">Returns</option>
        </select>

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

      {/* Order Cards */}
      <ul className="space-y-4">
        {paginatedOrders.map((order) => (
          <li
            key={order._id}
            className={`border p-4 rounded relative ${
              order.isReturn ? "bg-red-100" : "bg-green-100"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">
                  {order.customer?.name || "Unknown Customer"}
                </p>
                <p className="text-sm">Billed By: {order.billedBy || "-"}</p>
                <p className="text-sm">
                  Date: {new Date(order.date).toLocaleDateString()}
                </p>
                <p className="text-sm">
                  Outstanding: ₹ {order.outstandingAtTime}
                </p>
                <p className="text-sm">
                  Total: ₹ {order.totalAmount.toFixed(2)}
                </p>

                <ul className="list-disc ml-4 text-sm mt-2">
                  {order.products.map((p) => (
                    <li key={p._id}>
                      {p.product?.name || "Unknown"} – {p.quantity} × ₹
                      {p.rateAtPurchase}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => handleDelete(order._id)}
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
