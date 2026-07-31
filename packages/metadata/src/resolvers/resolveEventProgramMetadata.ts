import type { EventProgramMetadata, ProgramRule, ProgramRuleVariable } from '../types';

type RawProgram = Partial<Omit<EventProgramMetadata, 'programRules' | 'programRuleVariables'>>;

export type RawEventProgramConfigResult = {
    program: RawProgram | undefined;
    programRules: { programRules?: ProgramRule[] } | undefined;
    programRuleVariables: { programRuleVariables?: ProgramRuleVariable[] } | undefined;
};

/**
 * Resolves the raw `eventProgramConfigQuery` result into `EventProgramMetadata`.
 * Pure and non-throwing — `programRules: []` / `programRuleVariables: []` are valid outputs,
 * not error states.
 */
export function resolveEventProgramMetadata(
    raw: RawEventProgramConfigResult
): EventProgramMetadata {
    const program = raw.program;

    return {
        id: program?.id ?? '',
        displayName: program?.displayName ?? '',
        code: program?.code,
        shortName: program?.shortName,
        programType: program?.programType ?? '',
        programStages: program?.programStages ?? [],
        programRules: raw.programRules?.programRules ?? [],
        programRuleVariables: raw.programRuleVariables?.programRuleVariables ?? [],
    };
}
