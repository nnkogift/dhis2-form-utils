import { CircularLoader } from '@dhis2/ui';
import { translate } from './i18n';

export function RulesPanelGraphFallback() {
    return (
        <div
            className="flex min-h-[200px] items-center justify-center"
            role="status"
            aria-label={translate('Loading graph')}
        >
            <CircularLoader small />
        </div>
    );
}
