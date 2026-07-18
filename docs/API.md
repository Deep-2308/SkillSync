# 🔌 API Documentation

SkillSync utilizes the Next.js App Router for its backend, with all endpoints located inside the `app/api/.../route.ts` directories. The API is strictly RESTful and utilizes JSON bodies.

## General Principles
- **Authentication:** Protected routes utilize NextAuth's `auth()` helper to extract the JWT session. Unauthenticated requests return `401 Unauthorized`.
- **Validation:** `Zod` is used for all incoming Request bodies. Invalid requests return `400 Bad Request` with the Zod parsing errors.
- **Error Handling:** All database interactions are wrapped in `try/catch`. Server errors return `500 Internal Server Error`.

---

## Auth & Users

### `POST /api/auth/register`
- **Purpose:** Registers a new user.
- **Body:** `{ name, email, password, role }`
- **Logic:** Validates role enum, hashes password via bcrypt (12 rounds), ensures email uniqueness, dispatches welcome email.
- **Returns:** `201 Created` with `{ message: "Account created" }`

### `POST /api/auth/forgot-password`
- **Purpose:** Initiates the password recovery flow.
- **Body:** `{ email }`
- **Logic:** Generates a random crypto token, hashes it into the DB, and emails the raw token via Resend.
- **Returns:** `200 OK`

### `GET /api/users/me`
- **Purpose:** Fetches the logged-in user's profile.
- **Auth Required:** Yes
- **Returns:** `200 OK` with full User object (omitting password hashes).

### `PUT /api/users/me`
- **Purpose:** Updates the user's profile.
- **Auth Required:** Yes
- **Body:** `{ name, bio, headline, hourlyRate, image, location }`
- **Returns:** `200 OK`

---

## Projects & Proposals

### `POST /api/projects`
- **Purpose:** Creates a new project listing.
- **Auth Required:** Yes (`member` role)
- **Body:** `{ title, description, category, skills, budgetType, budgetAmount }`
- **Returns:** `201 Created`

### `POST /api/proposals`
- **Purpose:** Submits a bid on an open project.
- **Auth Required:** Yes (`provider` role)
- **Body:** `{ projectId, coverLetter, rate, estimatedDays }`
- **Logic:** Ensures the project exists and is open. Enforces compound uniqueness (a freelancer can only bid once per project). Emails the client.
- **Returns:** `201 Created`

### `PUT /api/proposals/[id]`
- **Purpose:** Accepts or rejects a proposal.
- **Auth Required:** Yes (must be the client of the project)
- **Logic:** If accepting, utilizes a Mongoose transaction to create the `Contract` and update the `Project` status simultaneously.
- **Returns:** `200 OK`

---

## Contracts & Payments

### `POST /api/payments/create-intent`
- **Purpose:** Initiates a Stripe checkout for a specific contract.
- **Auth Required:** Yes
- **Body:** `{ contractId }`
- **Logic:** Verifies the user is the Client of the contract. Generates a Stripe PaymentIntent for the `agreedRate` (converted to cents). Embeds `contractId` in the intent metadata.
- **Returns:** `200 OK` with `{ clientSecret: "pi_123_secret_abc" }`

### `POST /api/payments/webhook`
- **Purpose:** Listens for async payment confirmations from Stripe.
- **Auth Required:** No (Verifies via cryptographic Stripe Signature)
- **Logic:** Disables Next.js `bodyParser` to read the raw buffer. On `payment_intent.succeeded`, updates the Contract's `paymentStatus` to `paid`.
- **Returns:** `200 OK`

### `PUT /api/contracts/[id]`
- **Purpose:** Updates contract status (e.g., marking as `completed`).
- **Auth Required:** Yes (Party to the contract)
- **Returns:** `200 OK`

---

## Search & Uploads

### `GET /api/search`
- **Purpose:** Global full-text search.
- **Query Params:** `?q=search_term&type=freelancers|projects&page=1`
- **Logic:** Invokes the `getSearchResults` aggregation pipeline utilizing MongoDB `$text` indexes and `$meta: "textScore"`.
- **Returns:** `200 OK` with array of results.

### `POST /api/upload`
- **Purpose:** Uploads files to Cloudinary.
- **Auth Required:** Yes
- **Body:** `multipart/form-data` containing `file`
- **Logic:** Validates MIME type and 5MB limit. Converts `File` to `Buffer` and streams to Cloudinary v2 SDK.
- **Returns:** `200 OK` with `{ url, publicId }`
