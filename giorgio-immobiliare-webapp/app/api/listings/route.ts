import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { ListingStatus, PropertyType } from "@prisma/client";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const propertyType = searchParams.get("propertyType");
  const sortBy = searchParams.get("sortBy") || "createdAt_desc";

  const [orderByField, orderByDirection] = sortBy.split("_");

  let where = {};
  if (propertyType && propertyType !== "all") {
    where = { propertyType: propertyType as PropertyType };
  }

  try {
    const listings = await prisma.listing.findMany({
      where,
      orderBy: {
        [orderByField]: orderByDirection,
      },
    });
    return NextResponse.json(listings);
  } catch (error) {
    console.error("Failed to fetch listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

    if (!title || !location || !price || !propertyType || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newListing = await prisma.listing.create({
      data: {
        title,
        description: description || null,
        location,
        price: parseFloat(price),
        status: status as ListingStatus,
        propertyType: propertyType as PropertyType,
        bedrooms: bedrooms ? parseInt(bedrooms, 10) : null,
        bathrooms: bathrooms ? parseInt(bathrooms, 10) : null,
        squareMeters: squareMeters ? parseInt(squareMeters, 10) : null,
        imageUrls: imageUrls
          ? imageUrls.split(",").map((s: string) => s.trim())
          : [],
      },
    });

    return NextResponse.json(newListing, { status: 201 });
  } catch (error) {
    console.error("Failed to create listing:", error);
    return NextResponse.json(
      { error: "Failed to create listing" },
      { status: 500 }
    );
  }
}
