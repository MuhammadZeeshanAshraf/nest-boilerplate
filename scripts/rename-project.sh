#!/usr/bin/env bash
# Rename the boilerplate when cloning into a new project.
#
# Usage:
#   ./scripts/rename-project.sh <kebab-name> ["Title Name"]
#
# Example:
#   ./scripts/rename-project.sh my-awesome-api "My Awesome API"
#
# Replaces "nest-boilerplate" and "Nest Boilerplate" in:
#   - package.json
#   - README.md
#   - src/common/constants/index.ts
#   - .env.example
#   - docker-compose.yml

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <kebab-name> [\"Title Name\"]" >&2
  echo "Example: $0 my-awesome-api \"My Awesome API\"" >&2
  exit 1
fi

KEBAB="$1"
TITLE="${2:-$1}"

if [[ ! "$KEBAB" =~ ^[a-z0-9]([a-z0-9-]*[a-z0-9])?$ ]]; then
  echo "Error: <kebab-name> must be lowercase letters, digits, and hyphens." >&2
  exit 1
fi

FILES=(
  "package.json"
  "README.md"
  "src/common/constants/index.ts"
  ".env.example"
  "docker-compose.yml"
)

# Detect sed in-place flag (BSD on macOS vs GNU on Linux).
SED_INPLACE=(-i)
if sed --version >/dev/null 2>&1; then
  : # GNU sed
else
  SED_INPLACE=(-i '')  # BSD sed
fi

for f in "${FILES[@]}"; do
  if [[ -f "$f" ]]; then
    sed "${SED_INPLACE[@]}" \
      -e "s/nest-boilerplate/${KEBAB}/g" \
      -e "s/Nest Boilerplate/${TITLE}/g" \
      "$f"
    echo "  updated $f"
  fi
done

echo
echo "Renamed boilerplate -> ${KEBAB} (${TITLE})"
echo
echo "Suggested next steps:"
echo "  1. Update .env (DB_NAME, etc.) to match the new project."
echo "  2. Update LICENSE copyright holder if needed."
echo "  3. Reset git history if you want a clean slate:"
echo "       rm -rf .git && git init && git add -A && git commit -m \"chore: initial commit\""
