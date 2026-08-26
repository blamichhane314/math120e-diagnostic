// report.mjs — read the responses you downloaded and say what they mean.
//
//   node report.mjs responses.jsonl
//
// Offline and after the fact. Nothing polls, nothing is served, and the file
// never leaves the machine.

import { readFileSync } from 'node:fs';
import { Q } from './questions.js';

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
const flag = (name) => {
  const i = args.indexOf('--' + name);
  return i >= 0 ? args[i + 1] : null;
};
const listOnly = args.includes('--list');

if (!file) {
  console.error('usage: node report.mjs responses.jsonl [--since <when>] [--until <when>] [--list]');
  console.error('');
  console.error('  --since / --until  keep only responses in a window, so your own test');
  console.error('                     entries can be left out of the class figures.');
  console.error('                     Local time. "2026-08-26" or "2026-08-26 10:30".');
  console.error('  --list             show the responses and their times, and stop.');
  process.exit(1);
}

// Local time in, local time out. The records are stamped UTC, and a class that
// meets at 11am is not going to be reasoned about in UTC.
const when = (s) => {
  if (!s) return null;
  const d = new Date(s.includes('T') || s.includes(' ') ? s.replace(' ', 'T') : s + 'T00:00:00');
  if (isNaN(d)) { console.error(`cannot read the time "${s}"`); process.exit(1); }
  return d;
};
const since = when(flag('since'));
const until = when(flag('until'));

let rows = readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l, i) => {
  try { return JSON.parse(l); } catch { console.error(`line ${i + 1} is not JSON; skipped`); return null; }
}).filter(Boolean);

if (!rows.length) { console.error('no responses in that file'); process.exit(1); }

const all = rows.slice();
if (since || until) {
  rows = rows.filter((r) => {
    const t = new Date(r.at);
    return (!since || t >= since) && (!until || t <= until);
  });
  if (!rows.length) { console.error('no responses in that window'); process.exit(1); }
}

/* ── what came in, and when ────────────────────────────────────────
   Responses arrive in a cluster while the class is sitting there. Anything
   well outside that cluster is almost certainly a test entry, so the times
   are what separate the two. */
const fmt = (d) => d.toLocaleString(undefined,
  { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
function sessions(list) {
  const sorted = list.slice().sort((a, b) => (a.at || '').localeCompare(b.at || ''));
  console.log(rule(`${sorted.length} responses`));
  console.log(`  ${'when (local)'.padEnd(16)}${'session'.padEnd(12)}${'answered'.padStart(9)}${'correct'.padStart(9)}${'open for'.padStart(10)}`);
  let prev = null;
  for (const r of sorted) {
    const t = new Date(r.at);
    // a break of more than 30 minutes almost certainly separates two sittings
    if (prev && (t - prev) > 30 * 60 * 1000) console.log('  ' + '·'.repeat(54));
    prev = t;
    const a = r.answers || [];
    const tried = a.filter((x) => x.answered !== false);
    const right = tried.filter((x) => x.correct).length;
    const mins = r.ms ? Math.round(r.ms / 60000) : null;
    console.log(`  ${fmt(t).padEnd(16)}${String(r.session).padEnd(12)}` +
      `${(tried.length + '/' + a.length).padStart(9)}` +
      `${(tried.length ? pct(right, tried.length) + '%' : '-').padStart(9)}` +
      `${(mins === null ? '-' : mins + ' min').padStart(10)}`);
  }
  if (list.length !== all.length) {
    console.log(`\n  ${all.length - list.length} of ${all.length} responses fall outside the window and are excluded.`);
  }
}

const L = 'ABCDEFG';
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
const bar = (n, of, w = 22) => '█'.repeat(Math.round((n / (of || 1)) * w)).padEnd(w, '·');
const rule = (s) => `\n${s}\n${'─'.repeat(72)}`;

// Answers carry their own tag, so a file that mixes question sets still lines
// up and anything unrecognised is counted rather than silently dropped.
const forQ = (q) => rows.map((r) => (r.answers || []).find((a) => a && a.tag === q.tag))
                        .filter((a) => a && a.answered !== false);

sessions(rows);
if (listOnly) process.exit(0);

console.log(rule(`${rows.length} responses · ${file}`));
const times = rows.map((r) => r.ms).filter(Boolean).sort((a, b) => a - b);
if (times.length) {
  const mid = times[Math.floor(times.length / 2)];
  console.log(`median time: ${Math.round(mid / 60000)} min`);
}

let seen = 0;
for (const q of Q) {
  if (q.part) console.log(rule(q.part.toUpperCase()));
  const picks = forQ(q);
  const n = picks.length;
  console.log(`\n${String(++seen).padStart(2, '0')}  ${q.tag}   (${n} answered)`);

  if (q.kind === 'multi') {
    const tally = q.o.map((_, j) => picks.filter((p) => (p.picked || []).includes(j)).length);
    const exact = picks.filter((p) => p.correct).length;
    q.o.forEach((o, j) => {
      const belongs = q.keys.includes(j);
      console.log(`    ${belongs ? '·' : ' '} ${L[j]}  ${bar(tally[j], n)} ${String(tally[j]).padStart(3)}  ${strip(o)}`);
    });
    console.log(`      ${exact}/${n} named exactly the right set`);
    q.keys.map((j) => ({ j, missed: n - tally[j] }))
      .filter((g) => g.missed > 0).sort((a, b) => b.missed - a.missed)
      .forEach((g) => console.log(`      ${g.missed} did not name ${L[g.j]} — ${strip(q.miss[g.j])}`));
    q.o.forEach((_, j) => { if (!q.keys.includes(j) && tally[j] > 0)
      console.log(`      ${tally[j]} brought in ${L[j]} — ${strip(q.diag[j])}`); });
    continue;
  }

  const tally = q.o.map((_, j) => picks.filter((p) => p.picked === j).length);
  q.o.forEach((o, j) => {
    console.log(`    ${j === q.key ? '✓' : ' '} ${L[j]}  ${bar(tally[j], n)} ${String(tally[j]).padStart(3)}  ${strip(o)}`);
  });
  console.log(`      ${pct(tally[q.key], n)}% correct`);
  tally.map((c, j) => ({ c, j })).filter((v) => v.j !== q.key && v.c > 0)
    .sort((a, b) => b.c - a.c)
    .forEach((v) => console.log(`      ${v.c} chose ${L[v.j]} — ${strip(q.diag[v.j])}`));
}

/* ── where the class is weakest, in one place ──────────────────── */
console.log(rule('WEAKEST FIRST'));
Q.filter((q) => q.kind !== 'multi').map((q) => {
  const picks = forQ(q);
  return { q, n: picks.length, right: pct(picks.filter((p) => p.correct).length, picks.length) };
}).filter((r) => r.n).sort((a, b) => a.right - b.right).slice(0, 8)
  .forEach((r) => console.log(`  ${String(r.right).padStart(3)}%  ${r.q.obj.padEnd(8)} ${r.q.tag}`));

/* ── the same, rolled up to the section you would reteach ──────── */
console.log(rule('BY SECTION'));
const bySec = {};
for (const q of Q) {
  const sec = q.obj.split('/')[0];
  const picks = forQ(q);
  const b = (bySec[sec] = bySec[sec] || { right: 0, total: 0 });
  b.right += picks.filter((p) => p.correct).length;
  b.total += picks.length;
}
Object.entries(bySec).sort((a, b) => pct(a[1].right, a[1].total) - pct(b[1].right, b[1].total))
  .forEach(([sec, b]) => console.log(`  ${String(pct(b.right, b.total)).padStart(3)}%  ${sec}  ${bar(b.right, b.total)}  ${b.right}/${b.total}`));

function strip(s) { return String(s)
  .replace(/<sup>(.*?)<\/sup>/g, (_, t) => t.replace(/[0-9]/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]))
  .replace(/&minus;/g, '−').replace(/&times;/g, '×').replace(/&divide;/g, '÷')
  .replace(/&middot;/g, '·').replace(/&radic;/g, '√').replace(/&plusmn;/g, '±')
  .replace(/&le;/g, '≤').replace(/&ge;/g, '≥').replace(/&infin;/g, '∞')
  .replace(/&sup2;/g, '²').replace(/&sup3;/g, '³').replace(/&mdash;/g, '—')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
  .replace(/<[^>]+>/g, ''); }
