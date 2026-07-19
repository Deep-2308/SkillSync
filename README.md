# SkillSync

SkillSync is an open-source, full-stack marketplace platform connecting clients with vetted freelance professionals. Built on modern web technologies, it facilitates everything from skill discovery and project posting to contract negotiation, secure payments, and post-contract reviews.

---

## Technology Stack

### Core
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4, Lucide React Icons
- **Animation:** CSS View Transitions, custom Tailwind keyframes

### Backend & Database
- **Database:** MongoDB Atlas (M0/M10 Clusters)
- **ORM:** Mongoose 9
- **Authentication:** NextAuth.js v5 (Credentials + Google OAuth)

### Infrastructure & Integrations
- **File Storage:** Cloudinary (Project Attachments & Avatars)
- **Payments:** Stripe & `@stripe/react-stripe-js`
- **Transactional Email:** Resend API

---

## Folder Structure

```
├── app/                  # Next.js App Router (Pages, Layouts, API Routes)
│   ├── api/              # RESTful API Route Handlers
│   └── (routes)          # Public and protected page routes
├── components/           # React Components (UI, Forms, Layout)
│   ├── ui/               # Reusable base components (Sonner Toaster, etc.)
│   └── (features)        # Feature-specific components (auth, projects)
├── docs/                 # Complete system documentation
├── hooks/                # Custom React Hooks
├── lib/                  # Utility functions and core configurations
│   ├── aggregations.ts   # Advanced MongoDB pipelines
│   ├── mongodb.ts        # Database connection caching
│   ├── stripe.ts         # Stripe SDK initialization
│   └── email.ts          # Resend SDK & templates
├── models/               # Mongoose Database Schemas
├── public/               # Static assets
├── scripts/              # Database seeding and index optimization
└── types/                # Shared TypeScript interfaces
```

---

## Overall Architecture

SkillSync utilizes a **Serverless Monolith** architecture powered by the Next.js App Router.

- **Data Fetching:** Heavily leverages React Server Components (RSC) for initial page loads (e.g., Dashboard, Project Details), eliminating client-side waterfalls and exposing zero sensitive data to the browser.
- **Interactivity:** Client Components (`"use client"`) are pushed to the leaves of the render tree (Forms, Modals, Payment Elements).
- **API Layer:** `/app/api` serves as the RESTful boundary for client-side mutations and complex queries. It handles validation (Zod), authorization, and database transactions.

*(See `docs/ARCHITECTURE.md` for deep dives into data flow and rendering strategies).*

---

## Key Features

- **Robust Authentication:** Credential and Google OAuth flows with strict role-based access control (Client vs. Freelancer).
- **Advanced Search:** MongoDB `$text` search powers the Explore page, aggregating results across Skills and Projects with relevance scoring.
- **Contract Lifecycle:** End-to-end workflow covering Proposals → Active Contracts → Secure Funding (Stripe) → Completion → Dual Reviews.
- **Real-time Notifications:** In-app notification bell and transactional emails (Resend) alert users to crucial contract updates.
- **File Management:** Secure Cloudinary integration for project briefs and portfolio attachments.

*(See `docs/FEATURES.md` and `docs/APPLICATION_FLOW.md` for a complete breakdown).*

---

## Installation & Local Development

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account (See `ATLAS_SETUP.md`)
- Stripe Account
- Cloudinary Account
- Resend Account
- Google Cloud Console (for OAuth)

### 2. Clone and Install
```bash
git clone https://github.com/your-org/skillsync.git
cd skillsync
npm install
```

### 3. Environment Variables
Copy the example environment file and fill in your keys:
```bash
cp .env.local.example .env.local
```

You must provide values for:
- `MONGODB_URI`
- `AUTH_SECRET` & `AUTH_GOOGLE_*`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `CLOUDINARY_*`
- `RESEND_*`

### 4. Database Setup
Ensure you are connected to a safe development database, then run the background indexing and seed scripts to populate mock data:
```bash
npx tsx scripts/create-indexes.ts
npm run seed
```

### 5. Start the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000`.

---

## Production Deployment

SkillSync is optimized for deployment on Vercel.

1. **Environment Variables:** Ensure all variables from `.env.local` are securely added to your Vercel project settings.
2. **MongoDB Network Access:** You must configure your MongoDB Atlas cluster to accept connections from Vercel's dynamic IP ranges, or leave it at `0.0.0.0/0` (secured by strong credentials).
3. **Stripe Webhooks:** Register your production URL (e.g., `https://skillsync.com/api/payments/webhook`) in the Stripe Dashboard to ensure payment statuses synchronize correctly.

---

## Complete Documentation Suite

For developers looking to contribute or understand the system deeply, please refer to the extensive documentation suite located in the `/docs` directory:

- [Application Flow](./docs/APPLICATION_FLOW.md)
- [System Architecture](./docs/ARCHITECTURE.md)
- [Database Schema & Models](./docs/DATABASE.md)
- [API Reference](./docs/API.md)
- [Pages & Routing](./docs/PAGES.md)
- [Feature Breakdown](./docs/FEATURES.md)
- [Technical Debt & Roadmap](./docs/TECHNICAL_DEBT.md)

---
*SkillSync — Share skills. Hire talent.*
