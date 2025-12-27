export interface Env {
  DB: D1Database;
  ADMIN_API_KEY: string;
}

function unauthorized() {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export const onRequestDelete: PagesFunction<Env> = async ({ request, params, env }) => {
  const apiKey = request.headers.get("x-admin-api-key");
  if (!env.ADMIN_API_KEY || apiKey !== env.ADMIN_API_KEY) return unauthorized();

  const id = typeof params.id === "string" ? params.id : null;

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing id" }), {
      status: 400,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  try {
    await env.DB.prepare(`DELETE FROM listings WHERE id = ?`).bind(id).run();

    return new Response(JSON.stringify({ message: "Listing deleted successfully" }), {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error deleting listing:", error);

    return new Response(JSON.stringify({ error: "Failed to delete listing", debug: { message } }), {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
};
