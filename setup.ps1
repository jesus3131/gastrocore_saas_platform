# setup.ps1 — Bootstrap a GastroCore development environment
param([switch]$Force)

$ErrorActionPreference = "Stop"

Write-Host "=== GastroCore Setup ===" -ForegroundColor Cyan

# ─── Prerequisites ────────────────────────────────────────
$nodeVer = node -v 2>$null
if (-not $nodeVer) { Write-Host "ERROR: Node.js >= 20 is required" -ForegroundColor Red; exit 1 }
$pnpmVer = pnpm -v 2>$null
if (-not $pnpmVer) { Write-Host "ERROR: pnpm >= 9 is required" -ForegroundColor Red; exit 1 }

Write-Host "  Node.js $nodeVer — OK" -ForegroundColor Green
Write-Host "  pnpm $pnpmVer — OK" -ForegroundColor Green

# ─── Install Dependencies ─────────────────────────────────
Write-Host "`nInstalling dependencies..." -ForegroundColor Cyan
pnpm install

# ─── Environment ──────────────────────────────────────────
if (-not (Test-Path ".env") -or $Force) {
  Write-Host "`nCreating .env from .env.example..." -ForegroundColor Cyan
  Copy-Item ".env.example" ".env"
  Write-Host "  ⚠  Edit .env with your actual secrets before running" -ForegroundColor Yellow
}

# ─── Database ─────────────────────────────────────────────
Write-Host "`nGenerating Prisma client..." -ForegroundColor Cyan
npx prisma generate

Write-Host "`n=== Setup complete! ===" -ForegroundColor Green
Write-Host "`n  Start dev server:  pnpm dev"
Write-Host "  Run tests:         pnpm test"
Write-Host "  Lint:              pnpm lint"
