# MATH 120E — first-day diagnostic

A single static page. Five minutes, eight questions, no login. It reports what
students arrive knowing about the section 1.1 objectives, and its wrong answers
are chosen to name specific misconceptions rather than to be merely wrong.

## Running it with no backend

It works immediately. Responses are held in the browser and the student can
download a small JSON file at the end. Good for testing the flow, and adequate
if you would rather collect files than run a service.

## Deploying

The repository is private and Cloudflare Pages builds it. The API lives in
`functions/`, so it deploys with the site on the same origin — one push updates
both, and there is no CORS anywhere.

1. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to
   Git**, and pick this repository. There is no build command and no output
   directory: it is static files.
2. In the project's **Settings → Bindings**, add a **KV namespace** bound as
   `RESPONSES`.
3. In **Settings → Variables and secrets**, add `ADMIN_KEY` as a **secret**.
   Any long string. This guards reading the responses and never appears in this
   repository or in the page.
4. Redeploy. Bindings only take effect on the next build, which is the usual
   reason a first attempt returns a 500.

Change `CLASS_CODE` in both `index.html` and `functions/api/responses.js` each
term. It is sent by the page and is therefore public; it exists to keep stray
writes out, nothing more.

## Restricting who can open it

Cloudflare Access, on the free Zero Trust plan, gates the site by email for a
small number of users — roughly the size of one class. Add a policy over the
Pages project and only addresses on your list get in.

Apply it to the **site**, never to `/api/responses`. A student's browser posts
there with no session, so a login wall on that path would redirect every
submission to a sign-in screen and fail.

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
