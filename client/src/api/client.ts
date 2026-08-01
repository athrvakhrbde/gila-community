/**
 * Empty in production (same-origin via Express static).
 * In dev, Vite proxies `/api` and `/socket.io` to the API server.
 * Override with VITE_API_URL only when the API is on a different host.
 */
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(
  /\/$/,
  ""
) ?? "";

export type AuthSession = {
  token: string;
  username: string;
  userId: string;
  isAdmin: boolean;
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function getToken(): string | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    return parsed.token ?? null;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  _auth = false
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    [key: string]: unknown;
  };

  if (!res.ok) {
    throw new ApiError(data.error || "Request failed", res.status);
  }

  return data as T;
}

export { API_BASE };
