#!/bin/sh

set -e

# ─── Schema sync (safe, does not destroy data) ──────────────
if [ "${PRISMA_AUTO_MIGRATE:-false}" = "true" ]; then
  echo "Running Prisma schema sync..."
  npx prisma db push --skip-generate 2>&1 || true
fi

echo "Starting application..."
exec node dist/main.js
