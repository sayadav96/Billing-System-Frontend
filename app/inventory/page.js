"use client";
import { useEffect, useState } from "react";

export default function AddInventory() {
  const [date, setDate] = useState("");
  const [items, setItems] = useState([{ product: "", quantity: "" }]);
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");

  // Fetch product list on mount
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data.products))
      .catch(() => setProducts([]));
  }, []);

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { product: "", quantity: "" }]);
  };

  const removeItem = (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_DOMAIN}/api/inventory`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date, items }),
        }
      );

      if (!res.ok) throw new Error();
      setMessage("✅ Inventory added successfully");
      setDate("");
      setItems([{ product: "", quantity: "" }]);
    } catch {
      setMessage("❌ Failed to add inventory");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Add Inventory</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="w-full border p-2 rounded"
        />

        {items.map((item, index) => (
          <div key={index} className="flex gap-2 items-center">
            <select
              value={item.product}
              onChange={(e) =>
                handleItemChange(index, "product", e.target.value)
              }
              className="flex-1 border p-2 rounded"
              required
            >
              <option value="">Select product</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.unit})
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Qty"
              value={item.quantity}
              onChange={(e) =>
                handleItemChange(index, "quantity", e.target.value)
              }
              className="w-24 border p-2 rounded"
              required
            />

            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-red-600 font-bold px-2"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="text-sm bg-gray-100 px-4 py-2 rounded"
        >
          + Add Item
        </button>

        <button
          type="submit"
          className="block w-full bg-blue-600 text-white py-2 rounded"
        >
          Submit
        </button>
      </form>

      {message && <p className="mt-4 text-center text-sm">{message}</p>}
    </div>
  );
}
