# React & Next.js Standards

## Component Architecture

### One Component, One File

Every component lives in its own file. No exceptions.

- `UserProfileCard` → `user-profile-card.tsx`
- `OrganisationUnitSelector` → `organisation-unit-selector.tsx`
- `PeriodFilter` → `period-filter.tsx`

Do not put multiple exported components in the same file. Barrel `index.ts` files are fine for re-exporting from a folder, but the implementation goes in its own file.

### Composition Over Size

Never build a large, monolithic component. If a component is getting long, ask: "What is this section _conceptually_?" and extract it.

Good signals that extraction is needed:

- A section has its own internal state that doesn't affect the rest of the component
- A section is conditionally rendered in a meaningful block
- A section could be reused somewhere else
- The JSX exceeds roughly 80–100 lines in the return

Compose at every level: page → section → feature → primitive.

```
pages/
  dashboard/
    page.tsx                      ← Thin shell, composes sections
    dashboard-header.tsx
    dashboard-summary-cards.tsx
    dashboard-chart-panel.tsx
    dashboard-data-table.tsx
```

### Component File Structure

Inside a component file, order sections consistently:

```tsx
// 1. Imports
// 2. Types / Props interface
// 3. Constants local to this component
// 4. The component function
// 5. Subcomponents used only here (if small and tightly coupled)
// 6. Default export
```

### Props

- Define props as a `type`, not `interface`, named `[ComponentName]Props`.
- Destructure props directly in the function signature.
- Keep prop lists short — if a component needs more than ~7 props, consider splitting it or using a context/store.
- Never use prop drilling more than 2 levels deep. Use context, a store, or component composition instead.

```tsx
type UserProfileCardProps = {
    userId: string;
    onSelect: (id: string) => void;
    isSelected?: boolean;
};

export function UserProfileCard({ userId, onSelect, isSelected = false }: UserProfileCardProps) {
    // ...
}
```

---

## Utilities

### Utils Have Their Own Files

Utilities used in components are not defined inline in the component or dumped into a generic `utils.ts`. They live in dedicated files named by their domain or type.

Good util file names:

- `date-utils.ts` — date formatting, diffing, parsing
- `string-utils.ts` — truncation, slugification, capitalisation
- `number-utils.ts` — formatting, rounding, currency
- `dhis2-utils.ts` — DHIS2 ID handling, period parsing, OU traversal
- `chart-utils.ts` — data transformation for charts
- `api-utils.ts` — response shaping, error normalisation
- `geo-utils.ts` — coordinate transforms, bounding boxes

Utils _can_ share a file when they are closely related and the file stays focused. `date-utils.ts` can have both `formatDate` and `parseISODate` — they belong together. But don't put `formatDate` and `formatCurrency` in the same file just because they both "format" things.

Use `lodash-es` for utility operations (array manipulation, object transforms, deep cloning, debounce, throttle, etc.) before writing your own. Import individual functions, never the full library:

```ts
import { groupBy, orderBy, uniqBy } from 'lodash-es';
```

### Hooks Are Utilities Too

Custom hooks follow the same rules:

- One hook per file
- File named `use-[name].ts`
- Hooks that fetch data use TanStack Query internally
- Hooks that manage local UI state use `useState`/`useReducer`
- Hooks that share logic across components live in a `hooks/` folder alongside the components that use them

---

## Forms

Always use `react-hook-form`. Never manage form state manually with `useState`.

Schema validation is always Zod, connected via `@hookform/resolvers/zod`.

Standard form setup:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
});

type FormValues = z.infer<typeof schema>;

export function CreateUserForm() {
    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { name: '', email: '' },
    });

    const onSubmit = form.handleSubmit((data) => {
        // data is fully typed and validated
    });

    return <form onSubmit={onSubmit}>{/* fields */}</form>;
}
```

Keep forms extracted into their own component files. A page or dialog that _contains_ a form delegates to a `[Name]Form` component, it doesn't define form logic inline.

---

## Data Fetching

Always use TanStack Query (`@tanstack/react-query`) for server state. Never `useEffect` + `useState` for fetching.

- Query keys are defined as constants, not inline strings. Keep them in a `query-keys.ts` file or co-located `[resource].keys.ts`.
- Mutations use `useMutation`.
- After a mutation succeeds, invalidate the relevant query keys.
- Abstract each resource's queries into a dedicated hook file:

```
hooks/
  use-users.ts          ← useUsers(), useUser(id)
  use-org-units.ts      ← useOrgUnits(), useOrgUnit(id)
  use-indicators.ts
```

```ts
// use-users.ts
import { useQuery } from '@tanstack/react-query';
import { userKeys } from '../query-keys';
import { fetchUsers } from '../api/users-api';

export function useUsers() {
    return useQuery({
        queryKey: userKeys.list(),
        queryFn: fetchUsers,
    });
}
```

---

## Next.js Specific

- App Router only on all new projects. No Pages Router.
- Server components by default. Add `'use client'` only when you genuinely need browser APIs, event handlers, or React hooks.
- `use cache` directive for caching (Next.js 15+), not `revalidate` exports where avoidable.
- Never fetch data in a client component that could be fetched in a server component.
- Loading and error states use `loading.tsx` and `error.tsx` at the route level.
- Co-locate route-specific components in the route folder; shared components go in `components/`.

```
app/
  dashboard/
    page.tsx
    loading.tsx
    error.tsx
    _components/          ← private to this route, prefixed with _
      dashboard-header.tsx
      dashboard-chart.tsx
components/               ← shared across routes
  ui/
  forms/
  layout/
```

## React Hooks

- Use `useCallback` and `useMemo` whenever possible
- Use `useRef` and `useState` only when absolutely necessary
- Avoid the `useEffect` hook at all costs. only use it for side effects that cannot be expressed with other hooks.
- The `useEffect` hook should always have the dependecy array.
