import type { FeedbackMap, SectionState, SectionStateMap } from '@dhis2-form-utils/rules';

type Listener = () => void;

export type NonFieldStateStore = {
    getSectionSnapshot: (sectionId: string) => SectionState | undefined;
    getFeedbackSnapshot: () => FeedbackMap;
    subscribeSection: (sectionId: string, listener: Listener) => () => void;
    subscribeFeedback: (listener: Listener) => () => void;
    setState: (nextSections: SectionStateMap, nextFeedback: FeedbackMap) => void;
};

function shallowEqualSection(a: SectionState, b: SectionState): boolean {
    return a.hidden === b.hidden;
}

function shallowEqualFeedbackItem(
    a: FeedbackMap[string] | undefined,
    b: FeedbackMap[string] | undefined
): boolean {
    if (a === b) return true;
    if (!a || !b) return false;
    return (
        a.type === b.type &&
        a.content === b.content &&
        a.value === b.value &&
        a.location === b.location
    );
}

function stableSectionMap(prev: SectionStateMap, next: SectionStateMap): SectionStateMap {
    const result: SectionStateMap = {};
    const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);

    for (const key of keys) {
        if (key in prev && key in next && shallowEqualSection(prev[key], next[key])) {
            result[key] = prev[key];
            continue;
        }

        if (key in next) {
            result[key] = next[key];
        }
    }

    return result;
}

function stableFeedbackMap(prev: FeedbackMap, next: FeedbackMap): FeedbackMap {
    const result: FeedbackMap = {};
    const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);

    for (const key of keys) {
        if (key in prev && key in next && shallowEqualFeedbackItem(prev[key], next[key])) {
            result[key] = prev[key];
            continue;
        }

        if (key in next) {
            result[key] = next[key];
        }
    }

    const resultKeys = Object.keys(result);
    const prevKeys = Object.keys(prev);
    if (
        resultKeys.length === prevKeys.length &&
        resultKeys.every((key) => result[key] === prev[key])
    ) {
        return prev;
    }

    return result;
}

export function createNonFieldStateStore(
    initialSections: SectionStateMap = {},
    initialFeedback: FeedbackMap = {}
): NonFieldStateStore {
    let sections = initialSections;
    let feedback = initialFeedback;
    const sectionListeners = new Map<string, Set<Listener>>();
    const feedbackListeners = new Set<Listener>();

    return {
        getSectionSnapshot: (sectionId) => sections[sectionId],
        getFeedbackSnapshot: () => feedback,
        subscribeSection: (sectionId, listener) => {
            let listeners = sectionListeners.get(sectionId);
            if (!listeners) {
                listeners = new Set();
                sectionListeners.set(sectionId, listeners);
            }

            listeners.add(listener);
            return () => {
                sectionListeners.get(sectionId)?.delete(listener);
            };
        },
        subscribeFeedback: (listener) => {
            feedbackListeners.add(listener);
            return () => {
                feedbackListeners.delete(listener);
            };
        },
        setState: (nextSections, nextFeedback) => {
            const prevSections = sections;
            const prevFeedback = feedback;

            const mergedSections = stableSectionMap(prevSections, nextSections);
            const mergedFeedback = stableFeedbackMap(prevFeedback, nextFeedback);

            const changedSections = new Set<string>();
            const sectionKeys = new Set([
                ...Object.keys(prevSections),
                ...Object.keys(mergedSections),
            ]);

            for (const sectionId of sectionKeys) {
                if (prevSections[sectionId] !== mergedSections[sectionId]) {
                    changedSections.add(sectionId);
                }
            }

            const feedbackChanged =
                prevFeedback !== mergedFeedback &&
                (Object.keys(prevFeedback).length > 0 || Object.keys(mergedFeedback).length > 0);

            sections = mergedSections;
            feedback = mergedFeedback;

            if (!changedSections.size && !feedbackChanged) {
                return;
            }

            for (const sectionId of changedSections) {
                sectionListeners.get(sectionId)?.forEach((l) => {
                    l();
                });
            }

            if (feedbackChanged) {
                feedbackListeners.forEach((l) => {
                    l();
                });
            }
        },
    };
}
