const DEFAULT_LOCAL_BACKEND_URL = "http://localhost:3000";
const DEFAULT_PRODUCTION_BACKEND_URL = "https://auto-rho-peach.vercel.app";

const isLocalHost = (): boolean =>
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (isLocalHost() ? DEFAULT_LOCAL_BACKEND_URL : DEFAULT_PRODUCTION_BACKEND_URL);

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const envUrl = process.env.NEXT_PUBLIC_API_URL || localStorage.getItem("CUSTOM_API_URL");
    if (envUrl) {
      return envUrl.replace(/\/$/, "");
    }

    return isLocalHost() ? DEFAULT_LOCAL_BACKEND_URL : "/api/proxy";
  }

  return process.env.NEXT_PUBLIC_API_URL || DEFAULT_PRODUCTION_BACKEND_URL;
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

function extractErrorMessage(payload: unknown): string | null {
  if (payload == null) return null;

  if (typeof payload === "string") return payload.trim() || null;
  if (payload instanceof Error) return payload.message || null;

  if (typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const candidates = [
      record.message,
      record.error,
      record.details,
      record.reason,
      record.description,
      record.statusText,
    ];

    for (const candidate of candidates) {
      const message = extractErrorMessage(candidate);
      if (message) return message;
    }

    try {
      const json = JSON.stringify(payload);
      return json && json !== "{}" && json !== "[]" ? json : null;
    } catch {
      return null;
    }
  }

  return String(payload);
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
          const extracted = extractErrorMessage(errorData?.error ?? errorData?.message ?? errorData);
          if (extracted) {
            errorMessage = extracted;
          }
        } catch {
          // response wasn't JSON - keep HTTP status error message
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

      // Fallback from proxy to the production Vercel backend on retry
      if (attempt === 0 && url.startsWith("/api/proxy")) {
        url = `${DEFAULT_PRODUCTION_BACKEND_URL}/${cleanEndpoint}`;
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
    throw new Error("Request timed out while reaching the backend. The server may be busy or unreachable — try again, or resume the batch from the Outreach page.");
  }
  if (lastError?.message === "Failed to fetch" || lastError?.name === "TypeError") {
    throw new Error(`Unable to connect to the configured backend at ${DEFAULT_PRODUCTION_BACKEND_URL}. Check your network and the backend URL in Settings.`);
  }
  throw lastError;
}
