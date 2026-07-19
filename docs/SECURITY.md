# Skillsync Security Audit & Matrix

## Authentication & Authorization Matrix

| Route                                    | Authentication | Role/Permissions | Data Ownership / Validation |
| ---------------------------------------- | -------------- | ---------------- | --------------------------- |
| `POST /api/auth/register`                | None           | N/A              | Rate limited. Central schema. |
| `POST /api/auth/forgot-password`         | None           | N/A              | Rate limited. Central schema. |
| `POST /api/auth/reset-password`          | None           | N/A              | Rate limited. Central schema. |
| `GET /api/users/me`                      | Required       | Any              | Central schema. |
| `GET /api/users/[id]`                    | None           | N/A              | `isValidObjectId` check. |
| `PUT /api/users/role`                    | Required       | Any              | Central schema. |
| `PUT /api/users/password`                | Required       | Any              | Rate limited. Central schema. |
| `POST /api/projects`                     | Required       | `client`         | Rate limited. Central schema. |
| `GET /api/projects`                      | None           | N/A              | Central schema. |
| `GET /api/projects/[id]`                 | None           | N/A              | `isValidObjectId` check. |
| `PUT /api/projects/[id]`                 | Required       | `client`         | `isValidObjectId`, ownership check. |
| `DELETE /api/projects/[id]`              | Required       | `client`         | `isValidObjectId`, ownership check. |
| `POST /api/proposals`                    | Required       | `freelancer`     | Rate limited. Central schema. |
| `GET /api/proposals`                     | Required       | Any              | Central schema. |
| `GET /api/proposals/[id]`                | Required       | Any              | `isValidObjectId`, participant check. |
| `PUT /api/proposals/[id]`                | Required       | `freelancer`     | `isValidObjectId`, ownership check. |
| `DELETE /api/proposals/[id]`             | Required       | `freelancer`     | `isValidObjectId`, ownership check. |
| `POST /api/skills`                       | Required       | `freelancer`     | Rate limited. Central schema. |
| `GET /api/skills`                        | None           | N/A              | Central schema. |
| `GET /api/skills/[id]`                   | None           | N/A              | `isValidObjectId` check. |
| `PUT /api/skills/[id]`                   | Required       | `freelancer`     | `isValidObjectId`, ownership check. |
| `DELETE /api/skills/[id]`                | Required       | `freelancer`     | `isValidObjectId`, ownership check. |
| `POST /api/reviews`                      | Required       | Any              | Rate limited. `isValidObjectId`, contract check. |
| `GET /api/reviews`                       | None           | N/A              | Central schema. |
| `GET /api/reviews/[id]`                  | None           | N/A              | `isValidObjectId` check. |
| `POST /api/reviews/[id]/helpful`         | Required       | Any              | `isValidObjectId` check. |
| `POST /api/contracts`                    | Required       | `client`         | Rate limited. Central schema. |
| `GET /api/contracts`                     | Required       | Any              | Central schema. |
| `GET /api/contracts/[id]`                | Required       | Any              | `isValidObjectId`, participant check. |
| `PUT /api/contracts/[id]`                | Required       | Any              | `isValidObjectId`, participant/role checks. |
| `POST /api/messages/[id]`                | Required       | Any              | Rate limited. `isValidObjectId`, participant check. |
| `GET /api/messages/[id]`                 | Required       | Any              | `isValidObjectId`, participant check. |
| `POST /api/messages/[id]/read`           | Required       | Any              | `isValidObjectId`, participant check. |
| `GET /api/messages/conversations`        | Required       | Any              | Participant check. |
| `GET /api/notifications`                 | Required       | Any              | Ownership check. |
| `POST /api/notifications/[id]/read`      | Required       | Any              | `isValidObjectId`, ownership check. |
| `POST /api/payments/create-intent`       | Required       | `client`         | `isValidObjectId`, participant check. |
| `POST /api/payments/webhook`             | None           | Stripe Webhook   | Stripe Signature verification. Handles `charge.dispute.created`. |
| `POST /api/withdrawals`                  | Required       | `freelancer`     | Central schema. |
| `POST /api/ai/compose/profile`           | Required       | `freelancer`     | Rate limited. Central schema. |
| `POST /api/ai/compose/project`           | Required       | `client`         | Rate limited. Central schema. |
| `POST /api/ai/compose/proposal`          | Required       | `freelancer`     | Rate limited. Central schema. |
| `POST /api/ai/pricing`                   | Required       | Any              | Rate limited. Central schema. |
| `POST /api/upload`                       | Required       | Any              | Rate limited. |
| `POST /api/contact`                      | None           | N/A              | Rate limited. Central schema. |
| `GET /api/admin/*`                       | Required       | `admin`          | `isAdmin` middleware. |
| `POST /api/admin/*`                      | Required       | `admin`          | `isAdmin` middleware. |
| `PUT /api/admin/*`                       | Required       | `admin`          | `isAdmin` middleware. |
| `DELETE /api/admin/*`                    | Required       | `admin`          | `isAdmin` middleware. |

## Implemented Security Hardening
- **Rate Limiting:** In-memory rolling window rate limiting across `auth`, `login`, `submission`, `message`, `ai`, and `upload` namespaces.
- **Input Integrity:** Fully centralized validation schemas using Zod in `types/schemas.ts`. Every endpoint enforces payload structures safely.
- **Idempotency & Type Safety:** Mongoose `isValidObjectId` is strictly checked across all `[id]` dynamic API routes returning a uniform `400 Bad Request` prior to authorization logic.
- **Webhook Integrity:** Stripe Webhook signature validation. Fully handles `payment_intent.succeeded`, `charge.refunded`, `payment_intent.payment_failed`, and importantly `charge.dispute.created`.
- **Environment Safety:** Strict boot-time and run-time validation of `process.env` utilizing Zod in `lib/env.ts`.

