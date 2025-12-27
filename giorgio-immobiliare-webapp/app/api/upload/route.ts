import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

type Env = {
  IMAGES: R2Bucket;
};

function sanitizeFilename(filename: string): string {
  // Keep it simple and safe for object keys
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(request: Request, context: { env: Env }): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const filenameParam = searchParams.get("filename");

  if (!filenameParam) {
    return NextResponse.json({ error: "No filename provided." }, { status: 400 });
  }

  const contentType = request.headers.get("content-type") || "application/octet-stream";
  const arrayBuffer = await request.arrayBuffer();

  if (arrayBuffer.byteLength === 0) {
    return NextResponse.json({ error: "Empty file body." }, { status: 400 });
  }

  const safeName = sanitizeFilename(filenameParam);
  const key = `listings/${crypto.randomUUID()}-${safeName}`;

  await context.env.IMAGES.put(key, arrayBuffer, {
    httpMetadata: { contentType },
  });

  // NOTE: R2 does not automatically provide a public URL unless you configure
  // a public bucket or a custom domain. For now we return the key; you can:
  // - store the key in DB and serve via a route that reads from R2, OR
  // - configure a public R2 bucket/domain and build the URL client-side.
  return NextResponse.json({ key, contentType });
}
