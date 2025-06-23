"use client";
import { useEffect, useState } from "react";
import {
  IndianRupee,
  NotebookPen,
  MapPinHouse,
  Phone,
  SquarePen,
} from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [allProducts, setAllProducts] = useState([]);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
    outstandingAmount: "",
    defaultProducts: [],
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/products`)
      .then((res) => res.json())
      .then((data) => setAllProducts(data.products || []));
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/customers`
      );
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch {
      setMessage("❌ Failed to fetch customers");
    }
  };

  const startEdit = (customer) => {
    setEditingId(customer._id);
    setForm({
      name: customer.name,
      phone: customer.phone,
      address: customer.address || "",
      notes: customer.notes || "",
      outstandingAmount: customer.outstandingAmount || "",
      defaultProducts: customer.defaultProducts || [],
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({
      name: "",
      phone: "",
      address: "",
      notes: "",
      outstandingAmount: "",
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProductChange = (index, field, value) => {
    const updated = [...form.defaultProducts];
    updated[index][field] = value;
    setForm({ ...form, defaultProducts: updated });
  };

  const addProductRow = () => {
    setForm({
      ...form,
      defaultProducts: [
        ...form.defaultProducts,
        { product: "", customPrice: "" },
      ],
    });
  };

  const removeProduct = (index) => {
    const updated = [...form.defaultProducts];
    updated.splice(index, 1);
    setForm({ ...form, defaultProducts: updated });
  };

  const updateCustomer = async () => {
    try {
      const payload = {
        ...form,
        outstandingAmount: parseFloat(form.outstandingAmount || 0),
        defaultProducts: form.defaultProducts.filter(
          (p) => p.product && p.customPrice
        ),
      };
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/customers/${editingId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error();
      setMessage("✅ Customer updated successfully!");
      setEditingId(null);
      fetchCustomers();
    } catch {
      setMessage("❌ Failed to update customer");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded mt-6">
      <h1 className="text-2xl font-bold mb-4">Customers</h1>

      {message && (
        <p className="mb-4 text-center text-sm text-blue-600">{message}</p>
      )}

      <ul className="space-y-4">
        {customers.map((c) => (
          <li key={c._id} className="border p-4 rounded">
            {editingId === c._id ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="p-2 border rounded"
                  />
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="p-2 border rounded"
                  />
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="p-2 border rounded"
                  />
                  <input
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    className="p-2 border rounded"
                  />
                  <input
                    name="outstandingAmount"
                    type="number"
                    value={form.outstandingAmount}
                    onChange={handleChange}
                    className="p-2 border rounded"
                  />
                </div>
                <h2 className="mt-4 font-semibold">Default Products</h2>
                {form.defaultProducts.map((dp, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <select
                      value={dp.product}
                      onChange={(e) =>
                        handleProductChange(idx, "product", e.target.value)
                      }
                      className="p-2 border rounded flex-1"
                    >
                      <option value="">Select Product</option>
                      {allProducts.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={dp.customPrice}
                      onChange={(e) =>
                        handleProductChange(idx, "customPrice", e.target.value)
                      }
                      className="w-32 p-2 border rounded"
                      placeholder="Price"
                    />
                    <button
                      type="button"
                      onClick={() => removeProduct(idx)}
                      className="text-red-600 font-bold px-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addProductRow}
                  className="text-sm text-blue-600 underline mt-1"
                >
                  + Add Product
                </button>

                <div className="mt-2 flex gap-2">
                  <button
                    onClick={updateCustomer}
                    className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="bg-gray-400 text-white px-4 py-1 rounded hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold">{c.name}</p>
                  <p className="text-sm flex items-center gap-3">
                    <Phone size={15} /> {c.phone}
                  </p>
                  {c.address && (
                    <p className="text-sm flex items-center gap-3">
                      <MapPinHouse size={15} /> {c.address}
                    </p>
                  )}
                  {c.notes && (
                    <p className="text-sm flex items-center gap-3">
                      <NotebookPen size={15} /> {c.notes}
                    </p>
                  )}
                  <p className="text-sm flex items-center gap-3">
                    <IndianRupee size={15} /> {c.outstandingAmount}
                  </p>
                </div>
                <button
                  onClick={() => startEdit(c)}
                  className="text-blue-600 hover:underline"
                >
                  <SquarePen />
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
