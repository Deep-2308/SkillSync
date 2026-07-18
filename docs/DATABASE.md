# 🗄️ Database Architecture

SkillSync utilizes **MongoDB Atlas** as its primary datastore, heavily leveraging **Mongoose 9** for object data modeling, validation, and middleware hooks.

> [!NOTE]
> **Indexing Strategy**
> Because creating compound indexes on millions of rows can lock production tables, all complex indexing is explicitly handled in the background via the `scripts/create-indexes.ts` script rather than being auto-built on startup.

---

## 1. User
The core entity representing both Clients (`member`) and Freelancers (`provider`).

- **Fields:** name, email, role, isVerified, location, hourlyRate, headline, bio, skills, averageRating, totalReviews.
- **Security:** `passwordHash`, `passwordResetToken`, and `passwordResetExpires` are explicitly set to `select: false` to prevent accidental exposure to the client.
- **Indexes:** 
  - Unique on `email`.
  - Compound Text Index on `name` (weight: 10), `headline` (weight: 5), `bio` (weight: 1), and `skills` (weight: 3) for optimized `/explore` searching.

## 2. Skill
Represents a specific service offering posted by a Provider.

- **Relationships:** Links to `User` via `providerId`.
- **Fields:** title, description, category (enum), rate, tags, isAvailable.
- **Indexes:** Compound Text index on `title`, `description`, and `tags`.

## 3. Project
A job listing posted by a Member.

- **Relationships:** Links to `User` via `clientId`.
- **Fields:** title, description, category, skills (array limit 5), budgetType (`fixed`, `hourly`), budgetAmount, status (`open`, `in_progress`, `completed`, `cancelled`).
- **Indexes:** 
  - Compound Text index on `title` and `description`.
  - Background index on `{ status: 1, category: 1, createdAt: -1 }` for fast directory sorting.

## 4. Proposal
A bid placed by a freelancer on an open project.

- **Relationships:** Links to `Project` (projectId) and `User` (freelancerId).
- **Constraints:** 
  - **Compound Unique Index** on `{ projectId: 1, freelancerId: 1 }`. This database-level constraint physically prevents a freelancer from spamming multiple bids on the same project.

## 5. Contract
The formalized agreement generated when a Proposal is accepted.

- **Relationships:** Links to `clientId`, `freelancerId`, `projectId`, and `proposalId`.
- **Fields:** agreedRate, deadline, status (`active`, `completed`, `cancelled`), paymentStatus (`pending`, `paid`, `refunded`).

## 6. Review
A rating and comment left by either party upon contract completion.

- **Relationships:** Links to the `contractId`, the `reviewerId`, and the `targetId`.
- **Constraints:**
  - **Compound Unique Index** on `{ contractId: 1, reviewerId: 1 }` preventing double-reviewing.
- **Middleware:** A `post-save` hook automatically queries the `Review` collection to calculate the new `averageRating` and saves it directly to the target `User` document.

## 7. Notification
In-app alerts for users.

- **Fields:** userId, type, message, link, read.
- **Indexes:** Background index on `{ userId: 1, read: 1, createdAt: -1 }` for rapidly fetching unread badge counts.

## 8. Contact
Stores messages sent from the public `/contact` page for administrative review.
- **Fields:** name, email, subject, message, status, createdAt.

---

## Indexing Strategy
Because creating compound indexes on millions of rows can lock production tables, all complex indexing is explicitly handled in the background via the `scripts/create-indexes.ts` script rather than auto-built on startup.
