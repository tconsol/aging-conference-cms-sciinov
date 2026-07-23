# Product Requirements Document — Aging Congress CMS Platform

**Prepared by:** Tcon Solutions
**Date:** July 23, 2026
**Status:** Living document — reflects the platform as currently built

---

## 1. Product Overview

The Aging Congress CMS Platform is a three-part system that lets a small conference-organizing team run an annual international scientific congress:

1. **Client** — the public conference website
2. **Admin** — the internal content management system
3. **Server** — the shared REST API and database that both consume

The platform is designed around a central **Edition** entity (e.g. "Aging Congress 2026"), so the same codebase and database serve multiple conference years without duplication.

## 2. Goals

- Let non-technical staff publish and update all conference content without a developer
- Give prospective attendees, speakers, and sponsors a clear, self-service path to register, submit an abstract, apply to speak, or make a sponsorship inquiry
- Keep the public site always accurate to the *current* edition, with past editions still viewable
- Provide a single inbox for every kind of inbound submission

## 3. Personas

| Persona | Needs |
|---|---|
| **Super Admin** | Full control: content, submissions, site settings, other admin users |
| **Content Editor** | Manage content and submissions, no user/settings management |
| **Prospective Attendee** | Learn about the congress, register, pay, get a certificate |
| **Prospective Speaker** | Learn requirements, submit an abstract or speaker application |
| **Sponsor / Exhibitor** | Learn sponsorship tiers, submit an inquiry |
| **Existing Registrant** | Find schedule, venue, FAQs; get support if something goes wrong |

## 4. Functional Requirements

### 4.1 Public Site (client)

**Content display** (all edition-scoped unless noted):

| Module | Requirement |
|---|---|
| Home | Hero with live countdown to the active edition's start date, key stats, featured speakers, upcoming dates, latest news, testimonials |
| Editions | List of all congress editions with status (active / upcoming / past) |
| Scientific Sessions | Searchable grid of scientific tracks for the active edition |
| Scientific Program | Day-by-day timeline of scheduled talks, linked to speakers |
| Speakers | Directory of active, edition-scoped speakers with individual detail pages |
| Committee / Organizers | Static team listings |
| Venue | Active edition's venue: name, address, description, photos, map |
| Important Dates | Timeline of deadlines with automatic "Passed" / "Upcoming" state |
| Pricing | Active pricing tier's rates, split by In-Person / Virtual / Other |
| News / Reports / Downloads / Brochure | Edition-scoped content libraries |
| Partners / Testimonials | Global (not edition-scoped) marketing content |

**Submission flows** (all write to the backend and appear in the admin inbox):

| Flow | Fields captured |
|---|---|
| Abstract Submission | Presenter info, presentation type, topic, title, abstract text, file upload |
| Registration | Presenter/attendee info, category, attendance mode, pricing tier, payment status |
| Become a Speaker | Applicant info, expertise, bio, message |
| Sponsorship Inquiry | Organization, contact, sponsorship interest, message |
| Contact | Name, email, subject, message |
| Support Ticket | Name, email, subject, message, status tracked by admin |
| Newsletter | Email capture |

**Requirement:** every edition-scoped fetch must resolve against the *current* active edition, determined server-side, and must not silently fall back to unfiltered or stale data if the active edition hasn't loaded yet client-side.

### 4.2 Admin CMS (admin)

| Module group | Contents |
|---|---|
| Overview | Dashboard, Editions |
| Speakers | Speaker directory, Committee, Organizers |
| Program | Scientific Sessions, Scientific Program, Brochure Download, Partners, Submit Abstract (view) |
| Information | Important Dates, Venue & Hospitality, Guidelines, Publication, Pricing Tiers, Registration (view) |
| Help & Support | FAQs, FAQ Topics, Support Tickets, Contact Messages |
| Inbox / Submissions | Registrations, Abstract Submissions, Speaker Applications, Sponsorship Inquiries, Newsletter Subscribers |
| Settings | Site Settings (branding, contact, social, SEO), Admin Users |

**Requirement:** every content module must support create, edit, delete, and (where applicable) reorder and active/inactive toggling. Every submission module must support status transitions (e.g. pending → approved/rejected) and support staff review notes.

**Requirement (currently a gap — see Section 7):** deleting an Edition must either be blocked while dependent records exist, or must cascade/reassign those records, so content is never silently orphaned.

### 4.3 Authentication & Roles

- JWT-based session for admin users
- Two roles: `super_admin`, `editor`
- Rate-limited login (20 attempts / 15 min) and password reset flow
- Public submission endpoints are rate-limited (10/hour) to prevent abuse; general API traffic is capped at 200 requests / 15 minutes per IP

## 5. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Public pages should be interactive within 2s on a typical connection. *Current gap: client bundle is ~1.2 MB unsplit — see Section 7.* |
| Responsiveness | All public pages must render correctly from mobile (375px) to desktop |
| Security | No secrets in the repository; all admin routes protected by JWT; rate limiting on public write endpoints |
| Data integrity | Edition-scoped records must never reference a non-existent Edition |
| SEO | Site settings expose configurable title/description/keywords per site |

## 6. Data Model Summary

- **Edition** is the root scoping entity (title, year, dates, city/country, status, isActive)
- Edition-scoped collections: ScientificSession, ProgramSlot, PricingTier, ImportantDate, Venue, Brochure, Abstract, Registration, SpeakerApplication (via `edition` field); Speaker (via `editions` array, many-to-many)
- Global (not edition-scoped) collections: Admin, SiteSettings, StaticPage, CommitteeMember, Organizer, Partner, NewsArticle, Report, Download, Testimonial, FAQ (+ FAQTopic), ContactMessage, SupportTicket, SponsorshipInquiry, NewsletterSubscriber

## 7. Known Risks / Open Issues

These were identified during the most recent engagement and are recommended for Phase 2 (see `PROPOSAL.md`):

1. **No cascading delete on Edition removal.** Deleting an Edition currently leaves all its dependent records in place with a now-invalid `edition` reference, making them invisible to the public site with no admin warning. This has already caused real content loss in production once.
2. **Client bundle size.** ~1.2 MB unsplit JS bundle; recommend route-based code splitting.
3. **Placeholder content live in production.** At least one session description, one venue address, and several speaker profiles contain visibly unfinished test text ("testing", "hyd", etc.) — needs an editorial cleanup pass.
4. **No automated test coverage.** All defects found in the last engagement were caught by manual/browser verification, not by a test suite.

## 8. Out of Scope

- Payment processing (registration `paymentStatus` is tracked but no payment gateway is integrated)
- Multi-language / i18n support
- Native mobile apps

---
*This document reflects the platform as observed and built as of July 23, 2026. Update alongside future feature work.*
