export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("CUSTOM_API_URL");
    if (saved) return saved;
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
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
  const { timeout = 15000, ...customConfig } = options;
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
      throw new Error(`Request to ${baseUrl} timed out. Make sure the backend server (node index.js) is running on port 3000.`);
    }
    if (error.message === "Failed to fetch" || error.name === "TypeError") {
      throw new Error(`Failed to connect to backend at ${baseUrl}. Ensure "node index.js" is running locally or check Settings to update backend URL.`);
    }
    throw error;
  }
}
