import type {
    OptionGroupCodeMap,
    RawEventProgramConfigResult,
    RawOptionGroupsResult,
    RawTrackerConfigResult,
} from '@nnkogift/dhis2-form-utils-metadata';
import { resolveOptionGroups } from '@nnkogift/dhis2-form-utils-metadata';

/**
 * Denormalizes a full flat DHIS2 metadata-export JSON package (the shape of
 * `/api/programs/{id}/metadata.json` — top-level sibling arrays cross-referenced only by
 * `{id}`) into the `RawEventProgramConfigResult`/`RawTrackerConfigResult` shape that
 * `resolveEventProgramMetadata`/`resolveTrackerProgramMetadata` expect (the shape a live
 * `eventProgramConfigQuery`/`trackerConfigQuery` returns, where `programRuleActions` and
 * `optionSet.options` already arrive nested via DHIS2's `fields=` selector). See
 * docs/ARCHITECTURE.md for why the live query path is decomposed this way instead of using
 * the export endpoint directly.
 */

type Ref = { id: string };

type RawOption = { id: string; code?: string; name: string };
type RawOptionSet = { id: string; options?: Ref[] };
type RawOptionGroup = { id: string; name: string; options?: Ref[] };

type RawDataElement = {
    id: string;
    name: string;
    formName?: string;
    valueType: string;
    description?: string;
    optionSet?: Ref;
};

type RawTrackedEntityAttribute = {
    id: string;
    name: string;
    formName?: string;
    valueType: string;
    optionSet?: Ref;
};

type RawProgramStageDataElement = {
    id?: string;
    dataElement: Ref;
    compulsory?: boolean;
    sortOrder?: number;
};

type RawProgramStageSection = {
    id: string;
    name: string;
    sortOrder?: number;
    dataElements?: Ref[];
};

type RawProgramStage = {
    id: string;
    name: string;
    repeatable?: boolean;
    sortOrder?: number;
    programStageDataElements?: RawProgramStageDataElement[];
    programStageSections?: Ref[];
};

type RawProgramTrackedEntityAttribute = {
    id: string;
    trackedEntityAttribute: Ref;
    mandatory?: boolean;
    sortOrder?: number;
    searchable?: boolean;
    displayInList?: boolean;
    allowFutureDate?: boolean;
    renderOptionsAsRadio?: boolean;
};

type RawProgramSection = {
    id: string;
    name: string;
    sortOrder?: number;
    trackedEntityAttributes?: Ref[];
};

type RawProgramRuleAction = {
    id: string;
    programRuleActionType: string;
    priority?: number;
    content?: string;
    data?: string;
    location?: string;
    templateUid?: string;
    dataElement?: Ref;
    trackedEntityAttribute?: Ref;
    option?: Ref;
    optionGroup?: Ref;
    programStageSection?: Ref;
    programSection?: Ref;
    programStage?: Ref;
};

type RawProgramRule = {
    id: string;
    name?: string;
    condition: string;
    priority?: number;
    program: Ref;
    programStage?: Ref;
    programRuleActions?: Ref[];
};

type RawProgramRuleVariable = {
    id: string;
    name: string;
    program: Ref;
    programStage?: Ref;
    dataElement?: Ref;
    trackedEntityAttribute?: Ref;
    useCodeForOptionSet?: boolean;
    programRuleVariableSourceType: string;
    valueType: string;
};

type RawProgram = {
    id: string;
    name: string;
    programType: string;
    displayIncidentDate?: boolean;
    selectEnrollmentDatesInFuture?: boolean;
    selectIncidentDatesInFuture?: boolean;
    trackedEntityType?: Ref;
    programStages?: Ref[];
    programTrackedEntityAttributes?: RawProgramTrackedEntityAttribute[];
    programSections?: Ref[];
};

export type MetadataExport = {
    dataElements?: RawDataElement[];
    trackedEntityAttributes?: RawTrackedEntityAttribute[];
    options?: RawOption[];
    optionSets?: RawOptionSet[];
    optionGroups?: RawOptionGroup[];
    programStages?: RawProgramStage[];
    programStageSections?: RawProgramStageSection[];
    programRules?: RawProgramRule[];
    programRuleVariables?: RawProgramRuleVariable[];
    programRuleActions?: RawProgramRuleAction[];
    programSections?: RawProgramSection[];
    programs?: RawProgram[];
};

type ResolvedOption = { id: string; code?: string; displayName: string };
type ResolvedOptionSet = { id: string; options: ResolvedOption[] };
type ResolvedOptionGroupRef = { id: string; displayName: string };

type ResolvedDataElement = {
    id: string;
    displayName: string;
    displayFormName: string;
    valueType: string;
    description?: string;
    optionSet?: ResolvedOptionSet;
};

type ResolvedTrackedEntityAttribute = {
    id: string;
    displayName: string;
    displayFormName: string;
    formName: string;
    valueType: string;
    optionSet?: ResolvedOptionSet;
};

function indexById<T extends { id: string }>(items: T[] | undefined): Map<string, T> {
    return new Map((items ?? []).map((item) => [item.id, item]));
}

type Indices = {
    dataElements: Map<string, RawDataElement>;
    trackedEntityAttributes: Map<string, RawTrackedEntityAttribute>;
    options: Map<string, RawOption>;
    optionSets: Map<string, RawOptionSet>;
    optionGroups: Map<string, RawOptionGroup>;
    programStageSections: Map<string, RawProgramStageSection>;
    programRuleActions: Map<string, RawProgramRuleAction>;
};

function buildIndices(exportData: MetadataExport): Indices {
    return {
        dataElements: indexById(exportData.dataElements),
        trackedEntityAttributes: indexById(exportData.trackedEntityAttributes),
        options: indexById(exportData.options),
        optionSets: indexById(exportData.optionSets),
        optionGroups: indexById(exportData.optionGroups),
        programStageSections: indexById(exportData.programStageSections),
        programRuleActions: indexById(exportData.programRuleActions),
    };
}

function resolveOptionRef(
    ref: Ref | undefined,
    indices: Pick<Indices, 'options'>
): ResolvedOption | undefined {
    if (!ref) return undefined;
    const option = indices.options.get(ref.id);
    if (!option) return undefined;
    return { id: option.id, code: option.code, displayName: option.name };
}

function resolveOptionSetRef(
    ref: Ref | undefined,
    indices: Pick<Indices, 'optionSets' | 'options'>
): ResolvedOptionSet | undefined {
    if (!ref) return undefined;
    const optionSet = indices.optionSets.get(ref.id);
    if (!optionSet) return undefined;
    return {
        id: optionSet.id,
        options: (optionSet.options ?? [])
            .map((optionRef) => resolveOptionRef(optionRef, indices))
            .filter((option): option is ResolvedOption => Boolean(option)),
    };
}

function resolveOptionGroupRef(
    ref: Ref | undefined,
    indices: Pick<Indices, 'optionGroups'>
): ResolvedOptionGroupRef | undefined {
    if (!ref) return undefined;
    const group = indices.optionGroups.get(ref.id);
    if (!group) return undefined;
    return { id: group.id, displayName: group.name };
}

function resolveDataElementRef(
    ref: Ref | undefined,
    indices: Pick<Indices, 'dataElements' | 'optionSets' | 'options'>
): ResolvedDataElement | undefined {
    if (!ref) return undefined;
    const dataElement = indices.dataElements.get(ref.id);
    if (!dataElement) return undefined;
    const label = dataElement.formName ?? dataElement.name;
    return {
        id: dataElement.id,
        displayName: label,
        displayFormName: label,
        valueType: dataElement.valueType,
        description: dataElement.description,
        optionSet: resolveOptionSetRef(dataElement.optionSet, indices),
    };
}

function resolveTrackedEntityAttributeRef(
    ref: Ref | undefined,
    indices: Pick<Indices, 'trackedEntityAttributes' | 'optionSets' | 'options'>
): ResolvedTrackedEntityAttribute | undefined {
    if (!ref) return undefined;
    const tea = indices.trackedEntityAttributes.get(ref.id);
    if (!tea) return undefined;
    const label = tea.formName ?? tea.name;
    return {
        id: tea.id,
        displayName: label,
        displayFormName: label,
        formName: label,
        valueType: tea.valueType,
        optionSet: resolveOptionSetRef(tea.optionSet, indices),
    };
}

function resolveProgramRuleActions(refs: Ref[] | undefined, indices: Indices) {
    return (refs ?? [])
        .map((ref) => indices.programRuleActions.get(ref.id))
        .filter((action): action is RawProgramRuleAction => Boolean(action))
        .map((action) => ({
            id: action.id,
            programRuleActionType: action.programRuleActionType,
            priority: action.priority,
            content: action.content,
            data: action.data,
            location: action.location,
            templateUid: action.templateUid,
            dataElement: resolveDataElementRef(action.dataElement, indices),
            trackedEntityAttribute: resolveTrackedEntityAttributeRef(
                action.trackedEntityAttribute,
                indices
            ),
            option: resolveOptionRef(action.option, indices),
            optionGroup: resolveOptionGroupRef(action.optionGroup, indices),
            programStageSection: action.programStageSection
                ? {
                      id: action.programStageSection.id,
                      displayName: indices.programStageSections.get(action.programStageSection.id)
                          ?.name,
                  }
                : undefined,
            programSection: action.programSection,
            programStage: action.programStage,
        }));
}

function resolveProgramRules(
    programId: string,
    rules: RawProgramRule[] | undefined,
    indices: Indices
) {
    return (rules ?? [])
        .filter((rule) => rule.program.id === programId)
        .map((rule) => ({
            id: rule.id,
            name: rule.name,
            displayName: rule.name,
            condition: rule.condition,
            priority: rule.priority,
            programStage: rule.programStage,
            programRuleActions: resolveProgramRuleActions(rule.programRuleActions, indices),
        }));
}

function resolveProgramRuleVariables(
    programId: string,
    variables: RawProgramRuleVariable[] | undefined,
    indices: Indices,
    programStagesById: Map<string, RawProgramStage>
) {
    return (variables ?? [])
        .filter((variable) => variable.program.id === programId)
        .map((variable) => ({
            id: variable.id,
            name: variable.name,
            valueType: variable.valueType,
            useCodeForOptionSet: variable.useCodeForOptionSet,
            programRuleVariableSourceType: variable.programRuleVariableSourceType,
            programStage: variable.programStage
                ? {
                      id: variable.programStage.id,
                      displayName: programStagesById.get(variable.programStage.id)?.name,
                  }
                : undefined,
            dataElement: resolveDataElementRef(variable.dataElement, indices),
            trackedEntityAttribute: resolveTrackedEntityAttributeRef(
                variable.trackedEntityAttribute,
                indices
            ),
        }));
}

function resolveProgramStageSection(ref: Ref, indices: Indices) {
    const section = indices.programStageSections.get(ref.id);
    if (!section) return undefined;
    return {
        id: section.id,
        displayName: section.name,
        sortOrder: section.sortOrder,
        dataElements: (section.dataElements ?? []).map((deRef, index) => ({
            sortOrder: index,
            dataElement: resolveDataElementRef(deRef, indices),
        })),
    };
}

function resolveProgramStage(
    ref: Ref,
    indices: Indices,
    programStagesById: Map<string, RawProgramStage>
) {
    const stage = programStagesById.get(ref.id);
    if (!stage) return undefined;
    return {
        id: stage.id,
        displayName: stage.name,
        repeatable: stage.repeatable,
        sortOrder: stage.sortOrder,
        programStageDataElements: (stage.programStageDataElements ?? []).map((psde, index) => ({
            id: psde.id ?? psde.dataElement.id,
            compulsory: psde.compulsory,
            sortOrder: psde.sortOrder ?? index,
            dataElement: resolveDataElementRef(psde.dataElement, indices),
        })),
        programStageSections: (stage.programStageSections ?? [])
            .map((sectionRef) => resolveProgramStageSection(sectionRef, indices))
            .filter((section): section is NonNullable<typeof section> => Boolean(section)),
    };
}

function resolveProgramTrackedEntityAttributes(
    list: RawProgramTrackedEntityAttribute[] | undefined,
    indices: Indices
) {
    return (list ?? []).map((ptea, index) => ({
        id: ptea.id,
        mandatory: ptea.mandatory,
        sortOrder: ptea.sortOrder ?? index,
        searchable: ptea.searchable,
        displayInList: ptea.displayInList,
        allowFutureDate: ptea.allowFutureDate,
        renderOptionsAsRadio: ptea.renderOptionsAsRadio,
        trackedEntityAttribute: resolveTrackedEntityAttributeRef(
            ptea.trackedEntityAttribute,
            indices
        ),
    }));
}

function resolveProgramSections(
    refs: Ref[] | undefined,
    programSectionsById: Map<string, RawProgramSection>
) {
    return (refs ?? [])
        .map((ref) => programSectionsById.get(ref.id))
        .filter((section): section is RawProgramSection => Boolean(section))
        .map((section) => ({
            id: section.id,
            displayName: section.name,
            sortOrder: section.sortOrder,
            trackedEntityAttributes: section.trackedEntityAttributes ?? [],
        }));
}

/** Builds the `resolveEventProgramMetadata` input from a flat metadata-export package. */
export function buildRawEventProgramConfig(
    exportData: MetadataExport,
    programId: string
): RawEventProgramConfigResult {
    const indices = buildIndices(exportData);
    const programStagesById = indexById(exportData.programStages);
    const program = (exportData.programs ?? []).find((candidate) => candidate.id === programId);

    const resolvedProgram = program
        ? {
              id: program.id,
              displayName: program.name,
              programType: program.programType,
              programStages: (program.programStages ?? [])
                  .map((ref) => resolveProgramStage(ref, indices, programStagesById))
                  .filter((stage): stage is NonNullable<typeof stage> => Boolean(stage)),
          }
        : undefined;

    return {
        program: resolvedProgram,
        programRules: {
            programRules: resolveProgramRules(programId, exportData.programRules, indices),
        },
        programRuleVariables: {
            programRuleVariables: resolveProgramRuleVariables(
                programId,
                exportData.programRuleVariables,
                indices,
                programStagesById
            ),
        },
        constants: { constants: [] },
    } as RawEventProgramConfigResult;
}

// Branches are `??` fallbacks for optional program header fields absent from the flat export.
// fallow-ignore-next-line complexity
function resolveTrackerProgramHeader(
    program: RawProgram,
    indices: Indices,
    programSectionsById: Map<string, RawProgramSection>
) {
    return {
        id: program.id,
        displayName: program.name,
        trackedEntityType: program.trackedEntityType ?? { id: '' },
        displayIncidentDate: program.displayIncidentDate ?? false,
        selectEnrollmentDatesInFuture: program.selectEnrollmentDatesInFuture ?? false,
        selectIncidentDatesInFuture: program.selectIncidentDatesInFuture ?? false,
        programTrackedEntityAttributes: resolveProgramTrackedEntityAttributes(
            program.programTrackedEntityAttributes,
            indices
        ),
        programSections: resolveProgramSections(program.programSections, programSectionsById),
    };
}

/** Builds the `resolveTrackerProgramMetadata` input from a flat metadata-export package. */
export function buildRawTrackerConfig(
    exportData: MetadataExport,
    programId: string
): RawTrackerConfigResult {
    const indices = buildIndices(exportData);
    const programStagesById = indexById(exportData.programStages);
    const programSectionsById = indexById(exportData.programSections);
    const program = (exportData.programs ?? []).find((candidate) => candidate.id === programId);

    return {
        program: program
            ? resolveTrackerProgramHeader(program, indices, programSectionsById)
            : undefined,
        programRules: {
            programRules: resolveProgramRules(programId, exportData.programRules, indices),
        },
        programRuleVariables: {
            programRuleVariables: resolveProgramRuleVariables(
                programId,
                exportData.programRuleVariables,
                indices,
                programStagesById
            ),
        },
        constants: { constants: [] },
    } as RawTrackerConfigResult;
}

/** Builds an `OptionGroupCodeMap` (option-group id -> member option codes) for `useEventForm`'s `optionGroups`. */
export function buildOptionGroupCodeMap(exportData: MetadataExport): OptionGroupCodeMap {
    const options = indexById(exportData.options);
    const raw: RawOptionGroupsResult = {
        optionGroups: {
            optionGroups: (exportData.optionGroups ?? []).map((group) => ({
                id: group.id,
                options: (group.options ?? [])
                    .map((ref) => options.get(ref.id))
                    .filter((option): option is RawOption => Boolean(option))
                    .map((option) => ({ code: option.code })),
            })),
        },
    };
    return resolveOptionGroups(raw);
}
