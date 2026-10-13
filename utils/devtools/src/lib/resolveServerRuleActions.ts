import { ProgramRuleActionType } from '@nnkogift/dhis2-form-utils-metadata';
import type {
    NotificationTemplate,
    ServerRuleActionRaw,
    ServerRuleRaw,
} from '../api/serverRuleActionsQuery';

const SERVER_ACTION_TYPES: ReadonlySet<string> = new Set([
    ProgramRuleActionType.SENDMESSAGE,
    ProgramRuleActionType.SCHEDULEMESSAGE,
    ProgramRuleActionType.SCHEDULEEVENT,
    ProgramRuleActionType.CREATEEVENT,
]);

export type ServerRuleAction = ServerRuleActionRaw & {
    /** Resolved from `templateUid`; undefined when the action has none or it was not found. */
    template?: NotificationTemplate;
};

/** ruleId → the rule's server-side actions, in the order the server returned them. */
export type ServerRuleActionsByRule = Record<string, ServerRuleAction[]>;

function isServerAction(action: ServerRuleActionRaw): boolean {
    return SERVER_ACTION_TYPES.has(action.programRuleActionType);
}

export function collectTemplateUids(rules: ServerRuleRaw[]): string[] {
    const uids = new Set<string>();
    for (const rule of rules) {
        for (const action of rule.programRuleActions ?? []) {
            if (isServerAction(action) && action.templateUid) {
                uids.add(action.templateUid);
            }
        }
    }
    return [...uids];
}

export function resolveServerRuleActions(
    rules: ServerRuleRaw[],
    templates: NotificationTemplate[]
): ServerRuleActionsByRule {
    const templatesById = new Map(templates.map((template) => [template.id, template]));
    const result: ServerRuleActionsByRule = {};

    for (const rule of rules) {
        const actions = (rule.programRuleActions ?? []).filter(isServerAction);
        if (actions.length === 0) {
            continue;
        }
        result[rule.id] = actions.map((action) => ({
            ...action,
            template: action.templateUid ? templatesById.get(action.templateUid) : undefined,
        }));
    }

    return result;
}
