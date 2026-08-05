# `@nnkogift/dhis2-form-utils-devtools`

Optional, dev-only rule debugging panels — trace and dependency-graph views for a running form's
`FormStore`. Not intended for production form bundles.

```bash
pnpm add -D @nnkogift/dhis2-form-utils-devtools
```

Requires the CSS bundle (includes Tailwind utilities and `@xyflow/react` graph styles):

```ts
import '@nnkogift/dhis2-form-utils-devtools/style.css';
```

## Exports

```ts
function RuleDevtoolsScope(props: RuleDevtoolsScopeProps): JSX.Element;
type RuleDevtoolsScopeProps = { formStore: FormStore; children: React.ReactNode };

function RulesPanel(props: RulesPanelProps): JSX.Element;
type RulesPanelProps = {
    metadata?:
        | { formKind: 'event'; metadata: EventProgramMetadata; programStageId: string }
        | { formKind: 'tracker'; metadata: TrackerProgramMetadata; programStages?: unknown };
};
```

`RuleDevtoolsScope` owns a single shared trace subscription (via `FormStore.subscribeTrace`) so
multiple panels can attach without duplicating evaluation-cycle listeners. `RulesPanel` reads
`FormStore` from `@nnkogift/dhis2-form-utils-hooks` context and the shared trace store from
`RuleDevtoolsScope` — both must be present in the tree above it.

`metadata` is optional and purely cosmetic: without it, rules/fields/sections are labeled by raw
UID; with it, labels resolve to display names using the same fallback chain field components use
(`displayFormName ?? displayName ?? id`).

## Label and effect-styling helpers

Used internally by `RulesPanel`, exported for building custom devtools UI on top of the same
trace data:

```ts
function createLabelLookup(metadata?: RuleDevtoolsMetadata): DevtoolsLabelLookup;
type ProgramStageRef = { id: string; displayName?: string };
type RuleDevtoolsMetadata =
    | { formKind: 'event'; metadata: EventProgramMetadata; programStageId: string }
    | { formKind: 'tracker'; metadata: TrackerProgramMetadata; programStages?: ProgramStageRef[] };

function getEffectVariant(effectType: string): EffectVisualVariant;
function getEffectVisual(effectType: string): EffectVisual;
function getEffectTagRenderProps(effectType: string): EffectTagRenderProps;
function getEffectTagRenderPropsForVariant(variant: EffectVisualVariant): EffectTagRenderProps;
function getEffectEdgeStroke(effectType: string): string;
function getEffectShortLabel(effectType: string): string;
const EFFECT_ICONS: Record<string, unknown>;
```

See [Debug program rules with the devtools panel](../how-to/debug-rules-with-devtools.md) for a
task-oriented walkthrough, and
[Rule devtools design](../about/rule-devtools-design.md) for why it's built this way —
including the standing limitation that only rules which have actually fired appear in the Trace
and Graph tabs.
