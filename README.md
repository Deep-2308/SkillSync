# SkillSync

An online skill-sharing and hiring platform. Share your skills, learn from experts, and hire vetted talent by the hour.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router, TypeScript strict) |
| UI | React 19, Tailwind CSS v4, shadcn/ui (new-york) |
| Auth | NextAuth v5 (Auth.js) — Google OAuth + credentials |
| Data | MongoDB 7 + Mongoose 9 |
| Forms | react-hook-form + zod |
| Misc | Sonner, Lucide, next-themes, @vercel/analytics |

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.local.example .env.local
#    …then fill in MONGODB_URI, NEXTAUTH_SECRET, Google creds, etc.

# 3. (Optional) seed demo data
npm run seed

# 4. Run the dev server
npm run dev
```

Open http://localhost:3000.

## Project structure

```
app/            Pages + API routes (App Router)
components/     Custom shared components
components/ui/  shadcn/ui primitives
context/        React context providers (AuthContext)
hooks/          Custom React hooks
lib/            mongodb.ts, auth.ts, utils.ts
models/         Mongoose schemas
types/          TypeScript interfaces + zod schemas
data/           Static / seed data
scripts/        One-off scripts (seed)
public/         Static assets
```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` / `npm run start` — production build & serve
- `npm run lint` — ESLint
- `npm run typecheck` — `tsc --noEmit`
- `npm run seed` — seed the database with demo content
