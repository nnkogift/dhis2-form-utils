# Rule devtools design

`@nnkogift/dhis2-form-utils-devtools` answers a single question for a running form: _why did this
field/section/feedback area just change, and what else has this rule affected?_ One panel, three
tabs, driven by one trace stream.

## Attachment model

`FormStore` already holds all form state at any point — current field/section/feedback
snapshots. Devtools adds one thing to it: the full effect-and-source-rule detail from every
evaluation cycle, held internally and only emitted when a listener is attached.

```ts
type RuleTraceEntry = {
    id: string;
    timestamp: number;
    changedFields: string[];
    ruleResults: Array<{
        ruleId: string;
        effects: Array<{ type: string; targetId: string; data?: string | null }>;
    }>;
};
```

`FormStore.subscribeTrace(listener)` is a no-op cost when nothing is listening — devtools
attaches directly to a running `FormStore` instance rather than requiring a separate metadata
input or its own copy of rule-parsing logic. This also means devtools works identically for
`useEventForm`, `useTrackerForm`, or any future hook built on `FormStore` — neither hook needs to
know devtools exists.

One consequence worth stating plainly: **the graph only shows relationships that have actually
fired.** The rule engine returns _effects_, not a full evaluation log — a rule whose condition
was `false` produces nothing and leaves no trace anywhere. Both the Trace tab and the Graph tab
are a picture of what's been observed, not a complete map of what's possible. There's no way
around this without a different engine API — it's a property of `@dhis2/rule-engine` itself, not
a gap in the devtools implementation.

## Why a separate package

`@xyflow/react` (the graph rendering library) is the one new runtime dependency this design
introduces — deliberately scoped to the optional `devtools` package and never imported by
`hooks` or `rules`. Keeping devtools a separate, dev-only package means it never adds weight to a
production form bundle, regardless of how sophisticated the debugging UI gets.

## The three tabs

- **Rules** — a metadata-driven catalog of every program rule for the current program: name,
  configured actions, condition expression. Each card uses a 4-state accent — selected,
  firing-in-scope, idle-in-scope, out-of-scope — computed by comparing the rule's `programStage`
  against the slot currently being viewed and cross-referencing the latest `RuleTraceEntry` for
  whether it's currently firing.
- **Trace** — a reverse-chronological log of evaluation cycles: which field(s) changed, which
  rules fired, and what effects resulted.
- **Graph** — a node/edge visualization of fields, sections, and feedback areas, built up
  incrementally from the trace stream across the session. Edges are deduplicated by
  `(source, ruleId, target, effectType)`, so repeated firings strengthen an existing edge rather
  than duplicating it.

`RuleDevtoolsScope` wraps the form and however many panels are rendered, sharing a single trace
subscription between them — so multiple devtools views don't each open their own listener on
`FormStore`.

## Labeling

Rules, fields, and sections are labeled by raw UID by default. An optional `metadata` prop
resolves display names using the same fallback chain field components use elsewhere in the
library (`displayFormName ?? displayName ?? id` for data elements, `formName ?? displayName ?? id`
for TEAs) — naming is strictly cosmetic and the panel works fully without it.

See [Debug program rules with the devtools panel](../how-to/debug-rules-with-devtools.md) for
setup instructions.
