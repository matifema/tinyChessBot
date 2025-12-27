export interface Env {
  IMAGES: R2Bucket;
}

function notFound() {
  return new Response("Not found", { status: 404 });
}

export const onRequestGet: PagesFunction<Env> = async ({ env, params, request }) => {
  const keyParam = params.key;

  // IMPORTANT:
  // - In Pages Functions, a route like `/api/images/[key]` only captures ONE path segment.
  // - Our R2 keys include slashes (e.g. `listings/<uuid>-file.png`).
  // Therefore we expect the client to pass the key URL-encoded, with slashes encoded as `%2F`.
  // We then decode it back to the original R2 key.
  const encodedKey = typeof keyParam === "string" ? keyParam : null;
  if (!encodedKey) return notFound();

  let key: string;
  try {
    key = decodeURIComponent(encodedKey);
  } catch {
    return notFound();
  }

  const obj = await env.IMAGES.get(key);
  if (!obj) return notFound();

  const headers = new Headers();
  obj.writeHttpMetadata(headers);

  // Reasonable caching for immutable object keys (we include UUID in key).
  headers.set("cache-control", "public, max-age=31536000, immutable");

  // Support range requests for better UX on large images.
  const range = request.headers.get("range");
  if (range) {
    const ranged = await env.IMAGES.get(key, { range });
    if (!ranged) return notFound();

    const rangedHeaders = new Headers(headers);
    rangedHeaders.set("accept-ranges", "bytes");
    if (ranged.range) {
      rangedHeaders.set(
        "content-range",
        `bytes ${ranged.range.offset}-${ranged.range.end}/${ranged.size}`
      );
    }

    return new Response(ranged.body, {
      status: 206,
      headers: rangedHeaders,
    });
  }

  return new Response(obj.body, { status: 200, headers });
};
