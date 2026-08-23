// Cloudflare Worker — the write endpoint for the diagnostic.
//
// Paste this at workers.cloudflare.com (Create Worker → replace the code →
// Deploy), then bind a KV namespace called RESPONSES under Settings →
// Variables → KV Namespace Bindings.
//
// The endpoint URL is visible in the page source, as any browser-called URL
// must be. That is not a leak to fix; it is how the web works. What matters is
// what the endpoint ACCEPTS: a class code, a size cap, and a shape check are
// enough to keep a classroom dataset clean.

const CLASS_CODE = 'MATH120E-F26';   // change per term
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

    if (request.method === 'GET') {
      // a quick way to read what has come in, guarded by the same code
      const url = new URL(request.url);
      if (url.searchParams.get('code') !== CLASS_CODE) {
        return json({ ok: false, error: 'bad code' }, 403);
      }
      const list = await env.RESPONSES.list({ limit: 1000 });
      const rows = [];
      for (const k of list.keys) rows.push(JSON.parse(await env.RESPONSES.get(k.name)));
      return json({ ok: true, count: rows.length, rows });
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
      student: String(body.student || '').slice(0, 40),
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
