"use client";
import { useState } from "react";

export default function LocalPayment() {
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState("starter");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [error, setError] = useState("");

  async function submit() {
    if (!email || !plan || !receipt) {
      setError("Please fill all fields and upload a receipt.");
      return;
    }
    const formData = new FormData();
    formData.append("email", email);
    formData.append("plan", plan);
    formData.append("receipt", receipt);

    try {
      const res = await fetch("/api/payments/local", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Submission failed");
        return;
      }
      alert("Payment submitted. Contact us on WhatsApp to confirm: https://wa.me/2348012345678");
      setEmail(""); setPlan("starter"); setReceipt(null);
    } catch {
      setError("An error occurred. Please try again.");
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Local Bank Transfer (Nigeria)</h1>
      <div className="p-4 bg-gray-100 rounded">
        <p><strong>Bank:</strong> OPay</p>
        <p><strong>Account:</strong> 8168158636</p>
        <p><strong>Note:</strong> Upload receipt and contact <a href="https://wa.me/2348012345678" className="underline">+234 801 234 5678</a>. Credits added within minutes.</p>
      </div>
      <input className="border p-2 w-full" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <select className="border p-2 w-full" value={plan} onChange={(e) => setPlan(e.target.value)}>
        <option value="starter">Starter (₦12,000)</option>
        <option value="growth">Growth (₦24,000)</option>
        <option value="pro">Pro (₦48,000)</option>
        <option value="scale">Scale (₦96,000)</option>
        <option value="legacy">Legacy (₦195,000)</option>
        <option value="lifetime">Lifetime (₦3,999,000)</option>
      </select>
      <input type="file" accept="image/*,application/pdf" onChange={(e) => setReceipt(e.target.files?.[0] || null)} />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button onClick={submit} className="px-3 py-1 bg-black text-white rounded" disabled={!email || !plan || !receipt}>
        I&apos;ve Paid
      </button>
    </div>
  );
}