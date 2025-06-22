"use client";
import { useEffect, useState } from "react";

export default function UpdateProduct() {
  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState({ name: "", unit: "", defaultPrice: "" });
  const [message, setMessage] = useState("");

  // Fetch all products
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []));
  }, []);

  // When product selected, load its values
  useEffect(() => {
    const selected = products.find((p) => p._id === selectedId);
    if (selected) {
      setForm({
        name: selected.name,
        unit: selected.unit,
        defaultPrice: selected.defaultPrice,
      });
    }
  }, [selectedId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/products/${selectedId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      if (!res.ok) throw new Error();
      setMessage("✅ Product updated!");
    } catch {
      setMessage("❌ Update failed");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Update Product</h1>

      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      >
        <option value="">Select product to update</option>
        {products.map((p) => (
          <option key={p._id} value={p._id}>
            {p.name}
          </option>
        ))}
      </select>

      {selectedId && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Product Name"
            required
          />

          <select
            name="unit"
            value={form.unit}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select unit</option>
            <option value="litre">litre</option>
            <option value="kg">kg</option>
            <option value="pcs">pcs</option>
            <option value="other">other</option>
          </select>

          <input
            name="defaultPrice"
            type="number"
            value={form.defaultPrice}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Default Price"
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Update Product
          </button>
        </form>
      )}

      {message && <p className="mt-4 text-center text-sm">{message}</p>}
    </div>
  );
}
