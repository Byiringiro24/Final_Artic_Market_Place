# ARTIC HUB — Current Status, Full Service Scope & Academy Curriculum

**Prepared:** 4 November 2026  
**Project:** ARTIC Group Ltd / ARTIC HUB  
**Repository:** `Byiringiro24/Final_Artic_Market_Place`  
**Purpose:** Record what the repository currently contains, identify unfinished and future modules, define the full service scope, and propose a practical ARTIC Academy curriculum.

> Status in this document is based on the repository code and routes reviewed on the preparation date. A page or API route existing does not by itself mean its complete workflow has been implemented, deployed, or verified in production.

## 1. Executive status

ARTIC HUB is currently a Next.js web application with a Node.js/Express API. The repository contains a substantial marketplace foundation, account and administration pages, service listings and booking requests, course catalog and training registration foundations, seller applications, customer contact/support pages, and idea submission. ARTIC VMS is a separate external product at `https://articvms.ddnsgeek.com` with separate registration and sign-in.

The homepage was refocused as an ARTIC Group service hub. It has animated service navigation, the main routes into ARTIC services, an 18-family portfolio, a searchable directory of live destinations, a VMS link, an idea submission form, and contact/booking links. Storefront product feeds and deal/category panels were removed from the landing page; the marketplace remains a destination inside the wider platform.

Several larger services remain plans or partial foundations. In particular, the Academy still needs its learner experience and course-authoring workflows; the booking API does not yet persist a full booking record; seller application is not a full seller operations portal; and the Directory, Jobs, Events, Memberships, Hotel, Property, Health, and Agricultural IoT systems do not have full application workflows in this repository.

## 2. What has been made

### 2.1 Platform foundations

- **Frontend:** Next.js/React, localized route structure, Tailwind CSS, reusable Radix-based UI components, Motion animations, Lucide icons, React Query, React Hook Form, and Zod validation.
- **Backend:** Node.js/Express REST API under `/api/v1`, Prisma/PostgreSQL, optional MongoDB media metadata connection, optional Redis cache, Swagger API documentation, rate limiting, request validation, security middleware, email utilities, and a health endpoint.
- **Identity and accounts:** Sign-up/sign-in, email verification, password reset, user/account pages, addresses, orders, reviews, notifications, and account settings routes exist.
- **Administration:** Admin pages and APIs exist for overview, users, products, categories, orders, sellers, services, reviews, shipping, promotions, banners, web pages, settings, reports, and contact information.
- **Platform experience:** Localized pages, navigation, responsive layouts, error/loading states, reusable forms, and customer-facing support/contact pages.

### 2.2 Marketplace foundation

The codebase has frontend and API surfaces for product discovery, category and brand data, product details, cart, wishlist, checkout, order history/details, order administration, reviews, promotions/deals, shipping, taxes, payment routes, payment webhooks, and seller applications. Stripe integration is present in the backend and Stripe checkout pages exist in the frontend.

The marketplace should be treated as the most developed product foundation, but it still needs end-to-end production checks for payment provider configuration, webhook behavior, inventory and order transitions, delivery/returns operations, seller permissions and payouts, and customer support resolution. Presence of PayPal environment settings in examples should not be taken as proof that PayPal checkout is implemented and operational.

### 2.3 Learning and training foundation

- Public course catalog and course detail API routes.
- Course records, modules, lessons, enrollments, and training registrations represented in the Prisma schema.
- Admin endpoints to create and update course records.
- Public training registration page and form, including course association, participant contact details, consent, optional organization/message, and optional WhatsApp opt-in.
- Academy course list and registration links in the frontend.

**Important gap:** Academy API comments state that module and lesson editing will be added in a later slice. The learner course player, enrollment/payment completion, lesson completion tracking, progress dashboard, assessments, certificate issuance/verification, and a complete instructor/course-authoring workflow are not complete based on the inspected routes and pages. WhatsApp opt-in is captured; an automated or admin-managed community invitation flow is not evidenced in the current API.

### 2.4 Services, booking, and business enquiries

- Public service listing pages and API routes.
- Service booking form/modal and authenticated booking endpoint.
- Booking endpoint sends a request notification to the user/admins and email confirmations.
- A homepage idea form submits validated ideas to ARTIC administrators by email with rate limiting and a honeypot.
- Contact/support page and contact-information API.

**Important gap:** The booking endpoint currently records a booking request as a notification rather than a durable booking entity. A dedicated booking table, provider calendar, availability/slot holds, status management, reschedule/cancel flow, reminders, and booking administration are still needed. Listings on the service page should also be reviewed and aligned with ARTIC’s actual deliverable services before marketing them.

### 2.5 Seller/provider and support foundation

- Seller application page and `/sellers` API routes.
- Admin seller review pages.
- Customer support/contact page, FAQ content, and editable contact information.

**Important gap:** The seller application is not a complete seller portal for product/catalog management, orders, fulfillment, payouts, disputes, and analytics. Service-provider onboarding and provider-specific booking management are also not complete. A customer support ticket lifecycle and structured order dispute/returns cases are not evident as a full module.

### 2.6 Homepage and visual system

- ARTIC-branded company landing page.
- Animated connected-hub SVG diagram and interactive path cards.
- Motion-based hero, reveal effects, scroll progress, responsive directory filters, service ticker, and mobile quick navigation.
- Reduced-motion handling and pause controls for the moving hero/ticker.
- Complete portfolio display with clear `Live`, `Planned`, or `Separate product` labels.
- Idea proposal submission, contact details, service booking link, Academy links, and ARTIC VMS registration/sign-in links.
- Marketplace item remains a route in the hub, while product/category/deal feeds are kept on marketplace pages.

The landing page uses remote Unsplash photography in parts of the page. Replace these with approved ARTIC photography or commissioned illustrations when they are available, and ensure remote image use and licensing meet the deployment policy.

## 3. Current service inventory and status

| Service family | Current state in this repository | Main missing work |
|---|---|---|
| 1. ARTIC HUB marketplace | Substantial web/API foundation: product, category, search, cart, wishlist, checkout/order, reviews, shipping/tax, promotions, seller application, and admin surfaces | Production payment/webhook verification; complete stock/fulfillment/returns/refunds/dispute operations; seller catalog/order/payout workspace; end-to-end permissions and operational checks. |
| 2. ARTIC Academy | Catalog and course detail, course records, initial admin course create/update API, training registration | Module/lesson authoring, learner enrollment, course player, downloadable content access, progress, quizzes, assessment attempts, certificates, certificate verification, instructor workflows, team training purchase/management. |
| 3. Training registration & learner community | Registration form/API with consent and optional WhatsApp opt-in | Admin registration queue/status/export, duplicate rules, reminders, attendance, approved WhatsApp invitation flow, group/community lifecycle, learner dashboard. |
| 4. Engineering, electronics & IoT services | Service listings and enquiry/booking foundation | Confirm real service catalog, scoping forms, technical quotation/project workflow, provider assignment, durable booking/calendar, delivery records, after-service support. |
| 5. AI integration & digital technology services | Included in ARTIC service portfolio and technical enquiry direction | Define actual packages and delivery boundaries; lead qualification; secure AI gateway/integrations; human approval for code, firmware, data, or customer-facing outputs; no misleading “AI agent” claims. |
| 6. Professional services & booking | Service catalog and request endpoint; emails/notifications | Durable booking lifecycle, slot availability, provider calendars, payment/deposit rules, cancellation/reschedule, reminders, invoice/receipt, admin reporting. |
| 7. Business directory | Portfolio concept only | Business profiles, categories, locations/service areas, verification/moderation, search, reviews, contact leads, paid placement rules. |
| 8. Jobs & opportunities | Portfolio concept only | Employer accounts, job/internship/freelance listings, candidate profiles, applications, application status, moderation, alerts, privacy and retention. |
| 9. Events & webinars | Portfolio concept only | Event listings, capacity/registration, ticketing/payment if required, attendee communication, calendar/reminders, check-in, refunds/cancellation. |
| 10. Digital products & resources | Marketplace product machinery may provide a base; digital delivery/license workflows are not evidenced as a complete service | Secure downloads, product versioning, licenses/keys, access control, refund rules, update notices, malware scanning and storage lifecycle. |
| 11. Memberships & subscriptions | Portfolio concept only | Plans/benefits, recurring billing, entitlement checks, renewals, cancellation, dunning, member content/events, invoices and subscription reporting. |
| 12. Seller & service-provider portal | Seller application and admin seller review are present | Seller dashboard, product/service listing management, order/booking handling, fulfillment, payout ledger, commissions, disputes, compliance documents, analytics. |
| 13. Customer support & platform administration | Support/contact route, FAQ, contact data and core marketplace admin pages | Structured support tickets, SLA/assignment, attachments, order issue and dispute workflow, audit log, per-module role policies and operational reporting. |
| 14. Hotel management | Portfolio concept only | Property/room inventory, reservations, guests, check-in/out, housekeeping, maintenance, billing, staff roles, occupancy/revenue reports, multi-property setup. |
| 15. Property & tenant management | Portfolio concept only | Properties/units, tenants, leases, rent/deposit/utilities, documents/notices, payments/reconciliation, maintenance workflow, tenant portal, owner reports. |
| 16. Digital health companion | Separate product concept; no health application found in this repository | Product discovery and clinical/regulatory review, consent, secure device data, trend/alert workflows, clinician view, offline mode, retention and escalation rules. It must be positioned as monitoring/alerts rather than diagnosis unless separately authorized and validated. |
| 17. Agricultural IoT | Separate product concept; no farm system found in this repository | Device prototypes, sensor calibration, connectivity/edge pipeline, farm dashboard, alerting/irrigation workflows, field testing, maintenance and farmer onboarding. |
| 18. ARTIC VMS | Separate external product at `articvms.ddnsgeek.com`; homepage links to landing, personal/company registration, and sign-in | Treat as its own application and account system. Link or integrate through a documented, secure API/SSO design only if both products later support it; do not collect VMS passwords in ARTIC HUB. |

### Other ARTIC Group systems to represent in the company portfolio

The supplied UI toolkit notes also mention **EcaAfrica**, **biometric attendance systems**, and other web applications. They are not implemented as routes or APIs in this ARTIC HUB repository, and their detailed scope was not supplied here. If these are active ARTIC Group products, add them to an “ARTIC products” portfolio section with accurate descriptions and links to their own deployments. Keep their accounts, operational data, and product workflows separate from ARTIC HUB unless a specific integration is designed. Do not call biometric attendance “live” or add a public service page until its product scope, data handling, consent, access controls, retention, and deployment are confirmed.

## 4. Additional platform-wide services required

These capabilities support several service families and should be designed once as shared platform services:

1. **Identity, roles, and access:** Customer, learner, instructor, seller, service provider, employer, property/hotel staff, support agent, administrator, and auditor roles; MFA for privileged users; session revocation; audit history.
2. **Organization/team accounts:** Company profiles, invitations, staff seats, approval, team purchases, and organization-level reporting.
3. **Notification center:** Email and in-app notifications first; SMS/WhatsApp providers only after consent, message templates, delivery logs, opt-outs, and failure handling are implemented.
4. **Payments and finance ledger:** Provider-independent payment intents, order/booking/subscription records, refunds, invoices/receipts, commissions, seller settlements, reconciliation, and webhook replay protection.
5. **File and media management:** Private/public access control, upload validation, virus scanning, signed downloads, retention, backups, and video delivery for Academy lessons.
6. **Search and discovery:** Search across services, courses, sellers, jobs, events, and directory listings with permissions and moderation state respected.
7. **Consent, privacy, and retention:** Purpose-specific consent, data export/deletion, retention schedule, access audit, cookie preferences, and user-request workflow.
8. **Moderation and trust:** Seller/provider/business verification, listing review, abuse reports, review moderation, identity/document handling, and clear appeals.
9. **Observability and reliability:** Structured logs, error monitoring, metrics, scheduled jobs, backups/restore drills, uptime/health checks, incident procedures, and API versioning.
10. **Mobile clients:** Plan Android/iOS apps after the web/API workflows stabilize. Reuse the API and shared design tokens; do not create a second source of business rules.

## 5. ARTIC Academy — proposed lesson catalog

The following is a curriculum proposal, not a list of courses currently published in ARTIC Academy. Each course should have measurable outcomes, a level, prerequisites, lesson materials, practical work, assessment criteria, instructor/reviewer, duration, language, price, and certificate policy before publication.

### Track A — Digital foundations and employability

1. Computer and smartphone productivity: files, cloud storage, documents, spreadsheets, presentations, and safe collaboration.
2. Internet and digital safety: passwords, MFA, phishing, privacy, backups, and safe use of public Wi-Fi.
3. Professional communication: email, online meetings, customer communication, teamwork, and technical reporting.
4. CV, portfolio, and job applications: evidence of skills, interview practice, and responsible use of AI tools.

### Track B — Web development and software engineering

1. HTML, semantic page structure, accessibility, and responsive CSS.
2. JavaScript fundamentals, browser events, debugging, and API calls.
3. TypeScript, Git/GitHub, branches, code review, and practical team workflow.
4. React components, state, forms, validation, and reusable UI.
5. Next.js routing, rendering, metadata, localization, and deployment basics.
6. Node.js/Express APIs, REST conventions, authentication, authorization, validation, and rate limiting.
7. PostgreSQL data modeling, SQL, Prisma migrations, indexes, and safe database changes.
8. Software testing, logging, error handling, security basics, CI, Docker, deployment, and operations.
9. Capstone: plan, build, document, deploy, and present a small end-to-end application.

### Track C — Networking, Linux, and IT operations

1. Networking foundations: Ethernet, IP addressing, subnetting, DNS, DHCP, TCP/UDP, and routing.
2. Switching and Wi-Fi: VLANs, access points, coverage, interference, and troubleshooting.
3. Linux command line, users and permissions, services, logs, storage, and shell safety.
4. Firewalls, VPNs, TLS certificates, reverse proxies, and secure remote access.
5. Network monitoring and documentation: inventory, topology diagrams, metrics, alerting, and incident reports.
6. Practical lab: design and troubleshoot a small-business network.

### Track D — Electronics, embedded systems, and IoT

1. Electrical safety, measurement tools, voltage/current/resistance, power supplies, and reading schematics.
2. Digital electronics: logic, GPIO, ADC/DAC, PWM, interrupts, timers, and serial protocols.
3. Microcontroller programming with an appropriate beginner platform, followed by a deeper ESP32/STM32 pathway.
4. Sensors and actuators: selection, calibration, noise, sampling, power, and fault handling.
5. Embedded C/C++ fundamentals, state machines, memory, debugging, and firmware structure.
6. PCB design: schematic capture, layout, grounding, design rules, fabrication, assembly, and bring-up.
7. IoT communication: MQTT, HTTP, Wi-Fi, BLE, LoRa/LoRaWAN concepts, gateways, and offline behavior.
8. Device security: provisioning, credentials, encryption, signed updates, secure boot concepts, and physical risk.
9. Access and attendance device systems: device enrollment, roles, event logs, offline fallback, tamper handling, and privacy-aware system design. Biometrics require a separate consent, security, and retention module before any implementation.
10. Edge data and AI: sensor preprocessing, model constraints, latency, power, and safe model evaluation.
11. Capstone: build a sensor node, send data to a dashboard, add alerting, document, and test the system.

### Track E — Mechanical design and prototyping

1. Engineering drawing, dimensions, tolerances, units, and design intent.
2. 3D CAD workflow: sketches, constraints, assemblies, drawings, and revisions.
3. Materials and manufacturing processes: additive manufacturing, CNC, sheet metal, and PCB enclosure design.
4. Design for assembly, maintenance, safety, and cost.
5. Prototype testing: measurement plans, failure analysis, iteration, and technical documentation.
6. Capstone: design, prototype, test, and present a small electromechanical product.

### Track F — AI, data, and responsible automation

1. Data literacy: collection, cleaning, quality, visualization, and privacy.
2. Python foundations for automation and data work.
3. Machine-learning concepts: training/validation, overfitting, metrics, and limitations.
4. LLM use and prompt design: task framing, grounding, output checks, and uncertainty.
5. Business workflow automation: requirements, human review, error handling, and audit trail.
6. RAG and search concepts: documents, retrieval quality, permissions, freshness, and evaluation.
7. Edge AI: model size, latency, memory, power, offline use, and update strategy.
8. Responsible AI: bias, consent, confidentiality, safety boundaries, and escalation to a human.
9. Capstone: build an evaluated assistant or automation prototype with documented limits and fallback behavior.

### Track G — Business, product, and entrepreneurship

1. Customer discovery: identify users, interview ethically, test assumptions, and define a real problem.
2. Service design and product requirements: user journeys, scope, acceptance criteria, and prototypes.
3. Pricing and unit economics: cost, time, margin, cash flow, and quotation basics.
4. Project delivery: work plans, milestones, risks, change requests, and client handover.
5. Sales and proposals: discovery, technical proposal, statement of work, and negotiation basics.
6. Digital marketing and analytics: positioning, content planning, conversion, and privacy-aware measurement.
7. E-commerce operations: product content, order handling, customer service, fulfillment, returns, and seller standards.
8. Business compliance basics: records, contracts, data handling, taxes, and when to seek professional advice.
9. Capstone: validate a service idea, write a proposal and budget, and present a delivery plan.

### Track H — Fleet, hospitality, property, and vertical systems

These can be built as later applied courses after the relevant ARTIC products and operational practices are ready.

- Fleet telematics concepts: GPS, device installation, sensor data, alerts, fleet operations, and privacy.
- Hotel operations systems: reservations, room status, housekeeping, maintenance, and guest-data handling.
- Property operations: leases, maintenance requests, payment records, notices, and tenant privacy.
- Digital health systems: sensor quality, consent, monitoring/alert workflow, limitations, and escalation; no diagnosis training without qualified partners.
- Agricultural IoT: soil/environment sensing, calibration, connectivity trade-offs, irrigation decisions, and field maintenance.

## 6. Recommended Academy course format

For each course, build a consistent course pack:

- Course summary, learner level, prerequisites, outcomes, instructor, language, duration, and price.
- Numbered modules with short lessons, transcripts/captions, downloadable notes, and practical demonstrations.
- A practice task or lab for each module, with clear expected evidence and safety requirements.
- Short knowledge checks; graded assessments only where they measure stated outcomes.
- Capstone rubric and instructor feedback for project-based courses.
- Completion rules and certificate verification. Certificates should state the course and completion criteria and must not claim regulated accreditation unless ARTIC obtains it.
- Learner support route, accessibility notes, mobile-data-aware media, and offline/download policy.
- Version history so updates do not silently change a learner’s completed course record.

## 7. Recommended build sequence

### Phase 0 — stabilize the current release

- Complete the production environment configuration and verify server deployment.
- Validate database migrations, backups, restore procedure, API health, email delivery, payment keys, Stripe webhook signature handling, and frontend-to-backend routing.
- Review legal pages, privacy/consent language, marketplace returns/payment statements, and support details for accuracy.
- Run role-by-role security review for admin, customer, seller, and provider access.

### Phase 1 — complete the current core workflows

- Academy: module/lesson authoring, enrollment lifecycle, course player, learner progress, assessments, and certificate generation/verification.
- Training: admin queue, status changes, exports, reminders, attendance, and consent-based community invitation workflow.
- Booking: dedicated persistent bookings, availability/slot rules, admin/provider calendar, confirmation, cancellation/rescheduling, and reminders.
- Seller: listing management, order fulfillment, inventory, commission ledger, payout reporting, and seller support.
- Marketplace: production payment/webhook, refunds/returns/disputes, delivery tracking, seller permissions, and customer support cases.

### Phase 2 — add adjacent platform services

- Business directory, digital products, and events.
- Jobs and opportunities after employer/candidate verification and personal-data retention policy are defined.
- Memberships/subscriptions after payment ledger and entitlement management are reliable.
- Structured support ticketing and organization/team accounts.

### Phase 3 — launch separate vertical products

- Keep ARTIC VMS separate unless a secure integration boundary is designed and documented.
- Scope hotel and property systems as separate business applications with their own roles, workflows, and data models.
- Prototype Agricultural IoT and health companion with field/domain partners, device validation, privacy, safety, and operational support.
- Add mobile apps after the API and web workflows have stable behavior and clear mobile-specific use cases.

## 8. Deployment and repository notes

- The homepage and UI toolkit audit changes are in GitHub `main` through commit `a793c02`.
- The frontend production build succeeded and a direct TypeScript check passed during this work.
- The server has not yet been updated by this session. SSH reached the VPS root-password prompt but deployment was stopped before authentication; therefore server code, environment readiness, and live homepage are not confirmed.
- Previous deployment output showed unresolved template values in root/backend/frontend environment files. Recheck these on the VPS using a command that prints only variable names, never secret values, before running deployment.
- `vercel.json` remains an untracked local file from prior work and has not been reviewed/confirmed or pushed as the Vercel services configuration. Confirm service boundaries, routes, and bindings before adding it to the deployment branch.
- The repository is a web frontend plus API. A native Android/iOS application is not present in the inspected routes/files.

## 9. Definition of “ready” for a service

Do not move a module from `Planned` to `Live` just because a page or placeholder exists. A service should be marked live only after it has:

1. A named owner and documented user roles.
2. End-to-end frontend, API, database, email/notification, and failure flows where applicable.
3. Input validation, permission checks, audit logging, privacy/consent and data-retention decisions.
4. Admin operations for approvals, exceptions, refunds/status changes, and user support.
5. Deployment configuration, backups/monitoring, and a verified production health check.
6. Real content and accurate terms/pricing/support information.

