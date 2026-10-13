import type { Query, QueryVariables } from '@dhis2/data-engine';

type NamedRef = { id: string; displayName?: string };

export type ServerRuleActionRaw = {
    id: string;
    programRuleActionType: string;
    data?: string;
    templateUid?: string;
    priority?: number;
    programStage?: NamedRef;
    programRuleActionEvaluationTime?: string;
};

export type ServerRuleRaw = {
    id: string;
    displayName?: string;
    programStage?: { id: string };
    programRuleActions?: ServerRuleActionRaw[];
};

export type ServerRuleActionsQueryResult = {
    programRules: { programRules: ServerRuleRaw[] };
};

export type NotificationTemplate = {
    id: string;
    displayName?: string;
    subjectTemplate?: string;
    messageTemplate?: string;
    notificationRecipient?: string;
    deliveryChannels?: string[];
    recipientUserGroup?: NamedRef;
    recipientProgramAttribute?: NamedRef;
    recipientDataElement?: NamedRef;
};

export type NotificationTemplatesQueryResult = {
    templates: { programNotificationTemplates: NotificationTemplate[] };
};

const SERVER_RULE_ACTION_FIELDS = [
    'id',
    'programRuleActionType',
    'data',
    'templateUid',
    'priority',
    'programStage[id,displayName]',
    'programRuleActionEvaluationTime',
].join(',');

const SERVER_RULE_FIELDS = [
    'id',
    'displayName',
    'programStage[id]',
    `programRuleActions[${SERVER_RULE_ACTION_FIELDS}]`,
].join(',');

const NOTIFICATION_TEMPLATE_FIELDS = [
    'id',
    'displayName',
    'subjectTemplate',
    'messageTemplate',
    'notificationRecipient',
    'deliveryChannels',
    'recipientUserGroup[id,displayName]',
    'recipientProgramAttribute[id,displayName]',
    'recipientDataElement[id,displayName]',
].join(',');

/**
 * All rules of a program with the action fields the server effects summary needs but the
 * library's metadata query deliberately omits (`templateUid`, evaluation time).
 */
export const serverRuleActionsQuery: Query = {
    programRules: {
        resource: 'programRules',
        params: (variables: QueryVariables) => ({
            filter: `program.id:eq:${variables.programId as string}`,
            paging: false,
            fields: SERVER_RULE_FIELDS,
        }),
    },
};

/** Notification templates referenced by `templateUid`s collected from the rules query. */
export const notificationTemplatesQuery: Query = {
    templates: {
        resource: 'programNotificationTemplates',
        params: (variables: QueryVariables) => ({
            filter: `id:in:[${(variables.templateUids as string[]).join(',')}]`,
            paging: false,
            fields: NOTIFICATION_TEMPLATE_FIELDS,
        }),
    },
};
