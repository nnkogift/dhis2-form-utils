import type { FC } from 'react';
import type { IconProps } from '@dhis2/ui';
import { translate } from '../i18n/index';
import {
    EFFECT_ICONS,
    getEffectTagRenderPropsForVariant,
    type EffectTagRenderProps,
    type EffectVisualVariant,
} from '../styles/effectStyles';

export type EffectLegendEntry = {
    variant: EffectVisualVariant;
    label: string;
    description: string;
    icon: FC<IconProps>;
    tagProps: EffectTagRenderProps;
};

function legendEntry(
    variant: EffectVisualVariant,
    label: string,
    description: string
): EffectLegendEntry {
    return {
        variant,
        label,
        description,
        icon: EFFECT_ICONS[variant],
        tagProps: getEffectTagRenderPropsForVariant(variant),
    };
}

/** Effect variants shown in the Graph legend, in display order. */
export const EFFECT_LEGEND: readonly EffectLegendEntry[] = [
    legendEntry(
        'read',
        translate('Read'),
        translate('The rule reads this field in its condition.')
    ),
    legendEntry(
        'hide',
        translate('Hide'),
        translate('The rule hides a field, section, option or stage.')
    ),
    legendEntry('show', translate('Show'), translate('The rule shows a field or option.')),
    legendEntry('assign', translate('Assign'), translate('The rule assigns a value to a field.')),
    legendEntry(
        'mandatory',
        translate('Required'),
        translate('The rule makes a field required or optional.')
    ),
    legendEntry('warning', translate('Warning'), translate('The rule shows a warning message.')),
    legendEntry(
        'error',
        translate('Error'),
        translate('The rule shows an error and blocks saving.')
    ),
    legendEntry(
        'feedback',
        translate('Feedback'),
        translate('The rule displays text or a key-value pair in the feedback widget.')
    ),
];

export type ProvenanceTagId = 'simulated' | 'server-verified' | 'server-only' | 'not-executed';

export type ProvenanceTagEntry = {
    id: ProvenanceTagId;
    label: string;
    description: string;
};

/** Provenance tags shown on effects in the server effects summary. */
export const PROVENANCE_TAGS: readonly ProvenanceTagEntry[] = [
    {
        id: 'simulated',
        label: translate('Simulated'),
        description: translate(
            'The effect was evaluated in the browser and has no server report to compare with.'
        ),
    },
    {
        id: 'server-verified',
        label: translate('Server-verified'),
        description: translate('The browser and the server both produced this effect.'),
    },
    {
        id: 'server-only',
        label: translate('Server only'),
        description: translate(
            'The server reported this effect but the browser did not simulate it.'
        ),
    },
    {
        id: 'not-executed',
        label: translate('Not executed by this server'),
        description: translate(
            'The server version does not execute this action type, so it is shown for reference only.'
        ),
    },
];
