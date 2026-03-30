"use client";

import {
  Sparkles, Star, Heart, Gem, Zap, Gift, Sun, Moon, Crown, Music,
  Coffee, Flower2, PawPrint, Scissors, Dumbbell,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  sparkles: Sparkles, star: Star, heart: Heart, gem: Gem, zap: Zap,
  gift: Gift, sun: Sun, moon: Moon, crown: Crown, music: Music,
  coffee: Coffee, flower: Flower2, paw: PawPrint, scissors: Scissors,
  dumbbell: Dumbbell,
};

export default function StampIconDisplay({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICONS[name] || Sparkles;
  return <Icon className={className} />;
}
