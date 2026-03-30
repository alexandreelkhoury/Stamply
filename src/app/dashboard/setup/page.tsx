"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2, Sparkles, Coffee, Scissors, ShoppingBag, Cpu, PawPrint,
  Flower2, Utensils, Dumbbell, Car, Heart, Star, Gem, Zap, Gift,
  Sun, Moon, Crown, Music,
} from "lucide-react";
import { api } from "@/lib/api";
import { useSWRConfig } from "swr";

const PRESET_COLORS = [
  "#6C63FF", "#3B82F6", "#10B981", "#F59E0B", "#EF4444",
  "#8B5CF6", "#EC4899", "#14B8A6", "#F97316", "#1F2937",
];

const CATEGORIES = [
  { value: "coffee", label: "Coffee & Tea", icon: Coffee },
  { value: "food", label: "Food & Drinks", icon: Utensils },
  { value: "beauty", label: "Beauty & Salon", icon: Scissors },
  { value: "retail", label: "Retail & Shopping", icon: ShoppingBag },
  { value: "fitness", label: "Fitness & Gym", icon: Dumbbell },
  { value: "electronics", label: "Electronics", icon: Cpu },
  { value: "pets", label: "Pets", icon: PawPrint },
  { value: "plants", label: "Plants & Garden", icon: Flower2 },
  { value: "auto", label: "Auto & Car Care", icon: Car },
  { value: "health", label: "Health & Wellness", icon: Heart },
  { value: "other", label: "Other", icon: Star },
];

const STAMP_ICONS = [
  { value: "sparkles", label: "Sparkles", icon: Sparkles },
  { value: "star", label: "Star", icon: Star },
  { value: "heart", label: "Heart", icon: Heart },
  { value: "gem", label: "Gem", icon: Gem },
  { value: "zap", label: "Zap", icon: Zap },
  { value: "gift", label: "Gift", icon: Gift },
  { value: "sun", label: "Sun", icon: Sun },
  { value: "moon", label: "Moon", icon: Moon },
  { value: "crown", label: "Crown", icon: Crown },
  { value: "music", label: "Music", icon: Music },
  { value: "coffee", label: "Coffee", icon: Coffee },
  { value: "flower", label: "Flower", icon: Flower2 },
  { value: "paw", label: "Paw", icon: PawPrint },
  { value: "scissors", label: "Scissors", icon: Scissors },
  { value: "dumbbell", label: "Dumbbell", icon: Dumbbell },
];

function getStampIconComponent(value: string) {
  const found = STAMP_ICONS.find((s) => s.value === value);
  return found ? found.icon : Sparkles;
}

export default function SetupPage() {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const [name, setName] = useState("");
  const [stampsRequired, setStampsRequired] = useState("8");
  const [rewardText, setRewardText] = useState("");
  const [cardColor, setCardColor] = useState("#6C63FF");
  const [category, setCategory] = useState("other");
  const [stampIcon, setStampIcon] = useState("sparkles");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { ok, data } = await api.post<{ error?: string }>("/api/programs", {
        name, stampsRequired, rewardText, cardColor, category, stampIcon,
      });

      if (!ok) {
        setError(data.error || "Failed to create program");
        return;
      }

      mutate("/api/programs");
      router.push("/dashboard");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const StampIcon = getStampIconComponent(stampIcon);

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-2">Set up your loyalty program</h1>
      <p className="text-foreground/50 text-sm mb-8">This takes about 2 minutes. You can change everything later.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="text-sm text-danger bg-danger/10 px-3 py-2 rounded-lg">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1.5">Program name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-foreground/15 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Coffee Loyalty"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-3">Category</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {CATEGORIES.map((cat) => {
              const CatIcon = cat.icon;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                    category === cat.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-foreground/10 text-foreground/50 hover:border-foreground/20"
                  }`}
                >
                  <CatIcon className="h-5 w-5" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            How many stamps to earn a reward?
          </label>
          <input
            type="number"
            min="2"
            max="50"
            value={stampsRequired}
            onChange={(e) => setStampsRequired(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-foreground/15 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Reward</label>
          <input
            type="text"
            value={rewardText}
            onChange={(e) => setRewardText(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-foreground/15 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Free coffee"
            required
          />
        </div>

        {/* Stamp icon */}
        <div>
          <label className="block text-sm font-medium mb-3">Stamp design</label>
          <div className="flex gap-2 flex-wrap">
            {STAMP_ICONS.map((s) => {
              const SIcon = s.icon;
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStampIcon(s.value)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    stampIcon === s.value
                      ? "ring-2 ring-offset-2 ring-primary bg-primary/10 text-primary scale-110"
                      : "bg-foreground/5 text-foreground/40 hover:scale-105 hover:bg-foreground/10"
                  }`}
                  title={s.label}
                >
                  <SIcon className="h-5 w-5" />
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">Card color</label>
          <div className="flex gap-2 flex-wrap mb-3">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setCardColor(color)}
                className={`w-10 h-10 rounded-lg transition-all ${
                  cardColor === color ? "ring-2 ring-offset-2 ring-primary scale-110" : "hover:scale-105"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={cardColor}
              onChange={(e) => setCardColor(e.target.value)}
              className="w-10 h-10 rounded-lg border border-foreground/15 cursor-pointer"
            />
            <span className="text-sm text-foreground/40">Or pick any color</span>
          </div>
        </div>

        {/* Preview */}
        <div>
          <label className="block text-sm font-medium mb-3">Preview</label>
          <div className="rounded-2xl bg-[#0d0d12] p-6" style={{ "--card-glow-color": cardColor } as React.CSSProperties}>
            <div className="premium-card" style={{ backgroundColor: cardColor }}>
              <div className="relative z-[1] p-6">
                <h3 className="text-[14px] font-semibold tracking-wide text-white/90 uppercase">
                  {name || "Your Program"}
                </h3>
                <p className="text-[12px] text-white/40 mt-0.5 mb-5 font-medium">
                  {rewardText || "Your reward"}
                </p>

                <div className="grid grid-cols-5 gap-2 mb-4">
                  {Array.from({ length: Math.min(parseInt(stampsRequired) || 8, 20) }).map((_, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-lg flex items-center justify-center ${
                        i < 3 ? "stamp-filled" : "stamp-empty"
                      }`}
                    >
                      {i < 3 ? (
                        <StampIcon className="h-3.5 w-3.5 text-white drop-shadow-sm" />
                      ) : (
                        <span className="text-[10px] font-bold text-white/20">{i + 1}</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="progress-track h-1.5 mb-3">
                  <div
                    className="progress-fill h-full"
                    style={{ width: `${Math.round((3 / (parseInt(stampsRequired) || 8)) * 100)}%` }}
                  />
                </div>

                <div className="flex items-baseline justify-between">
                  <p className="text-[12px] text-white/50 font-medium">
                    <span className="text-white/90 text-[14px] font-bold">3</span>
                    <span className="mx-0.5">/</span>
                    {parseInt(stampsRequired) || 8}
                  </p>
                  <p className="text-[11px] text-white/40">
                    {(parseInt(stampsRequired) || 8) - 3} more for{" "}
                    <span className="text-white/70">{rewardText || "reward"}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Create program
        </button>
      </form>
    </div>
  );
}
