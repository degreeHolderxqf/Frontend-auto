// Live Render Production Backend URL (Universal)
export const RENDER_BACKEND_URL = "https://auto-9if9.onrender.com";

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    // If a custom URL is stored, ensure it's not localhost
    const saved = localStorage.getItem("CUSTOM_API_URL");
    if (saved && !saved.includes("localhost") && !saved.includes("127.0.0.1")) {
      return saved.replace(/\/$/, "");
    }
    // Automatically clear any old localhost values
    if (saved && (saved.includes("localhost") || saved.includes("127.0.0.1"))) {
      localStorage.removeItem("CUSTOM_API_URL");
    }
  }

  return process.env.NEXT_PUBLIC_API_URL || RENDER_BACKEND_URL;
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
  const { timeout = 35000, retries = 1, body, ...customConfig } = options;
  const baseUrl = getApiBaseUrl();

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${baseUrl.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;

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
        mode: "cors",
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

      // If we have retries left and it was a cold start network drop, wait 2s and retry
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
    }
  }

  if (lastError?.name === "AbortError") {
    throw new Error(`Request to Render backend (${baseUrl}) timed out. Please allow 30 seconds for Render to wake up if cold-starting.`);
  }
  if (lastError?.message === "Failed to fetch" || lastError?.name === "TypeError") {
    throw new Error(`Unable to connect to Render backend at ${baseUrl}. Please check if the Render service is active.`);
  }
  throw lastError;
}
