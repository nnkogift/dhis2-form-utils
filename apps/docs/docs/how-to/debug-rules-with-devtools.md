# Debug program rules with the devtools panel

`@nnkogift/dhis2-form-utils-devtools` is an optional, dev-only package that answers: _why did this
field/section/feedback area just change, and what else has this rule affected?_ It's not meant to
ship in a production form bundle.

```bash
pnpm add -D @nnkogift/dhis2-form-utils-devtools
```

## Wire it into a form

Wrap the form (or just the relevant part of your dev screen) in `RuleDevtoolsScope`, and render
`RulesPanel` anywhere inside it:

```tsx
import { RuleDevtoolsScope, RulesPanel } from '@nnkogift/dhis2-form-utils-devtools';
import '@nnkogift/dhis2-form-utils-devtools/style.css';

const { form, formStore } = useEventForm({ options: { programStageId, metadata } });

return (
    <FormStateProvider formStore={formStore} form={form}>
        <RuleDevtoolsScope formStore={formStore}>
            <div className="flex h-full flex-1 min-h-0">
                {/* ...your form fields... */}
                <RulesPanel metadata={{ formKind: 'event', metadata: program, programStageId }} />
            </div>
        </RuleDevtoolsScope>
    </FormStateProvider>
);
```

For a tracker registration form, pass `formKind: 'tracker'` instead:

```tsx
<RulesPanel metadata={{ formKind: 'tracker', metadata: trackerMetadata, programStages }} />
```

The `metadata` prop is optional — without it, `RulesPanel` still works, just labeling everything
by raw UID instead of display name.

## What each tab shows

- **Rules** — every program rule from metadata, with a 4-state visual accent: selected,
  firing-in-scope, idle-in-scope, or out-of-scope (relative to the stage/slot you're currently
  viewing).
- **Trace** — a reverse-chronological log of evaluation cycles: which field(s) changed, which
  rules fired, and what effects they produced.
- **Graph** — a node/edge visualization of fields, sections, and feedback areas connected by the
  rules that have actually fired during this session, built incrementally with `@xyflow/react`.

## Read the standing limitation

The rule engine only reports effects for rules whose condition evaluated `true`. A rule that never
fires leaves no trace anywhere — the Trace and Graph tabs only ever show what's been _observed_,
not a complete map of what's _possible_. Interact with every path through the form you want to
verify; an empty Graph tab does not mean "no rules exist," it means "no rules have fired yet."

## Only in development builds

Never import `@nnkogift/dhis2-form-utils-devtools` from code that ships to production — gate it
behind an environment check or a dev-only route/entry point, the same way you would any other
dev-tool panel.
