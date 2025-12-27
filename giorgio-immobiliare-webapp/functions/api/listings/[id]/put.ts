import { mapListingRow } from "../../../../lib/db";

export interface Env {
  DB: D1Database;
  ADMIN_API_KEY: string;
}

function unauthorized() {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

const SELECT_BY_ID = `SELECT
  id,
  reference_number,
  title,
  description,
  location,
  price,
  status,
  property_type,
  bedrooms,
  bathrooms,
  square_meters,
  image_urls,
  created_at,
  updated_at
FROM listings
WHERE id = ?`;

export const onRequestPut: PagesFunction<Env> = async ({ request, params, env }) => {
  const apiKey = request.headers.get("x-admin-api-key");
  if (!env.ADMIN_API_KEY || apiKey !== env.ADMIN_API_KEY) return unauthorized();

  const id = typeof params.id === "string" ? params.id : null;

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing id" }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const body = (await request.json()) as Record<string, unknown>;

  const normalizedImageUrls: string[] = Array.isArray(body.imageUrls)
    ? (body.imageUrls as unknown[]).filter((x): x is string => typeof x === "string")
    : typeof body.imageUrls === "string" && body.imageUrls.trim() !== ""
      ? body.imageUrls.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

  const now = new Date().toISOString();

  try {
    await env.DB.prepare(
      `UPDATE listings
       SET
         title = ?,
         description = ?,
         location = ?,
         price = ?,
         status = ?,
         property_type = ?,
         bedrooms = ?,
         bathrooms = ?,
         square_meters = ?,
         image_urls = ?,
         updated_at = ?
       WHERE id = ?`
    )
      .bind(
        body.title ?? null,
        body.description ?? null,
        body.location ?? null,
        Number(body.price),
        body.status ?? null,
        body.propertyType ?? null,
        body.bedrooms ? Number.parseInt(String(body.bedrooms), 10) : null,
        body.bathrooms ? Number.parseInt(String(body.bathrooms), 10) : null,
        body.squareMeters ? Number.parseInt(String(body.squareMeters), 10) : null,
        JSON.stringify(normalizedImageUrls),
        now,
        id
      )
      .run();

    const row = await env.DB.prepare(SELECT_BY_ID).bind(id).first<Record<string, unknown>>();

    if (!row) {
      return new Response(JSON.stringify({ error: "Listing not found" }), {
        status: 404,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }

    return new Response(JSON.stringify(mapListingRow(row)), {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error updating listing:", error);

    return new Response(JSON.stringify({ error: "Failed to update listing", debug: { message } }), {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
};
