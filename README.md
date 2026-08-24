# MATH 120E — first-day diagnostic

A single static page. Eight questions, about five minutes, no login. It reports
what students arrive knowing about the section 1.1 objectives. Each wrong answer
corresponds to a specific error.

## Running it with no backend

Set `ENDPOINT` to `''` in `index.html`. Responses are held in the browser and
the student downloads a small JSON file at the end.

## How it deploys

Two halves, hosted separately:

- **GitHub Pages** serves `index.html`, `live.html` and `questions.js` from the
  repository root.
- **A Cloudflare Worker** takes the data. Paste `worker.js` into it and deploy.

Because the page is on `github.io` and the endpoint on `workers.dev`, the
browser treats every submission as cross-origin and sends a preflight first.
`worker.js` answers it. That is what the CORS block is for.

The Worker needs two things, both on the Worker itself:

- a **KV namespace** bound with the variable name `RESPONSES`
- **ADMIN_KEY**, an encrypted variable, any long string

Both attach only on the next deploy, so deploy again after adding them. If
either is missing the endpoint returns a 500 naming the one that is absent.

Change `CLASS_CODE` in both `index.html` and `worker.js` each term. It is sent
by the page, so it is public. It keeps stray writes out.

## Restricting who can open it

The repository is public so that GitHub Pages can serve it for free, which
means the page is public too. The questions are written for the diagnostic and
no publisher material is involved.

Do not put Cloudflare Access in front of the Worker. A student's browser posts
there with no session, so a login wall would redirect every submission to a
sign-in screen and fail.

## On identity

There is none. No sign-in, no name field, no code. A response carries a random
session id and the answers, and the page says so where students can read it.
The diagnostic is not graded, so there is nothing here to attach to a student.

If a future activity does need attribution, put it in WebCampus rather than
here.

## Watching it live

Open `live.html` on the projector with your Worker URL and admin key in the
query string:

    live.html?endpoint=https://YOUR-WORKER.workers.dev&key=YOUR-ADMIN-KEY

It polls every five seconds and draws, per question, how the class answered.
The correct option is in ink, options that correspond to a known error are in
the accent colour, and a line names the error when enough of the room picks it.

Both values stay in that tab's address bar. Nothing in the students' page ever
sees the admin key.

Each student writes once and the projector only reads. Forty writes is about
four percent of the daily free-tier write allowance; a period of polling is a
fraction of the daily read allowance.

## Afterwards

Keep a copy, then purge:

    curl "https://YOUR-WORKER.workers.dev/?key=KEY&format=jsonl" -o responses.jsonl
    curl -X DELETE "https://YOUR-WORKER.workers.dev/?key=KEY"

Responses live in Cloudflare KV, not in this repository. Git only ever holds
the code.

## What the questions are for

Each targets one objective of section 1.1. Each wrong answer corresponds to a
documented error:

- **sticky sign**: reading `-9²` as `(-9)²`
- **left-to-right**: evaluating in reading order instead of by precedence
- **grouping bars**: treating a fraction bar as if it did not group
- **naming a property**: confusing associative with commutative
- **interval notation**: bracket versus parenthesis at an endpoint

The questions are written for this diagnostic. They are not the homework.
