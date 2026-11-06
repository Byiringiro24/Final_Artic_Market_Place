# ARTIC HUB Platform Foundation

This directory is the shared platform layer described by `ARTIC_HUB_Full_System_Structure_and_Architecture.pdf`.
It is introduced alongside the current application so departments can migrate gradually without replacing
the working marketplace in one risky release.

## Current contents

- `control-plane/registry.json` is the canonical department catalogue and migration map.
- `departments/` contains department charters and permission templates created from the shared template.
- `departments/_template/` is the starting point for new department projects.

## Department states

- `migration`: an existing feature is served by the legacy application while extraction is in progress.
- `planned`: the target department is catalogued but is not available to users.
- `live`: the department has passed the live checklist in the architecture document.
- `maintenance` and `off`: temporarily unavailable or administratively disabled.

Do not mark a department `live` until its owner has signed off its checklist, including isolated deployment,
database, health/readiness, authorization, backups, monitoring, and stop-one-department verification.

## Migration guardrails

1. Keep old URLs working while new department routes are introduced.
2. Move one department at a time; retain a rollback route until data and user journeys are reconciled.
3. Do not let one department query another department's tables or share its credentials.
4. Use versioned HTTP APIs for request/response and durable events for cross-department notifications.
5. Treat the registry as routing metadata, not an authorization source. Every protected API must enforce permissions.

The registry endpoint is a transition adapter served by the existing API. It is not yet the independent,
high-availability control-plane service described in the target architecture.
