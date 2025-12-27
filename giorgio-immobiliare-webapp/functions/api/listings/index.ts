import { mapListingRow, type Listing, type PropertyType } from "../../../lib/db";

export interface Env {
  DB: D1Database;
}

function getOrderBy(sortBy: string): { sql: string } {
  const [field, direction] = sortBy.split("_");
  const dir = direction?.toLowerCase() === "asc" ? "ASC" : "DESC";

  switch (field) {
    case "createdAt":
      return { sql: `created_at ${dir}` };
    case "price":
      return { sql: `price ${dir}` };
    default:
      return { sql: `created_at DESC` };
  }
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const { searchParams } = new URL(request.url);
  const propertyType = searchParams.get("propertyType");
  const sortBy = searchParams.get("sortBy") || "createdAt_desc";

  const orderBy = getOrderBy(sortBy);

  const baseSelect = `SELECT
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
  FROM listings`;

  try {
    let stmt: D1PreparedStatement;

    if (propertyType && propertyType !== "all") {
      stmt = env.DB.prepare(`${baseSelect} WHERE property_type = ? ORDER BY ${orderBy.sql}`).bind(
        propertyType as PropertyType
      );
    } else {
      stmt = env.DB.prepare(`${baseSelect} ORDER BY ${orderBy.sql}`);
    }

    const result = await stmt.all<Record<string, unknown>>();
    const listings: Listing[] = (result.results ?? []).map(mapListingRow);

    return new Response(JSON.stringify(listings), {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to fetch listings:", error);

    return new Response(JSON.stringify({ error: "Failed to fetch listings", debug: { message } }), {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
};
