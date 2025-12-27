import { mapListingRow, type Listing } from "../../../../lib/db";

export interface Env {
  DB: D1Database;
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

export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  const id = typeof params.id === "string" ? params.id : null;

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing id" }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  try {
    const row = await env.DB.prepare(SELECT_BY_ID).bind(id).first<Record<string, unknown>>();

    if (!row) {
      return new Response(JSON.stringify({ error: "Listing not found" }), {
        status: 404,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }

    const listing: Listing = mapListingRow(row);

    return new Response(JSON.stringify(listing), {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error fetching listing:", error);

    return new Response(JSON.stringify({ error: "Failed to fetch listing", debug: { message } }), {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
};
