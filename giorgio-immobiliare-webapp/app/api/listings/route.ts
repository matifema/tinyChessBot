import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: Request) {
  // Delegate to Cloudflare Pages Function (has access to env.DB)
  const url = new URL(request.url);
  const res = await fetch(`${url.origin}/api/listings${url.search}`, {
    headers: { accept: "application/json" },
    cache: "no-store",
  });

  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
  });
}

export async function POST(request: Request) {
  // Keep admin protection in Next (session cookie parsing is handled here),
  // then delegate the actual DB write to the Pages Function.
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const payload = await request.text();

  const res = await fetch(`${url.origin}/api/listings`, {
    method: "POST",
    headers: { "content-type": request.headers.get("content-type") ?? "application/json" },
    body: payload,
    cache: "no-store",
  });

  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
  });
}
