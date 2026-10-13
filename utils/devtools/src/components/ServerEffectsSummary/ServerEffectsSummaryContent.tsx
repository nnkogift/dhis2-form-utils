import { translate } from '../../i18n/index';
import type { DevtoolsLabelLookup } from '../../lib/createLabelLookup';
import type { ServerEffectRows } from '../../lib/resolveServerEffectRows';
import { ServerEffectRowCard } from './ServerEffectRowCard';
import { ServerEffectsSection } from './ServerEffectsSection';
import { ValidationRowCard } from './ValidationRowCard';

export type ServerEffectsSummaryContentProps = {
    rows: ServerEffectRows;
    values: Record<string, unknown>;
    labelLookup: DevtoolsLabelLookup;
    onOpenRule: (ruleId: string) => void;
};

export function ServerEffectsSummaryContent({
    rows,
    values,
    labelLookup,
    onOpenRule,
}: ServerEffectsSummaryContentProps) {
    const { notifications, events, validation } = rows;
    if (notifications.length + events.length + validation.length === 0) {
        return (
            <p className="m-0 text-sm text-dhis2-grey-600">
                {translate('No server-side rule effects fired.')}
            </p>
        );
    }

    return (
        <div className="flex flex-col gap-dp24">
            <ServerEffectsSection title={translate('Notifications')} count={notifications.length}>
                {notifications.map((row) => (
                    <ServerEffectRowCard
                        key={row.key}
                        row={row}
                        values={values}
                        labelLookup={labelLookup}
                        onOpenRule={onOpenRule}
                    />
                ))}
            </ServerEffectsSection>
            <ServerEffectsSection title={translate('Events')} count={events.length}>
                {events.map((row) => (
                    <ServerEffectRowCard
                        key={row.key}
                        row={row}
                        values={values}
                        labelLookup={labelLookup}
                        onOpenRule={onOpenRule}
                    />
                ))}
            </ServerEffectsSection>
            <ServerEffectsSection title={translate('Server validation')} count={validation.length}>
                {validation.map((row) => (
                    <ValidationRowCard
                        key={row.key}
                        row={row}
                        labelLookup={labelLookup}
                        onOpenRule={onOpenRule}
                    />
                ))}
            </ServerEffectsSection>
        </div>
    );
}
