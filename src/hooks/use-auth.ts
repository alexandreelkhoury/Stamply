import useSWR from "swr";

interface Merchant {
  id: string;
  email: string;
  businessName: string;
  phone: string | null;
  logoUrl: string | null;
  subscriptionStatus: string;
}

export function useAuth() {
  const { data, error, isLoading, mutate } = useSWR<{ merchant: Merchant }>(
    "/api/auth/me",
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: 60 * 60 * 1000, // 1 hour
      errorRetryCount: 0,
    }
  );

  return {
    merchant: data?.merchant ?? null,
    isLoading,
    isError: !!error,
    isUnauthorized: error?.message === "UNAUTHORIZED",
    mutateAuth: mutate,
  };
}
