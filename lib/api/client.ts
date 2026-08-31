// Live Render Production Backend URL (Universal)
export const RENDER_BACKEND_URL = "https://auto-9if9.onrender.com";

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    // Check for environment variable override
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envUrl) {
      return envUrl.replace(/\/$/, "");
    }

    const saved = localStorage.getItem("CUSTOM_API_URL");
    if (saved && !saved.includes("localhost") && !saved.includes("127.0.0.1")) {
      return saved.replace(/\/$/, "");
    }
    if (saved && (saved.includes("localhost") || saved.includes("127.0.0.1"))) {
      localStorage.removeItem("CUSTOM_API_URL");
    }

    // On Vercel / browser: use the Next.js API proxy route for zero CORS/latency issues
    return "/api/proxy";
  }

  return RENDER_BACKEND_URL;
}

export function setCustomApiUrl(url: string) {
  if (typeof window !== "undefined") {
    if (!url || url.includes("localhost") || url.includes("127.0.0.1")) {
      localStorage.removeItem("CUSTOM_API_URL");
    } else {
      localStorage.setItem("CUSTOM_API_URL", url.replace(/\/$/, ""));
    }
  }
}

interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
}

export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { timeout = 45000, retries = 1, body, ...customConfig } = options;
  const baseUrl = getApiBaseUrl();

  // Normalize endpoint
  const cleanEndpoint = endpoint.replace(/^\//, "");
  let url = baseUrl.startsWith("http")
    ? `${baseUrl.replace(/\/$/, "")}/${cleanEndpoint}`
    : `${baseUrl}/${cleanEndpoint}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(customConfig.headers as Record<string, string>),
  };

  if (body) {
    headers["Content-Type"] = "application/json";
  }

  let lastError: any = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...customConfig,
        body,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // fallback
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return (await response.json()) as T;
      }

      return (await response.text()) as unknown as T;
    } catch (error: any) {
      clearTimeout(timeoutId);
      lastError = error;

      // Fallback from proxy to direct Render URL on retry
      if (attempt === 0 && url.startsWith("/api/proxy")) {
        url = `${RENDER_BACKEND_URL}/${cleanEndpoint}`;
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }

      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
    }
  }

  if (lastError?.name === "AbortError") {
    throw new Error(`Request timed out. Render backend is warming up (takes ~30-40s on first load).`);
  }
  if (lastError?.message === "Failed to fetch" || lastError?.name === "TypeError") {
    throw new Error(`Unable to connect to Render backend at ${RENDER_BACKEND_URL}.`);
  }
  throw lastError;
}
