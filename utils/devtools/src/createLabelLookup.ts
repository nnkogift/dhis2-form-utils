import type {
    EventProgramMetadata,
    ProgramStageMetadata,
    TrackerProgramMetadata,
} from '@dhis2-form-utils/metadata';
import { selectProgramStage } from '@dhis2-form-utils/metadata';

export type ProgramStageRef = {
    id?: string;
    displayName?: string;
};

export type RuleDevtoolsMetadata =
    | {
          formKind: 'event';
          metadata: EventProgramMetadata;
          programStageId: string;
      }
    | {
          formKind: 'tracker';
          metadata: TrackerProgramMetadata;
          /** Stage names for rules that target a stage — the tracker metadata query itself has no stage list. */
          programStages?: ProgramStageRef[];
      };

export type DevtoolsLabelLookup = {
    resolveRuleName(id: string): string;
    resolveFieldName(id: string): string;
    resolveSectionName(id: string): string;
    resolveStageName(id: string): string;
};

const createLookup = (
    rules: Map<string, string>,
    fields: Map<string, string>,
    sections: Map<string, string>,
    stages: Map<string, string>
): DevtoolsLabelLookup => ({
    resolveRuleName: (id) => rules.get(id) ?? id,
    resolveFieldName: (id) => fields.get(id) ?? id,
    resolveSectionName: (id) => sections.get(id) ?? id,
    resolveStageName: (id) => stages.get(id) ?? id,
});

function buildEventLookup(source: Extract<RuleDevtoolsMetadata, { formKind: 'event' }>) {
    const rules = new Map<string, string>();
    const fields = new Map<string, string>();
    const sections = new Map<string, string>();
    const stages = new Map<string, string>();

    for (const rule of source.metadata.programRules) {
        if (!rule.id) {
            continue;
        }
        rules.set(rule.id, rule.displayName ?? rule.id);
    }

    const stage: ProgramStageMetadata = selectProgramStage(
        source.metadata,
        source.programStageId
    ) ?? {
        id: source.programStageId,
        programStageDataElements: [],
        programStageSections: [],
    };

    for (const psde of stage.programStageDataElements ?? []) {
        const de = psde.dataElement;
        if (!de?.id) {
            continue;
        }
        fields.set(de.id, de.displayFormName ?? de.displayName ?? de.id);
    }

    for (const section of stage.programStageSections ?? []) {
        sections.set(section.id, section.displayName ?? section.id);
    }

    for (const programStage of source.metadata.programStages) {
        if (!programStage.id) {
            continue;
        }
        stages.set(programStage.id, programStage.displayName ?? programStage.id);
    }

    return createLookup(rules, fields, sections, stages);
}

function buildTrackerLookup(source: Extract<RuleDevtoolsMetadata, { formKind: 'tracker' }>) {
    const rules = new Map<string, string>();
    const fields = new Map<string, string>();
    const sections = new Map<string, string>();
    const stages = new Map<string, string>();

    for (const rule of source.metadata.programRules) {
        if (!rule.id) {
            continue;
        }
        rules.set(rule.id, rule.name ?? rule.id);
    }

    for (const ptea of source.metadata.programTrackedEntityAttributes) {
        const tea = ptea.trackedEntityAttribute;
        if (!tea.id) {
            continue;
        }
        fields.set(tea.id, tea.formName ?? tea.displayName ?? tea.id);
    }

    for (const section of source.metadata.programSections ?? []) {
        sections.set(section.id, section.displayName ?? section.id);
    }

    for (const programStage of source.programStages ?? []) {
        if (!programStage.id) {
            continue;
        }
        stages.set(programStage.id, programStage.displayName ?? programStage.id);
    }

    return createLookup(rules, fields, sections, stages);
}

export function createLabelLookup(source: RuleDevtoolsMetadata): DevtoolsLabelLookup {
    return source.formKind === 'event' ? buildEventLookup(source) : buildTrackerLookup(source);
}
