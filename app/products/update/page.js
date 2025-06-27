"use client";
import { useEffect, useState } from "react";

export default function UpdateProduct() {
  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState({ name: "", unit: "", defaultPrice: "" });
  const [priceDelta, setPriceDelta] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []));
  }, []);

  useEffect(() => {
    const selected = products.find((p) => p._id === selectedId);
    if (selected) {
      setForm({
        name: selected.name,
        unit: selected.unit,
        defaultPrice: selected.defaultPrice,
      });
      setPriceDelta(0);
    }
  }, [selectedId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/products/${selectedId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            unit: form.unit,
          }),
        }
      );
      if (!res.ok) throw new Error();
      setMessage("✅ Product info updated!");
    } catch {
      setMessage("❌ Info update failed");
    }
  };

  const handlePriceChange = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/priceUpdate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: selectedId,
            priceIncrement: Number(priceDelta),
          }),
        }
      );
      if (!res.ok) throw new Error();
      setMessage("✅ Price updated and applied to all customers!");
      setPriceDelta(0);
    } catch {
      setMessage("❌ Global price update failed");
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
        <>
          <form onSubmit={handleUpdateInfo} className="space-y-4">
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
              value={form.defaultPrice}
              disabled
              className="w-full p-2 border rounded bg-gray-100 text-gray-600"
              placeholder="Default Price"
            />

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Update Info
            </button>
          </form>

          <div className="mt-6 border-t pt-4">
            <h2 className="font-semibold mb-2">Change Price (₹)</h2>
            <div className="flex gap-2">
              <input
                type="number"
                value={priceDelta ? priceDelta : ""}
                onChange={(e) => setPriceDelta(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="e.g. +2 or -1"
              />
              <button
                onClick={handlePriceChange}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Update Price
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This will update the price globally in all customer default
              products.
            </p>
          </div>
        </>
      )}

      {message && <p className="mt-4 text-center text-sm">{message}</p>}
    </div>
  );
}
