# .github/scripts/setup-labels.ps1
# Run this script once to create all labels and milestones in the GitHub repo.
# Requires: gh CLI authenticated (`gh auth login`)

param(
  [Parameter(Mandatory = $true)]
  [string]$Repo
)

# ─── Labels ────────────────────────────────────────────
$labels = @(
  # Type
  @{ name = "bug";              color = "d73a4a"; description = "Something isn't working" }
  @{ name = "enhancement";      color = "a2eeef"; description = "New feature or request" }
  @{ name = "chore";            color = "7057ff"; description = "Maintenance, deps, config" }
  @{ name = "refactor";         color = "fbca04"; description = "Code restructuring without functional change" }
  @{ name = "documentation";    color = "0075ca"; description = "Improvements or additions to docs" }
  @{ name = "performance";      color = "0e8a16"; description = "Performance improvement" }
  @{ name = "testing";          color = "c2e0c6"; description = "Adding or fixing tests" }
  # Area
  @{ name = "area:frontend";    color = "1d76db"; description = "React / Vite / Tailwind frontend" }
  @{ name = "area:backend";     color = "5319e7"; description = "Express / Prisma / Node.js backend" }
  @{ name = "area:shared";      color = "f9d0c4"; description = "Shared types and constants package" }
  @{ name = "area:analytics";   color = "bfd4f2"; description = "Python / FastAPI analytics service" }
  @{ name = "area:infra";       color = "bfdadc"; description = "Docker / K8s / CI-CD" }
  @{ name = "area:db";          color = "c5def5"; description = "Database schema, migrations, seed" }
  # Priority
  @{ name = "priority:critical"; color = "b60205"; description = "Blocker — must fix immediately" }
  @{ name = "priority:high";    color = "d93f0b"; description = "Should be addressed soon" }
  @{ name = "priority:medium";  color = "fbca04"; description = "Important but not urgent" }
  @{ name = "priority:low";     color = "0e8a16"; description = "Nice to have" }
  # Status
  @{ name = "blocked";          color = "000000"; description = "Waiting on something else" }
  @{ name = "needs-repro";      color = "cccccc"; description = "Cannot reproduce" }
  @{ name = "needs-design";     color = "cccccc"; description = "Requires design spec first" }
  @{ name = "good-first-issue"; color = "7057ff"; description = "Great for new contributors" }
  @{ name = "help-wanted";      color = "008672"; description = "Extra attention needed" }
  # Release
  @{ name = "release";          color = "e99695"; description = "Tracked for next release" }
  @{ name = "wontfix";          color = "ffffff"; description = "Will not be addressed" }
  @{ name = "stale";            color = "cccccc"; description = "Inactive issue/PR" }
)

Write-Host "Creating labels in $Repo ..." -ForegroundColor Cyan
foreach ($l in $labels) {
  $json = $l | ConvertTo-Json -Compress
  $result = gh api "repos/$Repo/labels" --method POST --input (Write-Output $json | ConvertFrom-Json | ConvertTo-Json) 2>&1
  # Alternative approach: pipe JSON
}

# Simpler approach: create labels via gh label command
foreach ($l in $labels) {
  $name = $l.name
  $color = $l.color
  $desc = $l.description
  Write-Host "  Creating label: $name" -ForegroundColor Gray
  gh label create "$name" --color "$color" --description "$desc" --repo "$Repo" 2>$null
}

# ─── Milestones ──────────────────────────────────────────
$milestones = @(
  @{ title = "v1.0 MVP";           description = "Core POS, KDS, auth, basic inventory"; due_date = (Get-Date).AddDays(30).ToString("yyyy-MM-dd") }
  @{ title = "v1.1 Operations";    description = "HR, CRM/Loyalty, full inventory, accounting"; due_date = (Get-Date).AddDays(60).ToString("yyyy-MM-dd") }
  @{ title = "v1.2 Integrations";  description = "Stripe, MercadoPago, Rappi, UberEats"; due_date = (Get-Date).AddDays(90).ToString("yyyy-MM-dd") }
  @{ title = "v1.3 Analytics";     description = "BCG Matrix, forecasting, multi-branch reports"; due_date = (Get-Date).AddDays(120).ToString("yyyy-MM-dd") }
  @{ title = "v2.0 Enterprise";    description = "Super Admin, subscriptions, multi-tenant scaling"; due_date = (Get-Date).AddDays(180).ToString("yyyy-MM-dd") }
)

Write-Host "`nCreating milestones in $Repo ..." -ForegroundColor Cyan
foreach ($m in $milestones) {
  $title = $m.title
  $desc = $m.description
  $due = $m.due_date
  Write-Host "  Creating milestone: $title" -ForegroundColor Gray
  gh api "repos/$Repo/milestones" --method POST `
    --field title="$title" `
    --field description="$desc" `
    --field due_on="$($due)T23:59:59Z" 2>$null
}

Write-Host "`nDone!" -ForegroundColor Green
