# MATH 120E — first-day diagnostic

A single static page. Twenty-four questions, about fifteen minutes, no login.
It covers the span of Exam 1 — sections 1.1 through 1.7 and 2.4 — and reports
what students arrive already knowing. Every wrong option corresponds to a
specific, named error; `check.mjs` refuses a question set where one does not.

    node check.mjs

## Running it with no backend

Set `ENDPOINT` to `''` in `index.html`. Responses are held in the browser and
the student downloads a small JSON file at the end.

## How it deploys

Two halves, hosted separately:

- **GitHub Pages** serves `index.html`, `live.html` and `questions.js` from the
  repository root.
- **A Cloudflare Worker** takes the data. It lives in `worker/` with a wrangler
  config; see `worker/README.md`. It serves no static files, deliberately — a
  Worker with assets attached hands GET requests to the asset handler before the
  script runs, so reads come back as a web page and writes are refused with an
  empty 405, which looks exactly like a binding that will not attach.

  **Check the endpoint answers as JSON before class.** A deploy that reports
  success is not evidence that the script is serving; the three curl commands in
  `worker/README.md` are.

Because the page is on `github.io` and the endpoint on `workers.dev`, the
browser treats every submission as cross-origin and sends a preflight first.
The Worker answers it; that is what the CORS block is for.

The Worker needs two things, both on the Worker itself:

- a **KV namespace** bound with the variable name `RESPONSES`
- **ADMIN_KEY**, an encrypted variable, any long string

Both attach only on the next deploy, so deploy again after adding them. If
either is missing the endpoint returns a 500 naming the one that is absent.

Change `CLASS_CODE` in both `index.html` and `worker/src/index.js` each term. It
is sent
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

    live.html?key=YOUR-ADMIN-KEY

The Worker URL is a constant in `live.html`; only the key comes from the query
string.

It polls every five seconds and draws, per question, how the class answered.
The correct option is in ink, options that correspond to a known error are in
the accent colour, and a line names the error when enough of the room picks it.

The key stays in that tab's address bar. Nothing in the students' page ever
sees it.

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

Two kinds of item, both defined in `questions.js`.

**One answer** (`kind: 'mc'`). `key` is the correct index and `diag` names, for
every other index, the error that produces it. An option with no nameable error
does not belong in the list: a response that says only "wrong" is the least
useful thing a wrong answer can say. The errors used are the ones documented in
the mathematics-education literature for this material:

- **sticky sign**: reading `-9²` as `(-9)²`, and dropping the minus from a
  leading coefficient
- **left to right**: evaluating in reading order instead of by precedence
- **the bar does not group**: cancelling into one term of a numerator
- **sign lost across a subtracted bracket**: the minus reaching the first term
  only
- **no cross terms**: `(x+3)(x-5)` becoming `x² - 15`
- **product checked, sum not**: factoring `x²+7x+12` as `(x+2)(x+6)`
- **factored but not completely**: `6x(2x² - 3x)`, which is correct and still
  wrong for the question asked
- **negative exponent read as negative answer**: `2⁻³` giving `-8`
- **the inequality not reversed** when dividing by a negative
- **an endpoint included that is excluded**, or the reverse

**Several answers** (`kind: 'multi'`). These show a problem and ask which ideas
it draws on, without asking for the answer. `keys` lists the options that
belong, `diag[i]` says why bringing in option `i` is a mistake, and `miss[i]`
says what is lost by leaving it out. Those are different failures: naming the
quadratic formula for a factoring problem is not the same mistake as not seeing
that factoring is the distributive property run backwards, and the second is
the more interesting one. The projector view reports them on separate lines.

A submitted answer records `picked`, and for a multi-select also `extra` and
`missed` as index lists, so both failures survive into the data rather than
collapsing into a single right-or-wrong.

The questions are written for this diagnostic. They are not the homework.
