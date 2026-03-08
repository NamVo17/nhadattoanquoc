const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export async function authorizedFetch(
  input: string,
  init: RequestInit = {},
  retry = true,
): Promise<Response> {
  const headers = new Headers(init.headers || {});

  if (!(init.body instanceof FormData)) {
    // Keep existing content-type if caller set it
    if (!headers.has("Content-Type") && init.method && init.method !== "GET") {
      headers.set("Content-Type", "application/json");
    }
  }

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(input, {
    ...init,
    headers,
    credentials: "include",
  });

  // If access token expired, try refresh once
  if (response.status === 401 && retry && typeof window !== "undefined") {
    try {
      const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (refreshRes.ok) {
        const refreshJson = await refreshRes.json();
        const newToken = refreshJson.data?.accessToken as string | undefined;
        if (newToken) {
          localStorage.setItem("accessToken", newToken);
          return authorizedFetch(input, init, false);
        }
      }
    } catch {
      // ignore and fall through to logout
    }

    // Refresh failed → clear local credentials
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  }

  return response;
}

