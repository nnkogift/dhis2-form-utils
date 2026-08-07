# `@nnkogift/dhis2-form-utils-hooks`

Composes `@nnkogift/dhis2-form-utils-rules`, `@nnkogift/dhis2-form-utils-metadata`, and React Hook
Form into form lifecycle hooks and per-field control. Every hook in this package must render
inside a `@dhis2/app-runtime` `Provider`.

## Form hooks

### `useEventForm`

Single tracker event / program stage data entry.

```ts
function useEventForm<FormValue extends DefaultFormValue = DefaultFormValue>(args: {
    options: UseEventFormOptions;
    formOptions?: Omit<Parameters<typeof useForm<FormValue>>[0], 'resolver'>;
}): UseEventFormReturn<FormValue>;

type UseEventFormOptions = {
    programStageId: string;
    metadata: EventProgramMetadata;
    effectHandlers?: EffectHandlersMap;
    enrollment?: { metadata: TrackerProgramMetadata; values: Record<string, unknown> };
    events?: RuleEventInput[];
    supplementaryData?: RuleSupplementaryDataInput;
    optionGroups?: OptionGroupCodeMap;
};

type UseEventFormReturn<FormValue> = {
    form: UseFormReturn<FormValue>;
    formStore: FormStore;
};
```

`metadata`, `enrollment`, `events`, and `supplementaryData` are compared by reference only — keep
them stable across renders (e.g. from a query result, not recreated inline) to avoid unnecessary
`FormStore` re-initialization.

### `useTrackerForm`

Tracked entity registration (enrollment + TEAs). Does not cover the first program stage's data
entry — see [Set up a tracker registration form](../how-to/tracker-registration-form.md).

```ts
function useTrackerForm<FormValue extends DefaultFormValue = DefaultFormValue>(args: {
    options: UseTrackerFormOptions;
    formOptions?: Omit<Parameters<typeof useForm<FormValue>>[0], 'resolver'>;
}): UseTrackerFormReturn<FormValue>;

type UseTrackerFormOptions = {
    programId: string;
    metadata: TrackerProgramMetadata;
    effectHandlers?: EffectHandlersMap;
};

type UseTrackerFormReturn<FormValue> = {
    form: UseFormReturn<FormValue>;
    formStore: FormStore;
};
```

Both hooks return the same `{ form, formStore }` shape — `form` is a standard React Hook Form
instance (Zod resolver already wired), `formStore` owns rule evaluation and exposes
`formStore.fieldStore` / `formStore.nonFieldStore` for state reads.

## Convenience query hooks

Optional — neither is called internally by `useEventForm`/`useTrackerForm`. Skip them and fetch
with `useDataQuery` + a resolver directly if you need more control.

```ts
function useEventProgramMetadataQuery(programId: string): UseEventProgramMetadataQueryResult;
function useTrackerMetadataQuery(programId: string): UseTrackerMetadataQueryResult;
function useOrganisationUnitsQuery(roots?: string[]): UseOrganisationUnitsQueryResult;

type UseOrganisationUnitsQueryResult = {
    organisationUnits: OrgUnitNode[]; // flattened list under `roots` (id, displayName, ancestors)
    roots: string[]; // effective roots — `roots` param, or resolved from `me` when omitted
    loading: boolean;
    error: Error | undefined;
};
```

`useOrganisationUnitsQuery` is the default data source for `D2OrgUnitField` (the `orgUnit` widget)
in all three UI adapters — when no `OrgUnitPickerProvider` ancestor is present, it falls back to
the logged-in user's data-capture organisation units.

## Provider and context

```ts
function FormStateProvider(props: FormStateProviderProps): JSX.Element;
function useFormStateContext(): FormStateContextValue;
function useFormStore(): FormStore;
```

`FormStateProvider` wraps React Hook Form's `FormProvider` internally — render it once per form,
directly around the fields, and don't render RHF's `FormProvider` separately.

## Per-field / per-section / feedback hooks

```ts
function useFieldState(fieldId: string): FieldState | undefined;
function useSectionState(sectionId: string): SectionState | undefined;
function useFormFeedback(): FeedbackMap;
```

Each is a `useSyncExternalStore` subscription scoped to a single field, section, or the feedback
map — a component only re-renders when the slice it reads actually changes. See
[Form state and the reactive loop](../about/form-state-and-reactive-loop.md) for why this
matters.

## Field control (for building custom UI adapters)

```ts
function useFieldControl(input: FieldControlInput): FieldControlReturn;

type FieldControlInput =
    | { kind: 'dataElement'; config: ProgramStageDataElement }
    | { kind: 'trackedEntityAttribute'; config: ProgramTrackedEntityAttribute };

type FieldControlReturn = {
    fieldId: string;
    fieldConfig: FieldConfig; // id, label, valueType, required, optionSet, ...
    widgetKind: WidgetKind; // 'text' | 'number' | 'boolean' | 'select' | 'date' | ...
    field: ControllerRenderProps; // React Hook Form field props (value, onChange, onBlur, ...)
    fieldState: ControllerFieldState;
    isHidden: boolean;
    isDisabled: boolean;
    isMandatory: boolean;
    hasWarning: boolean;
    hasError: boolean;
    warningMessage?: string;
    errorMessage?: string;
    visibleOptions?: ReadonlyArray<{ id: string; code: string; label: string }>;
};

type WidgetProps = { control: FieldControlReturn };
```

`useFieldControl` is what every shipped UI adapter's `D2Field` calls internally — see
[Build a form with a custom UI adapter](../how-to/custom-ui-adapter.md).

Supporting exports:

```ts
function resolveWidgetKind(fieldConfig: FieldConfig): WidgetKind;
function buildFieldSchema(fieldConfig: FieldConfig): ZodTypeAny;
function resolveFieldValidation(control: FieldControlReturn): {
    validationText?: string;
    hasError: boolean;
    hasWarning: boolean;
};
function joinMultiTextValue(values: string[]): string;
function parseMultiTextValue(value: string): string[];
function computeAgeFromDob(dob: string): number | undefined;
```

### Org unit / file upload support

```ts
function useFileResourceUpload(): UseFileResourceUploadReturn;

type FileResourceUploadResult = { id: string; name: string };
type UseFileResourceUploadReturn = {
    upload: (file: File) => Promise<FileResourceUploadResult>;
    uploading: boolean;
    error: Error | undefined;
};

function OrgUnitPickerProvider(props: { roots?: string[]; children: ReactNode }): JSX.Element;
function useOrgUnitPickerContext(): OrgUnitPickerContextValue | undefined;

type OrgUnitPickerContextValue = { roots?: string[] };
```

`useFileResourceUpload` wraps `useDataMutation` to POST a `File` to `fileResources` and resolve the
created resource's `id`/`name` — used by the `file`/`image` widgets. `OrgUnitPickerProvider` is
optional; wrap it around a form (or higher) to scope the `orgUnit` widget's picker to specific root
organisation units instead of the logged-in user's default data-capture org units.

## Rule trace (for devtools)

```ts
function useRuleEffectTrace(): RuleEffectTrace;
function useFieldRuleEffect(fieldId: string): RuleEffectTrace | undefined;
function useSectionRuleEffect(sectionId: string): RuleEffectTrace | undefined;

type RuleTraceEntry = {
    /* see @nnkogift/dhis2-form-utils-devtools */
};
function buildTraceEntry(changedFields: string[], effects: RuleEffect[]): RuleTraceEntry;
```

These back `@nnkogift/dhis2-form-utils-devtools` — most consuming apps never call them directly.

## Low-level store primitives

Exposed for advanced use (custom devtools, testing) — most consumers never touch these directly:

```ts
class FormStore {
    /* owns fieldStore + nonFieldStore, wires form.subscribe */
}
function createFieldStateStore(): FieldStateStore;
function createNonFieldStateStore(): NonFieldStateStore;
function evaluateFormState(...args): FormStateSnapshot;
function stableMap<T>(prev: T, next: T): T;
```

## Re-exported types

For convenience, `@nnkogift/dhis2-form-utils-hooks` re-exports several types originating in
`@nnkogift/dhis2-form-utils-metadata`: `ExpandedProgramRule`, `ExpandedProgramRuleAction`,
`EventProgramMetadata`, `TrackerProgramMetadata`.
