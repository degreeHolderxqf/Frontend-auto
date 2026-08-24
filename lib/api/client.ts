export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    // 1. User manual override from Settings page
    const saved = localStorage.getItem("CUSTOM_API_URL");
    if (saved) return saved;

    // 2. If browser is on localhost / 127.0.0.1, use localhost unless NEXT_PUBLIC_API_URL is explicitly set
    const isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (isLocal) {
      return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    }

    // 3. If deployed on Vercel / Remote (e.g. *.vercel.app), ALWAYS default to Render backend
    return process.env.NEXT_PUBLIC_API_URL || "https://auto-9if9.onrender.com";
  }

  return process.env.NEXT_PUBLIC_API_URL || "https://auto-9if9.onrender.com";
}

export function setCustomApiUrl(url: string) {
  if (typeof window !== "undefined") {
    if (!url) {
      localStorage.removeItem("CUSTOM_API_URL");
    } else {
      localStorage.setItem("CUSTOM_API_URL", url.replace(/\/$/, ""));
    }
  }
}

interface FetchOptions extends RequestInit {
  timeout?: number;
}

export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { timeout = 25000, ...customConfig } = options;
  const baseUrl = getApiBaseUrl();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Normalize endpoint
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${baseUrl.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;

  const headers = {
    "Content-Type": "application/json",
    ...customConfig.headers,
  };

  try {
    const response = await fetch(url, {
      ...customConfig,
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
    if (error.name === "AbortError") {
      throw new Error(`Request to ${baseUrl} timed out. The backend server might be cold-starting on Render or unreachable.`);
    }
    if (error.message === "Failed to fetch" || error.name === "TypeError") {
      throw new Error(`Failed to connect to backend at ${baseUrl}. Ensure the backend service is running or check Settings.`);
    }
    throw error;
  }
}
