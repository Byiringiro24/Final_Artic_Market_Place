#!/usr/bin/env bash
# Deploy ARTIC HUB only. The Compose project name and private service ports are
# isolated from the existing ARTIC VMS project.
set -Eeuo pipefail

PROJECT_DIR="${ARTIC_HUB_PROJECT_DIR:-/opt/artic-hub}"
COMPOSE_FILE="deploy/vps/docker-compose.yml"

cd "$PROJECT_DIR"

for required_file in .env backend/.env.production.local frontend/.env.production.local; do
  if [[ ! -f "$required_file" ]]; then
    printf 'Required protected configuration file is missing: %s\n' "$required_file" >&2
    exit 1
  fi
done

if grep --quiet --extended-regexp 'REPLACE_WITH|replace_on_server|URL_ENCODED_PASSWORD' \
  .env backend/.env.production.local frontend/.env.production.local; then
  echo 'Replace all template values in .env and the protected service env files before deploying.' >&2
  exit 1
fi

compose=(docker compose --env-file "$PROJECT_DIR/.env" --project-name artic-hub --file "$COMPOSE_FILE")

echo 'Validating ARTIC HUB Compose configuration...'
"${compose[@]}" config --quiet

echo 'Building and starting ARTIC HUB services...'
"${compose[@]}" up --build --detach

echo 'Waiting for ARTIC HUB API health endpoint...'
for attempt in {1..30}; do
  if curl --fail --silent --show-error http://127.0.0.1:5000/health >/dev/null; then
    echo 'ARTIC HUB API is healthy.'
    break
  fi
  if [[ "$attempt" -eq 30 ]]; then
    echo 'ARTIC HUB API did not become healthy. Review logs with:' >&2
    echo '  docker compose --project-name artic-hub --file deploy/vps/docker-compose.yml logs --tail=100' >&2
    exit 1
  fi
  sleep 2
done

"${compose[@]}" ps
echo 'ARTIC HUB containers are running. Configure/verify the separate Nginx site and TLS certificate next.'
