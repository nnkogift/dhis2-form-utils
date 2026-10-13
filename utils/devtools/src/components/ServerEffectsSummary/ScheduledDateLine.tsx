import { Tag } from '@dhis2/ui';
import { translate } from '../../i18n/index';
import type { ScheduledDate } from '../../lib/resolveServerEffectRows';
import { DetailLine } from './DetailLine';

export type ScheduledDateLineProps = {
    label: string;
    date: ScheduledDate;
    /** Only scheduled messages are silently dropped by the server when the date doesn't parse. */
    flagInvalid: boolean;
};

export function ScheduledDateLine({ label, date, flagInvalid }: ScheduledDateLineProps) {
    return (
        <DetailLine label={label}>
            <div className="flex flex-wrap items-center gap-dp8">
                <span className="font-mono text-[0.8125rem] text-dhis2-grey-800">
                    {date.value || '—'}
                </span>
                {flagInvalid && !date.valid ? (
                    <Tag negative>{translate('Invalid date, server will skip')}</Tag>
                ) : null}
            </div>
        </DetailLine>
    );
}
