"use client";
import { useState } from "react";

export default function AddProduct() {
  const [form, setForm] = useState({
    name: "",
    unit: "",
    defaultPrice: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to add product");
      setMessage("✅ Product added successfully");
      setForm({ name: "", unit: "", defaultPrice: "" });
    } catch {
      setMessage("❌ Failed to add product");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Add Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          placeholder="Product name"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        <select
          name="unit"
          value={form.unit}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
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
          placeholder="Default price"
          value={form.defaultPrice}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </form>

      {message && <p className="mt-4 text-sm text-center">{message}</p>}
    </div>
  );
}
