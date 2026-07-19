# 🏗️ System Architecture

SkillSync is designed as a **Serverless Monolith** leveraging the full power of the **Next.js App Router (v15)**. The architecture strictly separates data fetching (Server) from interactivity (Client) to ensure lightning-fast initial paints, superior SEO, and zero exposure of database credentials to the browser.

---

## 🏛️ High-Level Component Architecture

```mermaid
architecture-beta
    group frontend(cloud)[Frontend - Browser]
    group backend(server)[Backend - Next.js Node]
    group db(database)[MongoDB Atlas]
    group external(cloud)[3rd Party Services]

    service client(internet)[Client Components] in frontend
    service server_comp(server)[React Server Components] in backend
    service api(server)[API Route Handlers] in backend
    service mongoose(database)[Mongoose ORM] in backend
    
    service mongo(database)[MongoDB Collections] in db
    
    service stripe(cloud)[Stripe API] in external
    service cloudinary(cloud)[Cloudinary] in external
    service resend(cloud)[Resend API] in external

    client:R --> L:server_comp
    client:R --> L:api
    server_comp:R --> L:mongoose
    api:R --> L:mongoose
    mongoose:R --> L:mongo
    
    api:T --> B:stripe
    api:T --> B:cloudinary
    api:T --> B:resend
```

> [!NOTE]
> **Server vs. Client Boundary**
> We push `"use client"` directives to the absolute leaves of the component tree. A layout or page is almost always a Server Component, passing serialized data down to interactive Client Components like forms or buttons.

---

## 🔄 The Request Lifecycle

When a user interacts with the application, data flows through distinct layers ensuring security and validation.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Browser as Client (Browser)
    participant Auth as NextAuth (Session)
    participant API as Route Handler (/api)
    participant Zod as Validation (Zod)
    participant DB as MongoDB Atlas
    
    User->>Browser: Submits "Post Project" Form
    Browser->>API: POST /api/projects (JSON)
    API->>Auth: Extract JWT & Verify Role
    alt Invalid Session or Role
        Auth-->>Browser: 401 Unauthorized or 403 Forbidden
    end
    API->>Zod: Validate Request Body
    alt Invalid Payload
        Zod-->>Browser: 400 Bad Request (Errors)
    end
    API->>DB: Mongoose.create(payload)
    DB-->>API: Saved Document
    API-->>Browser: 201 Created
    Browser->>User: Toast Success & Redirect
```

---

## 🔑 Authentication Architecture (NextAuth v5)

Authentication uses a hybrid approach to maximize speed and security.

| Aspect | Implementation Details |
| :--- | :--- |
| **Strategy** | `jwt` (JSON Web Tokens) to prevent session database lookups on every request. |
| **Providers** | `Credentials` (Email/Password) and `Google OAuth`. |
| **Callbacks** | During the `jwt` callback, we inject the `user._id` and `user.role` into the token. |
| **Hydration** | The `session` callback exposes these minimal fields to the Client via `useSession()`. |

> [!TIP]
> **Why JWT?**
> Because SkillSync operates in a Serverless environment (Vercel), maintaining a persistent database connection for session validation on every route transition is too slow and resource-heavy. JWTs are cryptographically verified locally without hitting MongoDB.

---

## 💾 Database Access Pattern

We use **Mongoose 9** to interact with MongoDB.

```mermaid
graph TD
    A[Incoming Request] --> B{Environment?}
    B -->|Development| C[Global Connection Cache]
    B -->|Production| D[Direct Connection Pool]
    C --> E[(MongoDB)]
    D --> E
```

> [!WARNING]
> **Connection Exhaustion Prevention**
> In Development (`npm run dev`), Next.js constantly clears the module cache on hot-reloads. If we didn't cache the Mongoose connection in `global._mongoose`, Next.js would spawn hundreds of idle connections until MongoDB rate-limits the IP.

### The Aggregation Pipeline Pattern
For complex reads (like the Dashboard or Explore page), we bypass simple `.find()` queries and utilize **Aggregation Pipelines**. This allows us to push heavy computation (sorting, grouping, `$facet` pagination) directly to the database engine rather than computing it in Node.js memory.
