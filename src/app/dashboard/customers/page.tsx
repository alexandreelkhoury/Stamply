"use client";

import { useState, useEffect } from "react";
import { UserPlus, Loader2, Phone } from "lucide-react";
import { api } from "@/lib/api";

interface Program {
  id: string;
  name: string;
}

export default function CustomersPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/programs")
      .then(({ data }) => {
        setPrograms(data.programs || []);
        if (data.programs?.length > 0) {
          setSelectedProgram(data.programs[0].id);
        }
      });
  }, []);

  async function handleAddCustomer(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const { data, ok } = await api.post("/api/customers", {
        phone: phone.startsWith("+") ? phone : `+${phone}`,
        name: name || undefined,
        programId: selectedProgram,
      });

      if (!ok) {
        setError(data.error || "Failed to add customer");
        return;
      }

      setSuccess(
        data.message || `Card created! QR code: ${data.card.qrCode}`
      );
      setPhone("");
      setName("");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add Customer</h1>
      <p className="text-foreground/50 text-sm mb-8">
        Enter the customer&apos;s phone number to create their loyalty card. They&apos;ll receive an SMS with a link to add it to their wallet.
      </p>

      {programs.length === 0 ? (
        <div className="border border-dashed border-foreground/20 rounded-xl p-8 text-center">
          <p className="text-foreground/50">Create a loyalty program first before adding customers.</p>
        </div>
      ) : (
        <form onSubmit={handleAddCustomer} className="space-y-4">
          {error && (
            <div className="text-sm text-danger bg-danger/10 px-3 py-2 rounded-lg">{error}</div>
          )}
          {success && (
            <div className="text-sm text-success bg-success/10 px-3 py-2 rounded-lg">{success}</div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5">Program</label>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-foreground/15 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {programs.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Phone number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-foreground/15 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="+961 70 123 456"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Name (optional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-foreground/15 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Sarah"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2.5 rounded-lg font-medium text-sm hover:bg-primary-dark transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            Add customer
          </button>
        </form>
      )}
    </div>
  );
}
