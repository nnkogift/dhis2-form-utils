import type { ProgramRule, ProgramRuleAction, ProgramRuleVariable } from '../types';
import type {
    ExpandedProgramRule,
    ExpandedProgramRuleAction,
    TrackerProgramMetadata,
} from '../trackerTypes';

type RawProgram = Partial<Omit<TrackerProgramMetadata, 'programRules' | 'programRuleVariables'>>;

export type RawTrackerConfigResult = {
    program: RawProgram | undefined;
    programRules: { programRules?: ProgramRule[] } | undefined;
    programRuleVariables: { programRuleVariables?: ProgramRuleVariable[] } | undefined;
};

const toExpandedAction = (action: ProgramRuleAction): ExpandedProgramRuleAction => ({
    id: action.id,
    programRuleActionType: action.programRuleActionType,
    data: action.data,
    content: action.content,
    trackedEntityAttribute: action.trackedEntityAttribute,
    programStageSection: action.programStageSection,
    location: action.location,
    programSection: action.programSection,
});

const toExpandedRule = (rule: ProgramRule): ExpandedProgramRule => ({
    id: rule.id,
    condition: rule.condition,
    priority: rule.priority,
    name: rule.name ?? rule.displayName,
    programStage: rule.programStage,
    programRuleActions: (rule.programRuleActions ?? []).map(toExpandedAction),
});

/**
 * Resolves the raw `trackerConfigQuery` result into `TrackerProgramMetadata`.
 * Pure and non-throwing — `programRules: []` / `programRuleVariables: []` are valid outputs.
 *
 * Does not filter to enrollment-only rules/variables (no `programStage === null` filtering, no
 * `TEI_ATTRIBUTE`-only filtering) — that scoping belongs to `buildEnrollmentRuleEngineContext`
 * per use-tracker-form.md's implementation contract. This resolver's job is shape, not
 * rule-engine-specific filtering.
 */
export function resolveTrackerProgramMetadata(raw: RawTrackerConfigResult): TrackerProgramMetadata {
    const program = raw.program;

    return {
        id: program?.id ?? '',
        displayName: program?.displayName ?? '',
        trackedEntityType: program?.trackedEntityType ?? { id: '' },
        displayIncidentDate: program?.displayIncidentDate ?? false,
        selectEnrollmentDatesInFuture: program?.selectEnrollmentDatesInFuture ?? false,
        selectIncidentDatesInFuture: program?.selectIncidentDatesInFuture ?? false,
        displayEnrollmentDateLabel: program?.displayEnrollmentDateLabel,
        displayIncidentDateLabel: program?.displayIncidentDateLabel,
        programTrackedEntityAttributes: [...(program?.programTrackedEntityAttributes ?? [])].sort(
            (left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0)
        ),
        programRules: (raw.programRules?.programRules ?? []).map(toExpandedRule),
        programRuleVariables: raw.programRuleVariables?.programRuleVariables ?? [],
        programSections: program?.programSections,
    };
}
