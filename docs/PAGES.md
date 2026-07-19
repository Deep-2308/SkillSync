# Pages & Routing

This document details every page inside the SkillSync application, its purpose, rendering strategy, and access requirements.

---

## 1. Public Routes

These routes are accessible to all visitors.

### Landing Page
- **Route:** `/`
- **Purpose:** Marketing home page. Explains the platform, showcases categories, and features trust banners.
- **Rendering:** Server Component. Statically generated where possible.
- **Components Used:** `HeroSection`, `CategoryGrid`, `Testimonials`.

### Explore
- **Route:** `/explore`
- **Purpose:** The primary search interface for finding freelancers and open projects.
- **Rendering:** Server Component (reads search params).
- **API Calls:** Fetches from `/api/search` using SWR on the client side for instant filtering.
- **State:** URL Query Parameters dictate the search state (`?q=react&type=freelancers`).

### Static Pages
- **Routes:** `/about`, `/contact`
- **Purpose:** Corporate information and user support.
- **Rendering:** Server Components.
- **API Calls:** `/contact` form posts to `/api/contact`.

---

## 2. Authentication Routes

- **Routes:** `/login`, `/signup`, `/forgot-password`, `/reset-password`
- **Purpose:** User onboarding and session management.
- **Rendering:** Server Components wrapping Client Component forms (`"use client"`).
- **State Management:** Local component state for form inputs, `react-hook-form` for validation, and NextAuth for session persistence.
- **Navigation:** Redirects to `/dashboard` upon successful login/registration.

---

## 3. Protected Routes

These routes require an active NextAuth session. Unauthenticated users are redirected to `/login`.

### Dashboard Overview
- **Route:** `/dashboard`
- **Purpose:** The central hub for the user. Content varies dramatically based on user role (`member` vs `provider`).
- **Rendering:** Server Component. Securely fetches data directly from the DB without hitting API routes.
- **Components:** `StatCards`, `RecentActivityList`, `QuickActions`.

### Dashboard - Profile
- **Route:** `/dashboard/profile`
- **Purpose:** Allows users to edit their personal information, bio, hourly rate, and avatar.
- **Rendering:** Client Component for the form.
- **API Calls:** `PUT /api/users/me`, `POST /api/upload` (for Avatar).

### Dashboard - Projects & Proposals
- **Routes:** `/dashboard/projects`, `/dashboard/proposals`
- **Purpose:** List views for the user's active entities.
- **Rendering:** Server Components (data fetching) passing initial data to Client Components (tables with sorting/filtering).

### Post Project
- **Route:** `/post-project`
- **Purpose:** Multi-step wizard for clients to create a new project listing.
- **Rendering:** Client Component.
- **State:** `react-hook-form` manages the complex state across steps.
- **Authentication:** Must be a `member`.

### Share Skill
- **Route:** `/share-skill`
- **Purpose:** Multi-step wizard for freelancers to list a specific service offering.
- **Rendering:** Client Component.
- **Authentication:** Must be a `provider`.

### Contract Workspace
- **Route:** `/dashboard/contracts/[id]`
- **Purpose:** The collaborative space for an active contract. Shows status, payment intent UI, and review interfaces.
- **Rendering:** Server Component resolving the ID, rendering a Client Component workspace.
- **API Calls:** `POST /api/payments/create-intent`, `PUT /api/contracts/[id]`, `POST /api/reviews`.
- **Security:** The backend strictly ensures the logged-in user is either the `clientId` or `freelancerId` of the specific contract.
