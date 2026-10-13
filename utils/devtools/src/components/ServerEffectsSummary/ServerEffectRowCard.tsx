import { translate } from '../../i18n/index';
import type { DevtoolsLabelLookup } from '../../lib/createLabelLookup';
import type { ServerEffectRow } from '../../lib/resolveServerEffectRows';
import { EffectBadge } from '../EffectBadge';
import { EventDetails } from './EventDetails';
import { NotificationDetails } from './NotificationDetails';
import { ProvenanceTag } from './ProvenanceTag';
import { RuleLinkButton } from './RuleLinkButton';

export type ServerEffectRowCardProps = {
    row: ServerEffectRow;
    values: Record<string, unknown>;
    labelLookup: DevtoolsLabelLookup;
    onOpenRule: (ruleId: string) => void;
};

function resolveUnsupportedMessage(row: ServerEffectRow): string {
    return row.requiredMinor === null
        ? translate('Not executed by this server')
        : translate('Not executed by this server (requires 2.{{minor}})', {
              minor: row.requiredMinor,
          });
}

export function ServerEffectRowCard({
    row,
    values,
    labelLookup,
    onOpenRule,
}: ServerEffectRowCardProps) {
    return (
        <li
            className={`flex flex-col gap-dp8 rounded border border-dhis2-grey-200 bg-dhis2-grey-050 p-dp12 ${row.executedByServer ? '' : 'opacity-60'}`}
        >
            <div className="flex flex-wrap items-center gap-dp8">
                <EffectBadge type={row.actionType} />
                <RuleLinkButton
                    ruleId={row.ruleId}
                    ruleName={labelLookup.resolveRuleName(row.ruleId)}
                    onOpen={onOpenRule}
                />
                <span className="ms-auto">
                    <ProvenanceTag provenance={row.provenance} />
                </span>
            </div>
            {row.executedByServer ? null : (
                <p className="m-0 text-xs font-medium text-dhis2-grey-700">
                    {resolveUnsupportedMessage(row)}
                </p>
            )}
            {row.section === 'notifications' ? (
                <NotificationDetails row={row} values={values} />
            ) : (
                <EventDetails row={row} labelLookup={labelLookup} />
            )}
        </li>
    );
}
