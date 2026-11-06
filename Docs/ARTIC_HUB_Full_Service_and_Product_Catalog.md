# ARTIC Group Ltd — Full Service and Product Catalog

**Platform:** ARTIC HUB  
**Prepared:** 4 November 2026  
**Purpose:** Describe the services ARTIC Group Ltd can offer, the products and systems it can develop, the ARTIC HUB workflows needed to support them, and the current implementation status.

For the shorter department classification, see [ARTIC HUB Departments and Service Catalog](./ARTIC_HUB_Departments_and_Service_Catalog.md). This document expands each area into its offerings, potential deliverables, platform needs, and readiness.

## How to read this catalog

This is a business and product catalog, not a claim that every listed service is already staffed, available, or implemented. Confirm staff capability, equipment, partners, licensing, pricing, support arrangements, and delivery location before advertising an offer as available.

### Readiness labels

- **Implemented in source:** A real page/API workflow exists in the repository. Production operation must still be verified.
- **Partial:** A catalog page, registration, inquiry, or initial workflow exists, but end-to-end operations remain incomplete.
- **Planned:** A service/product direction has been identified; its production workflow has not been built.
- **Separate product:** It has or should have its own application, user roles, data boundaries, operations, and release cycle.
- **Potential delivery:** A reasonable product or service ARTIC could develop from its technical direction. Validate resources and commercial readiness before committing to it.

## 1. Digital Marketplace and Commerce

### Services ARTIC HUB can provide

- A searchable product marketplace for ARTIC products and approved third-party sellers.
- Seller applications and review, storefront/catalog presentation, product details, categories, brands, and customer reviews.
- Shopping cart, checkout, order history, order status, shipping setup, promotions, and customer notifications.
- Digital listings for downloadable guides, templates, software, or course materials once digital fulfillment is implemented.
- Business-to-consumer and business-to-business product discovery; organization purchasing can be added as an account and billing workflow.

### What ARTIC can make or assemble for sale

- ARTIC-developed IoT devices, sensor kits, gateways, embedded modules, electronics prototypes, or maintenance tools where design, testing, and supply arrangements are ready.
- Software licenses, device-monitoring plans, setup packages, installation services, training packages, and technical documentation.
- Approved third-party electronics, networking, safety, and engineering supplies through the marketplace.

### ARTIC HUB modules needed

Product catalog; seller onboarding; inventory and availability; product/media management; cart and checkout; payment configuration; order operations; delivery/returns; moderation; seller reporting and settlement.

**Current status:** Core marketplace pages and APIs exist. Latest VPS evidence showed PostgreSQL healthy and migrations applied, but the API failed during Stripe initialization. A fix has been pushed to initialize Stripe only when requested; deploy and verify it before treating the marketplace as operational. PayPal is represented in the data model but is not implemented in the current payment routes. Do not list payment methods as enabled until tested.

## 2. ARTIC Academy and Workforce Development

### Learning services

- Self-paced courses with short lessons, readings, video demonstrations, downloadable notes, and practical tasks.
- Instructor-led online or in-person training for individuals and organizations.
- Corporate/team training needs assessments, customized course plans, registration, attendance, and follow-up.
- Skills pathways, capstone projects, instructor feedback, completion records, and certificates after those workflows are built.
- Optional learner communities, including consent-based WhatsApp invitations after registration review.

### Recommended course families

1. **Software and web development:** programming fundamentals, frontend development, APIs, databases, authentication, deployment, testing, and a practical portfolio project.
2. **Networking and infrastructure:** TCP/IP, routing and switching concepts, Wi-Fi planning, VLANs, firewalls, VPNs, Linux servers, monitoring, backups, and troubleshooting labs.
3. **Electronics and embedded systems:** electrical safety, measurement, schematics, digital electronics, microcontrollers, sensors, actuators, embedded C/C++, debugging, and firmware updates.
4. **PCB design and prototyping:** schematic capture, layout, grounding, design rules, fabrication, assembly, enclosure integration, bring-up, and revision control.
5. **IoT systems:** device provisioning, MQTT/HTTP, gateways, connectivity trade-offs, telemetry, dashboards, alerts, offline behavior, device security, and a sensor-to-dashboard capstone.
6. **Mechanical design and prototyping:** engineering drawings, CAD, assemblies, tolerances, materials, design for assembly, fabrication options, test plans, and a prototype capstone.
7. **AI, data, and automation:** data quality, Python, model evaluation, LLM grounding, retrieval/search, workflow automation, human review, edge-AI constraints, privacy, and responsible-AI practices.
8. **Business and product delivery:** customer discovery, requirements, service design, pricing, proposals, project delivery, e-commerce operations, support, and product validation.
9. **Applied sector systems:** fleet telematics, agriculture sensors, property operations, hospitality workflows, and health monitoring concepts. Offer only with suitable domain partners and safety/privacy review.

### What ARTIC can create for training

Course packs; lab guides; demo systems; sample code; network diagrams; firmware examples; datasets; assessment rubrics; capstone kits; team-learning plans; instructor-led workshops.

**ARTIC HUB modules needed:** course authoring (course/module/lesson/media), enrollment and access control, lesson player, learner progress, quizzes/assessments, completion rules, certificate generation and verification, instructor/admin views, course payments, and email/community consent records.

**Current status:** Published course catalog/detail and training-interest registration exist. Full lesson delivery, enrollment lifecycle, progress, assessment, and certificates are not complete. Training registration is not the same as an operating e-learning system.

## 3. Engineering, Electronics, Embedded Systems, and Manufacturing

### Professional services

- Requirements capture and feasibility review for technical ideas.
- Electronics design support, circuit selection, schematic review, component research, and prototype planning.
- Embedded firmware for microcontrollers, sensor nodes, gateways, and device integrations.
- PCB design preparation, prototype assembly coordination, bring-up, testing, and revision documentation.
- Mechanical CAD, enclosure concepts, assemblies, mounting, and fit checks for electromechanical products.
- System integration, field installation, commissioning, maintenance planning, and operator training where ARTIC has the resources to deliver.
- Test plans, technical reports, bills of materials, user guides, maintenance documents, and handover packages.

### Potential products ARTIC can develop

- Environmental sensor nodes for temperature, humidity, air quality, water level, or soil conditions.
- Asset/vehicle trackers and telemetry gateways when integrated with an approved positioning/connectivity service.
- Smart attendance/access prototypes using privacy-aware, consent-based design. Biometric deployments require legal, security, and retention review before offering.
- Device-monitoring dashboards, alerting systems, energy-use monitors, and remote equipment-health prototypes.
- Custom sensor/actuator controllers and engineering proof-of-concept kits.

**Delivery boundary:** ARTIC can design and prototype systems where the skills, equipment, and component supply are available. Do not promise certified production, high-volume manufacturing, safety-critical controls, or regulated devices without qualified partners, testing, and certification.

**Current status:** Technical service categories and generic service/booking entry points are represented in ARTIC HUB. There is no end-to-end project execution workspace, and the current booking endpoint does not yet create a dedicated booking record/calendar.

## 4. Software, AI, and Digital Transformation

### Services

- Custom websites, web portals, dashboards, and internal business applications.
- API design and integration between business systems.
- E-commerce, learning, booking, directory, event, and operations platforms.
- Mobile application development using the Flutter direction already present in the repository.
- Workflow automation, document/search assistants, customer-service automation, and business-process integration.
- AI integration for existing websites and workflows, including retrieval-based assistants over approved business content.
- Data collection, dashboards, reporting, and lightweight analytics.
- Edge-AI prototypes for sensor or embedded-device use cases where hardware limits are understood.
- Maintenance, hosting/deployment planning, migrations, technical documentation, and support agreements.

### Products ARTIC can make

- Reusable business portals with roles, approvals, search, bookings, reports, and messaging.
- Vertical SaaS products for fleet, hospitality, property, or operational workflows as separately scoped products.
- AI-enabled knowledge assistants with explicit data permissions, source citations, human escalation, and evaluation plans.
- Reusable integration components and developer APIs for ARTIC products.

**Current status:** ARTIC HUB itself is a Next.js web app and Node/Express API. Its Flutter mobile directory is a starter, not a finished mobile release. AI product/service areas are not represented by a complete standalone product workflow.

## 5. Networking, Cloud, and Cybersecurity

### Services

- Network needs assessment and architecture planning for small organizations and technical deployments.
- Wired/wireless network setup, segmentation, device connectivity, and troubleshooting.
- Linux server and application deployment; reverse-proxy, HTTPS, container, backup, and monitoring setup.
- Cloud/server migration planning, DNS, environment configuration, and release automation.
- Secure API and application configuration reviews, access-control reviews, dependency hygiene, and basic hardening.
- Connectivity planning for IoT sensors, vehicle systems, and remote sites.
- Backup/restore and service-recovery planning.

### Potential deliverables

Network diagrams; setup/runbooks; secured server configurations; deployment pipelines; monitoring dashboards; connectivity plans; incident/recovery instructions; security findings and remediation plans.

**Delivery boundary:** Present this as technical engineering and configuration support. Do not claim independent certification, penetration-test accreditation, guaranteed security, or regulatory compliance unless qualified professionals and evidence support the claim.

**Current status:** These services can be listed and requested through ARTIC’s service/contact flow. A dedicated networking service catalog, technician scheduling, and support-ticket lifecycle remain to be completed.

## 6. Business Advisory, Product Innovation, and Project Delivery

### Services

- Idea intake and problem framing.
- Discovery workshops to identify users, constraints, outcomes, and success measures.
- Technical feasibility, options, cost/risk estimates, prototype plans, and proof-of-concept delivery.
- Product requirements, user journeys, service design, and implementation roadmaps.
- Project scoping, proposals, milestones, risk tracking, handover, and maintenance planning.
- Business process improvement and practical technology adoption.
- Partner referrals when an idea requires specialist or regulated expertise.

### What ARTIC can create

Feasibility reports; prototype specifications; product roadmaps; system architecture; clickable or functional prototypes; project proposals; implementation plans; operational playbooks.

**Current status:** An idea-submission form and contact/service inquiry routes exist. A tracked consulting pipeline, proposal acceptance, project workspace, and customer deliverable archive are not complete.

## 7. Business Directory, Jobs, and Opportunities

### Services the platform can offer

- Verified profiles for businesses and professionals.
- Directory search by specialty, location/service area, availability, and business type.
- Employer profiles and job/internship listings.
- Candidate profiles and applications with user consent and retention controls.
- Freelance or project-opportunity listings and responses.
- Moderation, reporting, and listing expiry/renewal.

### What ARTIC HUB can make

A local business-discovery network and a recruiting/opportunity portal that connects learners, technical professionals, businesses, and project owners.

**Current status:** Planned. Directory listings, candidate/employer models, applications, verification, moderation, and privacy retention workflows need to be designed and built before launch.

## 8. Events, Digital Content, and Memberships

### Services

- Online and in-person technical workshops, webinars, demonstrations, and community events.
- Event registration, capacity management, attendance, reminders, and post-event resources.
- Ticketing or paid reservations when the payment and refund workflows are ready.
- Downloadable e-books, manuals, templates, course packs, software, and technical resources.
- Learning/resource bundles and paid memberships with clear entitlement and cancellation rules.

### What ARTIC can create

Technical guides, lab manuals, CAD/PCB templates, code examples, training recordings, checklists, event series, and membership resource libraries.

**Current status:** Planned. Event inventory, content entitlements, secure download delivery, ticketing, subscriptions, refunds, and recurring billing are not complete.

## 9. Smart Industry and Sector Products

These products need separate discovery, domain partners, risk controls, and operating plans. Link them from ARTIC HUB without pretending their workflows are part of the HUB database or authentication.

### ARTIC VMS — fleet operations

- Vehicle/device onboarding, fleet monitoring, location/telemetry views, alerts, and fleet operations.
- Personal and company registration through the separate VMS application.
- ARTIC HUB currently links to VMS registration/login; this is a cross-site link, not shared-account SSO.
- **Status:** Separate existing product at `https://articvms.ddnsgeek.com`.

### Hospitality and hotel operations

- Future room/reservation, check-in/out, housekeeping, maintenance, guest messaging, staff roles, and occupancy reporting system.
- **Status:** Planned separate product; requires hospitality operators and local workflow validation.

### Property and tenant operations

- Future property/unit records, leases/documents, rent/deposit tracking, maintenance requests, tenant portal, notices, and owner reporting.
- **Status:** Planned separate product; legal, privacy, payment, and tenant-support workflows are required.

### Digital health companion

- Potential personal activity/sensor tracking, trends, reminders, and configurable alerts.
- Position as monitoring and wellness support, not diagnosis or treatment. Any clinical use needs qualified health partners and regulatory review.
- **Status:** Separate product concept; no patient monitoring workflow is live in ARTIC HUB.

### Agricultural IoT and food systems

- Potential soil/environment monitoring, water/irrigation alerts, farm asset connectivity, field dashboards, and maintenance support.
- Possible marketplace extension for verified agriculture equipment, inputs, or producer goods once supply and quality controls exist.
- **Status:** Separate product concept/planned; requires farmer/extension partners, field testing, device maintenance, and connectivity planning.

### Energy and infrastructure monitoring

- Potential energy-use monitoring, equipment status, power-quality measurements, backup-power visibility, and alerts.
- **Status:** Potential engineering/IoT service; define the electrical safety boundary and use qualified installers for regulated or high-voltage work.

## 10. Customer experience and platform operations

### Services

- Customer questions, order support, returns/complaints routing, and account assistance.
- Seller/provider applications, review, onboarding, and standards communication.
- Service inquiry intake, scheduling, booking confirmation, and follow-up.
- Course/training registration review, learner communication, and consent tracking.
- Content quality, marketplace moderation, and admin operations.
- Platform reporting, operational monitoring, and incident handling.

### What ARTIC HUB needs

Support cases with status, owner, notes, and response history; booking records and calendars; seller/provider lifecycle; training registration queue; admin permissions; audit history; notifications and reports.

**Current status:** Contact and administration pages, seller application review, and registration capture are present in parts. Dedicated tickets, provider calendars, complete booking lifecycle, and full audit/reporting workflows remain incomplete.

## 11. Cross-platform product surfaces ARTIC can build

ARTIC HUB can grow to provide these connected surfaces using shared accounts and the central API:

| Surface | Intended users | Main actions |
|---|---|---|
| Public homepage and service directory | Visitors and prospective clients | Understand ARTIC, search the hub, choose a department, send an idea, request contact |
| Marketplace | Shoppers and businesses | Discover products, buy, track orders, review products |
| Seller workspace | Sellers and providers | Apply, manage listings, fulfil orders, manage bookings, review performance and settlements |
| Academy | Learners, instructors, organizations | Register/enroll, learn, submit assessments, track progress, earn verified completion records |
| Service/project workspace | Clients and ARTIC delivery teams | Request consultation, receive scope/quotation, track work and handover |
| Directory/opportunities | Businesses, employers, candidates | Publish/verify profiles, list/apply for opportunities |
| Events and resources | Event hosts, attendees, members | Publish events, register, attend, access purchased resources |
| Admin and support workspace | ARTIC operators | Review users/listings/registrations, manage content, resolve cases, report operations |
| Mobile app | Customers, learners, field users | Access selected account, course, marketplace, booking, and device workflows over the API |
| Separate vertical products | Fleet, hospitality, property, health, agriculture users | Use a specialized product with its own domain rules and access controls |

## 12. Recommended implementation order

1. Restore and verify the marketplace API in production using the Stripe-optional startup fix; confirm database records and enabled payment methods.
2. Finish Academy delivery: author modules/lessons, enroll learners, protect course content, track progress, add assessments, define completion, and issue verifiable certificates.
3. Persist bookings and add availability, admin/provider scheduling, confirmation, cancellation, rescheduling, and reminders.
4. Complete seller operations, fulfillment, commission accounting, and payout reporting.
5. Add customer support cases and organization/team accounts.
6. Build directory/jobs and events/resources after privacy, moderation, payments, and operations are defined.
7. Develop memberships/digital products after entitlement and subscription billing is reliable.
8. Scope sector products with customers and domain partners; keep VMS, health, hospitality, property, agriculture, and energy product boundaries explicit.

## 13. Commercial launch checklist for each offer

Before an offer is shown as available, assign an owner and confirm:

- Exact deliverable, exclusions, target customer, location, and service area.
- Required staff skills, equipment, suppliers, partners, insurance, licenses, and certifications.
- Price or quotation method, payment terms, taxes, cancellation/refund policy, warranty, and support period.
- Data collected, consent, access permissions, retention, backups, and incident handling.
- Customer journey from discovery to payment/booking, fulfilment, acceptance, support, and closeout.
- Website copy accurately describes current availability and does not claim certification or regulated outcomes without evidence.
- Operational records, admin tools, monitoring, and a tested failure/recovery process exist.

