"use client";
import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";

export default function PrintOrderPage() {
  const billRef = useRef();
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [date, setDate] = useState("");
  const [orders, setOrders] = useState([]);
  const [mergedProducts, setMergedProducts] = useState([]);
  const [billDetails, setBillDetails] = useState({
    customerName: "",
    oldBalance: 0,
    bill: 0,
    paid: 0,
    total: 0,
    newBalance: 0,
  });

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/customers`)
      .then((res) => res.json())
      .then((data) => setCustomers(data.customers || []));
  }, []);

  const fetchOrders = async () => {
    if (!date || !customerId) return;

    const formatted = new Date(date).toISOString().split("T")[0];
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_DOMAIN}/api/orders?customer=${customerId}&singleDate=${formatted}`
    );
    const data = await res.json();

    const allOrders = data.orders || [];
    setOrders(allOrders);

    const merged = {};
    let totalBill = 0;
    let totalPaid = 0;
    let oldBalance = 0;

    allOrders.forEach((order) => {
      totalBill += order.bill;
      totalPaid += order.paid;
      oldBalance = order.oldBalance;

      order.products.forEach((item) => {
        const pid = item.product._id;
        const pname = item.product.name;
        const rate = item.rateAtPurchase;

        if (!merged[pid]) {
          merged[pid] = { name: pname, quantity: [], netQty: 0, amount: 0 };
        }

        const qty = order.isReturn ? -item.quantity : item.quantity;
        merged[pid].quantity.push(qty);
        merged[pid].netQty += qty;
        merged[pid].amount += qty * rate;
      });
    });

    const customer = customers.find((c) => c._id === customerId);
    const newBalance = oldBalance + totalBill - totalPaid;

    setMergedProducts(Object.values(merged));
    setBillDetails({
      customerName: customer?.name || "",
      oldBalance,
      bill: totalBill,
      paid: totalPaid,
      total: oldBalance + totalBill,
      newBalance,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareOnWhatsApp = async () => {
    const phone = customers
      .find((c) => c._id === customerId)
      ?.phone?.replace(/\D/g, "");
    if (!phone) return alert("No valid phone number found");

    const canvas = await html2canvas(billRef.current);
    const dataUrl = canvas.toDataURL("image/png");

    const uploadRes = await fetch("/api/upload-bill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageData: dataUrl }),
    });

    const result = await uploadRes.json();
    if (!result.url) return alert("Image upload failed");

    const formattedDate = new Date(date).toLocaleDateString("en-GB");
    const message = encodeURIComponent(
      `आप का ${formattedDate} का बिल इस लिंक में है:\n${result.url}`
    );
    window.open(`https://wa.me/91${phone}?text=${message}`, "_blank");
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded print:p-2 print:max-w-full print:bg-white">
      <img
        src="/Amrut Dudh kendra (2).png"
        className="w-[200px] mx-auto print:block"
      />

      <div className="grid md:grid-cols-2 gap-4 mb-4 no-print">
        <select
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Select Customer</option>
          {customers.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 rounded"
          max={new Date().toISOString().split("T")[0]}
        />
      </div>

      <button
        onClick={fetchOrders}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Fetch Bill
      </button>

      {mergedProducts.length > 0 && (
        <div ref={billRef} className="border p-4 rounded text-sm">
          <div className="flex justify-between mb-2 font-semibold">
            <span>Name: {billDetails.customerName}</span>
            <span>Date: {new Date(date).toLocaleDateString("en-GB")}</span>
          </div>

          <hr className="mb-2" />

          {mergedProducts.map((p) => (
            <div key={p.name} className="flex justify-between py-1">
              <span>
                {p.name} :{" "}
                {p.quantity.map((q, idx) => (
                  <span key={idx} className="mx-1">
                    {q > 0 && idx !== 0 ? `+${q}` : q}
                  </span>
                ))}
                = <b>{p.netQty}</b>
              </span>
              <span>₹{p.amount.toFixed(2)}</span>
            </div>
          ))}

          <hr className="my-2" />
          <div className="flex justify-between">
            <span>Previous Balance</span>
            <span>₹{billDetails.oldBalance.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Bill Amount</span>
            <span>₹{billDetails.bill.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total</span>
            <span>₹{billDetails.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Paid</span>
            <span>₹{billDetails.paid.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold mt-2">
            <span>New Balance</span>
            <span>₹{billDetails.newBalance.toFixed(2)}</span>
          </div>

          <button
            onClick={handlePrint}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 print:hidden"
          >
            Print Bill
          </button>
          <button
            onClick={handleShareOnWhatsApp}
            className="mt-4 ml-2 bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 print:hidden"
          >
            Share on WhatsApp
          </button>
        </div>
      )}
    </div>
  );
}
