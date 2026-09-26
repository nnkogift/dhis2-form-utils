import { translate } from '../../i18n';
import type { ConditionDescriptionState } from '../../hooks/useConditionDescription';
import { ConditionDescriptionCallout } from './ConditionDescriptionCallout';
import { ConditionDescriptionLoading } from './ConditionDescriptionLoading';
import { ConditionDescriptionWarning } from './ConditionDescriptionWarning';

// fallow-ignore-next-line complexity
export function ConditionDescription({
    loading,
    description,
    warning,
    fetchError,
}: ConditionDescriptionState) {
    if (loading) {
        return <ConditionDescriptionLoading />;
    }
    if (fetchError) {
        return (
            <ConditionDescriptionWarning
                warning={translate(
                    'Could not load a plain-language description for this condition. The raw expression is shown above.'
                )}
            />
        );
    }
    if (description) {
        return <ConditionDescriptionCallout description={description} />;
    }
    if (warning) {
        return <ConditionDescriptionWarning warning={warning} />;
    }
    return null;
}
