import type { ProgramRuleActionDetail } from '../../api/programRuleDetailQuery';
import { EFFECT_ICONS, getEffectVisual } from '../../styles/effectStyles';
import { translate } from '../../i18n/index';

type ActionTarget = { label: string; value: string };
type ActionTargetRef = { id: string; displayName?: string } | undefined;

/** Checked in this order — an action only ever populates one of these six target kinds. */
const ACTION_TARGET_RESOLVERS: Array<{
    label: string;
    getRef: (action: ProgramRuleActionDetail) => ActionTargetRef;
}> = [
    { label: 'Data element', getRef: (action) => action.dataElement },
    { label: 'Tracked entity attribute', getRef: (action) => action.trackedEntityAttribute },
    { label: 'Program stage section', getRef: (action) => action.programStageSection },
    { label: 'Program stage', getRef: (action) => action.programStage },
    { label: 'Option', getRef: (action) => action.option },
    { label: 'Option group', getRef: (action) => action.optionGroup },
];

function formatActionTargetValue(ref: NonNullable<ActionTargetRef>): string {
    return `${ref.displayName ?? ref.id} · ${ref.id}`;
}

function resolveActionTarget(action: ProgramRuleActionDetail): ActionTarget | null {
    for (const { label, getRef } of ACTION_TARGET_RESOLVERS) {
        const ref = getRef(action);
        if (ref?.id) {
            return { label: translate(label), value: formatActionTargetValue(ref) };
        }
    }
    return null;
}

type DetailRow = { label: string; value: string; mono?: boolean };

const FEEDBACK_ACTION_TYPES: ReadonlySet<string> = new Set(['DISPLAYTEXT', 'DISPLAYKEYVALUEPAIR']);

function resolveDataRow(action: ProgramRuleActionDetail): DetailRow | null {
    return action.data
        ? { label: translate('Data (expression)'), value: action.data, mono: true }
        : null;
}

function resolveContentRow(action: ProgramRuleActionDetail): DetailRow | null {
    const showContent =
        Boolean(action.content) && FEEDBACK_ACTION_TYPES.has(action.programRuleActionType);
    return showContent
        ? { label: translate('Content (static text)'), value: action.content ?? '' }
        : null;
}

function resolveLocationRow(action: ProgramRuleActionDetail): DetailRow | null {
    return action.location
        ? { label: translate('Location'), value: action.location, mono: true }
        : null;
}

function resolveActionRows(action: ProgramRuleActionDetail): DetailRow[] {
    const rows = [
        resolveActionTarget(action),
        resolveDataRow(action),
        resolveContentRow(action),
        resolveLocationRow(action),
    ];
    return rows.filter((row): row is DetailRow => row !== null);
}

export function ActionCard({ action, index }: { action: ProgramRuleActionDetail; index: number }) {
    const type = action.programRuleActionType;
    const visual = getEffectVisual(type);
    const Icon = EFFECT_ICONS[visual.variant];
    const rows = resolveActionRows(action);

    return (
        <div
            className="relative rounded-[3px] border border-dhis2-grey-300 bg-white py-dp12 pe-dp16 ps-dp16 shadow-[0_1px_2px_rgb(0_0_0/4%)]"
            style={{ borderInlineStartWidth: 3, borderInlineStartColor: visual.edgeStroke }}
        >
            <div className="mb-dp12 flex items-center justify-between gap-dp8">
                <span
                    className={`inline-flex items-center gap-[4px] rounded-[4px] px-dp8 py-[2px] text-xs font-semibold ${visual.tagClassName}`}
                >
                    <Icon />
                    {type}
                </span>
                <span className="text-[11px] uppercase tracking-wide text-dhis2-grey-600">
                    {translate('Action {{n}}', { n: index + 1 })}
                </span>
            </div>
            <div className="flex flex-col gap-dp10">
                {rows.map((row) => (
                    <div key={row.label} className="grid grid-cols-[172px_minmax(0,1fr)] gap-dp10">
                        <span className="text-xs text-dhis2-grey-600">{row.label}</span>
                        <span
                            className={`min-w-0 break-words text-sm ${row.mono ? 'font-mono text-[12px]' : ''}`}
                        >
                            {row.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
