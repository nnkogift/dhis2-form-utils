import { CircularLoader } from '@dhis2/ui';
import { translate } from '../../i18n/index';

export function ConditionDescriptionLoading() {
    return (
        <div className="mt-dp12 flex items-center gap-dp8 text-dhis2-grey-600">
            <CircularLoader extrasmall />
            <span className="text-sm">{translate('Generating a plain-language description…')}</span>
        </div>
    );
}
