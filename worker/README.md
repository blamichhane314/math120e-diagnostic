# The data endpoint

An API Worker. It takes one POST per student and lets you read and purge with a
key. It serves no pages — those are on GitHub Pages.

## Deploying

    cd worker
    npx wrangler kv namespace create RESPONSES     # once; copy the id
    # paste that id into wrangler.jsonc
    npx wrangler deploy                            # creates the Worker
    npx wrangler secret put ADMIN_KEY              # once; any long string

Deploy before setting the secret: `secret put` addresses a Worker that already
exists and fails with "Worker not found" otherwise. The secret takes effect at
once; it does not need a second deploy.

Only reads and purges use ADMIN_KEY. Submissions are stored without it, so the
activity works the moment the Worker is deployed.

## Check it before class

The failure this guards against is silent from the student's side only in the
sense that it looks like a network problem. Run these three and read the
answers, rather than assuming a deploy that reported success is serving.

    W=https://YOUR-WORKER.workers.dev

    # 1. a write with a bad code must be REFUSED BY THE SCRIPT, as JSON.
    #    {"ok":false,"error":"bad code"} means the script is running.
    #    An empty 405 means it is not: something else is answering.
    curl -s -X POST "$W" -H 'Content-Type: application/json' \
      -d '{"code":"WRONG","session":"probe","answers":[]}'

    # 2. a read without a key must be refused, as JSON
    curl -s "$W"

    # 3. a read with the key must return {"ok":true,...}
    curl -s --get "$W" --data-urlencode "key=YOUR-ADMIN-KEY"

If any of these returns HTML, the Worker has static assets attached and the
asset handler is answering ahead of the script. Remove the assets binding.

## Afterwards

    curl --get "$W" --data-urlencode "key=KEY" -d format=jsonl -o responses.jsonl
    curl -X DELETE --get "$W" --data-urlencode "key=KEY"
