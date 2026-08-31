# Road Track

Road Track is a full-stack tourism marketplace built with **Next.js 16**, **TypeScript**, **Prisma**, and **PostgreSQL (Neon)**. It connects travelers with verified destinations, resorts, and tourist vehicles while providing a complete enquiry and booking workflow through WhatsApp.

The platform includes dedicated dashboards for customers, resort owners, vehicle owners, and super administrators, with dynamic inventory management and booking validation.

---

# Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Prisma ORM
- PostgreSQL (Neon)
- Tailwind CSS
- JWT Authentication
- Vercel
- Google Maps
- WhatsApp Click-to-Chat

---

# Core Features

## Customer

- Browse tourist destinations
- Browse resorts
- Browse tourist vehicles
- Destination detail pages
- Resort detail pages
- Vehicle detail pages
- Trip Planner
- Bucket (trip cart)
- Dynamic availability checking
- WhatsApp enquiry & booking
- Booking ID generation
- Mobile responsive UI
- Google Maps integration
- Image galleries with carousel support

---

## Resort Owner

- Manage own resorts
- Update pricing
- Manage AC and Non-AC room capacity
- Upload multiple images
- View enquiries related to owned resorts

---

## Vehicle Owner

- Manage vehicles
- Per Day pricing
- Per KM pricing
- Minimum charge
- Minimum distance
- Upload multiple vehicle images
- View vehicle enquiries

---

## Super Admin

- Manage Destinations
- Manage Resorts
- Manage Tourist Vehicles
- Partner Approval
- Booking Management
- Enquiry Management
- View customer information
- View owner information
- Booking status updates
- Dynamic inventory monitoring

---

# Booking System

Road Track uses a **dynamic inventory architecture**.

## Resorts

Each resort stores:

- Total AC Rooms
- Total Non-AC Rooms

These values represent **maximum capacity** and are **never decremented**.

Available rooms are calculated dynamically based on overlapping confirmed bookings.

```
Available Rooms

=

Total Capacity

-

Confirmed Overlapping Reservations
```

---

## Vehicles

Vehicle availability is also calculated dynamically.

Vehicles are **never permanently marked unavailable**.

Availability depends entirely on overlapping confirmed bookings.

---

# Booking Flow

```
Customer

↓

Trip Planner

↓

Availability Validation

↓

Booking ID Generation

↓

Booking Saved

↓

WhatsApp Opens
```

If availability fails:

- Booking is not created
- Booking ID is not generated
- WhatsApp does not open
- Bucket is not cleared

---

# Dynamic Availability

Availability is calculated using reusable helper functions.

```
src/lib/booking-availability.ts
```

Includes:

- getAvailableRooms()
- hasOverlappingVehicleBooking()
- getCurrentActiveReservations()
- getVehicleCurrentBooking()

These functions are reused throughout the application.

---

# Trip Planner

The Trip Planner supports:

- Customer Information
- Check-in / Check-out
- Number of People
- Distance
- Vehicle Selection
- Resort Selection
- Pricing Mode
    - Per KM
    - Full Day Rental
- AC Room Selection
- Non-AC Room Selection
- Dynamic Availability Validation

---

# Booking IDs

Automatically generated IDs.

Example:

```
ROADB00001
ROADB00002
```

Other IDs

```
ROADR0001   Resort

ROADV0001   Vehicle
```

---

# WhatsApp Integration

After successful booking creation:

- Booking ID
- Customer Details
- Resort Details
- Vehicle Details
- Pricing
- Distance
- Room Quantities

are automatically included inside the WhatsApp message before sending.

---

# Image Management

Supports:

- Multiple Resort Images
- Multiple Vehicle Images
- Google Drive Public URLs
- Carousel Gallery
- Responsive Image Viewer

---

# Mobile Experience

The application is fully responsive.

Current optimization focuses on:

- Compact Destination Details pages
- Faster access to Nearby Places
- Vertical expandable lists
- Reduced scrolling
- Mobile-first spacing improvements

Desktop and tablet layouts remain unchanged.

---

# Authentication

JWT-based authentication supports:

- Customer Login
- Resort Owner Login
- Vehicle Owner Login
- Super Admin Login

Role-based authorization protects all management dashboards.

---

# Project Structure

```
src/

├── app/
│   ├── admin/
│   ├── api/
│   ├── destinations/
│   ├── planner/
│   ├── resorts/
│   ├── vehicles/
│   └── auth/
│
├── components/
│
├── lib/
│   ├── booking-availability.ts
│   ├── utils/
│   └── helpers/
│
├── prisma/
│   └── schema.prisma
│
└── styles/
```

---

# Main Routes

## Customer

```
/
```

Home Page

```
/destinations
```

Destination Listing

```
/destinations/[slug]
```

Destination Details

```
/resorts
```

Resorts

```
/vehicles
```

Tourist Vehicles

```
/planner
```

Trip Planner

---

## Authentication

```
/login
```

---

## Admin

```
/admin
```

Super Admin Dashboard

---

## Partner Panels

```
/partner/resort
```

```
/partner/vehicle
```

# Local Development

Install dependencies

```bash
npm install
```

Generate Prisma Client

```bash
npx prisma generate
```

Run development server

```bash
npm run dev
```

Open

```
http://localhost:3000
```

---

# Database

Current database:

- PostgreSQL
- Neon

ORM:

- Prisma

Generate migrations

```bash
npx prisma migrate dev
```

Generate Prisma Client

```bash
npx prisma generate
```

---

# Deployment

Production stack:

- Vercel
- Neon PostgreSQL
- Prisma ORM

---

# License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.


