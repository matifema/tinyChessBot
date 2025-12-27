import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { mapListingRow, type Listing } from "@/lib/db";

type Env = {
  DB: D1Database;
};

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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }>; env: Env }
) {
  // Public GET: used by /annunci/[id]
  try {
    const { id } = await context.params;

    const row = await context.env.DB.prepare(SELECT_BY_ID)
      .bind(id)
      .first<Record<string, unknown>>();

    if (!row) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    return NextResponse.json(mapListingRow(row));
  } catch (error) {
    console.error("Error fetching listing:", error);
    return NextResponse.json({ error: "Failed to fetch listing" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }>; env: Env }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await context.params;
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

    const normalizedImageUrls: string[] = Array.isArray(imageUrls)
      ? imageUrls
      : typeof imageUrls === "string" && imageUrls.trim() !== ""
        ? imageUrls.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [];

    const now = new Date().toISOString();

    await context.env.DB.prepare(
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
        id
      )
      .run();

    const row = await context.env.DB.prepare(SELECT_BY_ID)
      .bind(id)
      .first<Record<string, unknown>>();

    if (!row) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    return NextResponse.json(mapListingRow(row));
  } catch (error) {
    console.error("Error updating listing:", error);
    return NextResponse.json({ error: "Failed to update listing" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }>; env: Env }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await context.params;

    await context.env.DB.prepare(`DELETE FROM listings WHERE id = ?`).bind(id).run();

    return NextResponse.json({ message: "Listing deleted successfully" });
  } catch (error) {
    console.error("Error deleting listing:", error);
    return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 });
  }
}
