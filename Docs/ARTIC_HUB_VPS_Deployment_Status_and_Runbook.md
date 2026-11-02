# ARTIC HUB VPS Deployment Status and Runbook

**Company:** ARTIC Group Ltd

**Product:** ARTIC HUB — Enterprise Management Platform

**Domain:** `artichub.ddnsgeek.com`

**VPS:** Contabo Ubuntu 24.04.5, `185.208.207.100`
**Status snapshot:** 2 November 2026 (based on the user-provided terminal output)

## 1. Executive status

ARTIC HUB is **not deployed** to the VPS yet. The repository deployment changes have been pushed to GitHub `main` in commit `3b8541f`. The domain resolves to the VPS. ARTIC VMS is already running in its own Docker Compose project and has a valid HTTPS certificate. Certbot issued a certificate for ARTIC HUB and scheduled automatic renewal, but could not install it because no matching Nginx server block existed. A later attempt created a dangling `/etc/nginx/sites-enabled/artichub` link before its target file existed; the latest `nginx -t` failed because that target file is missing. No ARTIC HUB containers were observed in the supplied checks.

The VPS has suitable unused application ports for a separate HUB frontend and API, but the repository's default Compose configuration must not be used on this host unchanged: it publishes PostgreSQL on host port `5432`, which is already used by ARTIC VMS. There are also old, credential-bearing deployment scripts in the repository that must not be run.

## 2. What is verified on the server

The following facts come from terminal output supplied by the server owner; they have not been independently queried by this workstation.

| Item | Verified state |
|---|---|
| `artichub.ddnsgeek.com` DNS | Resolves to `185.208.207.100` |
| `articvms.ddnsgeek.com` DNS | Resolves to `185.208.207.100` |
| Operating system | Ubuntu 24.04.5 LTS |
| Nginx | Was active and valid before the HUB link attempt; the latest config test fails on a dangling HUB link |
| Public web ports | Nginx listens on `80` and `443` |
| Existing project | Docker Compose project `artic-vms`, four containers running |
| ARTIC VMS frontend | Host port `3000` → container port `3000` |
| ARTIC VMS backend | Host port `4000` → container port `4000`; MQTT port `1883` is also published |
| ARTIC VMS PostgreSQL | Host `127.0.0.1:5432` → container `5432` |
| ARTIC VMS Redis | Host `127.0.0.1:6379` → container `6379` |
| ARTIC HUB proposed ports | `3010` and `5000` were absent from the listener check and appear available at that time |
| ARTIC VMS Nginx site | `/etc/nginx/sites-enabled/artic-vms`, with `server_name articvms.ddnsgeek.com` |
| ARTIC VMS certificate | Valid for `articvms.ddnsgeek.com`; reported expiry 16 January 2027 |
| ARTIC HUB certificate | Issued at `/etc/letsencrypt/live/artichub.ddnsgeek.com/`; expires 31 January 2027; automatic renewal scheduled; not installed into Nginx yet |
| Latest Nginx check | Failed because `/etc/nginx/sites-enabled/artichub` points to a missing `/etc/nginx/sites-available/artichub`; Nginx service state after the failed reload has not been rechecked |
| PM2 | Not installed; current workloads are managed by Docker Compose |

Port availability can change. Recheck ports immediately before starting HUB containers.

## 3. Local repository changes and status

- The frontend production URL settings were updated locally to use `https://artichub.ddnsgeek.com` and the same-domain API path `/api/v1` in [`frontend/.env.production`](../frontend/.env.production).
- ARTIC Group Ltd / ARTIC HUB branding was changed across frontend metadata, navigation, authentication, admin, reports, emails, seeded defaults, translations, PWA manifest, mobile UI, and an SVG favicon.
- VPS deployment files have been added under [`deploy/vps`](../deploy/vps): an isolated Compose project, safe environment templates, and a separate Nginx site template. They are pushed to GitHub but have not been run on the VPS.
- Branding and VPS deployment changes are committed and pushed in `3b8541f` (`Prepare ARTIC HUB VPS deployment and branding`).
- A local `vercel.json` and Vercel-related API helper are present as uncommitted draft work. The selected host is now the VPS; do not treat that draft as the VPS deployment configuration.
- No post-branding build or test run has been performed.

## 4. Security and deployment blockers

### Do not run the existing deployment scripts

The previous versions of [`deploy.sh`](../deploy.sh) and [`server-cmd.ps1`](../server-cmd.ps1) contained hardcoded credentials and targeted an older server / port layout. The current worktree versions have been replaced with credential-free HUB deployment and SSH helpers. The old credentials remain in Git history and must be rotated; do not use old history copies of these scripts.

Actions required before any push or deployment:

1. Revoke or rotate credentials embedded in those scripts, including database, SSH, and seeded-account credentials as applicable.
2. Remove credentials from the scripts and replace deployment secrets with protected server-side environment files or a secrets manager. Do not paste secrets into chat or commit them.
3. Because these scripts are tracked by Git, check repository history and access before assuming a later edit removes exposure. Rotate a credential even if its literal is deleted from the current file.
4. The tracked `frontend/.env.production` and `backend/.env.production` files are now sanitized templates. Original local values were preserved in ignored `.env.production.local` files; never add those local files to Git.
5. Do not run the default [`docker-compose.yml`](../docker-compose.yml) unchanged on this VPS. It publishes PostgreSQL on `5432`, conflicting with VMS, and exposes service ports more broadly than needed for an Nginx-proxied production deployment. Use [`deploy/vps/docker-compose.yml`](../deploy/vps/docker-compose.yml).

### Other configuration gaps

- Configured production credentials were previously present in tracked env files and deployment scripts. Treat any credentials that were active as exposed and rotate them before production use; deleting or sanitizing the current files does not remove them from Git history.
- The deployment requires private server files: repository-root `.env`, `backend/.env.production.local`, and `frontend/.env.production.local`. Templates under [`deploy/vps`](../deploy/vps) contain placeholders only.
- [`frontend/next.config.ts`](../frontend/next.config.ts) now allows the ARTIC HUB HTTPS host for images. Confirm existing stored product/upload URLs use this domain or another approved image host.
- The backend must accept the actual frontend origin (`https://artichub.ddnsgeek.com`) for credentialed CORS. Do not use a broad wildcard origin.
- Production must use a unique strong auth/JWT secret, database password, SMTP credential, and payment-provider keys. The current development/default values must never be used in production.
- Database migrations should be preceded by a backup. Do not run the seed script against an existing production database.

## 5. Recommended target layout

Keep the two applications independent:

```text
Internet
  ├── https://articvms.ddnsgeek.com
  │     Nginx → existing ARTIC VMS frontend :3000 / backend :4000
  └── https://artichub.ddnsgeek.com
        Nginx → ARTIC HUB frontend 127.0.0.1:3010
              → ARTIC HUB API      127.0.0.1:5000
                 ├── HUB PostgreSQL (private Compose network only)
                 └── HUB Redis      (private Compose network only)
```

Use a distinct Docker Compose project name and distinct persistent volumes for HUB. Publish only the frontend and API on loopback for Nginx. Do not publish HUB PostgreSQL or Redis to the VPS host. Nginx should route `/api/` and `/uploads/` to the HUB API and other paths to the HUB frontend. Preserve the existing VMS site file and certificate.

## 6. Deployment phases and completion checklist

### Phase A — Secure and prepare the repository

- [x] Replace current tracked deployment helpers with credential-free versions; old credentials still require rotation and remain in Git history.
- [ ] Rotate exposed credentials and review Git history / repository access.
- [ ] Review all tracked environment files; use sanitized examples in Git and protected real environment files on the VPS.
- [x] Add the VPS Compose definition with project name `artic-hub`, production mode, independent volumes, private database/Redis, frontend bound to `127.0.0.1:3010`, and API bound to `127.0.0.1:5000`.
- [ ] Review Compose and environment templates before server use.
- [ ] Ensure frontend build-time public URLs are `NEXT_PUBLIC_API_URL=/api/v1` and `NEXT_PUBLIC_APP_URL=https://artichub.ddnsgeek.com`; set `NEXTAUTH_URL` / `AUTH_URL` to the HTTPS domain and backend `FRONTEND_URL` to the exact HTTPS origin.
- [ ] Check image URL handling, upload persistence, payment/webhook URLs, email verification/reset URLs, and authentication redirects for the new domain.
- [ ] Build and review the app locally; run the project's applicable checks before deployment.
- [x] Commit and push reviewed code and safe configuration in `3b8541f`; private `.env.production.local` files were excluded.

### Phase B — Prepare the VPS without disturbing VMS

- [ ] Recheck `3010` and `5000` are free.
- [ ] Back up any existing databases and deployment configuration before changes.
- [ ] Clone/pull the reviewed ARTIC HUB release into a distinct directory, separate from `/home/articadmin/artic-vms`.
- [ ] Create private environment files on the VPS with production secrets; set restrictive file permissions and do not print their contents in command output.
- [ ] Validate the HUB Compose configuration before starting it.
- [ ] Start only the HUB Compose project; do not use `down --remove-orphans` on a shared host.
- [ ] Confirm HUB frontend and API respond on loopback and that VMS remains healthy.

When setting up a fresh HUB directory on the VPS, copy the example files and replace every placeholder before starting containers:

```bash
cp deploy/vps/root.env.example .env
cp deploy/vps/backend.env.example backend/.env.production.local
cp deploy/vps/frontend.env.example frontend/.env.production.local
chmod 600 .env backend/.env.production.local frontend/.env.production.local
```

Set unique random authentication secrets and a strong database password. The `DATABASE_URL` password must be URL-encoded and match `POSTGRES_PASSWORD`. Do not paste the values into shared logs or chat. After the files are complete, deploy only the HUB Compose project with `bash ./deploy.sh`; the script checks for the three protected files, validates Compose, builds and starts HUB, and checks the API health endpoint. It does not seed demo records or stop the VMS project.

### Phase C — Nginx and HTTPS

- [ ] Recover Nginx first: remove only the dangling `/etc/nginx/sites-enabled/artichub` link with `sudo unlink /etc/nginx/sites-enabled/artichub`, run `sudo nginx -t`, and reload if it passes.
- [ ] After Git deployment, install [`deploy/vps/nginx/artichub.conf`](../deploy/vps/nginx/artichub.conf) as `/etc/nginx/sites-available/artichub`; enable it without modifying the VMS site.
- [ ] Confirm HUB containers are running on the configured loopback ports before expecting proxied requests to succeed.
- [ ] Preserve forwarding headers (`Host`, `X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto`) and disable proxy buffering for streaming API endpoints where required.
- [ ] Run `sudo nginx -t`; reload Nginx only if it passes.
- [ ] Install the already-issued certificate with `sudo certbot install --cert-name artichub.ddnsgeek.com` after the matching Nginx HTTP server block is enabled and DNS still resolves correctly. If Certbot cannot install it, inspect `sudo nginx -T` and the Certbot log before retrying.
- [ ] Verify HTTPS and certificate renewal; do not alter the VMS certificate/site.

Perform the Nginx steps in this order:

1. Recover the current configuration by removing the dangling HUB symlink and reload only after validation:

   ```bash
   sudo unlink /etc/nginx/sites-enabled/artichub
   sudo nginx -t && sudo systemctl reload nginx
   ```

2. After the repository is on the VPS, install and enable the site template:

   ```bash
   sudo install -D -m 0644 deploy/vps/nginx/artichub.conf /etc/nginx/sites-available/artichub
   sudo ln -s /etc/nginx/sites-available/artichub /etc/nginx/sites-enabled/artichub
   sudo nginx -t && sudo systemctl reload nginx
   ```

3. Install the certificate that Certbot already issued, then validate and reload again:

   ```bash
   sudo certbot install --cert-name artichub.ddnsgeek.com
   sudo nginx -t && sudo systemctl reload nginx
   ```

The site template proxies to the HUB loopback ports. Install it after HUB is running so visitors do not encounter upstream errors. Never create the `sites-enabled` link before the `sites-available/artichub` target exists.

### Phase D — Validate production behavior

- [ ] `https://artichub.ddnsgeek.com` loads with the ARTIC Group Ltd / ARTIC HUB brand.
- [ ] `/health` on the API works through the Nginx route (use the actual API health path/configured prefix).
- [ ] Product/category reads, login, registration, cart, checkout, seller/service booking, Academy routes, and admin access work.
- [ ] Uploads persist across container recreation and are served through HTTPS.
- [ ] Email verification, password reset, and order email links use the HTTPS domain.
- [ ] Payment webhooks use the correct public HTTPS endpoint; payment test/live mode is intentionally configured.
- [ ] No browser mixed-content or CORS errors; cookies use secure production settings.
- [ ] Restart HUB containers and verify persistent data; verify ARTIC VMS remains healthy.
- [ ] Confirm automated database backup and restore procedure.

## 7. Read-only commands for the next server check

These commands inspect the host without changing it:

```bash
sudo ss -tulpn | grep -E ':80|:443|:3010|:4000|:5000|:5432|:6379'
docker ps --format 'table {{.Names}}\t{{.Ports}}'
docker compose ls
sudo nginx -t
sudo certbot certificates
```

Never include passwords, API keys, private keys, or full secret environment-file contents in shared output.

## 8. Current decision

The deployment target is a **single Contabo VPS with separate Docker Compose projects and separate Nginx virtual hosts**. ARTIC VMS remains on its current domain and ports. ARTIC HUB should use its own application ports, private database/Redis network, Nginx hostname route, and already-issued TLS certificate. Deployment can proceed after reviewing the VPS Compose configuration, preparing server-only secrets, rotating exposed credentials, and restoring Nginx's valid configuration.
