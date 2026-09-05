import { useDataMutation } from '@dhis2/app-runtime';
import { useEffect, useState } from 'react';
import { conditionDescriptionMutation } from './conditionDescriptionMutation';

export type ConditionDescriptionState = {
    description: string | undefined;
    warning: string | undefined;
    loading: boolean;
};

const EMPTY_STATE: ConditionDescriptionState = {
    description: undefined,
    warning: undefined,
    loading: false,
};

export function parseConditionDescriptionResult(
    data: unknown
): Pick<ConditionDescriptionState, 'description' | 'warning'> {
    if (typeof data !== 'object' || data === null) {
        return { description: undefined, warning: undefined };
    }
    const result = data as { status?: unknown; description?: unknown; message?: unknown };
    if (
        result.status === 'OK' &&
        typeof result.description === 'string' &&
        result.description.trim()
    ) {
        return { description: result.description, warning: undefined };
    }
    if (result.status === 'ERROR' && typeof result.message === 'string' && result.message.trim()) {
        return { description: undefined, warning: result.message };
    }
    return { description: undefined, warning: undefined };
}

function resolveRequestKey(
    condition: string | undefined,
    programId: string | undefined
): string | null {
    if (!condition?.trim() || !programId) {
        return null;
    }
    return `${programId}::${condition}`;
}

/**
 * Fetches a plain-language reading of a condition from the same DHIS2 endpoint the
 * Maintenance app uses. Fires once per (condition, programId) pair when the details modal
 * opens; fails quiet on transport/permission errors (older DHIS2 instances, offline) since the
 * raw condition + variable chips already cover the essentials — only a well-formed `ERROR`
 * response (bad expression syntax) surfaces as a `warning`.
 */
export function useConditionDescription(
    condition: string | undefined,
    programId: string | undefined
): ConditionDescriptionState {
    const [mutate] = useDataMutation(conditionDescriptionMutation);
    const key = resolveRequestKey(condition, programId);
    const [state, setState] = useState<{ key: string | null } & ConditionDescriptionState>({
        key: null,
        ...EMPTY_STATE,
    });

    useEffect(() => {
        if (!key || !condition || !programId) {
            setState({ key: null, ...EMPTY_STATE });
            return;
        }
        let cancelled = false;
        setState({ key, description: undefined, warning: undefined, loading: true });
        mutate({ condition, programId })
            .then((data) => {
                if (!cancelled) {
                    setState({ key, loading: false, ...parseConditionDescriptionResult(data) });
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setState({ key, ...EMPTY_STATE });
                }
            });
        return () => {
            cancelled = true;
        };
    }, [key, condition, programId, mutate]);

    if (state.key !== key) {
        return key ? { description: undefined, warning: undefined, loading: true } : EMPTY_STATE;
    }
    return { description: state.description, warning: state.warning, loading: state.loading };
}
