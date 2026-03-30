"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Phone, Sparkles, Check, ArrowRight, User } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface ProgramInfo {
  id: string;
  name: string;
  stampsRequired: number;
  rewardText: string;
  cardColor: string;
  textColor: string;
  category: string;
  stampIcon: string;
  merchant: {
    businessName: string;
  };
}

export default function JoinPage() {
  const params = useParams();
  const code = params.code as string;

  const [program, setProgram] = useState<ProgramInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [cardCode, setCardCode] = useState("");

  useEffect(() => {
    async function fetchProgram() {
      try {
        const res = await fetch(`${API_URL}/api/enroll/${code}`);
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        setProgram(data.program);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchProgram();
  }, [code]);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/enroll/${code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.startsWith("+") ? phone : `+${phone}`,
          name: name || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setCardCode(data.card.qrCode);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !program) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Program not found</h1>
          <p className="text-gray-500 mb-6">This enrollment link may have expired or is invalid.</p>
          <Link href="/" className="text-primary font-medium hover:underline">
            Go to Stamply
          </Link>
        </div>
      </div>
    );
  }

  // Success state - card created
  if (cardCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white px-6">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <Check className="h-8 w-8 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re in!</h1>
          <p className="text-gray-500 mb-8">
            Your loyalty card for <span className="font-semibold text-gray-700">{program.merchant.businessName}</span> is ready.
          </p>

          {/* Card preview */}
          <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: program.cardColor }}>
            <div className="text-white/90 text-sm font-semibold uppercase tracking-wide mb-1">
              {program.merchant.businessName}
            </div>
            <div className="text-white/50 text-xs mb-4">{program.name}</div>
            <div className="grid grid-cols-5 gap-2 mb-3">
              {Array.from({ length: Math.min(program.stampsRequired, 15) }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg bg-black/15 flex items-center justify-center"
                >
                  <span className="text-[10px] font-bold text-white/20">{i + 1}</span>
                </div>
              ))}
            </div>
            <div className="text-white/40 text-xs">
              Collect {program.stampsRequired} stamps for {program.rewardText}
            </div>
          </div>

          <Link
            href={`/card/${cardCode}`}
            className="inline-flex items-center justify-center gap-2 w-full bg-primary text-white py-3.5 rounded-xl font-semibold hover:bg-primary-dark transition"
          >
            View your card
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-3 text-xs text-gray-400">
            Show this card at checkout to collect stamps
          </p>
        </div>
      </div>
    );
  }

  // Enrollment form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white px-6">
      <div className="max-w-sm w-full">
        {/* Program card preview */}
        <div className="rounded-2xl p-6 mb-8 text-center" style={{ backgroundColor: program.cardColor }}>
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-white/90 font-bold text-lg">{program.merchant.businessName}</h2>
          <p className="text-white/50 text-sm mt-1">{program.name}</p>
          <div className="mt-4 bg-white/10 rounded-lg py-2 px-4 inline-block">
            <span className="text-white/70 text-sm">
              Collect {program.stampsRequired} stamps &rarr; <span className="text-white font-semibold">{program.rewardText}</span>
            </span>
          </div>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-1">Join the loyalty program</h1>
        <p className="text-gray-500 text-sm mb-6">
          Enter your phone number to get your digital loyalty card. It takes 10 seconds.
        </p>

        <form onSubmit={handleJoin} className="space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30"
                placeholder="+961 70 123 456"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Name (optional)</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30"
                placeholder="Your name"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold hover:bg-primary-dark transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Get my card
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-gray-400">
          Powered by <Link href="/" className="text-primary hover:underline">Stamply</Link>
        </p>
      </div>
    </div>
  );
}
