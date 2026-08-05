# Debugging program rules — `@dhis2-form-utils/devtools`

Optional, **dev-only** package for answering "why did this field/section/feedback change
(or not change)?" while building a form. Not part of the composed-form quick start — add it
only when actively debugging rules, and keep it out of production bundles.

```bash
pnpm add -D @dhis2-form-utils/devtools
```

```tsx
import { RuleDevtoolsScope, RulesPanel } from '@dhis2-form-utils/devtools';
import '@dhis2-form-utils/devtools/style.css'; // includes Tailwind utilities + bundled @xyflow/react graph styles
```

## Wiring

`RuleDevtoolsScope` shares one trace subscription across multiple panels — wrap it around
both the form and the panel(s):

```tsx
<FormStateProvider formStore={formStore} form={form}>
    <RuleDevtoolsScope>
        <form>{/* fields */}</form>
        <RulesPanel metadata={/* optional RuleDevtoolsMetadata for human-readable labels */} />
    </RuleDevtoolsScope>
</FormStateProvider>
```

Requires `FormStateProvider` in the tree above it (same as the form itself) — it attaches
to the running `FormStore` via `subscribeTrace`. No separate metadata fetch is needed beyond
the form's own. `FormStateProvider` already wraps React Hook Form's `FormProvider`
internally — don't add another one around the fields.

## What `RulesPanel` shows

Three tabs:

- **Rules** — catalog of every program rule from metadata (name, actions, condition),
  scope-aware selected/firing/idle/out-of-scope state.
- **Trace** — reverse-chronological log of rule evaluations.
- **Graph** — a `@xyflow/react` dependency graph built from _observed_ firings.

## Known limitation

Only rules that have actually **fired** during the session are observable in Trace/Graph —
a rule whose condition never evaluated to true leaves no trace. This is not a complete
static map of all possible rule relationships in the program; it's an observability tool
for what actually happened while you interacted with the form.

## Keep it dev-only

Mount `RuleDevtoolsScope`/`RulesPanel` behind an environment check (or simply don't import
them outside a dev/storybook entry point) — this package is explicitly documented as
"not for production form bundles."

For the full attachment model and `RuleTraceEntry` shape, read `docs/dev-tools.md` in the
source repo.
