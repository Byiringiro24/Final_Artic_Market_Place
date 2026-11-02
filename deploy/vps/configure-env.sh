#!/usr/bin/env bash
# Configure private ARTIC HUB runtime values without displaying secrets.
set -Eeuo pipefail
umask 077

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

ROOT_ENV="$ROOT_DIR/.env"
BACKEND_ENV="$ROOT_DIR/backend/.env.production.local"
FRONTEND_ENV="$ROOT_DIR/frontend/.env.production.local"

for file in "$ROOT_ENV" "$BACKEND_ENV" "$FRONTEND_ENV"; do
  if [[ ! -f "$file" ]]; then
    printf 'Missing configuration file: %s\n' "$file" >&2
    exit 1
  fi
done

get_env() {
  awk -F= -v key="$2" '$1 == key { sub(/^[^=]*=/, ""); print; exit }' "$1"
}

set_env() {
  local file="$1" key="$2" value="$3"
  ARTIC_ENV_KEY="$key" ARTIC_ENV_VALUE="$value" python3 - "$file" <<'PY'
import os
import pathlib
import sys

path = pathlib.Path(sys.argv[1])
key = os.environ["ARTIC_ENV_KEY"]
value = os.environ["ARTIC_ENV_VALUE"]
lines = path.read_text().splitlines()
updated = False
for index, line in enumerate(lines):
    if line.startswith(key + "="):
        lines[index] = key + "=" + value
        updated = True
        break
if not updated:
    lines.append(key + "=" + value)
path.write_text("\n".join(lines) + "\n")
path.chmod(0o600)
PY
}

is_placeholder() {
  local value="${1,,}"
  [[ -z "$value" || "$value" == *replace* || "$value" == *url_encoded* ]]
}

# Give the isolated HUB database its own credentials. Existing configured
# values are preserved so rerunning this script will not rotate them.
POSTGRES_USER="$(get_env "$ROOT_ENV" POSTGRES_USER)"
POSTGRES_DB="$(get_env "$ROOT_ENV" POSTGRES_DB)"
POSTGRES_PASSWORD="$(get_env "$ROOT_ENV" POSTGRES_PASSWORD)"
[[ -n "$POSTGRES_USER" ]] || POSTGRES_USER=artic_hub
[[ -n "$POSTGRES_DB" ]] || POSTGRES_DB=artic_hub
if is_placeholder "$POSTGRES_PASSWORD"; then
  POSTGRES_PASSWORD="$(openssl rand -hex 24)"
fi
set_env "$ROOT_ENV" POSTGRES_USER "$POSTGRES_USER"
set_env "$ROOT_ENV" POSTGRES_DB "$POSTGRES_DB"
set_env "$ROOT_ENV" POSTGRES_PASSWORD "$POSTGRES_PASSWORD"

DATABASE_URL="$(get_env "$ROOT_ENV" DATABASE_URL)"
if is_placeholder "$DATABASE_URL"; then
  DATABASE_URL="$(DB_USER="$POSTGRES_USER" DB_PASSWORD="$POSTGRES_PASSWORD" DB_NAME="$POSTGRES_DB" python3 - <<'PY'
import os
from urllib.parse import quote

user = quote(os.environ["DB_USER"], safe="")
password = quote(os.environ["DB_PASSWORD"], safe="")
database = quote(os.environ["DB_NAME"], safe="")
print(f"postgresql://{user}:{password}@postgres:5432/{database}?schema=public")
PY
)"
fi
set_env "$ROOT_ENV" DATABASE_URL "$DATABASE_URL"

for key in JWT_ACCESS_SECRET JWT_REFRESH_SECRET JWT_EMAIL_VERIFY_SECRET JWT_RESET_SECRET; do
  value="$(get_env "$BACKEND_ENV" "$key")"
  if is_placeholder "$value"; then
    value="$(openssl rand -hex 32)"
  fi
  set_env "$BACKEND_ENV" "$key" "$value"
done

AUTH_SECRET="$(get_env "$FRONTEND_ENV" AUTH_SECRET)"
NEXTAUTH_SECRET="$(get_env "$FRONTEND_ENV" NEXTAUTH_SECRET)"
if is_placeholder "$AUTH_SECRET" && is_placeholder "$NEXTAUTH_SECRET"; then
  AUTH_SECRET="$(openssl rand -hex 32)"
  NEXTAUTH_SECRET="$AUTH_SECRET"
elif is_placeholder "$AUTH_SECRET"; then
  AUTH_SECRET="$NEXTAUTH_SECRET"
elif is_placeholder "$NEXTAUTH_SECRET"; then
  NEXTAUTH_SECRET="$AUTH_SECRET"
fi
set_env "$FRONTEND_ENV" AUTH_SECRET "$AUTH_SECRET"
set_env "$FRONTEND_ENV" NEXTAUTH_SECRET "$NEXTAUTH_SECRET"

# Configure the sender identity requested for ARTIC HUB.
set_env "$BACKEND_ENV" SMTP_HOST smtp.gmail.com
set_env "$BACKEND_ENV" SMTP_PORT 587
set_env "$BACKEND_ENV" SMTP_SECURE false
set_env "$BACKEND_ENV" SMTP_USER byiringirofabrice6@gmail.com
set_env "$BACKEND_ENV" SMTP_FROM_NAME "ARTIC HUB"
set_env "$BACKEND_ENV" SMTP_FROM_EMAIL byiringirofabrice6@gmail.com

SMTP_PASSWORD="$(get_env "$BACKEND_ENV" SMTP_PASSWORD)"
if is_placeholder "$SMTP_PASSWORD"; then
  read -r -s -p 'Enter a fresh Gmail app password (input hidden): ' SMTP_PASSWORD
  printf '\n'
  SMTP_PASSWORD="${SMTP_PASSWORD//[[:space:]]/}"
  if [[ -z "$SMTP_PASSWORD" ]]; then
    echo 'SMTP app password is required to configure email delivery.' >&2
    exit 1
  fi
fi
set_env "$BACKEND_ENV" SMTP_PASSWORD "$SMTP_PASSWORD"

# Payment providers are optional at initial launch. Empty prompts disable the
# provider; entering valid test/live values enables it. Never echo secret input.
STRIPE_PUBLISHABLE="$(get_env "$ROOT_ENV" NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)"
if is_placeholder "$STRIPE_PUBLISHABLE"; then STRIPE_PUBLISHABLE=; fi
if [[ -z "$STRIPE_PUBLISHABLE" ]]; then
  read -r -p 'Stripe publishable key (Enter to disable Stripe): ' STRIPE_PUBLISHABLE
  set_env "$ROOT_ENV" NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY "$STRIPE_PUBLISHABLE"
fi

for key in STRIPE_SECRET_KEY STRIPE_WEBHOOK_SECRET; do
  value="$(get_env "$BACKEND_ENV" "$key")"
  if is_placeholder "$value"; then
    read -r -s -p "$key (Enter to disable Stripe): " value
    printf '\n'
    set_env "$BACKEND_ENV" "$key" "$value"
  fi
done

for key in PAYPAL_CLIENT_ID PAYPAL_APP_SECRET; do
  value="$(get_env "$BACKEND_ENV" "$key")"
  if is_placeholder "$value"; then
    read -r -s -p "$key (Enter to disable PayPal): " value
    printf '\n'
    set_env "$BACKEND_ENV" "$key" "$value"
  fi
done

chmod 600 "$ROOT_ENV" "$BACKEND_ENV" "$FRONTEND_ENV"

if grep --quiet --extended-regexp 'REPLACE_WITH|replace_on_server|URL_ENCODED_PASSWORD' \
  "$ROOT_ENV" "$BACKEND_ENV" "$FRONTEND_ENV"; then
  echo 'A template value remains; review the listed key names and rerun this setup script.' >&2
  for file in "$ROOT_ENV" "$BACKEND_ENV" "$FRONTEND_ENV"; do
    awk -F= '/REPLACE_WITH|replace_on_server|URL_ENCODED_PASSWORD/ { print FILENAME ": " $1 " still needs a value" }' "$file"
  done
  exit 1
fi

docker compose --env-file "$ROOT_ENV" --project-name artic-hub \
  --file "$ROOT_DIR/deploy/vps/docker-compose.yml" config --quiet

unset POSTGRES_PASSWORD DATABASE_URL AUTH_SECRET NEXTAUTH_SECRET SMTP_PASSWORD value
echo 'ARTIC HUB environment files are configured and Compose validation passed.'
