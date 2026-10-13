import { useDataEngine } from '@dhis2/app-runtime';
import { useEffect, useState } from 'react';
import {
    notificationTemplatesQuery,
    serverRuleActionsQuery,
    type NotificationTemplatesQueryResult,
    type ServerRuleActionsQueryResult,
} from '../api/serverRuleActionsQuery';
import {
    collectTemplateUids,
    resolveServerRuleActions,
    type ServerRuleActionsByRule,
} from '../lib/resolveServerRuleActions';

export type UseServerRuleActionsResult = {
    actionsByRule: ServerRuleActionsByRule | undefined;
    loading: boolean;
    error: Error | undefined;
};

type FetchState = {
    programId: string;
    actionsByRule?: ServerRuleActionsByRule;
    error?: Error;
};

const toError = (error: unknown): Error =>
    error instanceof Error ? error : new Error(String(error));

/**
 * Lazily fetches each rule's server-side actions (SENDMESSAGE, SCHEDULEMESSAGE, SCHEDULEEVENT,
 * CREATEEVENT) with their notification templates resolved. Kept out of the library's metadata
 * query because data entry apps don't need it; only runs while `enabled` (i.e. when the server
 * effects summary is open) so the rules panel stays light.
 *
 * Actions are returned in the order the server returns them within each rule. Consumers must
 * match them to simulated effects by order: when a rule has several actions of the same type
 * (e.g. two SENDMESSAGE), the nth effect of that type corresponds to the nth action of that
 * type — effects carry no action id.
 *
 * The template request is skipped entirely when no server action references a template.
 */
export function useServerRuleActions(
    programId: string | undefined,
    { enabled = true }: { enabled?: boolean } = {}
): UseServerRuleActionsResult {
    const engine = useDataEngine();
    const [state, setState] = useState<FetchState | undefined>();

    useEffect(() => {
        if (!enabled || !programId) {
            return;
        }
        let cancelled = false;

        const load = async (): Promise<ServerRuleActionsByRule> => {
            const { programRules } = (await engine.query(serverRuleActionsQuery, {
                variables: { programId },
            })) as ServerRuleActionsQueryResult;
            const rules = programRules.programRules;

            const templateUids = collectTemplateUids(rules);
            if (templateUids.length === 0) {
                return resolveServerRuleActions(rules, []);
            }
            const { templates } = (await engine.query(notificationTemplatesQuery, {
                variables: { templateUids },
            })) as NotificationTemplatesQueryResult;
            return resolveServerRuleActions(rules, templates.programNotificationTemplates);
        };

        load()
            .then((actionsByRule) => {
                if (!cancelled) {
                    setState({ programId, actionsByRule });
                }
            })
            .catch((error: unknown) => {
                if (!cancelled) {
                    setState({ programId, error: toError(error) });
                }
            });

        return () => {
            cancelled = true;
        };
    }, [engine, programId, enabled]);

    const current = state?.programId === programId ? state : undefined;
    return {
        actionsByRule: current?.actionsByRule,
        error: current?.error,
        loading: enabled && Boolean(programId) && !current,
    };
}
