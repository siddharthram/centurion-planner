# Getting Started with Centurion Planner

**Tech Stack**: Next.js 15 + React 19 + Supabase + Vercel

---

## Quick Start

### 1. Initialize Next.js 15 Project

```bash
cd /Users/siddharthram/habits/personal-os-web

npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --use-npm \
  --import-alias "@/*" \
  --no-src-dir
```

**This installs**:
- ✅ Next.js 15.x
- ✅ React 19
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ App Router (not Pages Router)

---

### 2. Install Core Dependencies

```bash
# Supabase (database, auth, storage)
npm install @supabase/supabase-js @supabase/ssr

# Content parsing
npm install gray-matter remark remark-html

# UI components
npm install @radix-ui/react-* class-variance-authority clsx tailwind-merge

# Markdown editor
npm install novel @tiptap/react @tiptap/starter-kit

# Icons
npm install lucide-react

# Forms
npm install react-hook-form @hookform/resolvers zod

# Dev dependencies
npm install -D @types/node prettier prettier-plugin-tailwindcss
```

---

### 3. Install shadcn/ui

```bash
npx shadcn@latest init
```

**Configuration**:
- Style: **Default**
- Base color: **Slate**
- CSS variables: **Yes**

**Add components**:
```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add textarea
npx shadcn@latest add card
npx shadcn@latest add dropdown-menu
npx shadcn@latest add separator
npx shadcn@latest add skeleton
npx shadcn@latest add tabs
npx shadcn@latest add calendar
npx shadcn@latest add form
```

---

### 4. Set Up Supabase

#### Option A: Create New Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project: **personal-os**
3. Save your credentials:
   - Project URL: `https://xxxxx.supabase.co`
   - Anon key: `eyJhbGciOi...`
   - Service role key: `eyJhbGciOi...` (keep secret!)

#### Option B: Use Supabase CLI (Local Development)

```bash
npm install -D supabase
npx supabase init
npx supabase start
```

---

### 5. Environment Variables

Create `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# OpenAI (for pattern extraction)
OPENAI_API_KEY=sk-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### 6. Set Up Database Schema

Create `supabase/migrations/001_initial_schema.sql`:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company_name TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'quarterly', 'annual')),
  date DATE NOT NULL,
  template_id TEXT NOT NULL,
  template_version TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, type, date)
);

CREATE INDEX idx_reviews_user_type_date ON public.reviews(user_id, type, date DESC);

-- Goals table
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  time_horizon TEXT NOT NULL CHECK (time_horizon IN ('1_year', '3_year', '10_year')),
  category TEXT NOT NULL CHECK (category IN ('career', 'relationships', 'health', 'meaning', 'finances', 'fun')),
  content TEXT NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, time_horizon, category, year)
);

-- Documents table (north_star, principles, memory, etc.)
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('north_star', 'principles', 'memory', 'vivid_vision')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, type)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own reviews" ON public.reviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Similar policies for goals and documents...
CREATE POLICY "Users can manage own goals" ON public.goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own documents" ON public.documents FOR ALL USING (auth.uid() = user_id);

-- =====================
-- GAMIFICATION TABLES
-- =====================

-- User stats (streaks, points)
CREATE TABLE IF NOT EXISTS public.user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_daily_streak INTEGER DEFAULT 0,
  longest_daily_streak INTEGER DEFAULT 0,
  current_weekly_streak INTEGER DEFAULT 0,
  longest_weekly_streak INTEGER DEFAULT 0,
  last_daily_review_date DATE,
  last_weekly_review_date DATE,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- User achievements
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Activity log (for heatmap)
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_user_date ON public.activity_log(user_id, activity_date);

-- Enable RLS for gamification tables
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own stats" ON public.user_stats FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own achievements" ON public.user_achievements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own activity" ON public.activity_log FOR ALL USING (auth.uid() = user_id);
```

Run migration:

```bash
npx supabase db push
```

---

### 7. Create Project Structure

```bash
mkdir -p app/(auth)/(dashboard)/reviews/{daily,weekly,quarterly,annual}
mkdir -p app/api/{reviews,goals,documents}
mkdir -p components/{ui,markdown-editor,review-list}
mkdir -p lib/{supabase,content,utils}
mkdir -p types
```

---

### 8. Set Up Content Loader

Create `lib/content/index.ts`:

```typescript
import { readFileSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';

const contentDir = join(process.cwd(), '../personal-os-content');

export interface TemplateMetadata {
  id: string;
  title: string;
  type: string;
  frequency: string;
  duration: string;
  version: string;
  [key: string]: any;
}

export interface Template {
  metadata: TemplateMetadata;
  content: string;
}

export function getTemplate(templateId: string): Template {
  const filePath = join(contentDir, 'templates', `${templateId}.md`);
  const fileContents = readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    metadata: data as TemplateMetadata,
    content,
  };
}

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
```

---

### 9. Set Up Supabase Client

Create `lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

Create `lib/supabase/server.ts`:

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}
```

---

### 10. Create First Page

Create `app/page.tsx`:

```typescript
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">Personal OS</h1>
      <p className="mt-4 text-muted-foreground">
        Your personal operating system for clarity and growth
      </p>
      <div className="mt-8 flex gap-4">
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
    </div>
  );
}
```

---

### 11. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## Next Steps

1. **Build authentication** (`app/(auth)/login` and `app/(auth)/signup`)
2. **Create dashboard** (`app/(dashboard)/page.tsx`)
3. **Build daily review page** (`app/(dashboard)/reviews/daily/new/page.tsx`)
4. **Test content loading** from `personal-os-content/`
5. **Implement markdown editor** (Novel.sh)
6. **Add Server Actions** for saving reviews

---

## Development Workflow

```bash
# Start dev server (with Turbopack)
npm run dev

# Run type checking
npm run type-check

# Format code
npm run format

# Build for production
npm run build

# Run production build locally
npm run start
```

---

## Deployment to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

Or connect your GitHub repo to Vercel for automatic deployments.

---

**Last Updated**: 2026-01-04
**Next.js Version**: 15.x
**React Version**: 19.x
