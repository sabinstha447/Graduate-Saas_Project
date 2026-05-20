const BASE_URL = "/api";

export async function apiFetch(path: string, tenantId: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-tenant-id": tenantId,
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "API error");
  }

  return res.json();
}