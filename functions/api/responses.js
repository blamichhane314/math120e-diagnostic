// functions/api/responses.js — the endpoint, deployed with the site.
//
// A Pages Function runs on the same origin as the page that calls it, so there
// is no CORS here at all: no preflight, no allow-headers, no second thing to
// keep in sync when the class code changes. One push updates the page and the
// endpoint together, which removes the failure mode where they disagree.
//
// Two guards, doing two different jobs:
//   CLASS_CODE — sent by the page, therefore public by construction. It keeps
//     drive-by writes out of the dataset and claims nothing more.
//   ADMIN_KEY  — an environment variable set in the Pages project, never in
//     this repository and never in the page. It is the only thing standing
//     between a passer-by and the whole dataset.

const CLASS_CODE = 'MATH120E-F26';   // change per term; must match index.html

const json = (o, status = 200) =>
  new Response(JSON.stringify(o), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

/* ── a student submits ─────────────────────────────────────────── */
export async function onRequestPost({ request, env }) {
  if (!env.RESPONSES) return json({ ok: false, error: 'RESPONSES KV is not bound' }, 500);

  let body;
  try { body = await request.json(); }
  catch { return json({ ok: false, error: 'bad json' }, 400); }

  if (body.code !== CLASS_CODE) return json({ ok: false, error: 'bad code' }, 403);
  if (JSON.stringify(body).length > 20000) return json({ ok: false, error: 'too large' }, 413);
  if (!body.session || !Array.isArray(body.answers)) {
    return json({ ok: false, error: 'expected session and answers[]' }, 400);
  }

  // No name, no code, no address. A response is a random session id and the
  // answers, and that is the whole record by design.
  const rec = {
    at: new Date().toISOString(),
    session: String(body.session).slice(0, 40),
    answers: body.answers.slice(0, 60),
    ms: Number(body.ms) || null,
  };
  await env.RESPONSES.put(rec.at + '|' + rec.session, JSON.stringify(rec));
  return json({ ok: true });
}

/* ── you read them back ────────────────────────────────────────── */
export async function onRequestGet({ request, env }) {
  if (!env.RESPONSES) return json({ ok: false, error: 'RESPONSES KV is not bound' }, 500);
  if (!env.ADMIN_KEY) return json({ ok: false, error: 'ADMIN_KEY is not set' }, 500);

  const url = new URL(request.url);
  if (url.searchParams.get('key') !== env.ADMIN_KEY) {
    return json({ ok: false, error: 'not authorised' }, 403);
  }

  const list = await env.RESPONSES.list({ limit: 1000 });
  const rows = [];
  for (const k of list.keys) rows.push(JSON.parse(await env.RESPONSES.get(k.name)));

  if (url.searchParams.get('format') === 'jsonl') {
    return new Response(rows.map((r) => JSON.stringify(r)).join('\n'), {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Content-Disposition': 'attachment; filename="responses.jsonl"',
      },
    });
  }
  return json({ ok: true, count: rows.length, rows });
}

/* ── you purge, once you have a copy ───────────────────────────── */
export async function onRequestDelete({ request, env }) {
  if (!env.ADMIN_KEY) return json({ ok: false, error: 'ADMIN_KEY is not set' }, 500);
  const url = new URL(request.url);
  if (url.searchParams.get('key') !== env.ADMIN_KEY) {
    return json({ ok: false, error: 'not authorised' }, 403);
  }
  const list = await env.RESPONSES.list({ limit: 1000 });
  for (const k of list.keys) await env.RESPONSES.delete(k.name);
  return json({ ok: true, deleted: list.keys.length });
}
