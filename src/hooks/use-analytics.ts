import useSWR from "swr";

interface StampEntry {
  id: string;
  stampType: string;
  createdAt: string;
  card: {
    customer: { name: string | null; phone: string };
    program: { name: string };
  };
}

interface Analytics {
  totalCustomers: number;
  totalStampsToday: number;
  totalRewards: number;
  recentStamps: StampEntry[];
}

export function useAnalytics() {
  const { data, error, isLoading, mutate } = useSWR<Analytics>(
    "/api/analytics",
    {
      refreshInterval: 30 * 1000, // auto-poll every 30 seconds
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );

  return {
    analytics: data ?? null,
    isLoading,
    isError: !!error,
    mutateAnalytics: mutate,
  };
}
