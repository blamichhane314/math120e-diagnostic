# MATH 120E — first-day diagnostic

A single static page. Five minutes, eight questions, no login. It reports what
students arrive knowing about the section 1.1 objectives, and its wrong answers
are chosen to name specific misconceptions rather than to be merely wrong.

## Running it with no backend

It works immediately. Responses are held in the browser and the student can
download a small JSON file at the end. Good for testing the flow, and adequate
if you would rather collect files than run a service.

## How it deploys

The repository is private and Cloudflare builds it as a **Worker with static
assets** — not as a classic Pages project. That distinction matters: the
`functions/` directory convention belongs to Pages, and on this platform it did
nothing at all except serve its own source as a downloadable file.

    public/     the pages, served by the assets layer
    src/        the Worker, reached only by paths that are not files
    wrangler.jsonc

Assets are matched first, so `/api/responses` falls through to `src/index.js`
while `/index.html` never does. The page and the endpoint share an origin, so
there is no CORS and one push updates both.

Two bindings on the project, both required:

- **KV namespace**, variable name `RESPONSES`
- **ADMIN_KEY**, an encrypted variable, any long string

Bindings only attach on the next build, so redeploy after adding them. If either
is missing the endpoint returns a 500 naming the one that is absent rather than
failing silently.

Change `CLASS_CODE` in both `public/index.html` and `src/index.js` each term.

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
