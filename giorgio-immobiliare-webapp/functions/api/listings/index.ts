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

function parseStatusList(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseTake(value: string | null): number | null {
  if (!value) return null;
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.min(n, 100);
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const { searchParams } = new URL(request.url);

  const propertyType = searchParams.get("propertyType");
  const sortBy = searchParams.get("sortBy") || "createdAt_desc";
  const statusList = parseStatusList(searchParams.get("status"));
  const take = parseTake(searchParams.get("take"));

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
    const whereParts: string[] = [];
    const bindValues: unknown[] = [];

    if (propertyType && propertyType !== "all") {
      whereParts.push(`property_type = ?`);
      bindValues.push(propertyType as PropertyType);
    }

    if (statusList.length > 0) {
      whereParts.push(`status IN (${statusList.map(() => "?").join(", ")})`);
      bindValues.push(...statusList);
    }

    const whereSql = whereParts.length > 0 ? ` WHERE ${whereParts.join(" AND ")}` : "";
    const limitSql = take ? ` LIMIT ?` : "";

    if (take) bindValues.push(take);

    const sql = `${baseSelect}${whereSql} ORDER BY ${orderBy.sql}${limitSql}`;

    const result = await env.DB.prepare(sql).bind(...bindValues).all<Record<string, unknown>>();
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
