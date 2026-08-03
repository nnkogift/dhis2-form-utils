---
name: coding-standards
description: Gift's personal coding standards, file structure conventions, and project setup rules. ALWAYS load this skill when starting a new project, scaffolding files, setting up a repo, writing new components, creating hooks, naming functions, structuring folders, composing UI, or any time code organization or architecture is involved. Also load when reviewing code for quality or consistency.
---

# Coding Standards

This skill governs how all code is written, organized, and reviewed. These are non-negotiable defaults.
For framework-specific deep dives, see the references listed at the bottom of this file.

---

## TypeScript

- Strict mode always on (`"strict": true` in tsconfig)
- No implicit `any` — ever. Use `unknown` and narrow it properly
- Prefer `type` over `interface` unless you explicitly need declaration merging
- Use Zod for all runtime validation and derive TypeScript types from schemas with `z.infer<>`
- Avoid type assertions (`as X`) unless you can justify why the compiler cannot infer it
- Enums are recommended if not possible use `const` objects with `as const` and derive union types from them
- Keep types close to where they are used; only promote to a shared `types/` folder when genuinely shared across modules

---

## Project Structure

### Monorepos

```
root/
├── apps/
│   ├── web/          # Next.js
│   └── mobile/       # Flutter
├── packages/
│   ├── ui/           # Shared component library
│   ├── config/       # Shared tsconfig, eslint config
│   └── types/        # Shared cross-app types only
├── package.json      # workspaces: ["apps/*", "packages/*"]
├── eslint.config.js
└── .prettierrc
```

- Apps live in `apps/`, shared code in `packages/`
- Bun workspaces are declared in the root `package.json` `workspaces` field — no separate workspace file
- Each package has its own `tsconfig.json` extending `packages/config/tsconfig.base.json`
- Internal packages are referenced via workspace protocol: `"@repo/ui": "workspace:*"`
- Never import across `apps/` — shared code always goes through `packages/`

### Single App (Next.js App Router)

```
src/
├── app/
│   └── (invoices)/
│       ├── page.tsx
│       └── _shared/          # private folder — excluded from routing
│           ├── components/
│           ├── hooks/
│           ├── utils/
│           ├── schemas/
│           └── types/
├── shared/           # Cross-route shared code — promoted from _shared when used across routes
│   ├── components/
│   │   └── ui/       # Primitive UI components (buttons, inputs, etc.)
│   ├── hooks/
│   ├── utils/
│   ├── schemas/
│   └── types/
├── lib/              # Third-party client setup (queryClient, axios instance, etc.)
└── constants/        # App-wide constants
```

- No standalone `src/hooks/`, `src/utils/`, or `src/types/` folders — everything global lives under `src/shared/`

---

## Component Rules (React / Next.js)

These rules are strict. Follow them on every component you write or touch.

### One Component Per File

- Every component lives in its own file. No exceptions.
- File name matches the component name in `PascalCase`: `UserCard.tsx`, `InvoiceTable.tsx`
- If a component is only used by one parent, co-locate it in a `components/` subfolder beside the parent rather than at
  the global level

### Composition Over Monoliths

- If a component exceeds ~150 lines of JSX, it must be decomposed
- Extract logical sections into named sub-components: `<InvoiceHeader />`, `<InvoiceLineItems />`, `<InvoiceTotals />`
- Prefer using context for passing down data to child components unless it is not deeply nested enough to warrant
  passing it explicitly
- Use compound component patterns for UI that shares implicit state (tabs, accordions, dropdowns)
- When in doubt, split it out — small focused components are always preferable to large ones
- Always use the specified design system components unless instructed otherwise avoid updating the component styles
  directly, use component-available props, if not possible, use tailwind if available

### Feature Modules

#### Next.js (App Router)

Use Next.js private folders (`_shared`) co-located with routes. The `_` prefix is an official Next.js
convention — the folder and all its subfolders are excluded from the routing system entirely.

```
src/
├── app/
│   └── (invoices)/
│       ├── page.tsx
│       ├── [id]/
│       │   ├── page.tsx
│       │   └── _shared/              # scoped to this route only
│       │       └── components/
│       │           └── InvoiceDetail.tsx
│       └── _shared/                  # shared across invoices routes
│           ├── components/
│           │   ├── InvoiceTable.tsx
│           │   ├── InvoiceRow.tsx
│           │   └── InvoiceFilters.tsx
│           ├── hooks/
│           │   ├── useInvoices.ts    # TanStack Query hook
│           │   └── useInvoiceForm.ts
│           ├── utils/
│           │   └── invoice.utils.ts
│           ├── schemas/
│           │   └── invoice.schema.ts
│           └── types/
│               └── invoice.types.ts
└── shared/                           # promoted here when used across multiple routes
    └── components/
        └── CurrencyDisplay.tsx
```

- Place `_shared/` as close as possible to the route that uses it
- Nest as deep as the route hierarchy demands
- Create sub-folders (`components/`, `hooks/`, `utils/`, `schemas/`, `types/`, `constants/`) on demand — don't pre-scaffold empty ones
- No barrel `index.ts` files inside `_shared/` — always import from the exact file path
- Promote to `src/shared/` only when code spans multiple routes
- `src/shared/` follows the same on-demand sub-folder composition; no barrel exports there either

#### Other React apps / DHIS2 web apps

Use a `modules/` folder at `src/` level. Cross-module shared code promotes to `src/shared/` — same convention as Next.js apps.

```
src/
├── modules/
│   └── invoices/
│       ├── components/
│       ├── hooks/
│       ├── utils/
│       ├── schemas/
│       └── types/
└── shared/           # promoted here when used across multiple modules
    ├── components/
    │   └── ui/
    ├── hooks/
    ├── utils/
    ├── schemas/
    └── types/
```

Rename any existing `features/` directory to `modules/`.

### Server vs Client Components (Next.js App Router)

- Server components by default — never add `"use client"` unless the component needs browser APIs, event handlers, or
  React state/effects
- Push `"use client"` as far down the tree as possible (leaf components, not layouts)
- Data fetching happens in Server Components or via TanStack Query in Client Components — never both in the same
  component
- Never fetch data in a layout unless it is truly layout-level data (user session, nav config)

---

## Utility Rules

- Utils live in `utils/` at the closest scope that covers their usage
- Group utils by domain, not by type: `date.utils.ts`, `currency.utils.ts`, `dhis2.utils.ts`
- Utils that only serve one component live in that component's folder
- Utils that serve multiple components in a route/module live in that route's `_shared/utils/` (Next.js) or `modules/<name>/utils/` (other React apps)
- Utils used across routes/modules live in `src/shared/utils/`
- Multiple utils of the same domain can share a file as long as it remains cohesive and focused
- Use `lodash-es` for collection manipulation, debouncing, deep clones, and object transforms — do not reimplement what
  lodash already does well
- Every util function is pure unless it explicitly needs a side effect (must be documented if so)
- Export utils as named exports, never default exports

---

## Forms

- All forms use `react-hook-form` — no uncontrolled inputs, no manual `useState` for field values
- Schema validation always via Zod integrated with RHF using `@hookform/resolvers/zod`
- The Zod schema is the single source of truth: define it first, derive the TypeScript type from it, pass it to
  `useForm`
- Extract form logic into a custom hook: `useInvoiceForm.ts`, `useLoginForm.ts`
- Form components receive the form methods as props or via context — they do not own the form state themselves
- Field-level error messages come from Zod via RHF — never hardcoded strings in JSX
- Always use `FormProvider` to provide the form context to the entire form tree. Dont pass down control as a prop.
- If a field has properties or visibility depending on a different form value, extract it into its own component, use
  the `useWatch` hook to listen to the dependency value.

```ts
// Pattern to follow always
const schema = z.object({ email: z.string().email() });
type FormValues = z.infer<typeof schema>;

const useLoginForm = () => {
    return useForm<FormValues>({ resolver: zodResolver(schema) });
};
```

---

## Data Fetching

- All server state is managed by TanStack Query (`@tanstack/react-query`) — no raw `useEffect` for fetching
- Query keys are defined as typed constants in a `queryKeys.ts` file inside the module's `constants/` folder: `_shared/constants/queryKeys.ts` (Next.js) or `modules/<name>/constants/queryKeys.ts` (other apps); promote to `src/shared/constants/` only when keys are shared across modules
- Every query lives in a dedicated hook: `useInvoices.ts`, `usePatientById.ts`
- Mutations follow the same pattern with `useMutation` and always include `onError` handling
- Never put TanStack Query logic directly inside a component — always a hook

```ts
// queryKeys.ts — pattern to always follow
export const invoiceKeys = {
    all: ['invoices'] as const,
    list: (filters: InvoiceFilters) => [...invoiceKeys.all, 'list', filters] as const,
    detail: (id: string) => [...invoiceKeys.all, 'detail', id] as const,
};
```

---

## API Design

- REST for CRUD, flat resource URLs: `/invoices`, `/invoices/:id/lines`
- Consistent error response shape across all endpoints:
    ```ts
    { error: string; code: string; details?: unknown }
    ```
- All request bodies validated with Zod before any business logic runs
- Never trust client input downstream of the validation boundary

---

## Git

- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- PR descriptions explain the _why_, not the _what_ — the diff shows the what
- Branch naming: `feature/`, `fix/`, `chore/`, `refactor/`
- Commits are atomic — one logical change per commit
- Delete merged branches immediately

---

## General Rules

- No magic numbers — extract to named constants with clear names
- Functions do one thing. If you need "and" to describe it, split it into two functions
- Delete commented-out code — git history exists for a reason
- All async functions handle errors explicitly. No silent catch blocks, no swallowed rejections
- No `console.log` left in committed code — use a proper logger or remove it
- Avoid deeply nested conditionals — use early returns and guard clauses

---

## References

Read these when working in a specific context:

- `references/nextjs.md` — Next.js App Router patterns, caching, server actions
- `references/flutter.md` — Flutter project structure, state management, offline-first patterns
- `references/dhis2.md` — DHIS2 API conventions, data store patterns, UI library usage, and app platform bootstrapping
- `../forming/SKILL.md` — Full form architecture: react-hook-form + zod patterns, field arrays, server errors, validation modes
