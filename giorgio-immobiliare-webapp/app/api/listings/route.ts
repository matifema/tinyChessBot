import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

/**
 * Next.js dev server (Turbopack) will route `/api/listings` here.
 * In production on Cloudflare Pages, `/functions/api/listings` should handle it.
 *
 * To avoid 405s in local dev, we proxy requests to the Pages Functions dev server.
 */
const PAGES_DEV_ORIGIN = process.env.PAGES_DEV_ORIGIN ?? "http://localhost:8788";

function buildProxyUrl(req: NextRequest): string {
  const url = new URL(req.url);
  return `${PAGES_DEV_ORIGIN}${url.pathname}${url.search}`;
}

async function proxy(req: NextRequest): Promise<Response> {
  const target = buildProxyUrl(req);

  // Forward most headers, but drop hop-by-hop headers.
  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");

  const res = await fetch(target, {
    method: req.method,
    headers,
    body: req.method === "GET" || req.method === "HEAD" ? undefined : await req.arrayBuffer(),
    redirect: "manual",
  });

  // Stream response back to the client.
  return new Response(res.body, {
    status: res.status,
    headers: res.headers,
  });
}

export async function GET(req: NextRequest) {
  return proxy(req);
}

export async function POST(req: NextRequest) {
  return proxy(req);
}

export async function PUT(req: NextRequest) {
  return proxy(req);
}

export async function DELETE(req: NextRequest) {
  return proxy(req);
}

export async function OPTIONS(req: NextRequest) {
  // Let the Functions endpoint decide CORS; just proxy.
  return proxy(req);
}
