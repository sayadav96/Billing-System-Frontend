"use client";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [inventory, setInventory] = useState([]);
  const [milkSold, setMilkSold] = useState(0);
  const [paymentsCollected, setPaymentsCollected] = useState(0);
  const [totalOutstanding, setTotalOutstanding] = useState(0);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchInventory();
    fetchMilkSold();
    fetchPayments();
    fetchOutstanding();
  }, []);

  const fetchInventory = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_DOMAIN}/api/inventory/${today}`
    );
    const data = await res.json();
    setInventory(data.inventory?.[0]?.items || []);
  };

  const fetchMilkSold = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_DOMAIN}/api/orders?singleDate=${today}`
    );
    const data = await res.json();
    const totalQty = data.orders.reduce((acc, order) => {
      return (
        acc +
        order.products.reduce((sum, item) => {
          const signedQty = order.isReturn ? -item.quantity : item.quantity;
          return sum + signedQty;
        }, 0)
      );
    }, 0);
    setMilkSold(totalQty);
  };

  const fetchPayments = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_DOMAIN}/api/payments?singleDate=${today}`
    );
    const data = await res.json();
    const total = data.payments.reduce((sum, p) => sum + p.amount, 0);
    setPaymentsCollected(total);
  };

  const fetchOutstanding = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/customers`);
    const data = await res.json();
    const total = data.customers.reduce(
      (sum, c) => sum + (c.outstandingAmount || 0),
      0
    );
    setTotalOutstanding(total);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-2">📦 Today's Inventory ({today})</h2>
          <ul className="text-sm">
            {inventory.length > 0 ? (
              inventory.map((item, idx) => (
                <li key={idx} className="flex justify-between">
                  <span>{item.product?.name}</span>
                  <span>{item.quantity}</span>
                </li>
              ))
            ) : (
              <li className="text-gray-500">No inventory found</li>
            )}
          </ul>
        </div>

        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-2">🥛 Total Milk Sold</h2>
          <p className="text-2xl font-bold">{milkSold} Ltr</p>
        </div>

        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-2">💰 Total Payment Collected</h2>
          <p className="text-2xl font-bold">₹{paymentsCollected.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-2">📉 Total Outstanding</h2>
          <p className="text-2xl font-bold text-red-600">
            ₹{totalOutstanding.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
