export interface Env {
  IMAGES: R2Bucket;
  ADMIN_API_KEY: string;
}

function unauthorized() {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const apiKey = request.headers.get("x-admin-api-key");
  if (!env.ADMIN_API_KEY || apiKey !== env.ADMIN_API_KEY) return unauthorized();

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

  return new Response(JSON.stringify({ key, contentType }), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
};
