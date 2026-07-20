import type {
    DataElementRef,
    EventProgramMetadata,
    ProgramRule,
    ProgramRuleAction,
    ProgramRuleVariable,
    ProgramStageDataElement,
    ProgramStageMetadata,
    ProgramStageSection,
    ProgramTrackedEntityAttribute,
} from './types';
import type { ValueType } from '@dhis2/api-types/v43';
import type {
    ExpandedProgramRule,
    ExpandedProgramRuleAction,
    TrackerProgramMetadata,
} from './trackerTypes';

type IdRef = { id: string };

type ExportDataElement = {
    id: string;
    name?: string;
    formName?: string;
    description?: string;
    valueType?: ValueType;
    optionSet?: IdRef;
};

type ExportOption = {
    id: string;
    code?: string;
    name?: string;
    displayName?: string;
};

type ExportOptionSet = {
    id: string;
    options?: IdRef[];
};

type ExportProgramStageDataElement = {
    id?: string;
    compulsory?: boolean;
    allowProvidedElsewhere?: boolean;
    allowFutureDate?: boolean;
    displayInReports?: boolean;
    renderType?: ProgramStageDataElement['renderType'];
    dataElement?: IdRef;
};

type ExportProgramStageSectionDataElement = {
    sortOrder?: number;
    dataElement?: IdRef;
};

type ExportProgramStageSection = {
    id: string;
    name?: string;
    displayName?: string;
    sortOrder?: number;
    renderType?: ProgramStageSection['renderType'];
    programStageSectionDataElements?: ExportProgramStageSectionDataElement[];
};

type ExportProgramStage = {
    id: string;
    name?: string;
    displayName?: string;
    programStageDataElements?: ExportProgramStageDataElement[];
    programStageSections?: ExportProgramStageSection[];
};

type ExportProgramRuleAction = {
    id: string;
    programRuleActionType?: ProgramRuleAction['programRuleActionType'];
    priority?: number;
    content?: string;
    data?: string;
    location?: string;
    dataElement?: IdRef;
    trackedEntityAttribute?: IdRef;
    option?: IdRef;
    optionGroup?: IdRef;
    programStageSection?: IdRef;
};

type ExportProgramRule = {
    id: string;
    displayName?: string;
    name?: string;
    condition?: string;
    priority?: number;
    program?: IdRef;
    programStage?: IdRef;
    programRuleActions?: IdRef[];
};

type ExportProgramRuleVariable = {
    id: string;
    name?: string;
    useCodeForOptionSet?: boolean;
    programRuleVariableSourceType?: ProgramRuleVariable['programRuleVariableSourceType'];
    valueType?: ValueType;
    programStage?: IdRef;
    dataElement?: IdRef;
    trackedEntityAttribute?: IdRef;
};

type ExportTrackedEntityAttribute = {
    id: string;
    name?: string;
    formName?: string;
    description?: string;
    valueType?: ValueType;
    optionSet?: IdRef;
    unique?: boolean;
    generated?: boolean;
    pattern?: string;
    confidential?: boolean;
    orgunitScope?: boolean;
};

type ExportProgramTrackedEntityAttribute = {
    id?: string;
    mandatory?: boolean;
    allowFutureDate?: boolean;
    searchable?: boolean;
    displayInList?: boolean;
    sortOrder?: number;
    renderType?: ProgramTrackedEntityAttribute['renderType'];
    renderOptionsAsRadio?: boolean;
    trackedEntityAttribute?: IdRef;
};

type ExportProgramSection = {
    id: string;
    displayName?: string;
    name?: string;
    sortOrder?: number;
    trackedEntityAttributes?: IdRef[];
};

type ExportProgram = {
    id: string;
    name?: string;
    displayName?: string;
    code?: string;
    shortName?: string;
    programType?: string;
    enrollmentDateLabel?: string;
    incidentDateLabel?: string;
    displayIncidentDate?: boolean;
    selectEnrollmentDatesInFuture?: boolean;
    selectIncidentDatesInFuture?: boolean;
    trackedEntityType?: IdRef;
    programStages?: IdRef[];
    programTrackedEntityAttributes?: ExportProgramTrackedEntityAttribute[];
    programSections?: ExportProgramSection[];
};

/** Shape returned by `GET /api/programs/{id}/metadata` (metadata export with dependencies). */
export type ProgramMetadataExport = {
    programStages: ExportProgramStage[];
    programs?: ExportProgram[];
    dataElements: ExportDataElement[];
    trackedEntityAttributes?: ExportTrackedEntityAttribute[];
    optionSets?: ExportOptionSet[];
    options?: ExportOption[];
    programRules: ExportProgramRule[];
    programRuleActions: ExportProgramRuleAction[];
    programRuleVariables: ExportProgramRuleVariable[];
};

type ResolvedOptionSet = {
    id: string;
    options: Array<{ id: string; code: string; displayName: string }>;
};

const indexById = <T extends { id: string }>(items: T[]): Map<string, T> =>
    new Map(items.map((item) => [item.id, item]));

function createExportResolverContext(exportData: ProgramMetadataExport) {
    const dataElementById = indexById(exportData.dataElements);
    const teaById = indexById(exportData.trackedEntityAttributes ?? []);
    const optionSetById = indexById(exportData.optionSets ?? []);
    const optionById = indexById(exportData.options ?? []);
    const ruleActionById = indexById(exportData.programRuleActions);

    const resolveOptionSet = (optionSetRef?: IdRef): ResolvedOptionSet | undefined => {
        if (!optionSetRef?.id) return undefined;

        const optionSet = optionSetById.get(optionSetRef.id);
        if (!optionSet?.options?.length) return { id: optionSetRef.id, options: [] };

        return {
            id: optionSet.id,
            options: optionSet.options.map((optionRef) => {
                const option = optionById.get(optionRef.id);
                return {
                    id: optionRef.id,
                    code: option?.code ?? optionRef.id,
                    displayName:
                        option?.displayName ?? option?.name ?? option?.code ?? optionRef.id,
                };
            }),
        };
    };

    const resolveDataElementRef = (ref?: IdRef): DataElementRef | undefined => {
        if (!ref?.id) return undefined;

        const dataElement = dataElementById.get(ref.id);
        if (!dataElement) {
            return { id: ref.id, valueType: 'TEXT' };
        }

        const optionSet = resolveOptionSet(dataElement.optionSet);

        return {
            id: dataElement.id,
            displayName: (dataElement.name ?? dataElement.id).trim(),
            displayFormName: (dataElement.formName ?? dataElement.name ?? dataElement.id).trim(),
            valueType: dataElement.valueType ?? 'TEXT',
            description: dataElement.description,
            ...(optionSet ? { optionSet } : {}),
        } as DataElementRef;
    };

    const resolveTrackedEntityAttributeRef = (
        ref?: IdRef
    ): ProgramTrackedEntityAttribute['trackedEntityAttribute'] | undefined => {
        if (!ref?.id) return undefined;

        const tea = teaById.get(ref.id);
        if (!tea) {
            return { id: ref.id, displayName: ref.id, valueType: 'TEXT' };
        }

        const optionSet = resolveOptionSet(tea.optionSet);

        return {
            id: tea.id,
            displayName: (tea.name ?? tea.id).trim(),
            displayFormName: (tea.formName ?? tea.name ?? tea.id).trim(),
            valueType: tea.valueType ?? 'TEXT',
            unique: tea.unique,
            generated: tea.generated,
            fieldMask: tea.pattern,
            confidential: tea.confidential,
            orgunitScope: tea.orgunitScope,
            ...(optionSet ? { optionSet } : {}),
        } as ProgramTrackedEntityAttribute['trackedEntityAttribute'];
    };

    const resolveProgramStageDataElement = (
        psde: ExportProgramStageDataElement
    ): ProgramStageDataElement | undefined => {
        const dataElement = resolveDataElementRef(psde.dataElement);
        if (!dataElement) return undefined;

        return {
            id: psde.id,
            compulsory: psde.compulsory,
            allowProvidedElsewhere: psde.allowProvidedElsewhere,
            allowFutureDate: psde.allowFutureDate,
            displayInReports: psde.displayInReports,
            renderType: psde.renderType,
            dataElement,
        };
    };

    const resolveProgramStageSection = (
        section: ExportProgramStageSection
    ): ProgramStageSection => ({
        id: section.id,
        displayName: section.displayName ?? section.name ?? section.id,
        sortOrder: section.sortOrder,
        renderType: section.renderType,
        programStageSectionDataElements: (section.programStageSectionDataElements ?? []).map(
            (item) => ({
                sortOrder: item.sortOrder,
                dataElement: resolveDataElementRef(item.dataElement),
            })
        ),
    });

    const resolveProgramStage = (stage: ExportProgramStage): ProgramStageMetadata =>
        ({
            id: stage.id,
            displayName: stage.displayName ?? stage.name ?? stage.id,
            programStageDataElements: (stage.programStageDataElements ?? [])
                .map((psde) => resolveProgramStageDataElement(psde))
                .filter((psde): psde is ProgramStageDataElement => psde !== undefined),
            programStageSections: (stage.programStageSections ?? []).map(
                resolveProgramStageSection
            ),
        }) as ProgramStageMetadata;

    const resolveRuleAction = (actionRef: IdRef): ProgramRuleAction | undefined => {
        const action = ruleActionById.get(actionRef.id);
        if (!action?.programRuleActionType) return undefined;

        return {
            programRuleActionType: action.programRuleActionType,
            priority: action.priority,
            content: action.content,
            data: action.data,
            location: action.location,
            dataElement: resolveDataElementRef(action.dataElement),
            trackedEntityAttribute: action.trackedEntityAttribute?.id
                ? { id: action.trackedEntityAttribute.id, valueType: 'TEXT' }
                : undefined,
            option: action.option?.id
                ? {
                      id: action.option.id,
                      code: optionById.get(action.option.id)?.code,
                      displayName: optionById.get(action.option.id)?.displayName,
                  }
                : undefined,
            optionGroup: action.optionGroup?.id ? { id: action.optionGroup.id } : undefined,
            programStageSection: action.programStageSection?.id
                ? { id: action.programStageSection.id }
                : undefined,
        } as ProgramRuleAction;
    };

    const resolveProgramRule = (rule: ExportProgramRule): ProgramRule =>
        ({
            id: rule.id,
            displayName: rule.displayName ?? rule.name,
            condition: rule.condition,
            priority: rule.priority,
            programStage: rule.programStage?.id ? { id: rule.programStage.id } : undefined,
            programRuleActions: (rule.programRuleActions ?? [])
                .map((actionRef) => resolveRuleAction(actionRef))
                .filter((action): action is ProgramRuleAction => action !== undefined),
        }) as ProgramRule;

    const resolveProgramRuleVariable = (variable: ExportProgramRuleVariable): ProgramRuleVariable =>
        ({
            id: variable.id,
            name: variable.name,
            useCodeForOptionSet: variable.useCodeForOptionSet,
            programRuleVariableSourceType: variable.programRuleVariableSourceType,
            programStage: variable.programStage ? { id: variable.programStage.id } : undefined,
            dataElement: resolveDataElementRef(variable.dataElement),
            trackedEntityAttribute: variable.trackedEntityAttribute?.id
                ? { id: variable.trackedEntityAttribute.id, valueType: 'TEXT' as const }
                : undefined,
        }) as ProgramRuleVariable;

    const resolveEnrollmentRuleAction = (
        actionRef: IdRef
    ): ExpandedProgramRuleAction | undefined => {
        const action = ruleActionById.get(actionRef.id);
        if (!action?.programRuleActionType) return undefined;

        return {
            id: action.id,
            programRuleActionType: action.programRuleActionType,
            data: action.data,
            content: action.content,
            location: action.location,
            trackedEntityAttribute: action.trackedEntityAttribute?.id
                ? { id: action.trackedEntityAttribute.id }
                : undefined,
            programStageSection: action.programStageSection?.id
                ? { id: action.programStageSection.id }
                : undefined,
        };
    };

    const resolveEnrollmentProgramRule = (rule: ExportProgramRule): ExpandedProgramRule => ({
        id: rule.id,
        name: rule.name ?? rule.displayName,
        condition: rule.condition,
        priority: rule.priority,
        programStage: rule.programStage?.id ? { id: rule.programStage.id } : undefined,
        programRuleActions: (rule.programRuleActions ?? [])
            .map((actionRef) => resolveEnrollmentRuleAction(actionRef))
            .filter((action): action is ExpandedProgramRuleAction => action !== undefined),
    });

    const resolveEnrollmentProgramRuleVariable = (
        variable: ExportProgramRuleVariable
    ): TrackerProgramMetadata['programRuleVariables'][number] | undefined => {
        if (!variable.programRuleVariableSourceType) return undefined;

        return {
            id: variable.id,
            name: variable.name,
            useCodeForOptionSet: variable.useCodeForOptionSet,
            programRuleVariableSourceType: variable.programRuleVariableSourceType,
            valueType: variable.valueType ?? 'TEXT',
            trackedEntityAttribute: variable.trackedEntityAttribute?.id
                ? { id: variable.trackedEntityAttribute.id }
                : undefined,
        };
    };

    const resolveProgramTrackedEntityAttribute = (
        ptea: ExportProgramTrackedEntityAttribute
    ): TrackerProgramMetadata['programTrackedEntityAttributes'][number] | undefined => {
        const trackedEntityAttribute = resolveTrackedEntityAttributeRef(
            ptea.trackedEntityAttribute
        );
        if (!trackedEntityAttribute?.id) return undefined;

        return {
            id: ptea.id,
            mandatory: ptea.mandatory,
            allowFutureDate: ptea.allowFutureDate,
            searchable: ptea.searchable,
            displayInList: ptea.displayInList,
            sortOrder: ptea.sortOrder,
            renderType: ptea.renderType,
            renderOptionsAsRadio: ptea.renderOptionsAsRadio,
            trackedEntityAttribute:
                trackedEntityAttribute as TrackerProgramMetadata['programTrackedEntityAttributes'][number]['trackedEntityAttribute'],
        };
    };

    return {
        resolveProgramStage,
        resolveProgramRule,
        resolveProgramRuleVariable,
        resolveEnrollmentProgramRule,
        resolveEnrollmentProgramRuleVariable,
        resolveProgramTrackedEntityAttribute,
    };
}

export function resolveProgramStageMetadata(
    exportData: ProgramMetadataExport,
    stageId: string
): ProgramStageMetadata {
    const stage = exportData.programStages.find((candidate) => candidate.id === stageId);
    if (!stage) {
        throw new Error(`Program stage "${stageId}" not found in metadata export`);
    }

    return createExportResolverContext(exportData).resolveProgramStage(stage);
}

function resolveProgramStagesForProgram(
    exportData: ProgramMetadataExport,
    program: ExportProgram | undefined
): ProgramStageMetadata[] {
    const ctx = createExportResolverContext(exportData);
    const stageIds = new Set(program?.programStages?.map((ref) => ref.id) ?? []);

    const stages =
        stageIds.size > 0
            ? exportData.programStages.filter((stage) => stageIds.has(stage.id))
            : exportData.programStages;

    return stages.map((stage) => ctx.resolveProgramStage(stage));
}

export function resolveEventProgramMetadata(
    exportData: ProgramMetadataExport,
    programId: string
): EventProgramMetadata {
    const program = exportData.programs?.find((candidate) => candidate.id === programId);
    const ctx = createExportResolverContext(exportData);
    const programStages = resolveProgramStagesForProgram(exportData, program);
    const programStageIds = new Set(programStages.map((stage) => stage.id));

    const programRules = exportData.programRules
        .filter((rule) => rule.program?.id === programId)
        .map((rule) => ctx.resolveProgramRule(rule));

    const programRuleVariables = exportData.programRuleVariables
        .filter(
            (variable) =>
                !variable.programStage?.id || programStageIds.has(variable.programStage.id)
        )
        .map((variable) => ctx.resolveProgramRuleVariable(variable));

    return {
        id: programId,
        displayName: program?.displayName ?? program?.name ?? programId,
        code: program?.code,
        shortName: program?.shortName ?? program?.name,
        programType: program?.programType ?? 'WITHOUT_REGISTRATION',
        programStages,
        programRules,
        programRuleVariables,
    };
}

export function resolveTrackerProgramMetadata(
    exportData: ProgramMetadataExport,
    programId: string
): TrackerProgramMetadata {
    const program = exportData.programs?.find((candidate) => candidate.id === programId);
    if (!program) {
        throw new Error(`Program "${programId}" not found in metadata export`);
    }

    const ctx = createExportResolverContext(exportData);

    const programRules = exportData.programRules
        .filter((rule) => rule.program?.id === programId)
        .map((rule) => ctx.resolveEnrollmentProgramRule(rule));

    return {
        id: program.id,
        displayName: program.displayName ?? program.name ?? program.id,
        trackedEntityType: { id: program.trackedEntityType?.id ?? '' },
        displayIncidentDate: program.displayIncidentDate ?? false,
        selectEnrollmentDatesInFuture: program.selectEnrollmentDatesInFuture ?? false,
        selectIncidentDatesInFuture: program.selectIncidentDatesInFuture ?? false,
        displayEnrollmentDateLabel: program.enrollmentDateLabel,
        displayIncidentDateLabel: program.incidentDateLabel,
        programTrackedEntityAttributes: (program.programTrackedEntityAttributes ?? [])
            .map((ptea) => ctx.resolveProgramTrackedEntityAttribute(ptea))
            .filter(
                (ptea): ptea is TrackerProgramMetadata['programTrackedEntityAttributes'][number] =>
                    ptea !== undefined
            )
            .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0)),
        programRules,
        programRuleVariables: exportData.programRuleVariables
            .filter((variable) => !variable.programStage?.id)
            .map((variable) => ctx.resolveEnrollmentProgramRuleVariable(variable))
            .filter(
                (variable): variable is TrackerProgramMetadata['programRuleVariables'][number] =>
                    variable !== undefined
            ),
        programSections: (program.programSections ?? []).map((section) => ({
            id: section.id,
            displayName: section.displayName ?? section.name,
            sortOrder: section.sortOrder,
            trackedEntityAttributes: (section.trackedEntityAttributes ?? []).map((ref) => ({
                id: ref.id,
            })),
        })),
    };
}
