#!/bin/bash
# Migrate storage files from old hosted Supabase to self-hosted.
#
# Usage:
#   OLD_PROJECT_REF=bvdcmaxtonlfmngeuywx \
#   NEW_SUPABASE_URL=https://api.memasik.fun \
#   NEW_SERVICE_ROLE_KEY=eyJ... \
#   BUCKET=word-images \
#   FILES_LIST=/path/to/files.txt \  # one filename per line
#   bash migrate-storage.sh
#
# FILES_LIST contains the file names to copy (e.g. "1776783170494.jpg" per line).
# Source: https://${OLD_PROJECT_REF}.supabase.co/storage/v1/object/public/${BUCKET}/${name}
# Dest:   POST ${NEW_SUPABASE_URL}/storage/v1/object/${BUCKET}/${name}

set -euo pipefail

: "${OLD_PROJECT_REF:?required}"
: "${NEW_SUPABASE_URL:?required}"
: "${NEW_SERVICE_ROLE_KEY:?required}"
: "${BUCKET:?required}"
: "${FILES_LIST:?required}"

WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

OLD_BASE="https://${OLD_PROJECT_REF}.supabase.co/storage/v1/object/public/${BUCKET}"
NEW_UPLOAD="${NEW_SUPABASE_URL}/storage/v1/object/${BUCKET}"

ok=0; fail=0
while IFS= read -r name; do
  [ -z "$name" ] && continue
  echo "→ $name"
  tmp="$WORK/$name"
  if ! curl -fsSL --max-time 60 "$OLD_BASE/$name" -o "$tmp"; then
    echo "  ✗ download failed"
    fail=$((fail + 1))
    continue
  fi
  ctype=$(file -b --mime-type "$tmp")
  http_code=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$NEW_UPLOAD/$name" \
    -H "Authorization: Bearer ${NEW_SERVICE_ROLE_KEY}" \
    -H "Content-Type: $ctype" \
    -H "x-upsert: true" \
    --data-binary "@$tmp" \
    --max-time 60)
  if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    ok=$((ok + 1))
  else
    echo "  ✗ upload returned $http_code"
    fail=$((fail + 1))
  fi
done < "$FILES_LIST"

echo
echo "Done: $ok ok, $fail failed"
[ "$fail" -eq 0 ]
