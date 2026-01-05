# Centurion Planner - Web Application

This is the web application for Personal OS.

**Content templates live in**: `content/`
**Code lives in**: This directory

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│         personal-os-content/                        │
│         (Content Repository)                        │
│                                                     │
│  • templates/        ← User-facing templates       │
│  • frameworks/       ← Educational content         │
│  • interviews/       ← Self-interview scripts      │
│  • goals/            ← Goal templates              │
│  • guides/           ← How-to guides               │
│  • examples/         ← Example reviews             │
│  • schema/           ← Content manifest & schema   │
└─────────────────────────────────────────────────────┘
                        ↓
              (consumed by)
                        ↓
┌─────────────────────────────────────────────────────┐
│         personal-os-web/                            │
│         (Web Application)                           │
│                                                     │
│  • app/              ← Next.js app router          │
│  • components/       ← React components            │
│  • lib/              ← Utilities & content loader  │
│  • hooks/            ← React hooks                 │
│  • types/            ← TypeScript types            │
│  • supabase/         ← Database schema & config    │
│  • public/           ← Static assets               │
└─────────────────────────────────────────────────────┘
```

---

## Separation of Concerns

### Content Repository (`personal-os-content/`)

**Responsibilities**:
- Define all templates, frameworks, interviews, and guides
- Maintain content versioning
- Provide schema and metadata
- Can be edited by non-technical content creators

**Does NOT contain**:
- React components
- API routes
- Database schema
- Authentication logic
- UI styling

---

### Web Application (`personal-os-web/`)

**Responsibilities**:
- Render content from content repository
- Handle user authentication
- Store user data in database
- Provide markdown editing experience
- Generate insights and patterns
- Export user data

**Does NOT contain**:
- Template content (loads from content repo)
- Framework explanations (loads from content repo)
- Interview scripts (loads from content repo)

---

## How Content is Consumed

### 1. Build Time (Static Site Generation)

The web app reads content during build:

```typescript
// lib/content.ts
import { readFileSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';

const contentDir = join(process.cwd(), '../personal-os-content');

export function getTemplate(templateId: string) {
  const filePath = join(contentDir, 'templates', `${templateId}.md`);
  const fileContents = readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    metadata: data,
    content: content,
  };
}
```

### 2. Runtime (Dynamic)

Templates are loaded and rendered on-demand:

```typescript
// app/reviews/daily/new/page.tsx
import { getTemplate } from '@/lib/content';
import { MarkdownEditor } from '@/components/markdown-editor';

export default function NewDailyReview() {
  const template = getTemplate('daily');

  return (
    <div>
      <h1>{template.metadata.title}</h1>
      <p className="text-muted-foreground">
        Duration: {template.metadata.duration}
      </p>
      <MarkdownEditor
        initialContent={template.content}
        onSave={handleSave}
      />
    </div>
  );
}
```

### 3. Variable Replacement

Template variables are replaced with actual user data:

```typescript
// lib/template-engine.ts
export function replaceVariables(
  content: string,
  variables: Record<string, string>
): string {
  let result = content;

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  }

  return result;
}

// Usage
const content = getTemplate('daily').content;
const rendered = replaceVariables(content, {
  date: '2026-01-04',
  day_of_week: 'Saturday',
  tomorrow_date: '2026-01-05',
});
```

---

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **React**: React 19
- **Styling**: Tailwind CSS + shadcn/ui
- **Markdown Editor**: Novel.sh or Tiptap
- **State Management**: React Context + Server Components

### Backend
- **API Routes**: Next.js API Routes (Bearer token + cookie auth)
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth (SSR + JWT for mobile)
- **Storage**: Supabase Storage

### Gamification
- **Streaks**: Daily and weekly review streaks
- **Points**: Earn XP for completing reviews
- **Levels**: 10 progression tiers (Beginner → Enlightened)
- **Achievements**: 14 unlockable badges

### AI & Analytics
- **AI**: OpenAI API (pattern extraction - planned)
- **Analytics**: Vercel Analytics

### Deployment
- **Hosting**: Vercel
- **Database**: Supabase (PostgreSQL + Storage + Auth)
- **CI/CD**: Vercel (automatic deployments)

---

## Project Structure (Planned)

```
personal-os-web/
├── app/                          ← Next.js App Router
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   ├── page.tsx              ← Dashboard home
│   │   ├── reviews/
│   │   │   ├── daily/
│   │   │   │   ├── page.tsx      ← Daily reviews list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx  ← Create new daily review
│   │   │   │   └── [date]/
│   │   │   │       └── page.tsx  ← View/edit specific daily review
│   │   │   ├── weekly/
│   │   │   ├── quarterly/
│   │   │   └── annual/
│   │   ├── goals/
│   │   │   ├── 1-year/
│   │   │   ├── 3-year/
│   │   │   └── 10-year/
│   │   ├── interviews/
│   │   ├── frameworks/
│   │   └── settings/
│   ├── api/
│   │   ├── reviews/
│   │   ├── goals/
│   │   ├── uploads/
│   │   └── patterns/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                       ← shadcn/ui components
│   ├── markdown-editor.tsx
│   ├── review-list.tsx
│   ├── life-map-chart.tsx
│   └── ...
├── lib/
│   ├── content.ts                ← Content loader (reads from content repo)
│   ├── template-engine.ts        ← Variable replacement
│   ├── supabase.ts               ← Supabase client
│   ├── db.ts                     ← Database helpers
│   └── utils.ts
├── hooks/
│   ├── use-template.ts
│   ├── use-review.ts
│   └── ...
├── types/
│   ├── content.ts                ← Types for content (generated from manifest)
│   ├── database.ts               ← Database types
│   └── ...
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── public/
├── .env.local
├── next.config.js
├── package.json
├── tsconfig.json
└── README.md
```

---

## Development Workflow

### 1. Updating Content

**To update a template**:
1. Edit the file in `../personal-os-content/templates/`
2. Update frontmatter if needed
3. Commit changes to content repo
4. Rebuild the web app (automatic on Vercel)

**Web app automatically picks up changes** on next build.

---

### 2. Updating Code

**To add a new feature**:
1. Create new components in `components/`
2. Add API routes in `app/api/`
3. Update database schema if needed
4. Test locally
5. Deploy to Vercel

**Content remains unchanged** unless you're modifying the template loader.

---

## Content Versioning Strategy

### Template Versions

Templates use semantic versioning in frontmatter:

```yaml
version: 1.0.0
```

**When a template is updated**:
- **Patch** (1.0.1): Typo fixes, minor wording changes
- **Minor** (1.1.0): Add new optional section, add new variable
- **Major** (2.0.0): Remove section, restructure, breaking changes

### Storing Template Version with User Data

When a user saves a review, store the template version:

```typescript
// Database schema
reviews: {
  id: string;
  user_id: string;
  template_id: string;
  template_version: string; // "1.0.0"
  content: string;
  created_at: Date;
}
```

**Why**:
- User's old reviews always render correctly
- User can see which template version they used
- User can upgrade to new template if desired

---

## Data Flow Example

### Creating a Daily Review

```
┌──────────────────────────────────────────────────────┐
│  1. User navigates to /reviews/daily/new             │
└──────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────┐
│  2. Next.js loads page component                     │
│     - Calls getTemplate('daily')                     │
│     - Loads content from content repo                │
│     - Parses frontmatter + markdown                  │
└──────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────┐
│  3. Template engine replaces variables               │
│     - {{date}} → "2026-01-04"                        │
│     - {{day_of_week}} → "Saturday"                   │
└──────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────┐
│  4. Render markdown editor with template             │
│     - User fills out 5 questions                     │
└──────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────┐
│  5. User clicks "Save"                               │
│     - POST to /api/reviews                           │
│     - Payload: { template_id, content, metadata }    │
└──────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────┐
│  6. API route validates and saves to database        │
│     - Extract metadata (energy_level, etc.)          │
│     - Store in PostgreSQL via Supabase               │
└──────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────┐
│  7. Redirect to /reviews/daily/2026-01-04            │
│     - Display saved review                           │
└──────────────────────────────────────────────────────┘
```

---

## Benefits of This Architecture

### ✅ Separation of Concerns
- Content editors don't need to know React
- Developers don't need to touch content
- Each repo has a single responsibility

### ✅ Content Reusability
- Same content can power web app, CLI, mobile app
- Export content to static site or PDF
- Share content with other tools/platforms

### ✅ Version Control
- Content changes tracked separately from code changes
- Easy to see template evolution
- Can rollback content without redeploying code

### ✅ Easier Testing
- Test templates independently of UI
- Mock content for component tests
- Validate content schema

### ✅ Better Collaboration
- Content creators work in content repo
- Developers work in code repo
- Clear ownership boundaries

---

## Getting Started (Once Built)

### 1. Install Dependencies

```bash
cd personal-os-web
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_service_key
OPENAI_API_KEY=your_openai_key
```

### 3. Run Database Migrations

```bash
npm run db:migrate
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## Deployment

### Automatic Deployment (Vercel)

1. Connect GitHub repo to Vercel
2. Configure environment variables
3. Deploy automatically on every push to `main`

### Manual Deployment

```bash
npm run build
vercel --prod
```

---

## Features Implemented

### ✅ Core Features
- **Authentication**: Supabase Auth with SSR support
- **Daily Reviews**: Create, edit, view, list
- **Weekly Reviews**: Create, edit, view, list  
- **Goals**: 1-year, 3-year, 10-year planning documents
- **Foundational Documents**: North Star, Vivid Vision, Memory

### ✅ Onboarding Flow
New users are guided through setup in the right order:
1. Define Foundation (North Star)
2. Create 10-Year Vision
3. Set 3-Year Milestones
4. Plan This Year (1-Year Goals)
5. Start Review Practice

### ✅ Gamification System
- **Streaks**: Daily and weekly review streaks
- **Points**: 10 per daily, 25 per weekly, +5 streak bonus
- **Levels**: Beginner → Enlightened (10 tiers)
- **Achievements**: 14 unlockable badges

### ✅ Markdown Editor
Live preview with three modes:
- **Write**: Full-width editor
- **Split**: Side-by-side editor + preview
- **Preview**: Full-width rendered markdown

### ✅ Mobile-Ready API
- Bearer token authentication for iOS/Android apps
- RESTful endpoints for all resources
- See `docs/API.md` for documentation

## Next Steps

1. **Quarterly reviews**
2. **Annual reviews**
3. **Activity heatmap** (GitHub-style visualization)
4. **Pattern extraction** (AI-powered insights)
5. **Deploy to Vercel**

---

**Last Updated**: 2026-01-04
**Status**: MVP Core Complete
**Tech Stack**: Next.js 16 + React 19 + Supabase + Vercel

**See also**: 
- `NEXTJS_15_BENEFITS.md` - Why we chose Next.js 15/16
- `API.md` - REST API documentation for mobile apps
