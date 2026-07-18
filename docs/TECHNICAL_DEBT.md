# ⚠️ Technical Debt & Roadmap

This document serves as an honest assessment of the current codebase limitations, known issues, and structural debt discovered during the reverse-engineering pass. It acts as the primary roadmap for future refactoring efforts.

---

## 🛑 High Priority Issues

### 1. Missing Automated Tests
- **Description:** There is currently 0% test coverage in the repository. No Unit tests (Jest/Vitest) or End-to-End tests (Cypress/Playwright) exist.
- **Why it's a problem:** As the application scales, modifying complex Mongoose transactions (like proposal acceptance) is highly dangerous without a regression safety net.
- **Recommended Solution:** Implement `Vitest` for API route and utility testing, and `Playwright` for E2E user flows (Registration, Payment checkout).

### 2. Client-Side Secrets Exposure Risk
- **Description:** While `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is safe, developers must ensure that `STRIPE_SECRET_KEY` and `CLOUDINARY_API_SECRET` are never accidentally prefixed with `NEXT_PUBLIC_`.
- **Where it exists:** Throughout the `.env.local` lifecycle.
- **Recommended Solution:** Introduce an environment validation library like `@t3-oss/env-nextjs` in a generic `env.ts` file to strictly parse and type-check environment variables at build-time.

---

## 🟡 Medium Priority Improvements

### 3. File Upload Architecture
- **Description:** Currently, the `/api/upload` route receives the entire file buffer in Node.js memory before uploading to Cloudinary.
- **Why it's a problem:** On serverless platforms (like Vercel), requests have a tight body size limit (typically 4.5MB). If a user attempts to upload a 10MB project attachment, the request will crash before reaching Cloudinary.
- **Recommended Solution:** Migrate to **Presigned URLs** or **Cloudinary Direct Uploads**. The backend should only generate a secure signature, and the Client (browser) should upload the file directly to Cloudinary's servers, bypassing Next.js entirely.

### 4. Search Pagination Scalability
- **Description:** The `getFreelancerListing` aggregation utilizes `$skip` for pagination.
- **Why it's a problem:** As the database grows to hundreds of thousands of users, `$skip` becomes exponentially slower because MongoDB must scan and discard all skipped documents.
- **Recommended Solution:** Implement **Cursor-based pagination** using the `_id` or a composite index (e.g., `lastSeenId`) for infinite scrolling feeds.

---

## 🟢 Low Priority / Housekeeping

### 5. Hardcoded Currency & Locations
- **Description:** The platform assumes USD (`$`) and hardcodes location arrays in the seed script and forms.
- **Recommended Solution:** Abstract currencies and countries into a generic configuration file or a database collection to support internationalization (i18n) in the future.

### 6. Missing Error Boundaries
- **Description:** While API routes handle errors gracefully, React component crashes are not caught globally.
- **Recommended Solution:** Implement Next.js `error.tsx` and `global-error.tsx` boundaries to display user-friendly fallback UIs instead of a blank screen when rendering fails.

---

> [!TIP]
> **Refactoring Strategy**
> When addressing these issues, tackle High Priority items first. Do not attempt to fix all technical debt in a single Pull Request. Isolate each architectural shift (e.g., introducing testing vs modifying upload logic) to ensure stability.
