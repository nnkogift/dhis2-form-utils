import type {
    DataElementRef,
    ProgramRule,
    ProgramRuleAction,
    ProgramRuleVariable,
    ProgramStageDataElement,
    ProgramStageMetadata,
    ValueType,
} from '@dhis2-form-utils/metadata';

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

type ExportProgramStage = {
    id: string;
    name?: string;
    displayName?: string;
    programStageDataElements?: ExportProgramStageDataElement[];
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
    programRuleActions?: IdRef[];
};

type ExportProgramRuleVariable = {
    id: string;
    name?: string;
    useCodeForOptionSet?: boolean;
    programRuleVariableSourceType?: ProgramRuleVariable['programRuleVariableSourceType'];
    programStage?: IdRef;
    dataElement?: IdRef;
    trackedEntityAttribute?: IdRef;
};

export type MetadataExport = {
    programStages: ExportProgramStage[];
    dataElements: ExportDataElement[];
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

export function resolveMetadataExportStage(
    exportData: MetadataExport,
    stageId: string,
    fixtureName: string
): ProgramStageMetadata {
    const dataElementById = indexById(exportData.dataElements);
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

    const stage = exportData.programStages.find((candidate) => candidate.id === stageId);
    if (!stage) {
        throw new Error(`Program stage "${stageId}" not found in ${fixtureName} fixture`);
    }

    return {
        id: stage.id,
        displayName: stage.displayName ?? stage.name ?? stage.id,
        programStageDataElements: (stage.programStageDataElements ?? [])
            .map((psde) => resolveProgramStageDataElement(psde))
            .filter((psde): psde is ProgramStageDataElement => psde !== undefined),
        programRules: exportData.programRules.map(resolveProgramRule),
        programRuleVariables: exportData.programRuleVariables.map(resolveProgramRuleVariable),
    };
}
