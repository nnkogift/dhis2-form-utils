export type EffectTagVariant = 'hide' | 'show' | 'assign' | 'warning' | 'feedback' | 'default';

const EFFECT_VARIANT: Record<string, EffectTagVariant> = {
    HIDEFIELD: 'hide',
    HIDEOPTION: 'hide',
    HIDEOPTIONGROUP: 'hide',
    HIDESECTION: 'hide',
    HIDEPROGRAMSTAGE: 'hide',
    SHOWFIELD: 'show',
    SHOWOPTION: 'show',
    SHOWOPTIONGROUP: 'show',
    ASSIGN: 'assign',
    SETMANDATORYFIELD: 'assign',
    UNSETMANDATORYFIELD: 'assign',
    SHOWWARNING: 'warning',
    SHOWERROR: 'warning',
    WARNINGONCOMPLETE: 'warning',
    ERRORONCOMPLETE: 'warning',
    DISPLAYTEXT: 'feedback',
    DISPLAYKEYVALUEPAIR: 'feedback',
};

const EFFECT_TAG_CLASSES: Record<EffectTagVariant, string> = {
    hide: 'bg-dhis2-grey-200 text-dhis2-grey-900',
    show: 'bg-dhis2-green-100 text-dhis2-green-900',
    assign: 'bg-dhis2-blue-100 text-dhis2-blue-900',
    warning: 'bg-dhis2-red-100 text-dhis2-red-900',
    feedback: 'bg-dhis2-purple-100 text-dhis2-purple-900',
    default: 'bg-dhis2-grey-100 text-dhis2-grey-800',
};

export function getEffectTagVariant(type: string): EffectTagVariant {
    return EFFECT_VARIANT[type] ?? 'default';
}

export function getEffectTagClassName(type: string): string {
    return EFFECT_TAG_CLASSES[getEffectTagVariant(type)];
}
