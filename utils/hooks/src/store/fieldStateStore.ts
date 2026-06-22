import type { FieldState, FieldStateMap } from '@dhis2-form-utils/rules';

type Listener = () => void;

export type FieldStateStore = {
    getFieldSnapshot: (fieldId: string) => FieldState | undefined;
    getFieldState: (fieldId: string) => FieldState | undefined;
    getSnapshot: () => FieldStateMap;
    subscribe: (fieldId: string, listener: Listener) => () => void;
    subscribeField: (fieldId: string, listener: Listener) => () => void;
    subscribeAll: (listener: Listener) => () => void;
    setState: (next: FieldStateMap) => void;
};

export function createFieldStateStore(initial: FieldStateMap = {}): FieldStateStore {
    let state = initial;
    const fieldListeners = new Map<string, Set<Listener>>();
    const globalListeners = new Set<Listener>();

    const store: FieldStateStore = {
        getFieldSnapshot: (fieldId) => state[fieldId],
        getFieldState: (fieldId) => state[fieldId],
        getSnapshot: () => state,
        subscribe: (fieldId, listener) => store.subscribeField(fieldId, listener),
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

    return store;
}

function shallowEqualFieldState(a: FieldState, b: FieldState): boolean {
    return (
        a.hidden === b.hidden &&
        a.mandatory === b.mandatory &&
        a.warning === b.warning &&
        a.error === b.error &&
        a.warningOnComplete === b.warningOnComplete &&
        a.errorOnComplete === b.errorOnComplete &&
        Object.is(a.assignedValue, b.assignedValue) &&
        equalSet(a.hiddenOptions, b.hiddenOptions) &&
        equalSet(a.hiddenOptionGroups, b.hiddenOptionGroups)
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
