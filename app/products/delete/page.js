"use client";
import { useEffect, useState } from "react";

export default function DeleteProduct() {
  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [message, setMessage] = useState("");

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/products`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async () => {
    if (!selectedId) return;

    const confirm = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirm) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/products/${selectedId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) throw new Error();

      setMessage("✅ Product deleted successfully");
      setSelectedId("");
      fetchProducts(); // refresh list
    } catch {
      setMessage("❌ Failed to delete product");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Delete Product</h1>

      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      >
        <option value="">Select a product to delete</option>
        {products.map((p) => (
          <option key={p._id} value={p._id}>
            {p.name} ({p.unit})
          </option>
        ))}
      </select>

      <button
        disabled={!selectedId}
        onClick={handleDelete}
        className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:opacity-50"
      >
        Delete Product
      </button>

      {message && <p className="mt-4 text-center text-sm">{message}</p>}
    </div>
  );
}
