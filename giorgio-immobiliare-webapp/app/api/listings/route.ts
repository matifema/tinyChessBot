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

export async function GET(request: Request, context: { env: Env }) {
  // Public GET: used by /annunci
  const { searchParams } = new URL(request.url);
  const propertyType = searchParams.get("propertyType");
  const sortBy = searchParams.get("sortBy") || "createdAt_desc";

  const orderBy = getOrderBy(sortBy);

  try {
    let stmt = context.env.DB.prepare(
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
      FROM listings`
    );

    if (propertyType && propertyType !== "all") {
      stmt = context.env.DB.prepare(
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
        WHERE property_type = ?
        ORDER BY ${orderBy.sql}`
      ).bind(propertyType as PropertyType);
    } else {
      stmt = context.env.DB.prepare(
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
        ORDER BY ${orderBy.sql}`
      );
    }

    const result = await stmt.all<Record<string, unknown>>();
    const listings: Listing[] = (result.results ?? []).map(mapListingRow);
    return NextResponse.json(listings);
  } catch (error) {
    console.error("Failed to fetch listings:", error);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
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
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
  }
}
