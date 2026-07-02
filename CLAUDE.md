# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
pnpm install

# Development
pnpm playground          # Start Vite playground (apps/playground)
pnpm storybook           # Start Storybook (apps/storybook)

# Build all packages + Storybook
pnpm build

# Testing
pnpm test                # All unit tests + Storybook browser tests
pnpm test:watch          # Unit tests in watch mode
pnpm --filter rules test              # Test a single package
pnpm exec vitest run utils/rules   # Also works

# End-to-end
pnpm --filter playground e2e

# Linting / formatting
pnpm lint                # ESLint + Prettier check
pnpm lint:fix            # ESLint --fix + Prettier write
pnpm typecheck           # Type-check all packages

# Per-package typecheck or build
pnpm --filter @dhis2-form-utils/hooks typecheck
pnpm --filter @dhis2-form-utils/hooks build
```

## Architecture

Three-layer monorepo. Dependency direction is strictly downward — UI adapters → hooks → rules/metadata → external peers.

```
apps/playground              # Vite dev sandbox
apps/storybook               # Storybook: component docs + browser tests
utils/
  rules/                     # @dhis2-form-utils/rules
  hooks/                     # @dhis2-form-utils/hooks
packages/
  metadata/                  # @dhis2-form-utils/metadata
  config/                    # Shared tsconfig.base.json
components/
  dhis2-ui/                  # UI adapter — @dhis2/ui
  mantine/                   # UI adapter — Mantine
  mui/                       # UI adapter — Material UI
```

### `@dhis2-form-utils/rules`

Wraps `@dhis2/rule-engine` (DHIS2's official Kotlin/JS rule engine) — never reimplements rule logic. Key exports:

- `evaluateAndMap(engine, values, effectHandlers?)` — pure function; runs the engine against current form values, folds `RuleEffect[]` into a `FieldStateMap` keyed by data element or TEA uid
- `buildRuleEngineContext` / `buildRuleEngine` — event/stage evaluation via `evaluateEvent`
- `buildEnrollmentRuleEngineContext` / `buildEnrollmentRuleEngine` — tracker registration via `evaluateEnrollment`
- `filterPayload(values, fieldState)` — strips hidden fields and substitutes ASSIGN values before submission
- `FieldStateMap` / `FieldState` — the typed shape consumed by all hooks and UI components

`effectHandlers` is an extension point for apps that reuse standard action types (e.g. `DISPLAYTEXT`) for custom widget communication.

### `@dhis2-form-utils/metadata`

Converts DHIS2 metadata into Zod schemas:

- `buildSchema(metadata)` — program stage event forms (data elements keyed by DE uid)
- `buildTrackerSchema(metadata)` — tracker registration forms (TEA fields + `orgUnit`, `enrolledAt`, conditional `occurredAt`)

Each `valueType` maps to a Zod validator. Event `buildSchema` uses coercion; tracker `buildTrackerSchema` uses string validators (form values are flat strings). The Zod schema is passed directly to `useForm` via `@hookform/resolvers/zod`.

`TrackerProgramMetadata` is the program-level metadata shape for registration (TEAs, enrollment date flags, expanded program rules).

### `@dhis2-form-utils/hooks`

Composes rules, metadata, and React Hook Form.

**Form hooks:**

- `useEventForm` — program stage event data entry (data elements, `evaluateEvent`)
- `useTrackerForm` — tracker registration only (TEAs + enrollment system fields, `evaluateEnrollment`)

```ts
const { form, formStore } = useEventForm({
    options: { programStageId, metadata, effectHandlers? },
    formOptions?, // RHF options minus resolver
});

const { form, formStore } = useTrackerForm({
    options: { programId, metadata: trackerMetadata, effectHandlers? },
    formOptions?,
});
```

Returns `{ form, formStore }`. The caller must:

1. Fetch metadata (program stage: `programStageQuery` + `useDataQuery`; tracker: caller-owned program fetch)
2. Wrap children in `FormStateProvider` + RHF `FormProvider`
3. Implement submit (e.g. `filterPayload` + `useDataMutation`)

**Tracker submission** (caller-owned): split flat values into `trackedEntities[].attributes` (TEA uids) and `enrollments[]` system fields (`orgUnit`, `enrolledAt`, optional `occurredAt`). Use `filterPayload(values, formStore.fieldStore.getSnapshot())` to strip rule-hidden TEAs. See `docs/use-tracker-form.md`.

**Companion hooks** (require `FormStateProvider`):

- `useFieldControl` — field components: metadata + RHF + rule state
- `useFieldState` — per-field rule state (lower-level)
- `useSectionState` — section visibility
- `useFormFeedback` — feedback / indicator widgets

**Reactive loop:** `buildRuleEngineContext` or `buildEnrollmentRuleEngineContext` runs once per metadata; `FormStore` subscribes to
`form.subscribe` (debounced 40ms), calls `evaluateFormState` → `evaluateAndMap`, and pushes
results into `fieldStore` and `nonFieldStore`. No `useEffect` or `form.watch` in the hooks package.

See `docs/form-state-architecture.md` for store internals.

### UI adapter packages (`dhis2-ui`, `mantine`, `mui`)

Each exports `D2Field` (dispatcher calling `useFieldControl`), `FormSection`, and `FormFeedback`.
Widgets receive `WidgetProps = { control: FieldControlReturn }` and use `resolveFieldValidation`.
Plug-and-play `EventForm` / `TrackerForm` components are planned but not yet exported.

## Key constraints

- `@dhis2/app-runtime` and `@dhis2/rule-engine` are **peer dependencies** — never bundled, always provided by the host application. All API calls go through `useDataQuery` / `useDataMutation` from `@dhis2/app-runtime`.
- All hooks require a `@dhis2/app-runtime` `Provider` in the component tree.
- TypeScript strict mode is on across all packages. Types are derived from Zod schemas via `z.infer<>`. No `any`.
- Internal packages reference each other with `"workspace:*"`.
- Each package builds with `tsup` to `dist/` as both ESM and CJS with declarations.
- Unit tests are co-located with source. `evaluateAndMap` in the rules package is a pure function and can be tested with fixture rule sets — no DOM or network needed.
- CI pipeline: `lint → type-check → unit-test → build → storybook-test / e2e` (parallel after build).
- Branch naming: `feature/`, `fix/`, `chore/`, `refactor/`. Commits: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`).
