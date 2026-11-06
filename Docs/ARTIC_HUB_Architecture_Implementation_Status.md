# ARTIC HUB Architecture Implementation Status

**Reference:** `ARTIC_HUB_Full_System_Structure_and_Architecture.pdf` (Version 2.0)  
**Repository:** `Byiringiro24/Final_Artic_Market_Place`  
**Status date:** 5 November 2026

## Direction

The target architecture is a department-oriented platform with shared entry and platform services. Each department is intended to own its frontend, API, database credentials, storage scope, deployment lifecycle, staff portal and audit boundary. The public domain remains the entry point, with department paths such as `/marketplace` and `/academy`.

The migration is incremental. The current Marketplace, Academy, Services and account journeys remain reachable while target routes and APIs are extracted. Existing paths must not be retired until data parity, user journeys, rollback and production health have been verified.

## Implemented in this architecture increment

- Added the canonical 22-department registry at `platform/control-plane/registry.json` with target routes, API prefixes, audiences, tiers, lifecycle states, legacy route mappings and declared platform dependencies.
- Added department charter and role-template files for all registry entries. These are scaffolding metadata; they are not independent applications.
- Added a reusable `_template` contract for department projects, including deployment, isolation, health/readiness, permission, error-boundary, audit, backup and sign-off requirements.
- Added `GET /api/v1/platform/departments`, which publishes only safe directory fields and availability status.
- Added `/ready` to distinguish datastore readiness from process liveness at `/health`.
- Mounted the canonical registry read-only into both Compose deployments and configured the API to read it from an explicit environment path.

## Current architecture facts

- The public frontend remains one Next.js application.
- The Express backend remains one API process containing Marketplace, Academy, service booking, discovery, auth, payment and admin routes.
- Marketplace, Academy, accounts, orders and services still share one Prisma schema and PostgreSQL database.
- The current API continues to use `/api/v1/...`; the department API prefixes in the registry are target paths, not yet live route mounts.
- Existing user roles remain `USER`, `SELLER` and `ADMIN`; department memberships, scoped roles and ARTIC ID are not implemented.
- ARTIC VMS remains a separate application and identity store. No SSO/OIDC integration is included in this increment.
- The deployment remains one ARTIC HUB Compose project on the existing VPS. The independent department container/database topology is not yet deployed.

## Important availability interpretation

Registry entries marked `migration` mean the feature exists in the legacy application and is awaiting extraction. It does not mean it has passed the architecture's department-level Live checklist. Academy capabilities remain partial, and Services still needs a durable booking workflow. Entries marked `planned` are not presented as available products.

## Remaining implementation phases

### Phase 0 - Stabilize current release

1. Deploy the Stripe lazy-initialization fix and verify API health on the VPS.
2. Verify Marketplace browse, cart, checkout/payment modes, order placement and admin operations.
3. Confirm current database backup and perform a restore rehearsal before schema moves.
4. Review and rotate any credentials previously pasted into chat or committed documents.

### Phase 1 - Platform foundation

1. Turn the registry into an authenticated control-plane service with status changes, feature flags, health aggregation and audit history. The current registry endpoint is read-only and served by the legacy backend.
2. Implement ARTIC ID: identities, organizations, memberships, MFA, token revocation, scoped roles and JWKS/OIDC endpoints.
3. Define and deploy the public gateway with path routing, request IDs, rate limits, maintenance fallbacks and upstream health behavior.
4. Add shared packages for API clients, identity verification, permission helpers, fault handling, observability and design tokens.
5. Add platform-level object storage, notifications, payments/ledger, audit and event outbox. Provider outages must not prevent unrelated services from starting.
6. Create the Super Admin console; require MFA, separation of duties and audit trails for high-impact actions.

### Phase 2 - Tier 1 department extraction

1. Marketplace: extract catalog, cart, orders, reviews, seller onboarding and payments into its own API and database. Preserve URL compatibility through the gateway.
2. Academy: add instructor authoring, enrollment, lesson player, progress, assessments, certificates and organization cohorts.
3. Services: add persistent booking, quotation, scheduling, assignment and completion records.
4. Support: add durable tickets, assignment, status, customer history and service-level reporting.
5. My ARTIC: combine user-facing orders, learning, bookings, projects, invoices, tickets and privacy requests using authorized department APIs.
6. Run a stop-one-department test after each extraction. Keep rollback paths until parity is approved.

### Phase 3 - Remaining departments

Build Tier 2 and Tier 3 departments from the template only when a named owner and real operational need exist. Start each as `planned` or `off`; mark `live` only after every checklist item in section 18 of the architecture PDF is evidenced and signed.

## Migration decisions and risks

- **No direct database sharing:** departments keep separate databases and communicate through versioned APIs or durable events.
- **One identity, scoped authorization:** sharing login does not grant cross-department permission.
- **Capacity:** 22 frontends and APIs do not fit every low-cost server comfortably. Deploy Tier 1 first, measure memory/CPU/connection pools, then scale hosts before activating more departments.
- **Critical path:** ARTIC ID and the gateway become shared dependencies. Run multiple instances, cache public directory/status data, and provide a static fallback.
- **Data movement:** migrate in slices with snapshots, reconciliation counts, dual-read or parallel-run where needed, and a tested rollback.
- **Truthful status:** directory visibility must follow registry status and verified feature readiness. Do not market planned modules as operational.

## Verification needed for this increment

- Build the backend to verify route and TypeScript changes.
- Verify Compose config on the development machine and target VPS after the registry bind mount is pulled.
- Verify the public department directory response, `/health`, and `/ready`.

This document records an architecture foundation and migration plan. It does not claim that the full target platform or all departments have been implemented.
