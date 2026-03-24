"use client";

import { useEffect, useState } from "react";
import { Users, Stamp, Gift, TrendingUp, Loader2 } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Analytics {
  totalCustomers: number;
  totalStampsToday: number;
  totalRewards: number;
  recentStamps: Array<{
    id: string;
    stampType: string;
    createdAt: string;
    card: {
      customer: { name: string | null; phone: string };
      program: { name: string };
    };
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [programs, setPrograms] = useState<Array<{ id: string; name: string; stampsRequired: number; rewardText: string; _count: { cards: number } }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/api/analytics"),
      api.get("/api/programs"),
    ])
      .then(([analyticsRes, programsRes]) => {
        setData(analyticsRes.data);
        setPrograms(programsRes.data.programs || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const stats = [
    { label: "Total Customers", value: data?.totalCustomers || 0, icon: Users, color: "text-primary" },
    { label: "Stamps Today", value: data?.totalStampsToday || 0, icon: Stamp, color: "text-success" },
    { label: "Rewards Given", value: data?.totalRewards || 0, icon: Gift, color: "text-warning" },
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

      {/* Program */}
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
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Your Programs</h2>
          {programs.map((program) => (
            <div key={program.id} className="border border-foreground/10 rounded-xl p-5 flex items-center justify-between">
              <div>
                <h3 className="font-medium">{program.name}</h3>
                <p className="text-sm text-foreground/50">
                  {program.stampsRequired} stamps → {program.rewardText} · {program._count.cards} customers
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent activity */}
      {data?.recentStamps && data.recentStamps.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-2">
            {data.recentStamps.slice(0, 10).map((stamp) => (
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
