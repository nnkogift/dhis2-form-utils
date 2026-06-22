# Next.js App Router Reference

Load this file when working on Next.js projects. It supplements the main coding-standards SKILL.md with App Router-specific patterns.

---

## Routing & Layout Conventions

- Use route groups `(group)` to share layouts without affecting the URL
- Parallel routes (`@slot`) for complex dashboard layouts with independent loading states
- Intercepting routes (`(.)path`, `(..)path`, `(...)path`) for modal patterns (e.g. photo lightboxes, detail drawers)
- `loading.tsx` at the route segment level for streaming skeletons — not a single global spinner
- `error.tsx` per segment so errors are contained and don't blow up the whole page
- `not-found.tsx` for 404 handling at the appropriate segment level
- `template.tsx` when you need the layout to fully re-mount on every navigation (fresh state, re-triggered effects)
- `default.tsx` as a fallback for parallel route slots when no active match exists
- `global-error.tsx` for errors thrown in the root layout — must include its own `<html>` and `<body>`

---

## Data Fetching Patterns

### Server Components

```ts
// Use the generated PageProps helper — no import needed, globally available after next dev/build
export default async function InvoicePage(props: PageProps<'/invoices/[id]'>) {
  const { id } = await props.params
  const invoice = await getInvoice(id) // direct DB/API call
  return <InvoiceDetail invoice={invoice} />
}
```

- Always `async` server components when fetching
- Use `Promise.all` for parallel fetches to avoid waterfalls
- Never pass entire DB objects to client components — project only the fields needed
- `fetch` calls are **not cached by default** — use `'use cache'` to opt in

### Streaming to Client Components

Prefer the React `use()` API to stream a server promise into a client component:

```tsx
// Server Component — do NOT await the fetch
export default function Page() {
    const posts = getPosts();
    return (
        <Suspense fallback={<PostsSkeleton />}>
            <PostList posts={posts} />
        </Suspense>
    );
}

// Client Component — resolves the promise
('use client');
import { use } from 'react';

export function PostList({ posts }: { posts: Promise<Post[]> }) {
    const data = use(posts);
    return (
        <ul>
            {data.map((p) => (
                <li key={p.id}>{p.title}</li>
            ))}
        </ul>
    );
}
```

For complex client-side caching (mutations, pagination, background refetch), use TanStack Query with `HydrationBoundary` and `prefetchQuery`.

---

## Async Request APIs

All request-time APIs are async in Next.js 15+. Await them before accessing values:

```ts
import { cookies, headers } from 'next/headers';

const cookieStore = await cookies();
const token = cookieStore.get('token');

const headersList = await headers();
const ua = headersList.get('user-agent');
```

- `params` and `searchParams` in pages, layouts, and route handlers are also `Promise`s — always `await` them
- Components that read runtime APIs must be wrapped in `<Suspense>` when inside a cached page

---

## Caching Strategy

Enable Cache Components in `next.config.ts` to unlock Partial Prerendering (PPR):

```ts
// next.config.ts
const nextConfig: NextConfig = { cacheComponents: true };
```

Apply `'use cache'` at **file level** (all exports), **function level**, or **component/page level**:

```ts
import { cacheLife, cacheTag } from 'next/cache';

async function getProducts() {
    'use cache';
    cacheLife('hours');
    cacheTag('products');
    return db.query('SELECT * FROM products');
}
```

- Group cache profiles by data volatility:
    - `cacheLife('hours')` — reference data, org units, metadata
    - `cacheLife('minutes')` — aggregate data, dashboard values
    - `cacheLife('seconds')` — near-realtime indicators
- `updateTag('tag')` — immediately invalidates a tag (use after mutations in Server Actions)
- `revalidateTag('tag')` — schedules revalidation on next request
- `refresh()` from `next/cache` — re-fetches the current page without invalidating tags
- Use `React.cache()` to deduplicate repeated calls within a single render pass
- Use `connection()` from `next/server` before non-deterministic operations (`Math.random()`, `Date.now()`) to defer them to request time
- Use `'use cache: remote'` for durable shared caching in serverless environments

---

## Server Functions & Server Actions

**Server Functions** is the broader term for `'use server'` async functions. **Server Actions** is the specific term when used in form/mutation context.

- Server Actions handle form mutations — no separate API route needed for simple cases
- Always authenticate and authorize inside every Server Function — they are reachable via direct POST requests
- Always validate action inputs with Zod before touching the DB
- Return a typed result object; never throw from a Server Action that touches the UI:
    ```ts
    type ActionResult<T> = { success: true; data: T } | { success: false; error: string };
    ```
- Use `useActionState` (React 19) to wire action state to the form — `useFormState` is removed
- After mutations, call `revalidateTag()`, `revalidatePath()`, or `refresh()` to update the UI

---

## Environment Variables

- `NEXT_PUBLIC_` prefix only for values that must be on the client — keep the list minimal
- All env vars validated at startup with Zod in `src/lib/env.ts`:
    ```ts
    const envSchema = z.object({
        DATABASE_URL: z.string().url(),
        NEXT_PUBLIC_API_BASE: z.string().url(),
    });
    export const env = envSchema.parse(process.env);
    ```
- Import from `@/lib/env` everywhere — never `process.env` directly in components

---

## TypeScript Helpers

Next.js generates strongly typed helpers for page and layout components. They are globally available — no import needed — after running `next dev`, `next build`, or `next typegen`.

### `PageProps<Route>`

Infers `params` and `searchParams` from the route literal:

```ts
// app/blog/[slug]/page.tsx
export default async function Page(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params           // typed as { slug: string }
  const { q } = await props.searchParams        // typed as Record<string, string | string[] | undefined>
  return <h1>Post: {slug}</h1>
}
```

### `LayoutProps<Route>`

Infers `params` and named `@slot` props from the directory structure:

```ts
// app/dashboard/layout.tsx
export default function Layout(props: LayoutProps<'/dashboard'>) {
  return (
    <section>
      {props.children}
      {props.analytics}  {/* typed if app/dashboard/@analytics exists */}
    </section>
  )
}
```

- Pass the route literal as a string (e.g. `'/blog/[slug]'`) for autocomplete and strict param keys
- Static routes resolve `params` to `{}`
- For Client Components that can't be `async`, use `use(props.params)` to unwrap the promise

---

## Performance

- Use `next/image` for all images — never raw `<img>` tags
- Dynamic imports (`next/dynamic`) for heavy client components not needed on initial paint
- `generateStaticParams` for static generation of known dynamic routes
- Avoid layout shift — always provide `width` and `height` for images or use `fill` with a sized container
- Turbopack is the default dev bundler in Next.js 16 (`next dev`) — no flag required
