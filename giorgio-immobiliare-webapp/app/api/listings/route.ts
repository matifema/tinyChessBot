import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { mapListingRow, type Listing, type PropertyType } from "@/lib/db";

type Env = {
  DB: D1Database;
};

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

function withDebug(error: unknown, request: Request, context: { env: Env }) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  return NextResponse.json(
    {
      error: "Failed to fetch listings",
      debug: {
        message,
        stack,
        url: request.url,
        hasDBBinding: Boolean(context?.env?.DB),
      },
    },
    { status: 500 }
  );
}

export async function GET(request: Request) {
  // Public GET: used by /annunci
  //
  // IMPORTANT (local dev):
  // - When running `next dev` directly, Cloudflare bindings (D1/R2) are NOT available.
  // - When running through `wrangler pages dev`, Next route handlers still run in Node,
  //   so `context.env` is not reliably provided.
  //
  // Therefore, for local development we use a D1 URL from env and query via fetch.
  // In production on Cloudflare Pages, you should switch to a Pages Functions data layer
  // or a Worker that exposes the DB. For now, this unblocks local dev and keeps the API working.
  const { searchParams } = new URL(request.url);
  const propertyType = searchParams.get("propertyType");
  const sortBy = searchParams.get("sortBy") || "createdAt_desc";

  const orderBy = getOrderBy(sortBy);

  const d1Url = process.env.D1_DATABASE_URL;
  const d1Token = process.env.D1_DATABASE_TOKEN;

  if (!d1Url || !d1Token) {
    return NextResponse.json(
      {
        error: "D1 is not configured for local dev.",
        debug: {
          missing: [
            !d1Url ? "D1_DATABASE_URL" : null,
            !d1Token ? "D1_DATABASE_TOKEN" : null,
          ].filter(Boolean),
        },
      },
      { status: 500 }
    );
  }

  const whereClause =
    propertyType && propertyType !== "all" ? `WHERE property_type = ?1` : "";
  const params =
    propertyType && propertyType !== "all" ? [propertyType as PropertyType] : [];

  const sql = `SELECT
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
    ${whereClause}
    ORDER BY ${orderBy.sql}`;

  try {
    const res = await fetch(d1Url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${d1Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Failed to query D1", debug: { status: res.status, text } },
        { status: 500 }
      );
    }

    const json = (await res.json()) as {
      result?: Array<{ results?: Record<string, unknown>[] }>;
      errors?: unknown;
    };

    const rows = json.result?.[0]?.results ?? [];
    const listings: Listing[] = rows.map(mapListingRow);
    return NextResponse.json(listings);
  } catch (error) {
    console.error("Failed to fetch listings:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch listings",
        debug: { message: error instanceof Error ? error.message : String(error) },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, context: { env: Env }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
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
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const normalizedImageUrls: string[] = Array.isArray(imageUrls)
      ? imageUrls
      : typeof imageUrls === "string" && imageUrls.trim() !== ""
        ? imageUrls.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [];

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await context.env.DB.prepare(
      `INSERT INTO listings (
        id,
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        title,
        description ?? null,
        location,
        Number(price),
        status,
        propertyType,
        bedrooms ? Number.parseInt(String(bedrooms), 10) : null,
        bathrooms ? Number.parseInt(String(bathrooms), 10) : null,
        squareMeters ? Number.parseInt(String(squareMeters), 10) : null,
        JSON.stringify(normalizedImageUrls),
        now,
        now
      )
      .run();

    const created = await context.env.DB.prepare(
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

    return NextResponse.json(created ? mapListingRow(created) : { id }, { status: 201 });
  } catch (error) {
    console.error("Failed to create listing:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Failed to create listing", debug: { message } }, { status: 500 });
  }
}
