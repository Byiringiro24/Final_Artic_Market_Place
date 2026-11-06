# Department project template

Copy this directory to `platform/departments/<department-id>` and fill in `department.json` and `roles.json`.
Each department must have an owner, a named service owner, public/staff route policy, its own API process,
database and database credentials before it can be marked Live.

The initial template deliberately contains only the contract and operational checklist. Department-specific
UI and business logic are added during that department's migration; do not copy Marketplace code blindly.

## Required implementation before production

- Next.js frontend and Express API deployed as independent containers.
- `GET /health` (process health) and `GET /ready` (dependency readiness).
- Department-scoped authentication and permission checks on every protected operation.
- Separate PostgreSQL database/user, storage bucket and Redis namespace/ACL.
- Timeouts and fallbacks for every platform API call; no cross-department database access.
- Route-level error boundaries, audit events, logs, metrics, backup and restore procedure.
- Stop test, rollback test, security review, real content and owner sign-off.
