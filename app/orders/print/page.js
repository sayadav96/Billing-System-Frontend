"use client";
import { useEffect, useState, useRef } from "react";
import html2canvas from "html2canvas";

export default function PrintBillPage() {
  const billRef = useRef();
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [date, setDate] = useState("");
  const [mergedProducts, setMergedProducts] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [outstanding, setOutstanding] = useState(0);
  const [total, setTotal] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/api/customers`)
      .then((res) => res.json())
      .then((data) => setCustomers(data.customers || []));
  }, []);

  const fetchMergedOrders = async () => {
    const formattedDate = new Date(date).toISOString().split("T")[0]; // YYYY-MM-DD only
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_DOMAIN}/api/orders?customer=${customerId}&singleDate=${formattedDate}`
    );

    const data = await res.json();

    const merged = {};

    let tempTotal = 0;

    data.orders.forEach((order) => {
      order.products.forEach((item) => {
        const pid = item.product._id;
        const pname = item.product.name;
        const rate = item.rateAtPurchase;

        if (!merged[pid]) {
          merged[pid] = { name: pname, quantity: [], netQty: 0, amount: 0 };
        }

        const signedQty = order.isReturn ? -item.quantity : item.quantity;
        merged[pid].quantity.push(signedQty);
        merged[pid].netQty += signedQty;
        merged[pid].amount += signedQty * rate;
        tempTotal += signedQty * rate;
      });
    });

    const customer = customers.find((c) => c._id === customerId);

    setMergedProducts(Object.values(merged));
    setCustomerName(customer?.name || "");
    setOutstanding(customer?.outstandingAmount || 0);
    setTotal(tempTotal);
    setFinalTotal(tempTotal + (customer?.outstandingAmount || 0));
  };

  const handlePrint = () => {
    window.print();
  };

  // const handleShareOnWhatsApp = async () => {
  //   if (!customerId) return;

  //   const customer = customers.find((c) => c._id === customerId);
  //   const phone = customer?.phone?.replace(/\D/g, "");
  //   if (!phone) return alert("No valid phone number found");

  //   const canvas = await html2canvas(billRef.current);
  //   const dataUrl = canvas.toDataURL("image/png");

  //   // Upload to Cloudinary
  //   const uploadRes = await fetch("/api/upload-bill", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ imageData: dataUrl }),
  //   });

  //   const result = await uploadRes.json();
  //   if (!result.url) return alert("Image upload failed");

  //   const formattedDate = `${new Date(date)
  //     .getDate()
  //     .toString()
  //     .padStart(2, "0")}/${(new Date(date).getMonth() + 1)
  //     .toString()
  //     .padStart(2, "0")}/${new Date(date).getFullYear()}`;

  //   const message = encodeURIComponent(
  //     `आप का ${formattedDate} का बिल इस लिंक में है:\n${result.url}`
  //   );
  //   window.open(`https://wa.me/91${phone}?text=${message}`, "_blank");
  // };

  const handleShareOnWhatsApp = async () => {
    if (!customerId) return;

    const customer = customers.find((c) => c._id === customerId);
    const phone = customer?.phone?.replace(/\D/g, "");
    if (!phone) return alert("No valid phone number found");

    const formattedDate = `${new Date(date)
      .getDate()
      .toString()
      .padStart(2, "0")}/${(new Date(date).getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${new Date(date).getFullYear()}`;

    // 1. Capture screenshot
    const canvas = await html2canvas(billRef.current);
    const dataUrl = canvas.toDataURL("image/png");

    // 2. Upload to server
    const uploadRes = await fetch("/api/upload-bill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageData: dataUrl }),
    });

    const result = await uploadRes.json();
    if (!result.url) return alert("Image upload failed");

    // 3. Prepare WhatsApp message
    const message = encodeURIComponent(
      `आप का ${formattedDate} का बिल इस लिंक में है:\n${result.url}`
    );

    // 4. Create temporary anchor and trigger click
    const link = document.createElement("a");
    link.href = `https://wa.me/91${phone}?text=${message}`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link); // append required in some browsers
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded print:shadow-none print:p-2 print:max-w-full print:bg-white">
      {/* <h2 className="text-3xl text-center font-bold mb-8">Amrut Dudh Kendra</h2> */}
      <img src="/Amrut Dudh kendra (2).png" className="w-[200px] mx-auto" />
      <div className="grid md:grid-cols-2 gap-4 mb-4 no-print print:hidden">
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
          className="border p-2 rounded print:hidden"
          max={new Date().toISOString().split("T")[0]}
        />
      </div>

      <button
        onClick={fetchMergedOrders}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 print:hidden print:"
      >
        Fetch Bill
      </button>

      {mergedProducts.length > 0 && (
        <div ref={billRef} className="border p-4 rounded text-sm">
          <div className="flex justify-between mb-2 font-semibold">
            <span>Name: {customerName}</span>
            <span>
              Date:{" "}
              {date &&
                `${new Date(date).getDate().toString().padStart(2, "0")}/${(
                  new Date(date).getMonth() + 1
                )
                  .toString()
                  .padStart(2, "0")}/${new Date(date).getFullYear()}`}
            </span>
          </div>

          <hr className="mb-2" />

          {mergedProducts.map((p) => (
            <div key={p.name} className="flex justify-between  py-1">
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
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Outstanding</span>
            <span>₹{outstanding.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold mt-2">
            <span>Final Total</span>
            <span>₹{finalTotal.toFixed(2)}</span>
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
