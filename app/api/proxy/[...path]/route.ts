import { NextRequest, NextResponse } from "next/server";

const DEFAULT_BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://auto-rho-peach.vercel.app";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const targetPath = path.join("/");
  const search = request.nextUrl.search;
  const targetUrl = `${DEFAULT_BACKEND_URL}/${targetPath}${search}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 40000);
    const headers = new Headers({ Accept: "application/json" });
    const cookie = request.headers.get("cookie");
    if (cookie) headers.set("Cookie", cookie);

    const response = await fetch(targetUrl, {
      headers,
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeout);

    const contentType = response.headers.get("content-type") || "application/json";
    const data = await response.text();
    const responseHeaders = new Headers({
      "Content-Type": contentType,
      "Cache-Control": "no-store, no-cache, must-revalidate",
    });
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) responseHeaders.set("Set-Cookie", setCookie);

    return new NextResponse(data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to reach the configured Vercel backend" },
      { status: 502 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const targetPath = path.join("/");
  const targetUrl = `${DEFAULT_BACKEND_URL}/${targetPath}`;

  try {
    const body = await request.text();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    const headers = new Headers({
      "Content-Type": "application/json",
      Accept: "application/json",
    });
    const cookie = request.headers.get("cookie");
    if (cookie) headers.set("Cookie", cookie);

    const response = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: body || "{}",
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeout);

    const contentType = response.headers.get("content-type") || "application/json";
    const data = await response.text();
    const responseHeaders = new Headers({ "Content-Type": contentType, "Cache-Control": "no-store" });
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) responseHeaders.set("Set-Cookie", setCookie);

    return new NextResponse(data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to reach the configured Vercel backend" },
      { status: 502 }
    );
  }
}
