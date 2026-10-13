import { ProgramRuleActionType } from '@nnkogift/dhis2-form-utils-metadata';

const OLDEST_SUPPORTED_MINOR = 40;
const EVENT_ACTIONS_MIN_MINOR = 43;

/**
 * Minor version in which the tracker importer started executing each action type
 * (`ProgramRuleActionType.SERVER_SUPPORTED_TYPES` on each dhis2-core release branch).
 */
const ACTION_MIN_MINOR: ReadonlyMap<ProgramRuleActionType, number> = new Map([
    [ProgramRuleActionType.SENDMESSAGE, OLDEST_SUPPORTED_MINOR],
    [ProgramRuleActionType.SCHEDULEMESSAGE, OLDEST_SUPPORTED_MINOR],
    [ProgramRuleActionType.ASSIGN, OLDEST_SUPPORTED_MINOR],
    [ProgramRuleActionType.SETMANDATORYFIELD, OLDEST_SUPPORTED_MINOR],
    [ProgramRuleActionType.SHOWERROR, OLDEST_SUPPORTED_MINOR],
    [ProgramRuleActionType.SHOWWARNING, OLDEST_SUPPORTED_MINOR],
    [ProgramRuleActionType.ERRORONCOMPLETE, OLDEST_SUPPORTED_MINOR],
    [ProgramRuleActionType.WARNINGONCOMPLETE, OLDEST_SUPPORTED_MINOR],
    [ProgramRuleActionType.SCHEDULEEVENT, EVENT_ACTIONS_MIN_MINOR],
    [ProgramRuleActionType.CREATEEVENT, EVENT_ACTIONS_MIN_MINOR],
]);

/** Declared in the server's supported types, but the importer has no executor for them. */
export const DECLARED_BUT_NOT_EXECUTED_ACTIONS: ReadonlySet<ProgramRuleActionType> = new Set([
    ProgramRuleActionType.CREATEEVENT,
]);

export type ServerRuleSupport = {
    serverActions: ReadonlySet<ProgramRuleActionType>;
    isServerExecuted(type: ProgramRuleActionType): boolean;
    /** Minor version that introduced server support for `type`, or null if never server-side. */
    minVersionFor(type: ProgramRuleActionType): number | null;
};

/** An unknown or too-old minor (e.g. 0) is treated as the oldest supported version. */
export function resolveServerRuleSupport(minor: number): ServerRuleSupport {
    const effectiveMinor = Math.max(minor, OLDEST_SUPPORTED_MINOR);
    const serverActions = new Set(
        [...ACTION_MIN_MINOR].filter(([, min]) => min <= effectiveMinor).map(([type]) => type)
    );

    return {
        serverActions,
        isServerExecuted: (type) => serverActions.has(type),
        minVersionFor: (type) => ACTION_MIN_MINOR.get(type) ?? null,
    };
}
