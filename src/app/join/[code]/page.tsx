"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Phone, Sparkles, Check, ArrowRight, User, Smartphone } from "lucide-react";

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

function detectPlatform(): "ios" | "android" | "other" {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "other";
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

  const [walletCaps, setWalletCaps] = useState<{ appleWallet: boolean; googleWallet: boolean } | null>(null);
  const [walletAdding, setWalletAdding] = useState(false);
  const [walletAdded, setWalletAdded] = useState(false);
  const [platform] = useState(detectPlatform);

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

    // Pre-fetch wallet capabilities
    fetch(`${API_URL}/api/passes/capabilities`)
      .then((r) => r.json())
      .then(setWalletCaps)
      .catch(() => setWalletCaps({ appleWallet: false, googleWallet: false }));
  }, [code]);

  const addToAppleWallet = useCallback(async (qrCode: string) => {
    setWalletAdding(true);
    try {
      const res = await fetch(`${API_URL}/api/passes/apple/${qrCode}`);
      if (!res.ok) return false;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      // On iOS, opening .pkpass triggers native "Add to Wallet" prompt
      window.location.href = url;
      setWalletAdded(true);
      return true;
    } catch {
      return false;
    } finally {
      setWalletAdding(false);
    }
  }, []);

  const addToGoogleWallet = useCallback(async (qrCode: string) => {
    setWalletAdding(true);
    try {
      const res = await fetch(`${API_URL}/api/passes/google/${qrCode}`);
      if (!res.ok) return false;
      const { link } = await res.json();
      window.location.href = link;
      setWalletAdded(true);
      return true;
    } catch {
      return false;
    } finally {
      setWalletAdding(false);
    }
  }, []);

  // Auto-trigger wallet add when card is created
  const autoAddToWallet = useCallback(async (qrCode: string) => {
    if (!walletCaps) return;

    if (platform === "ios" && walletCaps.appleWallet) {
      await addToAppleWallet(qrCode);
    } else if (platform === "android" && walletCaps.googleWallet) {
      await addToGoogleWallet(qrCode);
    }
  }, [platform, walletCaps, addToAppleWallet, addToGoogleWallet]);

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

      const qrCode = data.card.qrCode;
      setCardCode(qrCode);

      // Auto-add to wallet right after enrollment
      autoAddToWallet(qrCode);
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
    const canAddApple = walletCaps?.appleWallet && (platform === "ios" || platform === "other");
    const canAddGoogle = walletCaps?.googleWallet && (platform === "android" || platform === "other");
    const hasWallet = canAddApple || canAddGoogle;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white px-6">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <Check className="h-8 w-8 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re in!</h1>
          <p className="text-gray-500 mb-6">
            Your loyalty card for <span className="font-semibold text-gray-700">{program.merchant.businessName}</span> is ready.
          </p>

          {/* Wallet buttons — primary action */}
          {hasWallet && !walletAdded && (
            <div className="space-y-2.5 mb-4">
              {walletAdding && (
                <div className="flex items-center justify-center gap-2 py-3 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding to wallet...
                </div>
              )}

              {!walletAdding && canAddApple && (
                <button
                  onClick={() => addToAppleWallet(cardCode)}
                  className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl bg-black text-white text-sm font-semibold transition hover:bg-gray-800"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Add to Apple Wallet
                </button>
              )}

              {!walletAdding && canAddGoogle && (
                <button
                  onClick={() => addToGoogleWallet(cardCode)}
                  className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl bg-white text-gray-900 text-sm font-semibold border border-gray-200 transition hover:bg-gray-50"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#4285F4"/>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10" fill="#34A853"/>
                    <path d="M2 12c0-5.52 4.48-10 10-10" fill="#EA4335"/>
                    <path d="M22 12c0 5.52-4.48 10-10 10" fill="#FBBC05"/>
                    <path d="M15 12l-3-2v4l3-2z" fill="white"/>
                  </svg>
                  Add to Google Wallet
                </button>
              )}
            </div>
          )}

          {walletAdded && (
            <div className="flex items-center justify-center gap-2 mb-4 py-3 text-sm text-success font-medium">
              <Smartphone className="h-4 w-4" />
              Card added to your wallet!
            </div>
          )}

          {/* Card page link — secondary */}
          <Link
            href={`/card/${cardCode}`}
            className={`inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold transition ${
              hasWallet
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "bg-primary text-white hover:bg-primary-dark"
            }`}
          >
            {hasWallet ? "View card in browser" : "View your card"}
            <ArrowRight className="h-4 w-4" />
          </Link>

          <p className="mt-3 text-xs text-gray-400">
            Show your card at checkout to collect stamps
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
