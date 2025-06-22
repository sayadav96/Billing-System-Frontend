"use client";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

export default function AddOrderPage() {
  const [customers, setCustomers] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [form, setForm] = useState({
    customer: "",
    billedBy: "",
    isReturn: false,
    products: [],
  });
  const [extraProductId, setExtraProductId] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
  }, []);

  const fetchCustomers = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/customers`);
    const data = await res.json();
    setCustomers(data.customers || []);
  };

  const fetchProducts = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/products`);
    const data = await res.json();
    setAllProducts(data.products || []);
  };

  const handleCustomerChange = (id) => {
    const customer = customers.find((c) => c._id === id);

    const defaultMapped = (customer?.defaultProducts || []).map((dp) => {
      const productDetail = allProducts.find((p) => p._id === dp.product);
      return {
        product: dp.product,
        rateAtPurchase: dp.customPrice || productDetail?.defaultPrice || 0,
        quantity: 0,
      };
    });

    setForm((prev) => ({
      ...prev,
      customer: id,
      products: defaultMapped,
    }));
  };

  const handleProductChange = (productId, field, value) => {
    const updated = [...form.products];
    const index = updated.findIndex((p) => p.product === productId);

    if (index > -1) {
      updated[index][field] = value;
    } else {
      updated.push({
        product: productId,
        rateAtPurchase: field === "rateAtPurchase" ? value : 0,
        quantity: field === "quantity" ? value : 0,
      });
    }

    setForm({ ...form, products: updated });
  };

  const removeProduct = (productId) => {
    const filtered = form.products.filter((p) => p.product !== productId);
    setForm({ ...form, products: filtered });
  };

  const addExtraProduct = () => {
    if (!extraProductId) return;

    const alreadyAdded = form.products.find(
      (p) => p.product === extraProductId
    );
    if (alreadyAdded) return;

    const prod = allProducts.find((p) => p._id === extraProductId);
    if (!prod) return;

    setForm((prev) => ({
      ...prev,
      products: [
        ...prev.products,
        {
          product: prod._id,
          rateAtPurchase: prod.defaultPrice,
          quantity: 0,
        },
      ],
    }));

    setExtraProductId("");
  };

  const calculateTotal = () => {
    return form.products.reduce((sum, item) => {
      const rate = parseFloat(item.rateAtPurchase || 0);
      const qty = parseFloat(item.quantity || 0);
      return sum + rate * qty;
    }, 0);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const totalAmount = calculateTotal();

    const payload = {
      customer: form.customer,
      billedBy: form.billedBy,
      isReturn: form.isReturn,
      products: form.products
        .filter((p) => parseFloat(p.quantity) > 0)
        .map((p) => ({
          product: p.product,
          rateAtPurchase: parseFloat(p.rateAtPurchase),
          quantity: parseFloat(p.quantity),
        })),
      totalAmount,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      setMessage("✅ Order created successfully");
      setForm({
        customer: "",
        billedBy: "",
        isReturn: false,
        products: [],
      });
    } catch {
      setMessage("❌ Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded mt-6">
      <h1 className="text-2xl font-bold mb-4">Add Order</h1>

      {message && <p className="mb-4 text-blue-600">{message}</p>}

      <div className="grid gap-4">
        <select
          value={form.customer}
          onChange={(e) => handleCustomerChange(e.target.value)}
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
          placeholder="Billed By"
          value={form.billedBy}
          onChange={(e) => setForm({ ...form, billedBy: e.target.value })}
          className="p-2 border rounded"
        />

        {/* Toggle switch */}
        <div className="flex items-center gap-3">
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={form.isReturn}
                onChange={(e) =>
                  setForm({ ...form, isReturn: e.target.checked })
                }
              />
              <div className="block bg-gray-300 w-14 h-8 rounded-full"></div>
              <div
                className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${
                  form.isReturn ? "translate-x-full bg-blue-600" : ""
                }`}
              ></div>
            </div>
            <span className="ml-3 text-sm">Return Order?</span>
          </label>
        </div>

        {/* Products */}
        <div className="space-y-4">
          {form.products.map((p) => {
            const prodInfo = allProducts.find((pr) => pr._id === p.product);
            return (
              <div
                key={p.product}
                className="border p-4 rounded grid grid-cols-1 md:grid-cols-4 gap-2 items-center"
              >
                <div className="flex justify-between">
                  <p className="font-semibold">{prodInfo?.name || "Unknown"}</p>
                  <button
                    onClick={() => removeProduct(p.product)}
                    className="text-red-600 hover:text-red-800"
                    title="Remove"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                <input
                  type="number"
                  placeholder="Rate"
                  value={p.rateAtPurchase}
                  onChange={(e) =>
                    handleProductChange(
                      p.product,
                      "rateAtPurchase",
                      e.target.value
                    )
                  }
                  className="p-2 border rounded"
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={p.quantity}
                  onChange={(e) =>
                    handleProductChange(p.product, "quantity", e.target.value)
                  }
                  className="p-2 border rounded"
                />
              </div>
            );
          })}

          {/* Add more product dropdown */}
          {form.customer && (
            <div className="flex gap-3 items-center mt-2">
              <select
                value={extraProductId}
                onChange={(e) => setExtraProductId(e.target.value)}
                className="p-2 border rounded w-full"
              >
                <option value="">Add More Product</option>
                {allProducts
                  .filter(
                    (p) => !form.products.some((fp) => fp.product === p._id)
                  )
                  .map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.unit})
                    </option>
                  ))}
              </select>
              <button
                onClick={addExtraProduct}
                className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
              >
                Add
              </button>
            </div>
          )}
        </div>

        <div className="text-right font-semibold text-lg mt-4">
          Total: ₹ {calculateTotal().toFixed(2)}
        </div>

        <button
          disabled={submitting}
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {submitting ? "Submitting..." : "Create Order"}
        </button>
      </div>
    </div>
  );
}
