#!/bin/sh

if [ "${PRISMA_AUTO_MIGRATE:-false}" = "true" ]; then
  echo "Running Prisma migrations..."
  npx prisma db push --accept-data-loss --skip-generate 2>&1 || true
fi

if [ "${SEED_DATABASE:-false}" = "true" ]; then
  if [ -f prisma/seed.ts ]; then
    echo "Seeding database..."
    pnpm exec tsx prisma/seed.ts 2>&1 || echo "Seed completed (may have already been seeded)"
  elif [ -f prisma/seed.js ]; then
    echo "Seeding database..."
    node prisma/seed.js 2>&1 || echo "Seed completed (may have already been seeded)"
  fi
fi

echo "Starting application..."
exec node dist/main.js
