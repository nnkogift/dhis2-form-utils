import { translate } from '../../i18n';

export function ConditionDescriptionWarning({ warning }: { warning: string }) {
    return (
        <p className="m-0 mt-dp12 rounded-[3px] bg-dhis2-yellow-100 px-dp16 py-[10px] text-sm text-dhis2-yellow-900">
            {translate('Could not describe this expression: {{message}}', { message: warning })}
        </p>
    );
}
