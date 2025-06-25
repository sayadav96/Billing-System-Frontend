"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, ChevronUp } from "lucide-react";

const productLinks = [
  { label: "Add Product", href: "/products/add" },
  { label: "Update Product", href: "/products/update" },
  { label: "Delete Product", href: "/products/delete" },
];

const customerLinks = [
  { label: "Add Customer", href: "/customers/add" },
  { label: "All Customers", href: "/customers/update" },
];

const orderLinks = [
  { label: "Add Order", href: "/orders/add" },
  { label: "All Orders", href: "/orders/all" },
  { label: "Print Orders", href: "/orders/print" },
];

const paymentLinks = [
  { label: "Add Payment", href: "/payments/add" },
  { label: "All Payments", href: "/payments/all" },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [showCustomers, setShowCustomers] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showPayments, setShowPayments] = useState(false);

  return (
    <>
      <div className="md:hidden p-4 print:hidden">
        <button onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <aside
        className={`bg-white fixed md:relative z-40 top-0 left-0 h-full w-64 shadow-md transition-transform transform ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:block`}
      >
        <nav className="flex flex-col gap-2 p-4 h-full">
          <div className="flex justify-between items-center mb-6 md:hidden">
            <h2 className="text-xl font-bold">Billing System</h2>
            <button onClick={() => setOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <h2 className="text-xl font-bold mb-4 hidden md:block">
            Amrut Dudh Kendra
          </h2>

          <Link
            href="/"
            className="text-gray-700 hover:bg-gray-200 px-3 py-2 rounded text-xl font-semibold"
            onClick={() => setOpen(false)}
          >
            Dashboard
          </Link>

          <Link
            href="/inventory"
            className="text-gray-700 hover:bg-gray-200 px-3 py-2 rounded text-xl font-semibold"
            onClick={() => setOpen(false)}
          >
            Inventory
          </Link>

          {/* Products dropdown */}
          <div className="flex flex-col">
            <button
              onClick={() => setShowProducts(!showProducts)}
              className="flex justify-between items-center text-gray-700 hover:bg-gray-200 px-3 py-2 rounded text-xl font-semibold"
            >
              Products
              {showProducts ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>
            {showProducts && (
              <div className="ml-4 mt-2 flex flex-col gap-1">
                {productLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-gray-600 hover:bg-gray-100 px-3 py-1 rounded text-lg"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Customers dropdown */}
          <div className="flex flex-col">
            <button
              onClick={() => setShowCustomers(!showCustomers)}
              className="flex justify-between items-center text-gray-700 hover:bg-gray-200 px-3 py-2 rounded text-xl font-semibold"
            >
              Customers
              {showCustomers ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>
            {showCustomers && (
              <div className="ml-4 mt-2 flex flex-col gap-1">
                {customerLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-gray-600 hover:bg-gray-100 px-3 py-1 rounded text-lg"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Orders dropdown */}
          <div className="flex flex-col">
            <button
              onClick={() => setShowOrders(!showOrders)}
              className="flex justify-between items-center text-gray-700 hover:bg-gray-200 px-3 py-2 rounded text-xl font-semibold"
            >
              Orders
              {showOrders ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {showOrders && (
              <div className="ml-4 mt-2 flex flex-col gap-1">
                {orderLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-gray-600 hover:bg-gray-100 px-3 py-1 rounded text-lg"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Payments dropdown */}
          <div className="flex flex-col">
            <button
              onClick={() => setShowPayments(!showPayments)}
              className="flex justify-between items-center text-gray-700 hover:bg-gray-200 px-3 py-2 rounded text-xl font-semibold"
            >
              Payments
              {showPayments ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>
            {showPayments && (
              <div className="ml-4 mt-2 flex flex-col gap-1">
                {paymentLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-gray-600 hover:bg-gray-100 px-3 py-1 rounded text-lg"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>
      </aside>

      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
