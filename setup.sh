#!/usr/bin/env bash
# setup.sh — Bootstrap a GastroCore development environment
set -euo pipefail

echo "=== GastroCore Setup ==="

# ─── Prerequisites ────────────────────────────────────────
command -v node >/dev/null 2>&1 || { echo "ERROR: Node.js >= 20 is required"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "ERROR: pnpm >= 9 is required"; exit 1; }

NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
PNPM_VER=$(pnpm -v | cut -d. -f1)
[[ "$NODE_VER" -ge 20 ]] || { echo "ERROR: Node.js >= 20 required (found $NODE_VER)"; exit 1; }
[[ "$PNPM_VER" -ge 9 ]]  || { echo "ERROR: pnpm >= 9 required (found $PNPM_VER)"; exit 1; }

echo "  Node.js $(node -v) — OK"
echo "  pnpm $(pnpm -v) — OK"

# ─── Install Dependencies ─────────────────────────────────
echo ""
echo "Installing dependencies..."
pnpm install

# ─── Environment ──────────────────────────────────────────
if [ ! -f .env ]; then
  echo ""
  echo "Creating .env from .env.example..."
  cp .env.example .env
  echo "  ⚠  Edit .env with your actual secrets before running"
fi

# ─── Database ─────────────────────────────────────────────
echo ""
echo "Generating Prisma client..."
npx prisma generate

echo ""
echo "=== Setup complete! ==="
echo ""
echo "  Start dev server:  pnpm dev"
echo "  Run tests:         pnpm test"
echo "  Lint:              pnpm lint"
echo ""
