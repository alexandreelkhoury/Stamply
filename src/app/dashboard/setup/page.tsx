"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useSWRConfig } from "swr";

const PRESET_COLORS = [
  "#6C63FF", "#3B82F6", "#10B981", "#F59E0B", "#EF4444",
  "#8B5CF6", "#EC4899", "#14B8A6", "#F97316", "#1F2937",
];

export default function SetupPage() {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const [name, setName] = useState("");
  const [stampsRequired, setStampsRequired] = useState("8");
  const [rewardText, setRewardText] = useState("");
  const [cardColor, setCardColor] = useState("#6C63FF");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { ok, data } = await api.post<{ error?: string }>("/api/programs", { name, stampsRequired, rewardText, cardColor });

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
          <div
            className="rounded-2xl p-6 text-white"
            style={{ backgroundColor: cardColor }}
          >
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5" />
              <span className="font-semibold">{name || "Your Program"}</span>
            </div>
            <div className="flex gap-1.5 mb-3">
              {Array.from({ length: parseInt(stampsRequired) || 8 }).map((_, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-white/40 flex items-center justify-center text-xs"
                >
                  {i < 3 ? "✓" : ""}
                </div>
              ))}
            </div>
            <p className="text-sm text-white/70">
              {parseInt(stampsRequired) || 8} stamps → {rewardText || "Your reward"}
            </p>
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
