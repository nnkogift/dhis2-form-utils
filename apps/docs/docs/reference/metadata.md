# `@nnkogift/dhis2-form-utils-metadata`

Converts DHIS2 metadata (programs, program stages, data elements, tracked entity attributes,
option sets) into Zod schemas React Hook Form can consume via `@hookform/resolvers/zod`, and owns
the standardized query objects + resolvers used to fetch that metadata.

## Schema builders

```ts
function buildSchema(metadata: ProgramStageMetadata): z.ZodObject<z.ZodRawShape>;
function buildTrackerSchema(metadata: TrackerProgramMetadata): z.ZodObject<z.ZodRawShape>;
```

`buildSchema` is used by `useEventForm`; `buildTrackerSchema` by `useTrackerForm`. Event schemas
use coercion (raw API strings → typed values); tracker schemas use string validators, since
tracker form values are flat strings end to end (matching the Tracker API's attribute value
shape). Each DHIS2 `valueType` maps to a Zod validator — `TEXT`/`LONG_TEXT` → `z.string()`,
`INTEGER` → `z.number().int()` with `Number()` coercion, `BOOLEAN` → `z.boolean()`,
`ORGANISATION_UNIT` → an 11-character uid string, and so on.

`buildTrackerSchema` includes `occurredAt` in the schema only when
`metadata.displayIncidentDate` is `true` — it's conditionally _absent_, not present-but-optional.

## Types

```ts
type EventProgramMetadata = {
    /* full program, all stages, rules, rule variables */
};
type ProgramStageMetadata = {
    id: string;
    programStageDataElements: ProgramStageDataElement[];
    programStageSections?: ProgramStageSection[];
};
type ProgramStageDataElement = { dataElement: DataElementRef /* ...mandatory, sortOrder, etc. */ };
type ProgramRule = {
    id: string;
    condition: string;
    programRuleActions: ProgramRuleAction[]; /* ... */
};
type ProgramRuleAction = {
    /* action type, target, expression */
};
type ProgramRuleVariable = {
    /* rule variable definition */
};
type ProgramConstant = { id: string; value: string };

type TrackerProgramMetadata = {
    id: string;
    displayName: string;
    trackedEntityType: { id: string };
    displayIncidentDate: boolean;
    selectEnrollmentDatesInFuture: boolean;
    selectIncidentDatesInFuture: boolean;
    programTrackedEntityAttributes: ProgramTrackedEntityAttribute[];
    programRules: ExpandedProgramRule[];
    programRuleVariables: ProgramRuleVariable[];
    programSections?: Array<{ id: string; trackedEntityAttributes: Array<{ id: string }> }>;
};
type ExpandedProgramRule = {
    id: string;
    condition: string;
    priority?: number;
    name?: string;
    programRuleActions: ExpandedProgramRuleAction[];
};
type ExpandedProgramRuleAction = {
    /* trackedEntityAttribute-targeted variant of ProgramRuleAction */
};
```

All types are derived from `@dhis2/api-types` — no DHIS2 API shapes are hand-written. See
[Tracker form design](../about/tracker-form-design.md) for the full rationale behind
`TrackerProgramMetadata`'s shape.

## Metadata helpers

```ts
function selectProgramStage(
    metadata: EventProgramMetadata,
    programStageId: string
): ProgramStageMetadata | undefined;

function filterEventProgramRules(
    metadata: EventProgramMetadata,
    programStageId: string
): ProgramRule[];
function filterEventProgramRuleVariables(
    metadata: EventProgramMetadata,
    programStageId: string
): ProgramRuleVariable[];

function getProgramStageSectionDataElementIds(section: ProgramStageSection): string[];
function resolveFormSectionLayout(metadata: ProgramStageMetadata): FormSectionLayout;
```

## Queries and resolvers

Query objects are plain, static `Query` objects for `@dhis2/app-runtime`'s `useDataQuery` — never
factory functions. Dynamic values are supplied via `useDataQuery(query, { variables })`.

```ts
const eventProgramConfigQuery: Query; // for useEventForm
const trackerConfigQuery: Query; // for useTrackerForm

function resolveEventProgramMetadata(raw: RawEventProgramConfigResult): EventProgramMetadata;
function resolveTrackerProgramMetadata(raw: RawTrackerConfigResult): TrackerProgramMetadata;
```

```tsx
import { useDataQuery } from '@dhis2/app-runtime';
import {
    eventProgramConfigQuery,
    resolveEventProgramMetadata,
} from '@nnkogift/dhis2-form-utils-metadata';

const { data } = useDataQuery(eventProgramConfigQuery, { variables: { programId } });
const metadata = data ? resolveEventProgramMetadata(data) : undefined;
```

Resolvers never throw and never inspect `useDataQuery`'s `error` — an empty `programRules: []` is
a valid state, not an error condition. Error handling stays entirely with `useDataQuery`.

### Option groups (for `HIDEOPTIONGROUP`)

```ts
const optionGroupsQuery: Query;
function extractReferencedOptionGroupIds(
    metadata: EventProgramMetadata | TrackerProgramMetadata
): string[];
function resolveOptionGroups(raw: RawOptionGroupsResult): OptionGroupCodeMap;
type OptionGroupCodeMap = Record<string /* optionGroupId */, string[] /* member option codes */>;
```

Resolving which option codes belong to a `HIDEOPTIONGROUP`-hidden group requires a separate
`optionGroups` API fetch — it's not included in the standard program/stage queries. Fetch it only
when a program actually uses `HIDEOPTIONGROUP`/`SHOWOPTIONGROUP`, and pass the result as the
`optionGroups` option to `useEventForm`/`useTrackerForm`.

### Extending queries

```ts
function withExtraFields(base: string[], extra?: string[]): string[];

const PROGRAM_STAGE_FIELDS: string[];
const PROGRAM_RULE_FIELDS: string[];
const PROGRAM_RULE_VARIABLE_FIELDS: string[];
const PROGRAM_TEA_FIELDS: string[];
const CONSTANT_FIELDS: string[];
const EVENT_PROGRAM_FIELDS: string[];
const DATA_ELEMENT_REF_FIELDS: string[];
const PROGRAM_STAGE_DATA_ELEMENT_FIELDS: string[];
const PROGRAM_STAGE_CORE_FIELDS: string[];
const PROGRAM_TRACKED_ENTITY_ATTRIBUTE_FIELDS: string[];
```

Compose a custom query by spreading an exported one and overriding just the resource you need:

```ts
import {
    eventProgramConfigQuery,
    PROGRAM_RULE_FIELDS,
    withExtraFields,
} from '@nnkogift/dhis2-form-utils-metadata';

const customQuery = {
    ...eventProgramConfigQuery,
    programRules: {
        ...eventProgramConfigQuery.programRules,
        params: ({ programId }: { programId: string }) => ({
            fields: withExtraFields(PROGRAM_RULE_FIELDS, ['programRuleActions[displayContent]']),
            filter: `program.id:eq:${programId}`,
        }),
    },
};
```

## Enums and misc

```ts
enum ProgramRuleActionType {
    HIDEFIELD,
    HIDESECTION,
    ASSIGN,
    SHOWWARNING /* ... */,
}
enum ProgramRuleVariableSourceType {
    DATAELEMENT_NEWEST_EVENT_PROGRAM_STAGE,
    TEI_ATTRIBUTE /* ... */,
}

function joinMultiTextValue(values: string[]): string;
function parseMultiTextValue(value: string): string[];
```
