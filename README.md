# Centurion Planner

Build your century. One day at a time.

A life planning system for clarity, growth, and intentional living across all areas of life.

## What is Centurion?

Centurion helps you:
- **Reflect regularly** through 5-minute daily check-ins and 20-minute weekly reviews
- **Set meaningful goals** across career, relationships, health, meaning, finances, and fun
- **Review quarterly and annually** to track progress and course-correct
- **Capture patterns** about yourself to make better decisions
- **Stay aligned** with your values and purpose

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **React**: React 19
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth
- **Deployment**: Vercel

## Features

### Reviews
- ✅ Daily Check-ins (5 minutes)
- ✅ Weekly Reviews (20 minutes)
- 🚧 Quarterly Reviews (90 minutes)
- 🚧 Annual Reviews (half-day)

### Goals
- ✅ 1-Year Goals (6 life dimensions)
- ✅ 3-Year Goals
- ✅ 10-Year Goals

### Foundational Documents
- ✅ North Star (purpose & values)
- ✅ Vivid Vision (3-year picture)
- ✅ Principles (operating rules)
- ✅ Memory (patterns & lessons)

### Coming Soon
- Pattern recognition (AI-powered insights)
- Dashboard with overview
- Export & backup

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account (or local Supabase)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd personal-os-web

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Add your Supabase credentials to .env.local

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Database Setup

```bash
# Push migrations to Supabase
npx supabase db push
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/         # Login, signup pages
│   ├── (dashboard)/    # Protected app pages
│   │   ├── reviews/    # Daily, weekly reviews
│   │   ├── goals/      # 1, 3, 10-year goals
│   │   └── documents/  # North star, principles, etc.
│   └── api/            # API routes
├── components/         # React components
├── lib/
│   ├── content/        # Template loader
│   ├── supabase/       # Database clients
│   └── utils/          # Helpers
└── types/              # TypeScript types
```

## Content Repository

Templates and frameworks live separately in `../personal-os-content/` (or `../ceo-personal-os-content/`). This separation allows:
- Content editors to work without touching code
- Same content to power web, CLI, mobile apps
- Independent versioning

## Scripts

```bash
npm run dev      # Start development server (Turbopack)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Documentation

- [Architecture Guide](docs/README.md)
- [Getting Started](docs/GETTING_STARTED.md)
- [API Reference](docs/API.md) - REST API for iOS/mobile apps
- [Why Next.js 16](docs/NEXTJS_15_BENEFITS.md)
- [Project Status](PROJECT_STATUS.md)
- [Credits & Inspirations](CREDITS.md)

## Credits

This project is built on proven frameworks from brilliant thinkers:

| Framework | Creator | Used For |
|-----------|---------|----------|
| **Life Map** | Alex Lieberman | 6 dimensions of life (career, relationships, health, meaning, finances, fun) |
| **Vivid Vision** | Tony Robbins & Cameron Herold | Future visualization and goal setting |
| **Annual Review** | Dr. Anthony Gustin | Honest self-reflection and pattern finding |
| **Dreamlining** | Tim Ferriss | Ideal life costing and lifestyle design |
| **Regret Minimization** | Jeff Bezos | Long-term decision making |

The gamification system (streaks, points, achievements) is inspired by Duolingo's behavior design.

**Full credits**: [CREDITS.md](CREDITS.md)

## License

Private - All rights reserved.
