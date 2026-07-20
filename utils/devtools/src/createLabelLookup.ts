import type {
    EventProgramMetadata,
    ProgramStageMetadata,
    TrackerProgramMetadata,
} from '@dhis2-form-utils/metadata';
import { selectProgramStage } from '@dhis2-form-utils/metadata';

export type RuleDevtoolsMetadata =
    | {
          formKind: 'event';
          metadata: EventProgramMetadata;
          programStageId: string;
      }
    | {
          formKind: 'tracker';
          metadata: TrackerProgramMetadata;
      };

export type DevtoolsLabelLookup = {
    resolveRuleName(id: string): string;
    resolveFieldName(id: string): string;
    resolveSectionName(id: string): string;
};

const createLookup = (
    rules: Map<string, string>,
    fields: Map<string, string>,
    sections: Map<string, string>
): DevtoolsLabelLookup => ({
    resolveRuleName: (id) => rules.get(id) ?? id,
    resolveFieldName: (id) => fields.get(id) ?? id,
    resolveSectionName: (id) => sections.get(id) ?? id,
});

function buildEventLookup(source: Extract<RuleDevtoolsMetadata, { formKind: 'event' }>) {
    const rules = new Map<string, string>();
    const fields = new Map<string, string>();
    const sections = new Map<string, string>();

    for (const rule of source.metadata.programRules) {
        if (!rule.id) {
            continue;
        }
        rules.set(rule.id, rule.displayName ?? rule.id);
    }

    const stage: ProgramStageMetadata =
        selectProgramStage(source.metadata, source.programStageId) ??
        ({
            id: source.programStageId,
            programStageDataElements: [],
            programStageSections: [],
        } as unknown as ProgramStageMetadata);

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

    return createLookup(rules, fields, sections);
}

function buildTrackerLookup(source: Extract<RuleDevtoolsMetadata, { formKind: 'tracker' }>) {
    const rules = new Map<string, string>();
    const fields = new Map<string, string>();
    const sections = new Map<string, string>();

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

    return createLookup(rules, fields, sections);
}

export function createLabelLookup(source: RuleDevtoolsMetadata): DevtoolsLabelLookup {
    return source.formKind === 'event' ? buildEventLookup(source) : buildTrackerLookup(source);
}
