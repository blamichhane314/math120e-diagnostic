// Cloudflare Worker — the write endpoint for the diagnostic.
//
// Paste this at workers.cloudflare.com (Create Worker → replace the code →
// Deploy), then bind a KV namespace called RESPONSES under Settings →
// Variables → KV Namespace Bindings.
//
// The endpoint URL is visible in the page source, as any browser-called URL
// must be. That is not a leak to fix; it is how the web works. What matters is
// what the endpoint ACCEPTS on the way in, and who it will read back OUT to —
// which are two different questions with two different answers.

// Writing and reading need DIFFERENT protection, and collapsing them into one
// secret was a mistake: the class code lives in a public repo, so anything it
// guards is effectively public.
//
//   CLASS_CODE — sent by the page, therefore public by construction. It exists
//     only to keep the dataset free of drive-by noise, and nothing more.
//   ADMIN_KEY  — a Worker SECRET (Settings -> Variables -> Add -> Encrypt).
//     Never in the repo, never in the page. This is what guards the readout.
const CLASS_CODE = 'MATH120E-F26';   // change per term
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

    if (request.method === 'GET') {
      // a quick way to read what has come in, guarded by the same code
      const url = new URL(request.url);
      const supplied = url.searchParams.get('key') || '';
      const expected = env.ADMIN_KEY || '';
      if (!expected) return json({ ok: false, error: 'ADMIN_KEY is not set on this Worker' }, 500);
      if (supplied !== expected) return json({ ok: false, error: 'not authorised' }, 403);
      const list = await env.RESPONSES.list({ limit: 1000 });
      const rows = [];
      for (const k of list.keys) rows.push(JSON.parse(await env.RESPONSES.get(k.name)));

      // JSON Lines, for keeping a copy on disk before purging
      if (url.searchParams.get('format') === 'jsonl') {
        return new Response(rows.map((r) => JSON.stringify(r)).join('\n'), {
          headers: { ...CORS, 'Content-Type': 'application/x-ndjson',
                     'Content-Disposition': 'attachment; filename="responses.jsonl"' },
        });
      }
      return json({ ok: true, count: rows.length, rows });
    }

    // Purge, once you have a copy. Holding a class's responses after you have
    // read them is a liability with no upside, and KV storage is finite.
    if (request.method === 'DELETE') {
      const url = new URL(request.url);
      if (!env.ADMIN_KEY || url.searchParams.get('key') !== env.ADMIN_KEY) {
        return json({ ok: false, error: 'not authorised' }, 403);
      }
      const list = await env.RESPONSES.list({ limit: 1000 });
      for (const k of list.keys) await env.RESPONSES.delete(k.name);
      return json({ ok: true, deleted: list.keys.length });
    }

    if (request.method !== 'POST') return json({ ok: false, error: 'POST only' }, 405);

    let body;
    try { body = await request.json(); }
    catch { return json({ ok: false, error: 'bad json' }, 400); }

    if (body.code !== CLASS_CODE) return json({ ok: false, error: 'bad code' }, 403);
    if (JSON.stringify(body).length > 20000) return json({ ok: false, error: 'too large' }, 413);
    if (!body.session || !Array.isArray(body.answers)) {
      return json({ ok: false, error: 'expected session and answers[]' }, 400);
    }

    const rec = {
      at: new Date().toISOString(),
      session: String(body.session).slice(0, 40),
      answers: body.answers.slice(0, 60),
      ms: Number(body.ms) || null,
      ua: (request.headers.get('user-agent') || '').slice(0, 120),
    };
    // key sorts by time, so listing comes back in order
    await env.RESPONSES.put(rec.at + '|' + rec.session, JSON.stringify(rec));
    return json({ ok: true });
  },
};

const json = (o, status = 200) =>
  new Response(JSON.stringify(o), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
