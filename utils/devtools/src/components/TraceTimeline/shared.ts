import type { TraceEffect } from '@nnkogift/dhis2-form-utils-hooks';
import type { DevtoolsLabelLookup } from '../../lib/createLabelLookup';

export function resolveLabel(
    id: string,
    resolver?: (value: string) => string
): { label: string; showId: boolean } {
    const label = resolver?.(id) ?? id;
    return { label, showId: label !== id };
}

// fallow-ignore-next-line complexity
export function resolveEffectTargetLabel(
    effect: TraceEffect,
    labelLookup?: DevtoolsLabelLookup
): { label: string; showId: boolean } {
    if (effect.type === 'HIDESECTION') {
        return resolveLabel(
            effect.targetId,
            labelLookup ? (id) => labelLookup.resolveSectionName(id) : undefined
        );
    }

    if (effect.type === 'DISPLAYTEXT' || effect.type === 'DISPLAYKEYVALUEPAIR') {
        return { label: effect.targetId, showId: false };
    }

    return resolveLabel(
        effect.targetId,
        labelLookup ? (id) => labelLookup.resolveFieldName(id) : undefined
    );
}
