# Application Features

This document outlines the core functional features currently implemented in SkillSync. 

> Note: All features listed here are completely implemented and currently functioning in the codebase.

---

## 1. Authentication & Authorization
- **Multi-Provider Auth:** Integrated NextAuth.js v5 supporting both Credentials (email/password) and Google OAuth flows.
- **Role-Based Access Control (RBAC):** Users are strictly divided into `member` (Clients) and `provider` (Freelancers) roles. UI and API routes dynamically adapt or restrict access based on these roles.
- **Session Management:** JWT-based session strategy mapping the MongoDB `_id` and `role` securely into the token payload to prevent excess database lookups on protected routes.

## 2. Advanced Search Engine
- **Full-Text `$text` Search:** Utilizes MongoDB's native text indexing to power the `/explore` page.
- **Relevance Scoring:** Search results are sorted by `$meta: "textScore"`. The indexes apply custom weights (e.g., a freelancer's `name` carries higher weight than their `bio`).
- **Unified Results:** The `/api/search` endpoint can concurrently query both `users` and `projects` collections and stream unified results to the client.

## 3. Real-Time Cloudinary File Uploads
- **Secure Handling:** Instead of saving files to disk, the backend converts `multipart/form-data` uploads into buffers and streams them directly to Cloudinary via the `v2` SDK.
- **Validation:** Strict server-side validation enforcing 5MB limits and specific MIME types (JPEG, PNG, WEBP, PDF).
- **Usage:** Implemented for user Avatars and Project brief attachments.

## 4. End-to-End Payments (Stripe)
- **Payment Intents:** The backend securely generates Stripe `clientSecret` tokens mapped to specific Contract amounts.
- **Secure Card Collection:** The frontend uses `@stripe/react-stripe-js` to tokenize card data without it ever touching our servers.
- **Webhook Synchronization:** A secure `/api/payments/webhook` endpoint listens for `payment_intent.succeeded` events, verifies the cryptographic signature (`STRIPE_WEBHOOK_SECRET`), and updates the database state autonomously.

## 5. Transactional Email Notifications
- **Resend Integration:** A robust wrapper (`lib/email.ts`) dispatches HTML emails using the Resend API.
- **Asynchronous Error Handling:** Email dispatch is wrapped in non-blocking `try/catch` blocks. If the email provider experiences downtime, core database flows (like registering a user or accepting a proposal) will still succeed.
- **Triggers:** Welcome emails, Password resets, Proposal submissions, Proposal acceptances, and Contract completions.

## 6. Advanced MongoDB Aggregations
- **Single-Trip Pagination (`$facet`):** Data tables (like Freelancer directories) utilize MongoDB `$facet` pipelines to fetch both the paginated data array AND the total count metadata in a single network round-trip, significantly lowering database latency.
- **Denormalized Reviews:** When a new `Review` is saved, a Mongoose `post-save` hook automatically aggregates all reviews for that user and writes the new `averageRating` and `totalReviews` directly to the `User` document. This allows for lightning-fast profile reads without complex joins.

## 7. UI / UX Flourishes
- **CSS View Transitions:** Natively morphs page states and crossfades layouts during Next.js client-side navigation.
- **Standardized Toast Notifications:** Utilizes `sonner` for beautiful, unified success/error feedback across all forms and API interactions.
- **Shimmer Loading:** Custom CSS keyframes applied to loading states to visually indicate network activity gracefully.
