export interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const tables = await env.DB.prepare(
      `SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name`
    ).all<{ name: string; sql: string }>();

    const listingsInfo = await env.DB.prepare(`PRAGMA table_info(listings)`).all<{
      cid: number;
      name: string;
      type: string;
      notnull: number;
      dflt_value: unknown;
      pk: number;
    }>();

    return new Response(
      JSON.stringify(
        {
          ok: true,
          tables: tables.results ?? [],
          listingsTableInfo: listingsInfo.results ?? [],
        },
        null,
        2
      ),
      {
        status: 200,
        headers: { "content-type": "application/json; charset=utf-8" },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
};
