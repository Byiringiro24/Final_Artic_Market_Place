# ARTIC Group Ltd — Departments and Service Catalog

**Product platform:** ARTIC HUB  
**Reviewed:** 4 November 2026  
**Purpose:** Classify ARTIC Group Ltd’s planned business services into departments and show which workflows are implemented in ARTIC HUB today.

## Recommended organization: 10 departments

Use **nine customer-facing departments and one shared operations department**. This is a practical starting structure: several areas can initially share staff, but the platform can still give each department a clear page, service catalog, owner, and roadmap.

Departments are an organizational classification. They do not need separate websites, databases, or APIs. ARTIC HUB can present them in one platform using the existing modular application. ARTIC VMS remains a separate product.

## Department and service map

| # | Department | Services and platform capabilities | Current readiness |
|---:|---|---|---|
| 1 | **Digital Marketplace & Commerce** | Product catalog; categories and brands; product search; product pages and reviews; cart and checkout; orders and order updates; promotions; shipping and tax configuration; seller applications | Marketplace workflows exist in the code. The latest VPS log showed the API crashing during startup; a Stripe-optional fix has been pushed but still needs deployment and health verification. |
| 2 | **ARTIC Academy & Workforce Development** | Course catalog and details; individual/team training registration; practical courses in software, networking, electronics, embedded systems, mechanical design, IoT, AI, and business | Catalog and registration workflows exist. The learner course player, lesson authoring, enrollment, progress tracking, assessments, and certificates are not complete. |
| 3 | **Engineering, Electronics & Manufacturing** | Mechanical CAD and prototyping; electronics and PCB design; embedded firmware; device integration; testing and technical documentation; installation and field support | Represented through ARTIC service listings and enquiry/booking entry points. Actual service capacity, detailed packages, and project delivery processes need to be defined and published. |
| 4 | **Software, AI & Digital Transformation** | Website, mobile, and API development; AI integration; workflow automation; data and dashboard solutions; edge AI and embedded software; system integration | Service direction and enquiry routes are represented. Each offer needs scoped service packages, delivery terms, and operational ownership. |
| 5 | **Networking, Cloud & Cybersecurity** | Network design and troubleshooting; server and cloud setup; connectivity for IoT and fleet systems; systems administration; security reviews and hardening | Service direction can be handled through professional-services enquiries. Dedicated service listings, delivery procedures, and support coverage remain to be established. |
| 6 | **Business Advisory & Innovation** | Consulting and project scoping; business and product development support; idea submission; technical feasibility and solution planning; partner referrals | Idea submission and contact routes exist. A full consulting workflow, proposal management, project tracking, and client workspace are not complete. |
| 7 | **Business Directory, Talent & Opportunities** | Verified business and professional profiles; searchable directory; employer and candidate profiles; jobs; internships; freelance and project opportunities | Planned. Dedicated data models, verification, publishing, applications, notifications, and moderation are not implemented. |
| 8 | **Events, Digital Content & Membership** | Events and webinars; reservations/ticketing; e-books and guides; templates and digital downloads; learning/resource collections; memberships and subscriptions | Planned. Event operations, paid entitlements, digital delivery, subscriptions, and recurring-payment lifecycle need to be built. |
| 9 | **Smart Industry & Sector Products** | ARTIC VMS fleet monitoring; future hospitality/hotel operations; property and tenant management; digital health monitoring; agricultural IoT | ARTIC VMS is a separate, existing product at `https://articvms.ddnsgeek.com`. Hotel/property, health, and agriculture ideas are separate future product lines and are not live ARTIC HUB modules. |
| 10 | **Customer Experience & Platform Operations** *(shared department)* | Customer support and contact; order and service assistance; seller/provider onboarding; moderation and administration; training registration follow-up; platform content and operations | Contact, admin, seller application review, and some notification workflows exist. Dedicated support cases, booking records/calendars, service-level tracking, and complete provider operations remain to be built. |

## Shared platform capabilities

These are common ARTIC HUB capabilities used across departments, rather than separate departments:

- **Global discovery:** Search published products, active service listings, published courses, and existing ARTIC HUB destinations. Results identify their type and location.
- **Accounts and permissions:** Customer accounts, authentication, roles, account details, and access-controlled administration.
- **Payments and orders:** Shared checkout and order records; payment providers must be configured and verified before their methods are offered.
- **Notifications and email:** Account, order, training, and service communications where the related workflow is implemented and SMTP is configured.
- **Media and documents:** Shared upload and delivery infrastructure.
- **Administration and reporting:** Common administration for implemented features; each new department needs its own operational controls as it is built.
- **Mobile access:** Flutter starter intended to use the same versioned API. It is not yet a complete mobile app.

## Service maturity labels

Use these labels in the website, roadmap, and administration tools:

- **Available:** A real end-to-end customer workflow has been implemented and is verified in the target environment.
- **Partial:** Some pages or APIs exist, but an important operating workflow is missing or the production deployment is not verified.
- **Planned:** The service is part of ARTIC Group’s direction, but does not yet have its full working application flow.
- **Separate product:** A separate application or product with its own service boundary, data, authentication, and release lifecycle.

At the date of this review, the marketplace should be marked **Partial in production** until the API startup fix is deployed and health checks pass. The Academy should be marked **Partial** until learners can access course content and track completion. Do not label a service Available solely because a portfolio card or landing page exists.

## Recommended platform navigation

Present the ten departments as top-level directory categories, then expose only the real pages and actions currently available within each category. For partially built areas, explain the available action (for example, “Register interest” or “Request a consultation”) instead of presenting unfinished functions as working tools.

Suggested primary navigation:

1. Marketplace
2. Academy
3. Services — Engineering, Software/AI, Networking, and Business Advisory
4. Business Network — directory and opportunities when released
5. Events & Resources when released
6. Sector Products — ARTIC VMS and future vertical products
7. Support

The homepage and global search should link to existing routes. Planned department pages may explain the future offer, but should not show fake listings or claim unavailable workflows are live.

## Build order

1. Restore and verify the current marketplace API in production; verify catalog, cart, checkout with enabled payment methods, and order administration.
2. Complete Academy operations: course/module/lesson authoring, learner enrollment, player, progress, assessments, completion rules, and certificate verification.
3. Make service bookings durable and manageable with availability, confirmation, cancellation/rescheduling, and admin/provider views.
4. Complete seller operations: listing ownership, order fulfillment, commission records, payout reporting, and seller support.
5. Build directory, jobs/opportunities, and event workflows after verification and privacy rules are set.
6. Add digital products and memberships after payment entitlements and recurring billing are reliable.
7. Scope hotel/property, health, and agricultural solutions as separate products when teams, partners, and operational requirements are ready.

