# Project Proposal — Aging Congress CMS Platform

**Prepared by:** Tcon Solutions
**Prepared for:** Aging Congress
**Date:** July 23, 2026
**Contact:** dhanunjay@hiresoftsolutions.com

---

## 1. Executive Summary

Tcon Solutions has designed, built, and now maintains a full-stack Content Management System purpose-built for running the Aging Congress conference brand across annual editions. The platform consists of a public-facing conference website, an administrative CMS for staff to manage all content and submissions, and a shared backend API and database.

This proposal summarizes what has been delivered, the remediation work completed in the most recent engagement, and the recommended next phase of work.

## 2. Understanding of the Need

Aging Congress runs an annual international scientific conference and needs a platform that lets non-technical staff:

- Publish and update conference content (program, speakers, sessions, venue, pricing, news) for the current edition without developer involvement
- Collect and manage inbound submissions (registrations, abstracts, speaker applications, sponsorship inquiries, contact messages, support tickets, newsletter signups)
- Present a professional, modern public website that stays accurate as content changes edition to edition

## 3. What Has Been Delivered (Phase 1 — Complete)

### 3.1 Public Website (client)
A 29-page React application covering the full attendee and prospective-speaker journey:

| Area | Pages |
|---|---|
| Core | Home, About, Editions |
| Program | Scientific Sessions, Scientific Program, Brochure Download, Partners |
| People | Speakers, Speaker Detail, Scientific Committee, Organizers |
| Registration funnel | Abstract Submission, Registration, Pricing, Become a Speaker, Sponsorship |
| Information | Important Dates, Venue, Guidelines, Publication Policy, Terms, Quick Downloads, News, Reports |
| Support | Help & FAQs, Support Tickets, Contact |
| Other | Newsletter, Testimonials, static policy pages |

### 3.2 Admin CMS (admin)
A dedicated administrative application covering:
- Dashboard and overview
- Content management for every public-site module (Speakers, Committee, Program, Sessions, Venue, Pricing Tiers, Partners, News, Reports, Downloads, Brochure, Guidelines, Publication, Testimonials, FAQs, FAQ Topics)
- A submissions inbox: Registrations, Abstract Submissions, Speaker Applications, Sponsorship Inquiries, Contact Messages, Support Tickets, Newsletter Subscribers
- Role-based authentication (Super Admin / Editor)
- Site Settings (branding, contact info, social links, SEO) and Admin User management

### 3.3 Backend & Infrastructure
- Node.js / Express REST API with MongoDB (Mongoose) data layer
- JWT-based authentication with role middleware
- File uploads to Google Cloud Storage (brochures, photos, documents)
- Rate limiting and request-validation middleware for public submission endpoints
- Edition-scoped content model, allowing the same platform to run multiple conference years

## 4. Remediation Completed in This Engagement

During a recent review, several defects were identified and resolved:

- **Critical context bug** — the site-wide data provider (`congressProvider`) was defined with an incorrect naming convention, causing React to silently skip mounting it. This meant the "active edition" and site settings were never actually available anywhere in the app, masked by fallback defaults. Fixed.
- **Orphaned content** — a previous conference edition had been deleted from the admin panel without its dependent records (sessions, pricing tiers, important dates, program schedule, several speakers) being reassigned, leaving them invisible on the live site. Data was safely re-attached to the current edition and stale 2025 dates were corrected to 2026.
- **Data-race bugs** — several pages fired a fallback network request before the active edition loaded and a corrected one after; whichever resolved last would win, occasionally showing wrong data. Fixed across six pages by gating fetches on context readiness.
- **Sessions page redesign** — rebuilt from a bare list into a searchable, modern card grid consistent with the rest of the site's design system.
- **Official brochure** — regenerated as an accurate PDF from live conference data (replacing a broken placeholder file).

## 5. Recommended Phase 2

| # | Item | Why |
|---|---|---|
| 1 | Edition lifecycle safety | Prevent the class of bug found in this engagement by adding a cascading-delete guard or archive step when an Edition is removed |
| 2 | Content QA pass | Several fields (venue address, one session description, three speaker profiles) still contain placeholder/test text visible on the live site |
| 3 | Performance optimization | The client bundle is ~1.2 MB; code-splitting by route would meaningfully improve first-load time |
| 4 | Automated test coverage | The defects above were only caught through manual, in-browser verification — a regression suite would catch them automatically going forward |
| 5 | Ongoing support retainer | Monthly maintenance window for content-model changes, dependency updates, and priority bug response |

See the accompanying **Quotation** (`QUOTATION.md`) for itemized pricing on Phase 2, and the **PRD** (`PRD.md`) for full functional detail on the existing platform.

## 6. Approach & Methodology

- Issue-driven development: every fix in this engagement was verified against the real running application (browser automation, live API checks) rather than static code review alone
- Direct database inspection before any data-affecting change, with destructive operations always confirmed before execution
- Incremental delivery — each fix built, verified, and confirmed working before moving to the next

## 7. Technology Stack

- **Frontend (client & admin):** React 18, Vite, Tailwind CSS, React Router
- **Backend:** Node.js, Express, MongoDB / Mongoose
- **Auth:** JWT with role-based middleware
- **Storage:** Google Cloud Storage (file uploads)
- **Hosting:** three independently deployable apps (client, admin, server)

## 8. Assumptions & Exclusions

- Content accuracy (copy, pricing, dates) remains the client's responsibility; Tcon Solutions flags data-quality issues found but does not author final marketing copy
- Third-party costs (GCS storage, MongoDB Atlas hosting, domain/SSL) are billed separately and are not included in development quotations
- Design changes beyond the existing design system are treated as new scope

## 9. Next Steps

1. Review and confirm Phase 2 priorities from the table in Section 5
2. Sign off on the accompanying quotation
3. Schedule kickoff for the highest-priority item (recommended: Edition lifecycle safety, given it caused the most significant defects found to date)

---
*This document is a draft prepared to support project planning. Figures and scope should be reviewed and confirmed before being sent externally.*
