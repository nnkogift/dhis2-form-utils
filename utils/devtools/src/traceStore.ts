import type { RuleTraceEntry } from '@dhis2-form-utils/hooks';
import { DEFAULT_TRACE_MAX_ENTRIES } from './constants';

type Listener = () => void;

export type RuleTraceStore = {
    record: (entry: RuleTraceEntry) => void;
    getSnapshot: () => readonly RuleTraceEntry[];
    subscribe: (listener: Listener) => () => void;
    dispose: () => void;
};

export function createRuleTraceStore(maxEntries = DEFAULT_TRACE_MAX_ENTRIES): RuleTraceStore {
    let entries: RuleTraceEntry[] = [];
    const listeners = new Set<Listener>();
    let disposeTraceSubscription: (() => void) | null = null;

    const notify = () => {
        for (const listener of listeners) {
            listener();
        }
    };

    return {
        record(entry) {
            entries = [...entries, entry].slice(-maxEntries);
            notify();
        },
        getSnapshot() {
            return entries;
        },
        subscribe(listener) {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        dispose() {
            disposeTraceSubscription?.();
            disposeTraceSubscription = null;
            listeners.clear();
        },
        bindTraceSubscription(unsubscribe: () => void) {
            disposeTraceSubscription = unsubscribe;
        },
    } as RuleTraceStore & {
        bindTraceSubscription: (unsubscribe: () => void) => void;
    };
}
