import { CreditCard } from "lucide-react";
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div
          className="rounded-2xl p-6 text-white shadow-xl"
          style={{ backgroundColor: card.program.cardColor }}
        >
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="h-5 w-5" />
            <span className="font-semibold">{card.program.merchant.businessName}</span>
          </div>
          <div className="text-sm text-white/70 mb-6">{card.program.name}</div>

          {/* Stamps */}
          <div className="flex gap-2 flex-wrap mb-4">
            {Array.from({ length: card.program.stampsRequired }).map((_, i) => (
              <div
                key={i}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                  i < card.currentStamps
                    ? "bg-white/30 text-white"
                    : "border-2 border-white/30"
                }`}
              >
                {i < card.currentStamps ? "✓" : i + 1}
              </div>
            ))}
          </div>

          <div className="text-sm text-white/80">
            {card.currentStamps}/{card.program.stampsRequired} stamps → {card.program.rewardText}
          </div>
          {card.rewardsEarned > 0 && (
            <div className="mt-2 text-sm font-medium">
              {card.rewardsEarned} reward{card.rewardsEarned > 1 ? "s" : ""} earned!
            </div>
          )}
        </div>

        {/* QR Code */}
        <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm text-center">
          <p className="text-sm text-gray-500 mb-4">Show this QR code at checkout</p>
          <QrCodeDisplay code={card.qrCode} />
          <p className="mt-3 text-xs text-gray-400 font-mono">{card.qrCode}</p>
        </div>

        {/* Customer info */}
        <div className="mt-4 text-center text-sm text-gray-400">
          {card.customer.name || card.customer.phone}
        </div>
      </div>
    </div>
  );
}
