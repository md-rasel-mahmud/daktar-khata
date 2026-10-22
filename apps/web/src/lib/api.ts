export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "http://localhost:7733/api/v1";

export async function fetchJson<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
      cache: options?.cache || "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData?.message || `Request failed with status ${res.status}`
      );
    }

    const data = await res.json();
    return (data?.data !== undefined ? data.data : data) as T;
  } catch (error) {
    console.error(`API fetch error [${url}]:`, error);
    throw error;
  }
}
