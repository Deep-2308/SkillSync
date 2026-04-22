# SkillSync

A full-stack freelancer hiring and review platform built with Next.js 15. Clients post projects, freelancers submit proposals, and both collaborate through real-time messaging — all backed by AI-powered skill matching.

**Live Demo →** [skillsync-amber.vercel.app](https://skillsync-amber.vercel.app/)

---

## Features

- **AI Skill Matching** — Intelligent algorithm matches projects with the right freelancers based on skills, experience, and availability
- **Project Management** — Post projects with budgets, timelines, and skill requirements; manage everything from a unified dashboard
- **Proposal System** — Freelancers submit proposals with cover letters and pricing; clients review, accept, or decline
- **Real-Time Messaging** — Built-in conversation system between clients and freelancers
- **User Profiles** — Public profile pages with portfolio, skills, bio, and work history
- **Authentication** — Email/password auth with JWT sessions, password reset flow
- **Reviews & Ratings** — Verified review system for completed projects
- **Dark Mode** — Full light/dark theme support with system preference detection
- **Responsive Design** — Mobile-first UI that works across all devices

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 15](https://nextjs.org/) (App Router, RSC) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) + Radix UI |
| Database | MongoDB + Mongoose |
| Authentication | JWT (jose) + bcrypt |
| Icons | Lucide React |
| Notifications | Sonner |
| Deployment | Vercel |

## Project Structure

```
skillsync/
├── app/
│   ├── api/              # REST API routes
│   │   ├── auth/         # Login, signup, password reset
│   │   ├── projects/     # CRUD for projects
│   │   ├── proposals/    # Proposal submission & management
│   │   ├── messages/     # Messaging endpoints
│   │   ├── conversations/
│   │   ├── freelancers/
│   │   └── users/
│   ├── dashboard/        # Authenticated user area
│   │   ├── messages/     # Chat interface
│   │   ├── projects/     # Project management
│   │   ├── portfolio/    # Portfolio editor
│   │   └── profile/      # Profile settings
│   ├── hire-talent/      # Browse freelancers
│   ├── post-project/     # Create new project
│   ├── projects/[id]/    # Project detail + proposals
│   ├── services/         # Service categories
│   ├── u/[username]/     # Public user profiles
│   └── login/ signup/    # Auth pages
├── components/
│   ├── ui/               # Reusable UI components (shadcn)
│   ├── navigation.tsx
│   └── footer.tsx
├── context/
│   └── AuthContext.tsx    # Global auth state
├── models/               # Mongoose schemas
│   ├── Conversation.ts
│   ├── Message.ts
│   └── Proposal.ts
└── lib/                  # Utilities
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Setup

```bash
# Clone the repository
git clone https://github.com/your-username/skillsync.git
cd skillsync

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
```

### Run

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login with credentials |
| GET | `/api/auth/me` | Get current session |
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create a project |
| GET | `/api/projects/[id]` | Get project details |
| POST | `/api/proposals` | Submit a proposal |
| GET | `/api/freelancers` | Browse freelancers |
| GET | `/api/conversations` | List conversations |
| POST | `/api/messages` | Send a message |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key for JWT tokens |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |

## License

This project is for educational purposes.
