export interface Env {
  DB: D1Database;
}

export const onRequestDelete: PagesFunction<Env> = async ({ params, env }) => {
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
