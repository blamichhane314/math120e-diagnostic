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
