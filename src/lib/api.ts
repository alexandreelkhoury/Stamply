const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

class ApiClient {
  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }

  setToken(token: string) {
    localStorage.setItem("token", token);
  }

  clearToken() {
    localStorage.removeItem("token");
  }

  async fetch<T = any>(
    path: string,
    options: RequestInit = {}
  ): Promise<{ data: T; ok: boolean; status: number }> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      credentials: "include",
    });

    const data = await res.json().catch(() => ({}));
    return { data: data as T, ok: res.ok, status: res.status };
  }

  async get<T = any>(path: string) {
    return this.fetch<T>(path, { method: "GET" });
  }

  async post<T = any>(path: string, body?: unknown) {
    return this.fetch<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T = any>(path: string, body?: unknown) {
    return this.fetch<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T = any>(path: string) {
    return this.fetch<T>(path, { method: "DELETE" });
  }
}

export const api = new ApiClient();
