# MATH 120E — first-day diagnostic

A single static page. Five minutes, eight questions, no login. It reports what
students arrive knowing about the section 1.1 objectives, and its wrong answers
are chosen to name specific misconceptions rather than to be merely wrong.

## Running it with no backend

It works immediately. Responses are held in the browser and the student can
download a small JSON file at the end. Good for testing the flow, and adequate
if you would rather collect files than run a service.

## Collecting responses

1. Go to `workers.cloudflare.com`, create a Worker, replace its code with
   `worker.js` from this repo, and deploy it.
2. In the Worker's **Settings → Variables → KV Namespace Bindings**, add a
   binding named `RESPONSES` pointing at a new KV namespace.
3. Under **Settings → Variables**, add a secret named `ADMIN_KEY` (use *Encrypt*).
   Make it something long. This guards reading the responses back, and unlike
   the class code it never appears in this repo or in the page.
4. Copy the Worker URL (it ends in `.workers.dev`).
5. In `index.html`, set `ENDPOINT` near the top of the script to that URL.
6. Commit and push. GitHub Pages redeploys in about a minute.

Change `CLASS_CODE` in both files each term.

## Reading the responses

Open the Worker URL with your admin key:

    https://YOUR-WORKER.workers.dev/?key=YOUR-ADMIN-KEY

That returns every response as JSON.

The class code and the admin key do different jobs. The class code is sent by
the page and is therefore public; it only keeps stray writes out. The admin key
is a Worker secret and is the only thing standing between a passer-by and the
whole dataset — so it must never end up in this repo.

**Do not put Cloudflare Access in front of the Worker.** Access adds a login
wall, and the page posts from a student's browser with no account, so every
submission would be redirected to a sign-in screen and fail. If you want a login
on the readout specifically, apply Access to a separate admin path rather than
to the route the page writes to.

## On identity

There is none. No sign-in, no name field, no code — a response carries a random
session id and nothing else, and the page says so where students can read it.
That is a deliberate choice: these assignments are for engagement and for
telling you what to teach, not for grading, so there is nothing to gain by
holding records about identifiable students.

If a future activity does need attribution, put it in WebCampus rather than
here. Identity belongs where the records obligations already live.

## Watching it live

Open `live.html` on the projector with your Worker URL and admin key in the
query string:

    live.html?endpoint=https://YOUR-WORKER.workers.dev&key=YOUR-ADMIN-KEY

It polls every five seconds and draws, per question, how the class answered —
the correct option in ink, options that correspond to a known error in the
accent colour, and a line naming the error when enough of the room picks it.

Both values stay in that tab's address bar. Nothing in the students' page ever
sees the admin key.

The arithmetic works because reads and writes are not equally scarce. Each
student writes exactly once; the projector only reads, and reads are the
abundant resource on the free tier. Polling all period costs a fraction of the
daily read allowance, while forty writes is four percent of the daily write
allowance.

## Afterwards

Keep a copy, then purge:

    curl "https://YOUR-WORKER.workers.dev/?key=KEY&format=jsonl" -o responses.jsonl
    curl -X DELETE "https://YOUR-WORKER.workers.dev/?key=KEY"

Responses live in Cloudflare KV, never in this repository — git only ever holds
the code, so there is no risk of committing a class's answers by accident.

## What the questions are for

Each targets one objective of section 1.1 and each wrong answer corresponds to
a documented error, so the result is a profile rather than a score:

- **sticky sign** — reading `-9²` as `(-9)²`, which survives into calculus
- **left-to-right** — evaluating in reading order instead of by precedence
- **grouping bars** — treating a fraction bar as if it did not group
- **naming a property** — confusing associative with commutative
- **interval notation** — bracket versus parenthesis at an endpoint

The questions are written for this diagnostic. They are not the homework.
