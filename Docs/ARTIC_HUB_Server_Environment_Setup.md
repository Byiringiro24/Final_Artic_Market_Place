# ARTIC HUB Server Environment Setup

Use this guide on the Contabo VPS in `/opt/artic-hub`. The setup script creates database and application secrets, configures the ARTIC HUB email sender, and prompts for optional payment-provider credentials. It does not print generated secrets.

## 1. Pull the latest setup script

```bash
cd /opt/artic-hub
git pull --ff-only origin main
```

The protected environment files should already exist from the deployment preparation step:

- `.env`
- `backend/.env.production.local`
- `frontend/.env.production.local`

If any file is missing, stop and create it from the matching example under `deploy/vps/` before continuing.

## 2. Configure secrets without editing the files manually

Run the setup helper:

```bash
bash deploy/vps/configure-env.sh
```

The script will:

- Generate a unique database password and matching PostgreSQL URL when the template values remain.
- Generate JWT and NextAuth secrets when the template values remain.
- Set the SMTP sender to `ARTIC HUB` using the configured ARTIC email address.
- Prompt for the SMTP app password without echoing it to the terminal.
- Prompt for Stripe and PayPal credentials. Press Enter for a provider you are not enabling; its payment flow will remain unavailable until configured.
- Restrict the environment files to owner-only access and validate the Compose configuration.

Because an SMTP password was shared in chat, revoke that app password and enter a newly generated one at the hidden prompt. Do not put the password in this document, a Git file, or a command-line argument.

## 3. Start ARTIC HUB

Only after the setup script reports that Compose validation passed, run:

```bash
bash ./deploy.sh
```

The deployment script builds and starts the separate `artic-hub` Compose project, runs the backend's configured Prisma migrations at startup, and checks `http://127.0.0.1:5000/health`. It does not stop ARTIC VMS or seed demo accounts.

## 4. Verify

```bash
docker compose --env-file .env --project-name artic-hub --file deploy/vps/docker-compose.yml ps
curl -fsS http://127.0.0.1:5000/health
curl -I https://artichub.ddnsgeek.com
```

If an error occurs, share the error text only. Never share `.env` contents, SMTP passwords, database passwords, OAuth secrets, or payment credentials.
