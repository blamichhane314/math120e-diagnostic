// worker.js — the data endpoint. Paste this into the Cloudflare Worker and
// deploy; the pages themselves are served by GitHub Pages.
//
// The page is on github.io and this is on workers.dev, so the browser treats
// every submission as cross-origin: it sends an OPTIONS preflight first and
// will discard the response unless the headers below come back. That is what
// the CORS block is for.
//
// Two guards:
//   CLASS_CODE  sent by the page, so it is public. It keeps drive-by writes
//               out of the dataset.
//   ADMIN_KEY   an encrypted variable set on the project, never in this repo
//               and never in the page. It gates reads and deletes.

const CLASS_CODE = 'MATH120E-F26';   // change per term; must match index.html

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const json = (o, status = 200) =>
  new Response(JSON.stringify(o), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
    const url = new URL(request.url);
    if (request.method === 'POST')   return submit(request, env);
    if (request.method === 'GET')    return read(url, env);
    if (request.method === 'DELETE') return purge(url, env);
    return json({ ok: false, error: 'method not allowed' }, 405);
  },
};

/* ── a student submits ─────────────────────────────────────────── */
async function submit(request, env) {
  if (!env.RESPONSES) return json({ ok: false, error: 'RESPONSES KV is not bound' }, 500);

  let body;
  try { body = await request.json(); }
  catch { return json({ ok: false, error: 'bad json' }, 400); }

  if (body.code !== CLASS_CODE) return json({ ok: false, error: 'bad code' }, 403);
  if (JSON.stringify(body).length > 20000) return json({ ok: false, error: 'too large' }, 413);
  if (!body.session || !Array.isArray(body.answers)) {
    return json({ ok: false, error: 'expected session and answers[]' }, 400);
  }

  // A response is a random session id and the answers. No name, no address.
  const rec = {
    at: new Date().toISOString(),
    session: String(body.session).slice(0, 40),
    answers: body.answers.slice(0, 60),
    ms: Number(body.ms) || null,
    // set by the page when the device is marked as the instructor's
    test: body.test === true || undefined,
  };
  await env.RESPONSES.put(rec.at + '|' + rec.session, JSON.stringify(rec));
  return json({ ok: true });
}

/* ── you read them back ────────────────────────────────────────── */
async function read(url, env) {
  if (!env.RESPONSES) return json({ ok: false, error: 'RESPONSES KV is not bound' }, 500);
  if (!env.ADMIN_KEY) return json({ ok: false, error: 'ADMIN_KEY is not set' }, 500);
  if (url.searchParams.get('key') !== env.ADMIN_KEY) {
    return json({ ok: false, error: 'not authorised' }, 403);
  }

  const list = await env.RESPONSES.list({ limit: 1000 });
  const rows = [];
  for (const k of list.keys) rows.push(JSON.parse(await env.RESPONSES.get(k.name)));

  if (url.searchParams.get('format') === 'jsonl') {
    return new Response(rows.map((r) => JSON.stringify(r)).join('\n'), {
      headers: {
        ...CORS,
        'Content-Type': 'application/x-ndjson',
        'Content-Disposition': 'attachment; filename="responses.jsonl"',
      },
    });
  }
  return json({ ok: true, count: rows.length, rows });
}

/* ── you purge, once you have a copy ───────────────────────────── */
async function purge(url, env) {
  if (!env.RESPONSES) return json({ ok: false, error: 'RESPONSES KV is not bound' }, 500);
  if (!env.ADMIN_KEY) return json({ ok: false, error: 'ADMIN_KEY is not set' }, 500);
  if (url.searchParams.get('key') !== env.ADMIN_KEY) {
    return json({ ok: false, error: 'not authorised' }, 403);
  }
  const list = await env.RESPONSES.list({ limit: 1000 });
  for (const k of list.keys) await env.RESPONSES.delete(k.name);
  return json({ ok: true, deleted: list.keys.length });
}
