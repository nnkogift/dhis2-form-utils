import type { RuleEffect } from './evaluate';
import type { FeedbackItem, FeedbackLocation, FeedbackMap, SectionStateMap } from './types';

const parseLocation = (location: string | null | undefined): FeedbackLocation =>
    location === 'indicators' ? 'indicators' : 'feedback';

export function buildSectionMap(effects: RuleEffect[]): SectionStateMap {
    const map: SectionStateMap = {};

    for (const effect of effects) {
        const sectionId = effect.programStageSection ?? effect.programSection;
        if (!sectionId) continue;

        map[sectionId] = { hidden: true };
    }

    return map;
}

export function buildFeedbackMap(effects: RuleEffect[]): FeedbackMap {
    const map: FeedbackMap = {};

    for (const effect of effects) {
        const content = effect.content ?? '';
        const location = parseLocation(effect.location);
        const key = `${location}:${content}`;
        const value = effect.data ?? '';

        if (effect.ruleActionType === 'DISPLAYTEXT') {
            map[key] = { type: 'text', content, value, location };
        } else if (effect.ruleActionType === 'DISPLAYKEYVALUEPAIR') {
            map[key] = { type: 'keyValuePair', content, value, location };
        }
    }

    return map;
}

export function feedbackItemKey(item: FeedbackItem): string {
    return `${item.location}:${item.content}`;
}
