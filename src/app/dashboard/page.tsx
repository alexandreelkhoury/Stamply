"use client";

import {
  Users, Stamp, Gift, TrendingUp, Loader2, Plus,
  Coffee, Scissors, ShoppingBag, Cpu, PawPrint, Flower2,
  Utensils, Dumbbell, Car, Heart, Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  coffee: Coffee, food: Utensils, beauty: Scissors,
  retail: ShoppingBag, fitness: Dumbbell, electronics: Cpu,
  pets: PawPrint, plants: Flower2, auto: Car, health: Heart,
  other: Star,
};
import Link from "next/link";
import { useAnalytics } from "@/hooks/use-analytics";
import { usePrograms } from "@/hooks/use-programs";

export default function DashboardPage() {
  const { analytics, isLoading: analyticsLoading } = useAnalytics();
  const { programs, isLoading: programsLoading } = usePrograms();
  const loading = analyticsLoading || programsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const stats = [
    { label: "Total Customers", value: analytics?.totalCustomers || 0, icon: Users, color: "text-primary" },
    { label: "Stamps Today", value: analytics?.totalStampsToday || 0, icon: Stamp, color: "text-success" },
    { label: "Rewards Given", value: analytics?.totalRewards || 0, icon: Gift, color: "text-warning" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link
          href="/dashboard/scan"
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition"
        >
          Scan QR Code
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="border border-foreground/10 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <span className="text-sm text-foreground/50">{stat.label}</span>
            </div>
            <div className="text-3xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Programs */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Your Programs</h2>
        <Link
          href="/dashboard/setup"
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition"
        >
          <Plus className="h-4 w-4" />
          New program
        </Link>
      </div>

      {programs.length === 0 ? (
        <div className="border border-dashed border-foreground/20 rounded-xl p-8 text-center">
          <TrendingUp className="h-8 w-8 text-foreground/20 mx-auto mb-3" />
          <h3 className="font-semibold mb-1">Create your loyalty program</h3>
          <p className="text-sm text-foreground/50 mb-4">Set up your first reward program to start collecting customers</p>
          <Link
            href="/dashboard/setup"
            className="inline-block bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition"
          >
            Set up program
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {programs.map((program) => (
            <Link
              key={program.id}
              href={`/dashboard/programs/${program.id}`}
              className="group border border-foreground/10 rounded-xl overflow-hidden hover:border-foreground/20 transition"
            >
              {/* Color bar */}
              <div className="h-2" style={{ backgroundColor: program.cardColor }} />
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  {(() => {
                    const Icon = CATEGORY_ICONS[(program as unknown as Record<string, unknown>).category as string] || Star;
                    return (
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: program.cardColor }}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                    );
                  })()}
                  <div>
                    <h3 className="font-medium group-hover:text-primary transition">{program.name}</h3>
                    <p className="text-xs text-foreground/40">
                      {program._count?.cards || 0} customers
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-foreground/50">
                  <span>{program.stampsRequired} stamps &rarr; {program.rewardText}</span>
                  <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition">
                    View details &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Recent activity */}
      {analytics?.recentStamps && analytics.recentStamps.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-2">
            {analytics.recentStamps.slice(0, 10).map((stamp) => (
              <div key={stamp.id} className="flex items-center justify-between py-2 border-b border-foreground/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${stamp.stampType === 'reward_redeemed' ? 'bg-warning' : 'bg-success'}`} />
                  <div>
                    <span className="text-sm font-medium">
                      {stamp.card.customer.name || stamp.card.customer.phone}
                    </span>
                    <span className="text-sm text-foreground/40 ml-2">
                      {stamp.stampType === 'reward_redeemed' ? 'earned reward' : 'stamped'} · {stamp.card.program.name}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-foreground/30">
                  {new Date(stamp.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
