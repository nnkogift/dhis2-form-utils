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

export function getEffectTagVariant(type: string): EffectTagVariant {
    return EFFECT_VARIANT[type] ?? 'default';
}

export function getEffectTagClassName(type: string): string {
    return `rule-devtools-effect-tag--${getEffectTagVariant(type)}`;
}
