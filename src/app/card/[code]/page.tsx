import { Crown } from "lucide-react";
import { notFound } from "next/navigation";
import QrCodeDisplay from "@/components/qr-code-display";
import StampIconDisplay from "./stamp-icon";
import WalletButtons from "./wallet-buttons";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface CardData {
  card: {
    id: string;
    qrCode: string;
    currentStamps: number;
    totalStamps: number;
    rewardsEarned: number;
    program: {
      name: string;
      stampsRequired: number;
      rewardText: string;
      cardColor: string;
      textColor: string;
      stampIcon?: string;
      showAddress?: boolean;
      merchant: {
        businessName: string;
        logoUrl: string | null;
        address: string | null;
        city: string | null;
      };
    };
    customer: {
      name: string | null;
      phone: string;
    };
  };
}

async function getCard(code: string) {
  try {
    const res = await fetch(`${API_URL}/api/cards/${code}/public`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    const data: CardData = await res.json();
    return data.card;
  } catch {
    return null;
  }
}

export default async function CardPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const card = await getCard(code);

  if (!card) notFound();

  const progress = Math.round((card.currentStamps / card.program.stampsRequired) * 100);
  const remaining = card.program.stampsRequired - card.currentStamps;
  const cardColor = card.program.cardColor;

  return (
    <div
      className="card-page-bg flex flex-col items-center justify-center px-5 py-10"
      style={{
        "--card-glow-color": cardColor,
        overscrollBehavior: "contain",
        touchAction: "manipulation",
      } as React.CSSProperties}
    >
      {/* Ambient glow */}
      <div className="card-page-glow" />

      <div className="relative z-10 w-full max-w-[380px] space-y-5">
        {/* The Card */}
        <div className="premium-card" style={{ backgroundColor: cardColor }}>
          <div className="relative z-[1] p-7 pb-6">
            {/* Top row: Merchant + Rewards badge */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h1 className="text-[15px] font-semibold tracking-wide text-white/90 uppercase">
                  {card.program.merchant.businessName}
                </h1>
                <p className="text-[13px] text-white/45 mt-0.5 font-medium">
                  {card.program.name}
                </p>
                {card.program.showAddress && card.program.merchant.address && (
                  <p className="text-[11px] text-white/30 mt-0.5">
                    {card.program.merchant.address}
                    {card.program.merchant.city && `, ${card.program.merchant.city}`}
                  </p>
                )}
              </div>
              {card.rewardsEarned > 0 && (
                <div className="reward-badge flex items-center gap-1.5 bg-amber-400/20 text-amber-200 px-3 py-1.5 rounded-full text-xs font-bold border border-amber-400/20">
                  <Crown className="h-3 w-3" />
                  {card.rewardsEarned}
                </div>
              )}
            </div>

            {/* Stamp Grid + QR Code side by side */}
            <div className="flex gap-4 mb-5">
              {/* Stamps */}
              <div className="flex-1">
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: card.program.stampsRequired }).map((_, i) => {
                    const isFilled = i < card.currentStamps;
                    return (
                      <div
                        key={i}
                        className={`stamp-cell aspect-square rounded-xl flex items-center justify-center ${
                          isFilled ? "stamp-filled" : "stamp-empty"
                        }`}
                        style={{ animationDelay: `${0.6 + i * 0.04}s` }}
                      >
                        {isFilled ? (
                          <StampIconDisplay name={card.program.stampIcon || "sparkles"} className="h-3.5 w-3.5 text-white drop-shadow-sm" />
                        ) : (
                          <span className="text-[10px] font-bold text-white/20">{i + 1}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* QR Code on the card */}
              <div className="flex-shrink-0 flex flex-col items-center justify-center">
                <div className="bg-white rounded-xl p-2">
                  <QrCodeDisplay code={card.qrCode} size={90} />
                </div>
                <p className="text-[8px] text-white/25 mt-1.5 font-mono tracking-wider text-center">
                  {card.qrCode}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="progress-track h-1.5">
                <div
                  className="progress-fill h-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Status Text */}
            <div className="flex items-baseline justify-between">
              <p className="text-[13px] text-white/50 font-medium">
                <span className="text-white/90 text-[15px] font-bold tabular-nums">
                  {card.currentStamps}
                </span>
                <span className="mx-0.5">/</span>
                {card.program.stampsRequired}
              </p>
              <p className="text-[12px] text-white/40 font-medium">
                {remaining > 0 ? (
                  <>
                    {remaining} more for{" "}
                    <span className="text-white/70">{card.program.rewardText}</span>
                  </>
                ) : (
                  <span className="text-amber-300/80 font-semibold">Reward unlocked!</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Wallet Buttons */}
        <WalletButtons qrCode={card.qrCode} />

        {/* Customer identifier */}
        <p className="text-center text-[12px] text-white/20 font-medium tracking-wide">
          {card.customer.name || card.customer.phone}
        </p>
      </div>
    </div>
  );
}
