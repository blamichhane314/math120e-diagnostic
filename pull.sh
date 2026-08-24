#!/bin/sh
# pull.sh — download every response into responses.jsonl.
#
# Reads KV directly through wrangler, which is already signed in, so this needs
# no ADMIN_KEY and no endpoint. (ADMIN_KEY is only for the curl route in
# worker/README.md; if you never set one, this still works.)
#
#   ./pull.sh              -> responses.jsonl
#   ./pull.sh --purge      -> download, then delete what was downloaded
set -eu

NS=0adbe595bcd04b30941cd20e346e19e9
OUT=responses.jsonl
cd "$(dirname "$0")/worker"

keys=$(npx --yes wrangler kv key list --namespace-id="$NS" --remote 2>/dev/null \
       | python3 -c 'import json,sys;[print(k["name"]) for k in json.load(sys.stdin)]')

if [ -z "$keys" ]; then echo "nothing stored yet"; exit 0; fi

n=$(printf '%s\n' "$keys" | wc -l | tr -d ' ')
echo "$n stored; downloading"
: > "../$OUT"
printf '%s\n' "$keys" | while IFS= read -r k; do
  npx --yes wrangler kv key get "$k" --namespace-id="$NS" --remote 2>/dev/null >> "../$OUT"
  printf '\n' >> "../$OUT"
done

# Blank lines from the loop above are dropped; report.mjs skips them anyway,
# but a clean file is easier to hand to anything else.
python3 - "../$OUT" <<'PY'
import sys
p=sys.argv[1]
lines=[l for l in open(p).read().split('\n') if l.strip()]
open(p,'w').write('\n'.join(lines)+'\n')
print(f'wrote {len(lines)} responses to {p.lstrip("./")}')
PY

if [ "${1:-}" = "--purge" ]; then
  # Only ever deletes keys that are in the file just written.
  printf '%s\n' "$keys" | while IFS= read -r k; do
    npx --yes wrangler kv key delete "$k" --namespace-id="$NS" --remote >/dev/null 2>&1
  done
  echo "purged $n from KV"
fi
