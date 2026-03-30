"use client";

import { useState, useEffect } from "react";
import { Smartphone } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface Capabilities {
  appleWallet: boolean;
  googleWallet: boolean;
}

export default function WalletButtons({ qrCode }: { qrCode: string }) {
  const [caps, setCaps] = useState<Capabilities | null>(null);
  const [loading, setLoading] = useState<"apple" | "google" | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/passes/capabilities`)
      .then((r) => r.json())
      .then(setCaps)
      .catch(() => setCaps({ appleWallet: false, googleWallet: false }));
  }, []);

  if (!caps || (!caps.appleWallet && !caps.googleWallet)) return null;

  async function handleApple() {
    setLoading("apple");
    try {
      const res = await fetch(`${API_URL}/api/passes/apple/${qrCode}`);
      if (!res.ok) throw new Error("Failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `stamply-${qrCode}.pkpass`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Could not generate Apple Wallet pass. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  async function handleGoogle() {
    setLoading("google");
    try {
      const res = await fetch(`${API_URL}/api/passes/google/${qrCode}`);
      if (!res.ok) throw new Error("Failed");
      const { link } = await res.json();
      window.open(link, "_blank");
    } catch {
      alert("Could not generate Google Wallet pass. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      {caps.appleWallet && (
        <button
          onClick={handleApple}
          disabled={loading === "apple"}
          className="wallet-btn flex items-center justify-center gap-2.5 w-full py-3 rounded-xl bg-black text-white text-[13px] font-semibold border border-white/10 transition hover:bg-white/10 disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          {loading === "apple" ? "Generating..." : "Add to Apple Wallet"}
        </button>
      )}

      {caps.googleWallet && (
        <button
          onClick={handleGoogle}
          disabled={loading === "google"}
          className="wallet-btn flex items-center justify-center gap-2.5 w-full py-3 rounded-xl bg-white/5 text-white text-[13px] font-semibold border border-white/10 transition hover:bg-white/10 disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#4285F4"/>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10" fill="#34A853"/>
            <path d="M2 12c0-5.52 4.48-10 10-10" fill="#EA4335"/>
            <path d="M22 12c0 5.52-4.48 10-10 10" fill="#FBBC05"/>
            <path d="M15 12l-3-2v4l3-2z" fill="white"/>
          </svg>
          {loading === "google" ? "Generating..." : "Add to Google Wallet"}
        </button>
      )}

      {!caps.appleWallet && !caps.googleWallet && (
        <div className="flex items-center justify-center gap-2 text-white/25 text-[12px] py-2">
          <Smartphone className="h-4 w-4" />
          <span>Show this QR code at checkout to earn stamps</span>
        </div>
      )}
    </div>
  );
}
