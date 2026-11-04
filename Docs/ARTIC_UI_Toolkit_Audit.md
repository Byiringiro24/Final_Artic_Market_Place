# ARTIC HUB UI Toolkit Audit

**Reviewed:** 4 November 2026  
**Scope:** `Final_Artic_Market_Place` frontend and the shared UI toolkit proposal for ARTIC HUB, ARTIC VMS, EcaAfrica, and future ARTIC applications.

## Summary

The current ARTIC HUB frontend already has the right core toolkit for its active product and landing page. It uses Next.js, React, Tailwind CSS, local accessible UI primitives built with Radix, Motion, Lucide, Recharts, React Hook Form, and Zod. The landing page now uses Motion for its animated hub illustration, reduced-motion-aware effects, reveal transitions, service ticker, and navigable service cards.

The proposal is a useful menu of options, but installing every item now would add dependencies without active features to support. Keep the current app focused. Add a library when an actual screen needs it, and establish cross-product reuse as a separately versioned design system after the other applications are available for comparison.

## What is already in the ARTIC HUB frontend

| Area | Current project evidence | Recommendation |
|---|---|---|
| Framework | Next.js 15 and React 19 in `frontend/package.json` | Keep. |
| Styling | Tailwind CSS, `tailwindcss-animate`, ARTIC colors, radii, and motion keyframes in `frontend/tailwind.config.ts` | Keep the existing design tokens and consolidate duplicated colors as components are touched. |
| UI primitives | Local `frontend/components/ui` components using Radix patterns for buttons, inputs, cards, dialogs, menus, tabs, and toasts | Extend these. shadcn/ui is a component source/generator, not a runtime library that needs to be installed wholesale. |
| Motion | `motion` is installed and used by the ARTIC HUB homepage components | Continue using Motion for page-level transitions and interaction. The landing page honors reduced motion and lets users pause the ticker and hero animation. |
| Icons | `lucide-react` | Keep. |
| Charts | `recharts` is already used in admin reports and overview | Keep for current operational dashboards. |
| Forms | `react-hook-form` and `zod` are used across auth, checkout, account, service booking, and admin forms | Keep. |
| Data fetching | `@tanstack/react-query` is installed | Keep for the existing API/client data workflows. |
| Notifications | Local toast and toaster components exist in `frontend/components/ui` | Reuse the current implementation; consider Sonner only if the existing components prove insufficient. |

## Proposal items not currently installed

GSAP, Rive, Lottie, Three.js/React Three Fiber, React Flow, Mermaid, Leaflet, Apache ECharts, Sonner, and TanStack Table do not appear in the active frontend dependencies or source imports. Their absence is appropriate until an implemented screen needs them.

| Library or tool | Add when | Current decision |
|---|---|---|
| GSAP | A specific page needs pinned, sequenced scroll storytelling that Motion cannot handle cleanly | Defer. The homepage already has a Motion-based animated hub and reveal effects. Avoid running two animation systems on the same screen without a clear need. |
| Rive or Lottie | ARTIC has approved, branded animation assets for onboarding, empty states, or product illustrations | Defer until the design assets and interaction are defined. Prefer one format per use case. |
| Three.js / React Three Fiber | A product page needs a real interactive 3D device, vehicle, or engineering model | Defer and load it only on that page. Avoid putting a 3D scene in the shared landing route by default. |
| React Flow | An ARTIC product has an editable workflow, network topology, or device/system diagram | Defer. It is appropriate for a dedicated editor, not ordinary marketing diagrams. |
| Mermaid | Technical documentation needs source-controlled diagrams | Use in Markdown where the renderer supports it; an application dependency is not required for documentation. |
| Leaflet | A live directory, service area, or location-based workflow has been implemented | Defer until there is a real location dataset and map interaction. ARTIC VMS is currently a separate product. |
| Apache ECharts | Recharts no longer meets a defined advanced visualization requirement such as dense live telemetry or specialized gauges | Defer. Existing admin analytics already use Recharts. |
| Sonner | The current toast components fail a concrete UX requirement | Defer; first improve or reuse the local toast primitives. |
| TanStack Table | A data-heavy admin table needs advanced sorting, filtering, visibility, selection, or virtualization | Defer until an existing table screen demonstrates that need. |

## Reusable design system across ARTIC products

ARTIC HUB, ARTIC VMS, and EcaAfrica should share brand foundations and selected primitives, but they should not be coupled to one application's routes, data models, or authentication.

1. **Inventory the products first.** Compare framework versions, CSS approaches, accessibility needs, and existing components across each repository.
2. **Define framework-neutral tokens.** Publish ARTIC color, type, spacing, radius, elevation, and motion tokens as CSS variables or a small token package.
3. **Create a versioned shared package.** Prefer a private package such as `@artic/ui` once the shared components are verified in at least two applications. Keep it free of app-specific API calls and route assumptions.
4. **Share stable primitives.** Start with buttons, fields, dialogs, alerts, badges, cards, navigation patterns, and accessible loading/empty states. Keep VMS maps, marketplace product cards, and EcaAfrica workflows in their product packages.
5. **Share motion selectively.** Provide a small set of accessible patterns (reveal, loading, hover, progress) with reduced-motion behavior. Do not make every component animate by default.
6. **Set package versioning and release checks.** Pin versions in consuming apps and use a change log so a shared update cannot silently alter deployed products.

If the repositories are eventually consolidated, a monorepo can host `apps/artic-hub`, `apps/artic-vms`, `apps/eca-africa`, and `packages/ui`. Until then, a versioned private npm package avoids copying source between repositories. Do not create a shared package against unseen code or impose a monorepo migration as part of the current homepage update.

## Homepage implementation checked against the proposal

- Motion drives the ARTIC-connected hub diagram and its moving signal pulses.
- Motion animates hero text, service cards, and filtered page-directory results.
- Users can pause the hero and ticker animations; `prefers-reduced-motion` is respected by the homepage components.
- Animated elements use CSS transforms/opacity or SVG path motion rather than introducing a canvas or 3D runtime.
- The home route is a corporate service hub. It no longer renders product grids, sale listings, category tiles, or browsing history.
- The marketplace remains a navigable destination and a named item in the complete service portfolio; its store content belongs on marketplace pages.
- Planned modules are described as planned rather than linked to pages that do not exist.

## Next toolkit work, when feature scope is ready

1. Compare the existing shared primitives with ARTIC VMS and EcaAfrica.
2. Define the common tokens and component contribution rules.
3. Add accessibility and reduced-motion review to shared component changes.
4. Select one real future feature (for example a VMS live map or technical topology editor), then add only its required visualization library to that product.
5. Package shared primitives after the two or more consuming products have validated them.

