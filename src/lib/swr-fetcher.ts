import { api } from "./api";

// SWR fetcher that wraps the API client.
// On 401, throws so SWR's onError can handle the redirect.
export async function swrFetcher<T>(path: string): Promise<T> {
  const { data, ok, status } = await api.get<T>(path);

  if (status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!ok) {
    throw new Error(`API error: ${status}`);
  }

  return data;
}
