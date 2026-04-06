/**
 * API Client - Native fetch wrapper with auth token handling
 * Includes timeout support to handle Render cold-start delays gracefully.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Default timeout: 20s (accommodates Render free-tier cold starts ~15s)
const DEFAULT_TIMEOUT_MS = 20_000;

function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
    ...(token ? { Authorization: 'Bearer ' + token } : {}),
  };

  // Timeout via AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(BASE_URL + path, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(
        'Kết nối đến máy chủ quá chậm. Vui lòng thử lại sau vài giây.'
      );
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  }

  if (!res.ok) {
    // Try to extract server error message
    try {
      const body = await res.json();
      throw new Error(body?.message || `Request failed: ${res.status} ${res.statusText}`);
    } catch {
      throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    }
  }

  return res.json() as Promise<T>;
}

const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  // Expose extended timeout for payment flows
  postWithTimeout: <T>(path: string, body: unknown, timeoutMs: number) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }, timeoutMs),
};

export default api;