import { translate } from '../../i18n/index';
import type { DevtoolsLabelLookup } from '../../lib/createLabelLookup';
import type { ServerEffectRow } from '../../lib/resolveServerEffectRows';
import { DetailLine } from './DetailLine';
import { ScheduledDateLine } from './ScheduledDateLine';

export type EventDetailsProps = {
    row: ServerEffectRow;
    labelLookup: DevtoolsLabelLookup;
};

export function EventDetails({ row, labelLookup }: EventDetailsProps) {
    return (
        <dl className="m-0 flex flex-col gap-dp8">
            {row.stageId ? (
                <DetailLine label={translate('Target stage')}>
                    <span className="text-[0.8125rem] text-dhis2-grey-800">
                        {labelLookup.resolveStageName(row.stageId)}
                    </span>
                </DetailLine>
            ) : null}
            {row.scheduledDate ? (
                <ScheduledDateLine
                    label={translate('Due date')}
                    date={row.scheduledDate}
                    flagInvalid={false}
                />
            ) : null}
        </dl>
    );
}
