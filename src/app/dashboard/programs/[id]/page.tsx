"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import useSWR, { useSWRConfig } from "swr";
import {
  ArrowLeft,
  Loader2,
  Save,
  Users,
  Stamp,
  Gift,
  Pencil,
  Sparkles,
  X,
  LinkIcon,
  Copy,
  Check,
  QrCode,
  Coffee,
  Scissors,
  ShoppingBag,
  Cpu,
  PawPrint,
  Flower2,
  Utensils,
  Dumbbell,
  Car,
  Heart,
  Star,
  Gem,
  Zap,
  Sun,
  Moon,
  Crown,
  Music,
} from "lucide-react";
import { api } from "@/lib/api";

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
  { value: "sparkles", icon: Sparkles },
  { value: "star", icon: Star },
  { value: "heart", icon: Heart },
  { value: "gem", icon: Gem },
  { value: "zap", icon: Zap },
  { value: "gift", icon: Gift },
  { value: "sun", icon: Sun },
  { value: "moon", icon: Moon },
  { value: "crown", icon: Crown },
  { value: "music", icon: Music },
  { value: "coffee", icon: Coffee },
  { value: "flower", icon: Flower2 },
  { value: "paw", icon: PawPrint },
  { value: "scissors", icon: Scissors },
  { value: "dumbbell", icon: Dumbbell },
];

function getStampIcon(value: string) {
  return STAMP_ICONS.find((s) => s.value === value)?.icon || Sparkles;
}

function getCategoryIcon(value: string) {
  return CATEGORIES.find((c) => c.value === value)?.icon || Star;
}

function getCategoryLabel(value: string) {
  return CATEGORIES.find((c) => c.value === value)?.label || "Other";
}

interface Card {
  id: string;
  currentStamps: number;
  totalStamps: number;
  rewardsEarned: number;
  createdAt: string;
  customer: {
    id: string;
    name: string | null;
    phone: string;
  };
}

interface Program {
  id: string;
  name: string;
  stampsRequired: number;
  rewardText: string;
  cardColor: string;
  textColor: string;
  isActive: boolean;
  category?: string;
  stampIcon?: string;
  enrollmentCode?: string;
  _count?: { cards: number };
  cards?: Card[];
}

export default function ProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const programId = params.id as string;

  const { data: programData, error: fetchError, isLoading: loading, mutate: mutateProgram } = useSWR<{ program: Program }>(
    programId ? `/api/programs/${programId}` : null,
    {
      dedupingInterval: 2 * 60 * 1000,
      revalidateOnFocus: true,
    }
  );

  const program = programData?.program ?? null;

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editStamps, setEditStamps] = useState(8);
  const [editReward, setEditReward] = useState("");
  const [editColor, setEditColor] = useState("#6C63FF");
  const [editCategory, setEditCategory] = useState("other");
  const [editStampIcon, setEditStampIcon] = useState("sparkles");

  function startEditing() {
    if (!program) return;
    setEditName(program.name);
    setEditStamps(program.stampsRequired);
    setEditReward(program.rewardText);
    setEditColor(program.cardColor);
    setEditCategory(program.category || "other");
    setEditStampIcon(program.stampIcon || "sparkles");
    setEditing(true);
    setError("");
    setSuccess("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!program) return;
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const { data, ok } = await api.patch<{ error?: string }>(`/api/programs/${program.id}`, {
        name: editName,
        stampsRequired: editStamps,
        rewardText: editReward,
        cardColor: editColor,
        category: editCategory,
        stampIcon: editStampIcon,
      });

      if (ok) {
        mutateProgram();
        mutate("/api/programs");
        setEditing(false);
        setSuccess("Program updated!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data?.error || "Failed to save");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  function copyEnrollmentLink() {
    if (!program?.enrollmentCode) return;
    const url = `${window.location.origin}/join/${program.enrollmentCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (fetchError || (!loading && !program)) {
    router.push("/dashboard");
    return null;
  }

  if (!program) {
    return null;
  }

  const customerCount = program._count?.cards || program.cards?.length || 0;
  const totalStamps = program.cards?.reduce((sum, c) => sum + c.totalStamps, 0) || 0;
  const totalRewards = program.cards?.reduce((sum, c) => sum + c.rewardsEarned, 0) || 0;
  const StampIconComponent = getStampIcon(editing ? editStampIcon : (program.stampIcon || "sparkles"));
  const CategoryIcon = getCategoryIcon(program.category || "other");

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard"
          className="p-2 rounded-lg hover:bg-foreground/5 transition"
        >
          <ArrowLeft className="h-5 w-5 text-foreground/50" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <CategoryIcon className="h-5 w-5 text-foreground/40" />
            <h1 className="text-2xl font-bold">{program.name}</h1>
          </div>
          <p className="text-sm text-foreground/40">
            {getCategoryLabel(program.category || "other")} &middot; {program.stampsRequired} stamps &rarr; {program.rewardText}
          </p>
        </div>
        {!editing && (
          <button
            onClick={startEditing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-foreground/15 text-sm font-medium hover:bg-foreground/5 transition"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </button>
        )}
      </div>

      {success && (
        <div className="text-sm text-success bg-success/10 px-3 py-2 rounded-lg mb-4">{success}</div>
      )}

      {/* Enrollment link */}
      {!editing && program.enrollmentCode && (
        <div className="border border-foreground/10 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <LinkIcon className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Enrollment link</span>
          </div>
          <p className="text-xs text-foreground/40 mb-3">
            Share this link or show the QR code so customers can join your program themselves.
          </p>
          <div className="flex gap-2">
            <div className="flex-1 bg-foreground/5 rounded-lg px-3 py-2 text-sm font-mono text-foreground/60 truncate">
              {typeof window !== "undefined" ? `${window.location.origin}/join/${program.enrollmentCode}` : `/join/${program.enrollmentCode}`}
            </div>
            <button
              onClick={copyEnrollmentLink}
              className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition shrink-0"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}

      {/* Card preview */}
      {(() => {
        const previewName = editing ? editName || "Program Name" : program.name;
        const previewStamps = editing ? editStamps : program.stampsRequired;
        const previewReward = editing ? editReward || "Reward" : program.rewardText;
        const previewColor = editing ? editColor : program.cardColor;
        const filledCount = editing ? 3 : Math.min(3, previewStamps);
        const progress = Math.round((filledCount / previewStamps) * 100);
        const remaining = previewStamps - filledCount;

        return (
          <div className="rounded-2xl bg-[#0d0d12] p-6 mb-6" style={{ "--card-glow-color": previewColor } as React.CSSProperties}>
            <div className="premium-card" style={{ backgroundColor: previewColor }}>
              <div className="relative z-[1] p-6">
                <h3 className="text-[14px] font-semibold tracking-wide text-white/90 uppercase">
                  {previewName}
                </h3>
                <p className="text-[12px] text-white/40 mt-0.5 mb-5 font-medium">
                  {previewReward}
                </p>

                <div className="grid grid-cols-5 gap-2 mb-4">
                  {Array.from({ length: Math.min(previewStamps, 20) }).map((_, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-lg flex items-center justify-center ${
                        i < filledCount ? "stamp-filled" : "stamp-empty"
                      }`}
                    >
                      {i < filledCount ? (
                        <StampIconComponent className="h-3.5 w-3.5 text-white drop-shadow-sm" />
                      ) : (
                        <span className="text-[10px] font-bold text-white/20">{i + 1}</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="progress-track h-1.5 mb-3">
                  <div className="progress-fill h-full" style={{ width: `${progress}%` }} />
                </div>

                <div className="flex items-baseline justify-between">
                  <p className="text-[12px] text-white/50 font-medium">
                    <span className="text-white/90 text-[14px] font-bold">{filledCount}</span>
                    <span className="mx-0.5">/</span>
                    {previewStamps}
                  </p>
                  <p className="text-[11px] text-white/40">
                    {remaining > 0 ? (
                      <>
                        {remaining} more for <span className="text-white/70">{previewReward}</span>
                      </>
                    ) : (
                      <span className="text-amber-300/80 font-semibold">Reward unlocked!</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Edit form */}
      {editing && (
        <form onSubmit={handleSave} className="border border-foreground/10 rounded-xl p-5 mb-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Edit Program</h2>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="p-1.5 rounded-lg hover:bg-foreground/5 transition"
            >
              <X className="h-4 w-4 text-foreground/40" />
            </button>
          </div>

          {error && (
            <div className="text-sm text-danger bg-danger/10 px-3 py-2 rounded-lg">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5">Program name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-foreground/15 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                    onClick={() => setEditCategory(cat.value)}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      editCategory === cat.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-foreground/10 text-foreground/50 hover:border-foreground/20"
                    }`}
                  >
                    <CatIcon className="h-4 w-4" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Stamps required</label>
            <input
              type="number"
              min="2"
              max="50"
              value={editStamps}
              onChange={(e) => setEditStamps(parseInt(e.target.value) || editStamps)}
              className="w-full px-3 py-2 rounded-lg border border-foreground/15 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Reward text</label>
            <input
              type="text"
              value={editReward}
              onChange={(e) => setEditReward(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-foreground/15 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                    onClick={() => setEditStampIcon(s.value)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                      editStampIcon === s.value
                        ? "ring-2 ring-offset-2 ring-primary bg-primary/10 text-primary scale-110"
                        : "bg-foreground/5 text-foreground/40 hover:scale-105"
                    }`}
                  >
                    <SIcon className="h-4 w-4" />
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
                  onClick={() => setEditColor(color)}
                  className={`w-9 h-9 rounded-lg transition-all ${
                    editColor === color ? "ring-2 ring-offset-2 ring-primary scale-110" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={editColor}
                onChange={(e) => setEditColor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-foreground/15 cursor-pointer"
              />
              <span className="text-sm text-foreground/40">Or pick any color</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary text-white py-2.5 rounded-lg font-medium text-sm hover:bg-primary-dark transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save changes
          </button>
        </form>
      )}

      {/* Stats */}
      {!editing && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="border border-foreground/10 rounded-xl p-4 text-center">
            <Users className="h-5 w-5 text-primary mx-auto mb-1" />
            <div className="text-2xl font-bold">{customerCount}</div>
            <div className="text-xs text-foreground/40">Customers</div>
          </div>
          <div className="border border-foreground/10 rounded-xl p-4 text-center">
            <Stamp className="h-5 w-5 text-success mx-auto mb-1" />
            <div className="text-2xl font-bold">{totalStamps}</div>
            <div className="text-xs text-foreground/40">Total stamps</div>
          </div>
          <div className="border border-foreground/10 rounded-xl p-4 text-center">
            <Gift className="h-5 w-5 text-warning mx-auto mb-1" />
            <div className="text-2xl font-bold">{totalRewards}</div>
            <div className="text-xs text-foreground/40">Rewards earned</div>
          </div>
        </div>
      )}

      {/* Customer list */}
      {!editing && program.cards && program.cards.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Customers</h2>
          <div className="border border-foreground/10 rounded-xl divide-y divide-foreground/5">
            {program.cards.map((card) => (
              <div key={card.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">
                    {card.customer.name || card.customer.phone}
                  </div>
                  {card.customer.name && (
                    <div className="text-xs text-foreground/40">{card.customer.phone}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {card.currentStamps}/{program.stampsRequired}
                  </div>
                  <div className="text-xs text-foreground/40">
                    {card.rewardsEarned} reward{card.rewardsEarned !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
