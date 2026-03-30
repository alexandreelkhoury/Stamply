"use client";

import { useState, useEffect } from "react";
import { UserPlus, Loader2, Phone, Search, Users } from "lucide-react";
import { api } from "@/lib/api";
import { usePrograms } from "@/hooks/use-programs";
import useSWR, { useSWRConfig } from "swr";

interface CustomerCard {
  id: string;
  currentStamps: number;
  totalStamps: number;
  rewardsEarned: number;
  program: {
    name: string;
    stampsRequired: number;
  };
}

interface Customer {
  id: string;
  phone: string;
  name: string | null;
  createdAt: string;
  cards: CustomerCard[];
}

export default function CustomersPage() {
  const { programs } = usePrograms();
  const { mutate } = useSWRConfig();

  // All customers list
  const { data: customersData, isLoading: loadingCustomers } = useSWR<{ customers: Customer[] }>(
    "/api/customers",
    { dedupingInterval: 60 * 1000 }
  );
  const allCustomers = customersData?.customers || [];

  // Add customer form
  const [showForm, setShowForm] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (programs.length > 0 && !selectedProgram) {
      setSelectedProgram(programs[0].id);
    }
  }, [programs, selectedProgram]);

  async function handleAddCustomer(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const { data, ok } = await api.post<{ error?: string; message?: string; card: { qrCode: string } }>("/api/customers", {
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
      mutate("/api/analytics");
      mutate("/api/customers");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Filter customers by search
  const filteredCustomers = allCustomers.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      c.phone.includes(q) ||
      c.cards.some((card) => card.program.name.toLowerCase().includes(q))
    );
  });

  const totalCards = allCustomers.reduce((sum, c) => sum + c.cards.length, 0);
  const totalRewards = allCustomers.reduce(
    (sum, c) => sum + c.cards.reduce((s, card) => s + card.rewardsEarned, 0),
    0
  );

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-foreground/50 text-sm mt-1">
            {allCustomers.length} customer{allCustomers.length !== 1 ? "s" : ""} across all programs
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition"
        >
          <UserPlus className="h-4 w-4" />
          Add customer
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="border border-foreground/10 rounded-xl p-4 text-center">
          <Users className="h-5 w-5 text-primary mx-auto mb-1" />
          <div className="text-2xl font-bold">{allCustomers.length}</div>
          <div className="text-xs text-foreground/40">Customers</div>
        </div>
        <div className="border border-foreground/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold">{totalCards}</div>
          <div className="text-xs text-foreground/40">Active cards</div>
        </div>
        <div className="border border-foreground/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold">{totalRewards}</div>
          <div className="text-xs text-foreground/40">Rewards earned</div>
        </div>
      </div>

      {/* Add customer form (collapsible) */}
      {showForm && (
        <div className="border border-foreground/10 rounded-xl p-5 mb-6">
          <h2 className="font-semibold mb-4">Add customer manually</h2>
          {programs.length === 0 ? (
            <p className="text-foreground/50 text-sm">Create a loyalty program first before adding customers.</p>
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

              <div className="grid grid-cols-2 gap-3">
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
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, or program..."
          className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-foreground/15 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Customer list */}
      {loadingCustomers ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="border border-dashed border-foreground/20 rounded-xl p-8 text-center">
          <Users className="h-8 w-8 text-foreground/20 mx-auto mb-3" />
          <p className="text-foreground/50 text-sm">
            {search ? "No customers match your search." : "No customers yet. Add your first customer or share your program QR code."}
          </p>
        </div>
      ) : (
        <div className="border border-foreground/10 rounded-xl divide-y divide-foreground/5">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="p-4">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <span className="text-sm font-medium">
                    {customer.name || customer.phone}
                  </span>
                  {customer.name && (
                    <span className="text-xs text-foreground/40 ml-2">{customer.phone}</span>
                  )}
                </div>
                <div className="text-xs text-foreground/30">
                  Joined {new Date(customer.createdAt).toLocaleDateString()}
                </div>
              </div>
              {/* Program cards summary */}
              <div className="flex flex-wrap gap-2 mt-2">
                {customer.cards.map((card) => (
                  <div
                    key={card.id}
                    className="inline-flex items-center gap-1.5 bg-foreground/5 px-2.5 py-1 rounded-md text-xs"
                  >
                    <span className="font-medium">{card.program.name}</span>
                    <span className="text-foreground/40">
                      {card.currentStamps}/{card.program.stampsRequired}
                    </span>
                    {card.rewardsEarned > 0 && (
                      <span className="text-warning font-semibold">
                        {card.rewardsEarned} reward{card.rewardsEarned !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
