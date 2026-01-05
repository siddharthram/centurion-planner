# Why Next.js 15 for Centurion

**Last Updated**: 2026-01-04

---

## Key Benefits of Next.js 15

### 1. React 19 Support

Next.js 15 ships with **React 19**, which includes:

- **React Compiler**: Automatic optimization without manual memoization
- **Server Components by default**: Better performance, smaller client bundles
- **Improved Server Actions**: Better for form handling and mutations
- **Enhanced async/await**: Cleaner async data fetching

**Why this matters for Centurion**:
- Daily/weekly reviews involve lots of form inputs → Server Actions make this cleaner
- Markdown content is mostly static → Server Components reduce client JS
- Pattern extraction can run server-side → Better UX, faster response

---

### 2. Turbopack (Stable)

Next.js 15 makes **Turbopack** the default for `next dev`:

- **5x faster** local development server startup
- **Fast Refresh** is much snappier
- Better for iterating on markdown editor UX

**Impact**:
- Faster iteration when building the editor
- Better DX for development team

---

### 3. Enhanced Async Request APIs

Next.js 15 improves async APIs:

```typescript
// Before (Next.js 14)
export async function generateMetadata({ params }) {
  const id = (await params).id; // Need to await params
  return { title: `Review ${id}` };
}

// After (Next.js 15)
export async function generateMetadata({ params }) {
  const { id } = params; // params is now synchronous
  return { title: `Review ${id}` };
}
```

**Why this matters**:
- Cleaner code in dynamic routes (`/reviews/daily/[date]`)
- Less boilerplate for metadata generation

---

### 4. Partial Prerendering (Experimental)

Next.js 15 introduces **Partial Prerendering (PPR)**:

- Combine static and dynamic content in the same page
- Static shell renders instantly, dynamic parts stream in

**Use case for Centurion**:
```typescript
// reviews/daily/[date]/page.tsx
export default async function DailyReviewPage({ params }) {
  const { date } = params;

  // Static: Template structure (prerendered)
  const template = getTemplate('daily');

  // Dynamic: User's saved review (streamed)
  const review = await getReview(date);

  return (
    <div>
      <h1>{template.metadata.title}</h1>
      <Suspense fallback={<Skeleton />}>
        <ReviewContent review={review} />
      </Suspense>
    </div>
  );
}
```

**Benefit**: Instant page load, then stream in user data

---

### 5. Improved Caching

Next.js 15 refines caching defaults:

- More predictable fetch caching
- Better control over revalidation
- Clearer caching behavior

**Why this matters**:
- Reviews change frequently → Need smart revalidation
- Templates are static → Can be cached aggressively
- Life Map scores update quarterly → Can cache between updates

---

### 6. Better Error Handling

Next.js 15 improves error boundaries and error states:

```typescript
// app/reviews/error.tsx
export default function ReviewError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong loading your review</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

**Why this matters**:
- Better UX when database queries fail
- Graceful handling of markdown parsing errors
- User-friendly error messages

---

### 7. Enhanced Forms with Server Actions

Next.js 15 + React 19 Server Actions are production-ready:

```typescript
// app/reviews/daily/new/actions.ts
'use server'

export async function saveReview(formData: FormData) {
  const content = formData.get('content') as string;
  const energyLevel = parseInt(formData.get('energy_level') as string);

  // Validate
  if (!content || energyLevel < 1 || energyLevel > 10) {
    return { error: 'Invalid input' };
  }

  // Save to database
  await db.reviews.create({
    user_id: auth.userId,
    template_id: 'daily',
    content,
    metadata: { energy_level: energyLevel },
  });

  redirect('/reviews/daily');
}
```

**Benefits**:
- No need to create API routes for simple mutations
- Type-safe form handling
- Automatic revalidation after mutations

---

### 8. Instrumentation API (Stable)

Next.js 15 stabilizes the **instrumentation API**:

```typescript
// instrumentation.ts
export async function register() {
  // Initialize Sentry, OpenTelemetry, etc.
  // Runs once when the server starts
}
```

**Use case**:
- Initialize OpenAI client once
- Set up error tracking (Sentry)
- Configure analytics

---

## Migration from Next.js 14 → 15

Since we're starting fresh, **no migration needed**. But if you had a Next.js 14 app:

- ✅ App Router stays the same
- ✅ Most APIs are backwards compatible
- ⚠️ Some caching behavior changed (mostly improvements)
- ⚠️ Async request APIs are now synchronous (breaking, but easy to fix)

---

## Recommended Setup Commands

### 1. Initialize with Next.js 15

```bash
npx create-next-app@latest personal-os-web \
  --typescript \
  --tailwind \
  --app \
  --use-npm \
  --import-alias "@/*"
```

**This installs**:
- Next.js 15.x
- React 19
- TypeScript
- Tailwind CSS
- App Router

### 2. Add Key Dependencies

```bash
npm install \
  @supabase/supabase-js \
  gray-matter \
  @tailwindcss/typography \
  novel \
  lucide-react

npm install -D \
  @types/node
```

### 3. Configure for Content Loading

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable if you want to use PPR
    ppr: true,
  },
  // Allow reading from content directory
  webpack: (config) => {
    config.resolve.alias['@content'] = path.resolve(__dirname, '../personal-os-content');
    return config;
  },
};

module.exports = nextConfig;
```

---

## Key Features We'll Use

| Next.js 15 Feature | How We'll Use It |
|-------------------|------------------|
| React 19 + Server Components | Render markdown templates server-side |
| Server Actions | Save daily/weekly reviews without API routes |
| Turbopack | Fast local development |
| Streaming + Suspense | Load reviews progressively |
| Partial Prerendering | Static template shell + dynamic user data |
| Enhanced Forms | Handle daily check-in submissions |
| Improved Caching | Cache templates aggressively, reviews smartly |

---

## Performance Benefits

### Before (Next.js 14)
- Client-side React: ~150KB
- Need API routes for all mutations
- Manual cache management

### After (Next.js 15 + React 19)
- Client-side React: ~100KB (thanks to Server Components)
- Server Actions eliminate many API routes
- Better default caching

**Expected improvement**:
- 30-40% smaller JS bundles
- Faster page loads
- Simpler codebase (fewer API routes)

---

## Conclusion

**Next.js 15 is the right choice** for Centurion because:

✅ **React 19** gives us better forms and Server Actions
✅ **Turbopack** speeds up development
✅ **Partial Prerendering** improves perceived performance
✅ **Better caching** reduces database queries
✅ **Smaller bundles** mean faster page loads
✅ **Stable, production-ready** (not experimental)

**Timeline**: Next.js 15 was released October 2024, so it's been stable for ~3 months by now (January 2026).

---

**Recommendation**: Start with Next.js 15 from day one. No reason to use 14 at this point.
