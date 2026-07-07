#!/bin/sh

set -e

# ─── Schema sync ────────────────────────────────────────────
if [ "${PRISMA_AUTO_MIGRATE:-false}" = "true" ]; then
  if [ "$NODE_ENV" = "production" ]; then
    echo "Running production migrations..."
    npx prisma migrate deploy 2>&1 || true
  else
    echo "Running dev schema sync..."
    npx prisma db push --skip-generate 2>&1 || true
  fi
fi

echo "Starting application..."
exec node dist/main.js
