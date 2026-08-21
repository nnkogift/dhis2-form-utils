import { useDataQuery } from '@dhis2/app-runtime';
import { useEffect } from 'react';
import {
    programRuleDetailQuery,
    type ProgramRuleDetail,
    type ProgramRuleDetailQueryResult,
} from './programRuleDetailQuery';

export type UseProgramRuleDetailResult = {
    detail: ProgramRuleDetail | undefined;
    loading: boolean;
    error: Error | undefined;
};

function isCurrentDetail(ruleId: string | null, detail: ProgramRuleDetail | undefined): boolean {
    return ruleId != null && detail?.id === ruleId;
}

function resolveDetailState(
    ruleId: string | null,
    detail: ProgramRuleDetail | undefined,
    hasError: boolean
): Pick<UseProgramRuleDetailResult, 'detail' | 'loading'> {
    const isCurrent = isCurrentDetail(ruleId, detail);
    return {
        detail: isCurrent ? detail : undefined,
        loading: ruleId != null && !isCurrent && !hasError,
    };
}

/**
 * Lazily fetches a single program rule's full detail (actions with resolved target names,
 * code/description/lastUpdated) when `ruleId` is set — the catalog list already has enough
 * (id/name/condition/priority/scope) to render rule cards, so this only runs when the details
 * modal opens.
 */
export function useProgramRuleDetail(ruleId: string | null): UseProgramRuleDetailResult {
    const { data, error, refetch } = useDataQuery<ProgramRuleDetailQueryResult>(
        programRuleDetailQuery,
        { lazy: true }
    );

    useEffect(() => {
        if (ruleId) {
            void refetch({ ruleId });
        }
    }, [ruleId, refetch]);

    return { ...resolveDetailState(ruleId, data?.programRule, Boolean(error)), error };
}
