import type { EventProgramMetadata, ProgramStageMetadata } from './fieldFilters';

export function selectProgramStage(
    metadata: EventProgramMetadata,
    programStageId: string
): ProgramStageMetadata | undefined {
    return metadata.programStages.find((stage) => stage.id === programStageId);
}

export function filterEventProgramRules(
    metadata: EventProgramMetadata,
    programStageId: string
): EventProgramMetadata['programRules'] {
    return metadata.programRules.filter(
        (rule) => !rule.programStage?.id || rule.programStage.id === programStageId
    );
}

export function filterEventProgramRuleVariables(
    metadata: EventProgramMetadata,
    programStageId: string
): EventProgramMetadata['programRuleVariables'] {
    return metadata.programRuleVariables.filter(
        (variable) => !variable.programStage?.id || variable.programStage.id === programStageId
    );
}
