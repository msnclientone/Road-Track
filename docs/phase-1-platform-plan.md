# Road Track Phase 1 Platform Plan

This project is aligned to the production build brief in `road-track-build-prompt.md.pdf`.
Phase 1 should ship first; later-phase UI should not be promoted until those milestones start.

## Current Product Scope

- Public, server-rendered destination browsing for Udupi, Malpe Beach, Kapu Beach, and Agumbe.
- Public resort, vehicle, and package discovery from seeded/demo inventory.
- Guest enquiry form that validates input, saves an `Enquiry`, then opens the WhatsApp click-to-chat message.
- Admin lead dashboard concept for status review, assignment, booking value, and commission visibility.
- Email OTP login UI foundation with first-time profile and Terms/Privacy acceptance.
- `/privacy`, `/terms`, `robots.txt`, and `sitemap.xml` routes.

## Database Shape

The Prisma schema is future-ready on day one and includes:

- Users, OTP codes, role and partner approval status.
- Destinations and destination media.
- Resorts, room types, resort media, reviews, and bookings.
- Vehicles, vehicle media, reviews, and bookings.
- Packages.
- Enquiries with manual resort and vehicle assignment fields.
- Commission rules, notifications, audit logs, blog posts, and a dormant Phase 4 local expert profile model.

## Feature Gates

- Phase 1: public browsing, OTP auth foundation, enquiry persistence, WhatsApp handoff, admin lead review.
- Phase 2: resort-owner and vehicle-owner dashboards with strict owner-side authorization.
- Phase 3: commission automation, booking creation from confirmed enquiries, review moderation, notifications, Twilio WhatsApp API.
- Phase 4: blog, weather, nearby attractions, emergency assistance, and any local expert marketplace work.

Per the current product direction, no guide option or guide-facing website functionality should be shown in Phase 1.

## Remaining Production Work

- Connect a real PostgreSQL database and run the first migration.
- Seed the Super Admin account from environment configuration.
- Implement SMTP-backed OTP request and verification API routes.
- Add JWT httpOnly cookie sessions and role-protect `/admin`, `/resort-owner`, and `/vehicle-owner`.
- Replace mock data reads with Prisma queries.
- Add Playwright coverage for OTP login, enquiry flow, and lead assignment.
