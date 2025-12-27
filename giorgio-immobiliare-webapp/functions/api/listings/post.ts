import { mapListingRow } from "../../../lib/db";

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

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const apiKey = request.headers.get("x-admin-api-key");
  if (!env.ADMIN_API_KEY || apiKey !== env.ADMIN_API_KEY) return unauthorized();

  const body = (await request.json()) as Record<string, unknown>;

  const {
    title,
    description,
    location,
    price,
    status,
    propertyType,
    bedrooms,
    bathrooms,
    squareMeters,
    imageUrls,
  } = body;

  if (!title || !location || price === undefined || !propertyType || !status) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  const normalizedImageUrls: string[] = Array.isArray(imageUrls)
    ? (imageUrls as unknown[]).filter((x): x is string => typeof x === "string")
    : typeof imageUrls === "string" && imageUrls.trim() !== ""
      ? imageUrls.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    const nextRef = await env.DB.prepare(
      `SELECT COALESCE(MAX(reference_number), 0) + 1 AS next_ref FROM listings`
    ).first<{ next_ref: number }>();

    const referenceNumber = Number(nextRef?.next_ref ?? 1);

    await env.DB.prepare(
      `INSERT INTO listings (
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        referenceNumber,
        String(title),
        description ? String(description) : null,
        String(location),
        Number(price),
        String(status),
        String(propertyType),
        bedrooms ? Number.parseInt(String(bedrooms), 10) : null,
        bathrooms ? Number.parseInt(String(bathrooms), 10) : null,
        squareMeters ? Number.parseInt(String(squareMeters), 10) : null,
        JSON.stringify(normalizedImageUrls),
        now,
        now
      )
      .run();

    const created = await env.DB.prepare(
      `SELECT
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
      WHERE id = ?`
    )
      .bind(id)
      .first<Record<string, unknown>>();

    return new Response(JSON.stringify(created ? mapListingRow(created) : { id }), {
      status: 201,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to create listing:", error);

    return new Response(JSON.stringify({ error: "Failed to create listing", debug: { message } }), {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
};
