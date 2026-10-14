export type ServerReportLevel = 'ERROR' | 'WARNING' | 'ASSIGN_OVERWRITE';

export type ServerReportEntry = {
    ruleId: string;
    /** `ProgramRuleActionType` the server reported against, e.g. `SHOWERROR`, `SENDMESSAGE`. */
    actionType: string;
    level: ServerReportLevel;
    message: string;
    /** Data element / attribute uid the entry applies to, when the server names one. */
    targetId?: string;
};

/** What the server reported for the submitted payload (e.g. from a tracker importer dry run). */
export type ServerVerification = {
    entries: ServerReportEntry[];
};
