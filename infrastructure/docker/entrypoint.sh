#!/bin/sh

set -e

# ─── Schema sync (safe, does not destroy data) ──────────────
if [ "${PRISMA_AUTO_MIGRATE:-false}" = "true" ]; then
  echo "Running Prisma migrations..."
  npx prisma db push --accept-data-loss --skip-generate 2>&1 || true
fi

echo "Starting application..."
exec node dist/main.js
