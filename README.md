# MATH 120E — first-day diagnostic

A single static page. Five minutes, eight questions, no login. It reports what
students arrive knowing about the section 1.1 objectives, and its wrong answers
are chosen to name specific misconceptions rather than to be merely wrong.

## Running it with no backend

It works immediately. Responses are held in the browser and the student can
download a small JSON file at the end. Good for testing the flow, and adequate
if you would rather collect files than run a service.

## How it deploys

Two halves, hosted separately:

- **GitHub Pages** serves `index.html`, `live.html` and `questions.js` from the
  repository root.
- **A Cloudflare Worker** takes the data. Paste `worker.js` into it and deploy.

Because the page is on `github.io` and the endpoint on `workers.dev`, the
browser treats every submission as cross-origin and sends a preflight first.
`worker.js` answers it; that is the only reason the CORS block is there.

The Worker needs two things, both on the Worker itself:

- a **KV namespace** bound with the variable name `RESPONSES`
- **ADMIN_KEY**, an encrypted variable, any long string

Both attach only on the next deploy, so deploy again after adding them. If
either is missing the endpoint returns a 500 naming the one that is absent.

Change `CLASS_CODE` in both `index.html` and `worker.js` each term. It is sent
by the page and so is public by construction; it exists to keep stray writes out.

## Restricting who can open it

The repository is public so that GitHub Pages can serve it for free, which
means the page is public too. That is fine for this: the questions are written
for the diagnostic and no publisher material is involved.

Do not put Cloudflare Access in front of the Worker. A student's browser posts
there with no session, so a login wall would redirect every submission to a
sign-in screen and fail.

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
