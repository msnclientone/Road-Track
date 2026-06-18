# Road Track

Road Track is a Next.js tourism marketplace MVP for the Udupi region. It connects tourists with verified destinations, resorts, tourist vehicles, tour packages, and a Road Track-managed enquiry workflow.

The implementation is now organized around the production build brief in `road-track-build-prompt.md.pdf`: ship Phase 1 first, keep the full database schema ready, and avoid later-phase UI until its milestone begins.

## Phase 1 Features

- Premium customer homepage for destination, resort, vehicle, and package discovery.
- Destination pages for Udupi, Malpe Beach, Kapu Beach, and Agumbe.
- Dynamic quote planner with people, days, vehicle, and resort category.
- Zod-validated enquiry API route designed to persist before WhatsApp opens.
- WhatsApp click-to-chat messages using the required Phase 1 template.
- Super Admin dashboard concept for leads, status review, assignment, commission visibility, and broadcasts.
- Email OTP login UI with expiry, resend delay, attempt warning, edit email, and first-time profile setup.
- Privacy, Terms, sitemap, robots, and PostgreSQL-ready Prisma schema.

## Feature Gates

- Phase 1: public browsing, enquiry persistence, WhatsApp handoff, OTP auth foundation, admin lead review.
- Phase 2: resort-owner and vehicle-owner dashboards after role protection and owner-only mutations are implemented.
- Phase 3: commission automation, bookings, reviews, notifications, and Twilio WhatsApp Business API.
- Phase 4: blog, weather, nearby attractions, and emergency assistance.

Guide options and guide-facing website functionality are intentionally excluded from the current website scope.

## Recommended Database

Use PostgreSQL for the core database.

For this business, the data is relational: users, partners, destinations, resorts, vehicles, leads, assignments, commissions, reviews, media, and OTP records all need reliable relationships and reporting. PostgreSQL handles this cleanly and can scale from MVP to a larger marketplace.

Recommended launch setup:

1. Supabase Postgres for MVP and early production.
2. Prisma ORM for migrations and type-safe database access.
3. Supabase Storage or S3-compatible storage for resort and vehicle media.
4. Google SMTP first for OTP email, then move to Resend, SendGrid, or Amazon SES when volume grows.

Neon Postgres is also a strong option if you want a serverless Postgres database with branching-first development. Supabase is more complete for this product because it can cover database, auth, storage, realtime, and dashboard operations in one platform.

## Routes

- `/` - Customer marketplace and trip planner
- `/destinations/udupi`
- `/destinations/malpe-beach`
- `/destinations/kapu-beach`
- `/destinations/agumbe`
- `/admin` - Super Admin dashboard
- `/partner/resort` - Resort owner panel
- `/partner/vehicle` - Tourist vehicle owner panel
- `/login` - Email OTP login flow
- `/privacy` - Privacy baseline
- `/api/enquiries` - Lead API

## Local Development

```bash
npm.cmd install
npx.cmd prisma generate
npm.cmd run dev
```

Open `http://localhost:3000`.

## Production Wiring Checklist

- Copy `.env.example` to `.env.local`.
- Create a PostgreSQL database and set `DATABASE_URL`.
- Run the initial full-schema migration:

```bash
npx.cmd prisma migrate dev --name init
```

- Replace the mock seed data in `src/lib/data.ts` with database queries.
- Store submitted enquiries from `/api/enquiries` in the `Enquiry` table.
- Hash OTPs before saving them in `OtpToken`.
- Add rate limiting for OTP and enquiry endpoints.
- Move media uploads to Supabase Storage or S3.
- Use HTTPS in production through hosting or Cloudflare.
