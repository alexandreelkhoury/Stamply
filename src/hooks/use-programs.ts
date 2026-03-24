import useSWR from "swr";

interface Program {
  id: string;
  name: string;
  stampsRequired: number;
  rewardText: string;
  cardColor: string;
  textColor: string;
  isActive: boolean;
  _count?: { cards: number };
}

export function usePrograms() {
  const { data, error, isLoading, mutate } = useSWR<{ programs: Program[] }>(
    "/api/programs",
    {
      dedupingInterval: 5 * 60 * 1000, // 5 minutes
      revalidateOnFocus: true,
    }
  );

  return {
    programs: data?.programs ?? [],
    isLoading,
    isError: !!error,
    mutatePrograms: mutate,
  };
}
