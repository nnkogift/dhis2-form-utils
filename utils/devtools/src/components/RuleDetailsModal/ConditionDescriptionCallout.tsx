import { IconInfo16, NoticeBox } from '@dhis2/ui';
import { translate } from '../../i18n/index';

export function ConditionDescriptionCallout({ description }: { description: string }) {
    return (
        <NoticeBox title={translate('Description')} icon={<IconInfo16 color="#147cd7" />}>
            {description}
        </NoticeBox>
    );
}
