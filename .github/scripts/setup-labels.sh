#!/usr/bin/env bash
# .github/scripts/setup-labels.sh
# Creates labels and milestones in the GitHub repository.
# Usage: GITHUB_TOKEN=ghp_xxx bash .github/scripts/setup-labels.sh jesus3131/gastrocore_saas_platform
#
# You can create a token at: https://github.com/settings/tokens
# Required scopes: repo (full control)

set -euo pipefail

REPO="${1:?Usage: $0 <owner/repo>}"
TOKEN="${GITHUB_TOKEN:?GITHUB_TOKEN env var is required}"
API="https://api.github.com/repos/$REPO"

echo "=== Setting up repository: $REPO ==="

# ─── Labels ────────────────────────────────────────────
declare -A LABELS
LABELS=(
  # Type
  ["bug"]="d73a4a:Something isn't working"
  ["enhancement"]="a2eeef:New feature or request"
  ["chore"]="7057ff:Maintenance, deps, config"
  ["refactor"]="fbca04:Code restructuring without functional change"
  ["documentation"]="0075ca:Improvements or additions to docs"
  ["performance"]="0e8a16:Performance improvement"
  ["testing"]="c2e0c6:Adding or fixing tests"
  # Area
  ["area:frontend"]="1d76db:React / Vite / Tailwind frontend"
  ["area:backend"]="5319e7:Express / Prisma / Node.js backend"
  ["area:shared"]="f9d0c4:Shared types and constants package"
  ["area:analytics"]="bfd4f2:Python / FastAPI analytics service"
  ["area:infra"]="bfdadc:Docker / K8s / CI-CD"
  ["area:db"]="c5def5:Database schema, migrations, seed"
  # Priority
  ["priority:critical"]="b60205:Blocker — must fix immediately"
  ["priority:high"]="d93f0b:Should be addressed soon"
  ["priority:medium"]="fbca04:Important but not urgent"
  ["priority:low"]="0e8a16:Nice to have"
  # Status
  ["blocked"]="000000:Waiting on something else"
  ["needs-repro"]="cccccc:Cannot reproduce"
  ["needs-design"]="cccccc:Requires design spec first"
  ["good-first-issue"]="7057ff:Great for new contributors"
  ["help-wanted"]="008672:Extra attention needed"
  # Release
  ["release"]="e99695:Tracked for next release"
  ["wontfix"]="ffffff:Will not be addressed"
  ["stale"]="cccccc:Inactive issue or PR"
)

echo "Creating labels..."
for name in "${!LABELS[@]}"; {
  IFS=":" read -r color desc <<< "${LABELS[$name]}"
  echo "  $name ($color)"

  # Try update first (in case it exists), then create
  curl -s -X PATCH "$API/labels/$name" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    -d "$(jq -n --arg c "$color" --arg d "$desc" '{color: $c, description: $d}')" \
    > /dev/null 2>&1 || \
  curl -s -X POST "$API/labels" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    -d "$(jq -n --arg n "$name" --arg c "$color" --arg d "$desc" '{name: $n, color: $c, description: $d}')" \
    > /dev/null 2>&1
}

# ─── Milestones ──────────────────────────────────────────
echo ""
echo "Creating milestones..."

create_milestone() {
  local title="$1" desc="$2" due="$3"
  echo "  $title"
  curl -s -X POST "$API/milestones" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    -d "$(jq -n --arg t "$title" --arg d "$desc" --arg due "${due}T23:59:59Z" '{title: $t, description: $d, due_on: $due}')" \
    > /dev/null 2>&1
}

create_milestone "v1.0 MVP" "Core POS, KDS, auth, basic inventory" "$(date -d '+30 days' +%Y-%m-%d)"
create_milestone "v1.1 Operations" "HR, CRM/Loyalty, full inventory, accounting" "$(date -d '+60 days' +%Y-%m-%d)"
create_milestone "v1.2 Integrations" "Stripe, MercadoPago, Rappi, UberEats" "$(date -d '+90 days' +%Y-%m-%d)"
create_milestone "v1.3 Analytics" "BCG Matrix, forecasting, multi-branch reports" "$(date -d '+120 days' +%Y-%m-%d)"
create_milestone "v2.0 Enterprise" "Super Admin, subscriptions, multi-tenant scaling" "$(date -d '+180 days' +%Y-%m-%d)"

echo ""
echo "=== Done! ==="
