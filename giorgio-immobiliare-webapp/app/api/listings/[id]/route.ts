import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = params.id;

  try {
    await prisma.listing.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Listing deleted successfully" });
  } catch (error) {
    console.error("Failed to delete listing:", error);
    return NextResponse.json(
      { error: "Failed to delete listing" },
      { status: 500 }
    );
  }
}
