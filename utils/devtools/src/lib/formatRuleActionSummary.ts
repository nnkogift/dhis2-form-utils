import type { DevtoolsLabelLookup } from './createLabelLookup';

export type RuleActionLike = {
    programRuleActionType?: string;
    dataElement?: { id?: string; displayName?: string };
    trackedEntityAttribute?: { id?: string; displayName?: string };
    programStageSection?: { id?: string; displayName?: string };
    programSection?: { id?: string; displayName?: string };
    data?: string | null;
    content?: string | null;
    location?: string | null;
};

export type FormattedRuleAction = {
    type: string;
    targetLabel: string;
    detail?: string;
};

function resolveFieldLabel(
    id: string,
    displayName: string | undefined,
    labelLookup?: DevtoolsLabelLookup
): string {
    if (labelLookup) {
        const resolved = labelLookup.resolveFieldName(id);
        if (resolved !== id) {
            return resolved;
        }
    }
    return displayName ?? id;
}

function resolveSectionLabel(
    id: string,
    displayName: string | undefined,
    labelLookup?: DevtoolsLabelLookup
): string {
    if (labelLookup) {
        const resolved = labelLookup.resolveSectionName(id);
        if (resolved !== id) {
            return resolved;
        }
    }
    return displayName ?? id;
}

export function formatRuleActionSummary(
    action: RuleActionLike,
    labelLookup?: DevtoolsLabelLookup
): FormattedRuleAction {
    const type = action.programRuleActionType ?? 'UNKNOWN';

    let targetLabel = '';
    if (action.dataElement?.id) {
        targetLabel = resolveFieldLabel(
            action.dataElement.id,
            action.dataElement.displayName,
            labelLookup
        );
    } else if (action.trackedEntityAttribute?.id) {
        targetLabel = resolveFieldLabel(
            action.trackedEntityAttribute.id,
            action.trackedEntityAttribute.displayName,
            labelLookup
        );
    } else if (action.programStageSection?.id) {
        targetLabel = resolveSectionLabel(
            action.programStageSection.id,
            action.programStageSection.displayName,
            labelLookup
        );
    } else if (action.programSection?.id) {
        targetLabel = resolveSectionLabel(
            action.programSection.id,
            action.programSection.displayName,
            labelLookup
        );
    } else if (type === 'DISPLAYTEXT' || type === 'DISPLAYKEYVALUEPAIR') {
        targetLabel = action.location ?? 'feedback';
    }

    let detail: string | undefined;
    if (action.data) {
        detail = action.data;
    }
    if (action.content && (type === 'DISPLAYTEXT' || type === 'DISPLAYKEYVALUEPAIR')) {
        detail = action.content;
    }

    return { type, targetLabel, detail };
}
