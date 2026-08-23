import type { RuleTraceEntry } from '@nnkogift/dhis2-form-utils-hooks';
import { DEFAULT_TRACE_MAX_ENTRIES } from './constants';
import { createRuleTraceStore, type RuleTraceStore } from './traceStore';

/** Structural attach surface — avoids nominal `FormStore` clashes across package versions. */
export type TraceAttachableFormStore = {
    subscribeTrace: (listener: (entry: RuleTraceEntry) => void) => () => void;
};

export function attachRuleDevtools(
    formStore: TraceAttachableFormStore,
    options?: { maxEntries?: number }
): RuleTraceStore {
    const store = createRuleTraceStore(
        options?.maxEntries ?? DEFAULT_TRACE_MAX_ENTRIES
    ) as RuleTraceStore & {
        bindTraceSubscription: (unsubscribe: () => void) => void;
    };

    store.bindTraceSubscription(formStore.subscribeTrace(store.record));

    return store;
}
