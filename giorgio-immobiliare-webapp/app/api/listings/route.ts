import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { PropertyType } from "@prisma/client";

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
