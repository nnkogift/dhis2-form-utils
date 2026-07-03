# Rule Devtools — Architecture

## Purpose

A developer-facing tool that answers, for any running `dhis2-form-utils` form:
**"why did this field/section/feedback area just change, and what else has this rule affected?"**

Two views, driven by one data source:

- **Trace timeline** — a reverse-chronological log of every evaluation cycle: which field(s) changed, which rules fired, what effects they produced.
- **Dependency graph** — a node/edge visualization of fields, sections, feedback areas, and the rules connecting them, built up from what's actually been observed.

Ships as a new package, `@dhis2-form-utils/devtools`, attached directly to a running form's `FormStore` via a side panel.

---

## 1. Attachment model

`FormStore` already holds all form state at any given time — current field/section/feedback snapshots, and, with one internal addition (§3), the full effect-and-source-rule detail from every evaluation cycle. The devtool attaches directly to a `FormStore` instance and derives everything — timeline and graph — from what it streams and holds. There is no separate metadata input and no parsing of rule definitions.

One consequence worth stating plainly: the graph only shows relationships that have actually fired during the session. It is a picture of what has been observed, not a complete map of what's possible — the same honest limitation the trace timeline has for the same underlying reason (§2).

---

## 2. The fact this design hinges on

Verified directly against the installed `@dhis2/rule-engine` (v3.8.1) type declarations:

```ts
export declare class RuleEffectJs {
    constructor(ruleId: string, ruleAction: RuleActionJs, data?: Nullable<string>);
    get ruleId(): string;
    get ruleAction(): RuleActionJs;
    get data(): Nullable<string>;
}
```

Every effect returned by `engine.evaluateEvent()` / `evaluateEnrollment()` carries the `ruleId` that produced it. `FormStore` already receives this on every evaluation cycle.

**Standing limitation:** the engine returns _effects_, not a full evaluation log — a rule whose condition was `false` produces nothing and leaves no trace anywhere. Both the timeline and the graph only ever show rules that have fired at least once. There's no way around this without a different engine API; the devtool's own empty-state UI should say so plainly ("no rules observed yet — interact with the form") rather than imply completeness.

---

## 3. `FormStore` changes (additive, non-breaking, entirely internal)

`FormStore` grows a small internal subscription surface — the same pattern it already uses for `fieldStore`/`nonFieldStore`, applied to trace data:

```ts
type RuleTraceEntry = {
    id: string; // per-cycle id
    timestamp: number;
    changedFields: string[]; // fields that triggered this evaluation cycle
    ruleResults: Array<{
        ruleId: string;
        effects: Array<{
            type: EffectType; // ASSIGN | HIDEFIELD | HIDESECTION | SHOWWARNING | ...
            targetId: string; // field id / section id / feedback key
            data?: string | null;
        }>;
    }>;
};

class FormStore {
    // ...existing fieldStore, nonFieldStore...

    private traceListeners = new Set<(entry: RuleTraceEntry) => void>();

    subscribeTrace(listener: (entry: RuleTraceEntry) => void): () => void {
        this.traceListeners.add(listener);
        return () => this.traceListeners.delete(listener);
    }

    // inside the existing debounced evaluate(), alongside the existing
    // fieldStore.setState(...) / nonFieldStore.setState(...) calls:
    private maybeEmitTrace(changedFields: string[], effects: RuleEffectJs[]) {
        if (this.traceListeners.size === 0) return; // no-op when nobody's attached
        const entry = buildTraceEntry(changedFields, effects); // groups effects by ruleId
        for (const listener of this.traceListeners) listener(entry);
    }
}
```

Attaching at the store level rather than threading a prop through hook options means devtools works with any hook built on `FormStore` — `useEventForm`, `useTrackerForm`, and any future hook — with zero changes to those hooks' public APIs. Neither hook needs to know devtools exists. The `traceListeners.size === 0` check keeps this a genuine no-op — no trace object is even constructed — when nothing is attached, so production forms pay nothing for this existing.

---

## 4. Devtools package

```
apps/playground
      │
      ▼
@dhis2-form-utils/devtools   ◄── NEW, optional, dev-only
      │
      ▼
@dhis2-form-utils/hooks       (needs only FormStore + RuleTraceEntry types)
```

`devtools` depends on `hooks` for types only — no dependency on `@dhis2-form-utils/metadata` or `@dhis2/api-types`.

```ts
// devtools/src/attach.ts
function attachRuleDevtools(
    formStore: FormStore,
    options?: { maxEntries?: number }
): RuleTraceStore {
    const store = createRuleTraceStore(options?.maxEntries ?? 200);
    store.dispose = formStore.subscribeTrace(store.record);
    return store;
}
```

```ts
// devtools/src/traceStore.ts — same useSyncExternalStore pattern as FieldStateStore
function createRuleTraceStore(maxEntries: number): RuleTraceStore;
// .record(entry)      — called by FormStore via subscribeTrace
// .getSnapshot()       — ring buffer, newest last, bounded to maxEntries
// .subscribe(listener)
// .dispose()            — unsubscribe from FormStore, call on panel unmount
```

Bounded ring buffer (default 200) avoids unbounded memory growth in a long dev session. In-memory only — no persistence, no browser storage; there's no reason a devtool needs to survive a page reload.

`attachRuleDevtools` and `createRuleTraceStore` are internal to the `devtools` package — called once, inside `RuleDevtoolsPanel` itself (§5), not exported for consuming apps to wire up by hand.

---

## 5. Wiring in a consuming app

`RuleDevtoolsPanel` takes **no props**. It reads `FormStore` from context and owns its trace store internally:

```tsx
const { form, formStore } = useEventForm({ options });

return (
    <FormStateProvider formStore={formStore} form={form}>
        <FormProvider {...form}>{/* ...form fields... */}</FormProvider>
        <RuleDevtoolsPanel />
    </FormStateProvider>
);
```

This works because `FormStateProvider` already receives the `formStore` instance as a prop. Exposing it through context via a `useFormStore()` hook — alongside the existing `useFieldState` / `useSectionState` / `useFormFeedback` — is a small, additive addition to `FormStateContext`.

```tsx
// devtools/src/RuleDevtoolsPanel.tsx
function RuleDevtoolsPanel() {
    const formStore = useFormStore(); // from @dhis2-form-utils/hooks context
    const traceStore = useMemo(() => attachRuleDevtools(formStore), [formStore]);

    useEffect(() => () => traceStore.dispose(), [traceStore]);

    // reads traceStore for the timeline/graph, and formStore (via useFieldState /
    // useSectionState / useFormFeedback) to annotate graph nodes with current values
}
```

The panel creating and disposing its own trace store — rather than the consuming app doing it and passing both stores down as props — keeps the integration to a single `<RuleDevtoolsPanel />` line, and means nothing about attaching or cleaning up the trace subscription leaks into application code. The `useEffect` here is inside the `devtools` package's own React component, not inside `dhis2-form-utils/hooks` — the library's hard constraint (no `useEffect` for subscriptions) governs the core store-wiring code in `hooks`, not a devtools UI component built on top of it.

---

## 6. Dependency graph — cumulative, observed

Built entirely from the `RuleTraceEntry` stream, accumulated over the session:

- On each new trace entry, for each `ruleResult`: add/reuse a rule-node keyed by `ruleId`; add/reuse field/section/feedback nodes for `changedFields` (as "read by" edges into the rule) and for each effect's `targetId` (as an edge out of the rule, labeled by effect type).
- Edges are deduplicated by `(source, ruleId, target, effectType)` — repeated firings strengthen an existing edge rather than duplicating it. Edge thickness or a fire-count badge is a natural cheap addition here.
- The graph is empty until the user interacts with the form. The UI states this plainly rather than implying a complete picture (§2).

**Rule labeling:** rules are labeled by `ruleId` by default. An optional, decorative-only prop covers the common case where a human-readable name is wanted:

```ts
<RuleDevtoolsPanel
    resolveRuleName={(ruleId) => programStageMetadata.programRules.find(r => r.id === ruleId)?.name}
/>
```

`resolveRuleName` is the one optional prop the panel accepts — everything required to function (`FormStore`, the trace store) is read internally via `useFormStore()`, per §5. Naming stays strictly optional and cosmetic — the graph and timeline are fully functional without it.

Clicking a trace-timeline entry highlights the exact rule-node and edges that entry contributed, since they're already in the same accumulated graph.

---

## 7. UI shell — side panel

- `<RuleDevtoolsPanel>` — persistent side panel (not a floating overlay), toggle button, resizable width, two tabs: **Trace** and **Graph**.
- Graph rendered with **`@xyflow/react`** (v12.11.1, current — verified against npm: the package was renamed from `reactflow` in v12, `ReactFlow` is now a named import, and a separate stylesheet import is required).
- This is the one new runtime dependency in this design, scoped entirely to the optional `devtools` package — never imported by `hooks`, never in a production form bundle.

---

## 8. Resolved decisions (v1)

1. **`@xyflow/react` outside core no-new-deps rule** — confirmed. Scoped to optional `devtools` package only; never imported by `hooks` or `rules`.
2. **`subscribeTrace()` + `useFormStore()`** — implemented. Trace emission is a no-op when no listeners are attached.
3. **Ring buffer** — default 200 entries; overridable via internal `attachRuleDevtools({ maxEntries })`.
4. **`resolveRuleName`** — included in v1; playground wires it from `program.programRules`.
5. **`useTrackerForm`** — no special handling; same `FormStore` attach point.

---

## 9. On the horizon (not in v1)

- `useDataEntryForm` — works automatically once it exists, since attachment is at `FormStore`, not per-hook
- Time-travel: re-running a past `RuleTraceEntry`'s changed fields against the current form state
- Exporting a trace/graph session as JSON for bug reports
- Edge fire-count badges / thickness once the graph has real usage data to validate the idea against
