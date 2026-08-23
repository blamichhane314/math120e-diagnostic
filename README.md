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
3. Copy the Worker URL (it ends in `.workers.dev`).
4. In `index.html`, set `ENDPOINT` near the top of the script to that URL.
5. Commit and push. GitHub Pages redeploys in about a minute.

Change `CLASS_CODE` in both files each term.

## Reading the responses

Open the Worker URL with the class code appended:

    https://YOUR-WORKER.workers.dev/?code=MATH120E-F26

That returns every response as JSON.

## On identity

By default a student is a random session id and nothing else. There is an
optional field for a code you hand out on paper — `M07`, `M13` — so you can
match a response to a person without the dataset containing anyone's name. If
you would rather have names, change the label; the field is free text either
way. Nothing here asks for an email or an account.

## What the questions are for

Each targets one objective of section 1.1 and each wrong answer corresponds to
a documented error, so the result is a profile rather than a score:

- **sticky sign** — reading `-9²` as `(-9)²`, which survives into calculus
- **left-to-right** — evaluating in reading order instead of by precedence
- **grouping bars** — treating a fraction bar as if it did not group
- **naming a property** — confusing associative with commutative
- **interval notation** — bracket versus parenthesis at an endpoint

The questions are written for this diagnostic. They are not the homework.
