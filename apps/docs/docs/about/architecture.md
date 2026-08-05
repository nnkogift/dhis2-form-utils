# Architecture

`dhis2-form-utils` is organized as a monorepo with three layers. Each layer depends only on the
layers below it, keeping concerns cleanly separated and every package independently publishable.

![DHIS2 Form Utils monorepo package architecture — three layers: core utilities at the bottom, headless hooks in the middle, UI adapters at the top, with Storybook above](/img/architecture-diagram.svg)

`@nnkogift/dhis2-form-utils-devtools` (optional, dev-only) attaches directly to a `FormStore`
instance from the hooks layer — see [Rule devtools design](./rule-devtools-design.md).

All internal packages reference each other via the workspace protocol
(`"@nnkogift/dhis2-form-utils-hooks": "workspace:*"`). `@dhis2/app-runtime` and
`@dhis2/rule-engine` are peer dependencies — never bundled — so the host application controls
their versions and the library stays in lockstep with whatever DHIS2 runtime the app already
ships.

## Layer 3 — Core utilities

### `@nnkogift/dhis2-form-utils-rules`

`@dhis2/rule-engine` — the same engine used by Tracker Capture, Event Capture, and the Android
app — handles expression parsing, variable resolution, and priority ordering. It returns a flat
list of `RuleEffect` objects; it does not address how that output integrates into a React form
lifecycle. `@nnkogift/dhis2-form-utils-rules` closes that gap:

- Translates raw `RuleEffect`s into a typed `FieldStateMap`, keyed by data element or TEA uid.
- Provides `buildRuleEngineContext` / `buildEnrollmentRuleEngineContext` to construct the engine
  context once per metadata object, outside the render loop, and `buildRuleEngine` to build the
  engine for a specific evaluation session.
- Exposes `effectHandlers` as an extension point so consuming apps can interpret non-standard
  conventions (e.g. `DISPLAYTEXT` carrying machine-readable data) without forking the library.
- Provides `filterPayload`, which strips hidden fields and substitutes assigned values from a
  form's values object before submission.

Because evaluation is built on `@dhis2/rule-engine` rather than a reimplementation, any new rule
action types or expression functions DHIS2 adds to the engine become available automatically —
no corresponding change is needed here.

### `@nnkogift/dhis2-form-utils-metadata`

Converts DHIS2 metadata objects into Zod schemas React Hook Form can consume directly, and owns
the standardized query objects and resolver functions used to fetch that metadata. This keeps
metadata _fetching_ decoupled from the form hooks — query objects and resolvers are
dependency-free exports with no React or runtime dependency beyond a type-only reference to
`Query` from `@dhis2/data-engine`.

Every exported query is a static object, never a factory function — dynamic values are supplied
through `useDataQuery(query, { variables })`, matching how `@dhis2/app-runtime` expects queries
to be defined. `programRules` and `programRuleVariables` are queried as independent, top-level
API resources filtered by `program.id` — not as nested fields under `programs` — matching how the
official DHIS2 Capture app sources the same data.

## Layer 2 — Headless hooks (`@nnkogift/dhis2-form-utils-hooks`)

Composes rules, metadata, and React Hook Form into two form-lifecycle hooks:

- **`useEventForm`** — single program stage event data entry
- **`useTrackerForm`** — tracker registration (enrollment + TEAs); see
  [Tracker form design](./tracker-form-design.md) for why this is a separate hook from
  `useEventForm` rather than one hook covering both.

Both hooks build a Zod schema and a rule engine context synchronously from caller-supplied
metadata, then wire a `FormStore` that evaluates rules reactively as form values change — see
[Form state and the reactive loop](./form-state-and-reactive-loop.md) for the full design,
including the hard "no `useEffect`, no `form.watch`" constraints that shape it.

Neither hook fetches metadata internally. The caller fetches it — directly with `useDataQuery`
and an exported query object, or via the thin convenience hooks
(`useEventProgramMetadataQuery`, `useTrackerMetadataQuery`) — and passes the resolved result in
via `options.metadata`.

## Layer 1 — UI adapters

Each adapter package (`-dhis2-ui`, `-mantine`, `-mui`) exports the same three building blocks:
`D2Field` (a dispatcher that calls `useFieldControl` and routes to the right widget by
`widgetKind`), `FormSection` (subscribes to a section's `hidden` state), and `FormFeedback`
(renders the feedback/indicator panel). Only the underlying widget implementations differ
between adapters — the rule-state contract is identical, because all three are built on the same
headless `useFieldControl` primitive. This is also what makes it possible to build a fourth,
custom adapter without touching any other layer — see
[Build a form with a custom UI adapter](../how-to/custom-ui-adapter.md).

## Configuration

- **TypeScript** — strict mode across every package, extending a shared
  `packages/config/tsconfig.base.json`. Types are derived from Zod schemas via `z.infer<>`; no
  `any`.
- **Build** — each package builds to `dist/` with `tsup`, emitting both ESM and CJS with type
  declarations.
- **Testing** — unit tests are co-located with source. `evaluateAndMap` in the rules package is a
  pure function, well suited to fixture-based testing with no DOM or network involved.
- **CI** — GitHub Actions builds once, then fans out to lint, type-check, unit-test, and
  Storybook browser tests in parallel, each downloading the shared build artifact.
