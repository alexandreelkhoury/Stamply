import { Crown, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import QrCodeDisplay from "./qr-code-display";

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
      merchant: {
        businessName: string;
        logoUrl: string | null;
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
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-[15px] font-semibold tracking-wide text-white/90 uppercase">
                  {card.program.merchant.businessName}
                </h1>
                <p className="text-[13px] text-white/45 mt-0.5 font-medium">
                  {card.program.name}
                </p>
              </div>
              {card.rewardsEarned > 0 && (
                <div className="reward-badge flex items-center gap-1.5 bg-amber-400/20 text-amber-200 px-3 py-1.5 rounded-full text-xs font-bold border border-amber-400/20">
                  <Crown className="h-3 w-3" />
                  {card.rewardsEarned}
                </div>
              )}
            </div>

            {/* Stamp Grid */}
            <div className="grid grid-cols-5 gap-2.5 mb-6">
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
                      <Sparkles className="h-4 w-4 text-white drop-shadow-sm" />
                    ) : (
                      <span className="text-[11px] font-bold text-white/20">{i + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
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

        {/* QR Code Section */}
        <div className="qr-glass p-6 text-center">
          <p className="text-[11px] uppercase tracking-[0.15em] text-white/30 font-semibold mb-4">
            Show at checkout
          </p>
          <div className="bg-white rounded-2xl p-4 inline-block mx-auto">
            <QrCodeDisplay code={card.qrCode} />
          </div>
          <p className="mt-4 text-[11px] text-white/20 font-mono tracking-wider">
            {card.qrCode}
          </p>
        </div>

        {/* Customer identifier */}
        <p className="text-center text-[12px] text-white/20 font-medium tracking-wide">
          {card.customer.name || card.customer.phone}
        </p>
      </div>
    </div>
  );
}
