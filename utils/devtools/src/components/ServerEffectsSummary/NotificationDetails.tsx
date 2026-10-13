import { translate } from '../../i18n/index';
import { ProgramRuleActionType } from '@nnkogift/dhis2-form-utils-metadata';
import { resolveNotificationRecipient } from '../../lib/resolveNotificationRecipient';
import type { ServerEffectRow } from '../../lib/resolveServerEffectRows';
import { DetailLine } from './DetailLine';
import { ScheduledDateLine } from './ScheduledDateLine';
import { TemplateText } from './TemplateText';

export type NotificationDetailsProps = {
    row: ServerEffectRow;
    values: Record<string, unknown>;
};

export function NotificationDetails({ row, values }: NotificationDetailsProps) {
    const { template, scheduledDate } = row;
    if (!template) {
        return (
            <p className="m-0 text-[0.8125rem] text-dhis2-grey-600">
                {translate('Notification template not found for this action.')}
            </p>
        );
    }

    const recipient = resolveNotificationRecipient(template);

    return (
        <div className="flex flex-col gap-dp8">
            <DetailLine label={translate('Template')}>
                <span className="text-[0.8125rem] text-dhis2-grey-800">
                    {template.displayName ?? template.id}
                </span>
            </DetailLine>
            {recipient ? (
                <DetailLine label={translate('Recipient')}>
                    <span className="text-[0.8125rem] text-dhis2-grey-800">{recipient}</span>
                </DetailLine>
            ) : null}
            {template.deliveryChannels?.length ? (
                <DetailLine label={translate('Delivery channels')}>
                    <span className="text-[0.8125rem] text-dhis2-grey-800">
                        {template.deliveryChannels.join(', ')}
                    </span>
                </DetailLine>
            ) : null}
            {scheduledDate ? (
                <ScheduledDateLine
                    label={translate('Scheduled for')}
                    date={scheduledDate}
                    flagInvalid={row.actionType === ProgramRuleActionType.SCHEDULEMESSAGE}
                />
            ) : null}
            {template.subjectTemplate ? (
                <DetailLine label={translate('Subject')}>
                    <TemplateText template={template.subjectTemplate} values={values} />
                </DetailLine>
            ) : null}
            {template.messageTemplate ? (
                <DetailLine label={translate('Message')}>
                    <TemplateText template={template.messageTemplate} values={values} />
                </DetailLine>
            ) : null}
        </div>
    );
}
