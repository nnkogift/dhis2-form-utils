import type { FieldState, FieldStateMap } from '@dhis2-form-utils/rules';

type Listener = () => void;

export type FieldStateStore = {
    getFieldState: (fieldId: string) => FieldState | undefined;
    getSnapshot: () => FieldStateMap;
    subscribeField: (fieldId: string, listener: Listener) => () => void;
    subscribeAll: (listener: Listener) => () => void;
    setState: (next: FieldStateMap) => void;
};

export function createFieldStateStore(initial: FieldStateMap = {}): FieldStateStore {
    let state = initial;
    const fieldListeners = new Map<string, Set<Listener>>();
    const globalListeners = new Set<Listener>();

    return {
        getFieldState: (fieldId) => state[fieldId],
        getSnapshot: () => state,

        subscribeField: (fieldId, listener) => {
            let listeners = fieldListeners.get(fieldId);
            if (!listeners) {
                listeners = new Set();
                fieldListeners.set(fieldId, listeners);
            }

            listeners.add(listener);
            return () => {
                fieldListeners.get(fieldId)?.delete(listener);
            };
        },

        subscribeAll: (listener) => {
            globalListeners.add(listener);
            return () => {
                globalListeners.delete(listener);
            };
        },

        setState: (next) => {
            const prev = state;
            const merged: FieldStateMap = {};
            const changed = new Set<string>();

            for (const fieldId of Object.keys(next)) {
                const b = next[fieldId];

                if (fieldId in prev) {
                    const a = prev[fieldId];
                    if (shallowEqualFieldState(a, b)) {
                        merged[fieldId] = a;
                        continue;
                    }
                }

                merged[fieldId] = b;
                changed.add(fieldId);
            }

            for (const fieldId of Object.keys(prev)) {
                if (!(fieldId in next)) {
                    changed.add(fieldId);
                }
            }

            // Important: ensure referential identity is preserved for unchanged fields.
            state = merged;

            if (!changed.size) {
                return;
            }

            for (const fieldId of changed) {
                fieldListeners.get(fieldId)?.forEach((l) => {
                    l();
                });
            }
            globalListeners.forEach((l) => {
                l();
            });
        },
    };
}

function shallowEqualFieldState(a: FieldState, b: FieldState): boolean {
    return (
        a.hidden === b.hidden &&
        a.mandatory === b.mandatory &&
        a.warning === b.warning &&
        a.error === b.error &&
        Object.is(a.assignedValue, b.assignedValue) &&
        equalSet(a.hiddenOptions, b.hiddenOptions) &&
        equalSet(a.hiddenOptionGroups, b.hiddenOptionGroups) &&
        equalSet(a.hiddenSections, b.hiddenSections)
    );
}

function equalSet<T>(a: Set<T>, b: Set<T>): boolean {
    if (a === b) return true;
    if (a.size !== b.size) return false;
    for (const value of a) {
        if (!b.has(value)) return false;
    }
    return true;
}
