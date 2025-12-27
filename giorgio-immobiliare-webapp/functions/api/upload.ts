export interface Env {
  IMAGES: R2Bucket;
  ADMIN_API_KEY: string;
}

function unauthorized(debug?: Record<string, unknown>) {
  return new Response(JSON.stringify({ error: "Unauthorized", debug }), {
    status: 401,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  // Accept both header names to avoid client/env mismatches.
  const apiKey =
    request.headers.get("x-admin-api-key") ?? request.headers.get("x-admin-api_key");

  // In Pages Functions, env vars come from:
  // - Pages project settings (recommended), OR
  // - wrangler.toml [vars] for local dev
  //
  // If you're seeing Unauthorized, it's usually:
  // - header not being sent (empty shell var), OR
  // - env.ADMIN_API_KEY not set in the Pages dev environment.
  if (!env.ADMIN_API_KEY || !apiKey || apiKey !== env.ADMIN_API_KEY) {
    return unauthorized({
      hasEnvKey: Boolean(env.ADMIN_API_KEY),
      hasHeaderKey: Boolean(apiKey),
      headerKeyLength: apiKey?.length ?? 0,
      envKeyLength: env.ADMIN_API_KEY?.length ?? 0,
    });
  }

  const { searchParams } = new URL(request.url);
  const filenameParam = searchParams.get("filename");

  if (!filenameParam) {
    return new Response(JSON.stringify({ error: "No filename provided." }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const contentType = request.headers.get("content-type") || "application/octet-stream";
  const arrayBuffer = await request.arrayBuffer();

  if (arrayBuffer.byteLength === 0) {
    return new Response(JSON.stringify({ error: "Empty file body." }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const safeName = sanitizeFilename(filenameParam);
  const key = `listings/${crypto.randomUUID()}-${safeName}`;

  await env.IMAGES.put(key, arrayBuffer, {
    httpMetadata: { contentType },
  });

  // Return a URL that the frontend can render directly.
  // We serve images via a Pages Function that streams from R2.
  const url = new URL(request.url);
  const publicUrl = `${url.origin}/api/images/${encodeURIComponent(key)}`;

  return new Response(JSON.stringify({ key, url: publicUrl, contentType }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
};
