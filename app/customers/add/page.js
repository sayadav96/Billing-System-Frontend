"use client";
import { useEffect, useState } from "react";

export default function AddCustomer() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
    outstandingAmount: "",
  });

  const [defaultProducts, setDefaultProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/products`)
      .then((res) => res.json())
      .then((data) => setAllProducts(data.products || []));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProductChange = (index, field, value) => {
    const updated = [...defaultProducts];
    updated[index][field] = value;
    setDefaultProducts(updated);
  };

  const addProductRow = () => {
    setDefaultProducts([...defaultProducts, { product: "", customPrice: "" }]);
  };

  const removeProductRow = (index) => {
    const updated = [...defaultProducts];
    updated.splice(index, 1);
    setDefaultProducts(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        outstandingAmount: parseFloat(form.outstandingAmount || 0),
        defaultProducts: defaultProducts.filter(
          (p) => p.product && p.customPrice
        ),
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/customers`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error();
      setMessage("✅ Customer added successfully!");
      setForm({
        name: "",
        phone: "",
        address: "",
        notes: "",
        outstandingAmount: "",
      });
      setDefaultProducts([]);
    } catch {
      setMessage("❌ Failed to add customer");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Add Customer</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <input
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          name="notes"
          placeholder="Notes"
          value={form.notes}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          name="outstandingAmount"
          placeholder="Outstanding Amount"
          type="number"
          value={form.outstandingAmount}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        {/* Default Products Section */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold">Default Products</h2>
            <button
              type="button"
              onClick={addProductRow}
              className="text-sm text-blue-600 underline"
            >
              + Add Product
            </button>
          </div>

          {defaultProducts.map((item, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <select
                value={item.product}
                onChange={(e) =>
                  handleProductChange(idx, "product", e.target.value)
                }
                className="flex-1 p-2 border rounded"
              >
                <option value="">Select product</option>
                {allProducts.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Custom Price"
                value={item.customPrice}
                onChange={(e) =>
                  handleProductChange(idx, "customPrice", e.target.value)
                }
                className="w-32 p-2 border rounded"
              />
              <button
                type="button"
                onClick={() => removeProductRow(idx)}
                className="text-red-600 font-bold px-2"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </form>

      {message && <p className="mt-4 text-center text-sm">{message}</p>}
    </div>
  );
}
