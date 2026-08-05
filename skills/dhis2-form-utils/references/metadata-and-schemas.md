# Metadata and schemas — `@dhis2-form-utils/metadata`

Converts DHIS2 metadata into the shapes `@dhis2-form-utils/hooks` and the UI adapters
consume, and generates the Zod schemas used for validation.

## Event program metadata

```ts
import { useDataQuery } from '@dhis2/app-runtime';
import {
    eventProgramConfigQuery,
    resolveEventProgramMetadata,
    selectProgramStage,
} from '@dhis2-form-utils/metadata';

const { data } = useDataQuery(eventProgramConfigQuery, { variables: { programId } });
const metadata = data ? resolveEventProgramMetadata(data) : undefined; // EventProgramMetadata
const stageMetadata = metadata ? selectProgramStage(metadata, programStageId) : undefined;
```

Note `eventProgramConfigQuery` is a **query descriptor object** passed to `useDataQuery`,
not a function you call with `programId` — the variable goes in `useDataQuery`'s `variables`
option instead. And `resolveEventProgramMetadata` takes just `data`, not `(data, programId)`.
This is the manual equivalent of the convenience hook `useEventProgramMetadataQuery` (see
`event-forms.md`), which wraps exactly this pattern.

## Tracker program metadata

```ts
import { trackerConfigQuery, resolveTrackerProgramMetadata } from '@dhis2-form-utils/metadata';

const { data } = useDataQuery(trackerConfigQuery, { variables: { programId } });
const metadata = data ? resolveTrackerProgramMetadata(data) : undefined; // TrackerProgramMetadata
```

Manual equivalent of `useTrackerMetadataQuery` (see `tracker-forms.md`).

## Convenience query hooks are optional

`useEventProgramMetadataQuery` / `useTrackerMetadataQuery` (from `@dhis2-form-utils/hooks`)
are thin sugar over the patterns above. `useEventForm`/`useTrackerForm` never fetch on their
own and don't call these internally — bring your own metadata however fits your app's data
layer (React Query, your own caching, etc.), as long as the shape matches
`EventProgramMetadata`/`TrackerProgramMetadata`.

## Zod schema generation

`buildSchema` (event) and `buildTrackerSchema` (tracker) are called **internally** by
`useEventForm`/`useTrackerForm` via `zodResolver` — you rarely need to call them directly
unless you're building a custom form hook outside this library's own hooks.

## Sectioned layout

`resolveFormSectionLayout` (+ `getProgramStageSectionDataElementIds`) turns
`ProgramStageSection`s into a renderable layout for `FormSection`-based UIs. See
`apps/storybook/components/ProgrammeEventForm.tsx` and `ProgrammeRegistrationForm.tsx` for
real usage building a sectioned form.

## Option groups

Needed only if program rules use `HIDEOPTIONGROUP`/`SHOWOPTIONGROUP`:

```ts
import {
    optionGroupsQuery,
    resolveOptionGroups,
    extractReferencedOptionGroupIds,
} from '@dhis2-form-utils/metadata';
```

Fetch the referenced option groups, resolve them into an `OptionGroupCodeMap`, and pass that
map as `options.optionGroups` to `useEventForm`/`useTrackerForm`.

## Types (verified against `packages/metadata/src/index.ts`)

`EventProgramMetadata`, `TrackerProgramMetadata`, `ProgramStageMetadata`,
`ProgramStageDataElement`, `ProgramStageSection`, `ProgramStageSectionDataElement`,
`ProgramTrackedEntityAttribute`, `ProgramRule`, `ProgramRuleAction`, `ProgramRuleVariable`,
`ProgramConstant`, `ExpandedProgramRule`, `ExpandedProgramRuleAction`, `FormSectionLayout`,
`SectionWithItems`.

## Why `@dhis2/api-types` v43

Domain types are built on the official OpenAPI-generated `@dhis2/api-types` package rather
than hand-rolled types, except where the rule-evaluation runtime needs its own shapes. See
`docs/adr/api-types.md` for the full rationale and when local extension is appropriate.
