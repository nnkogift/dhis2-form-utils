import type { ConditionDescriptionState } from '../../hooks/useConditionDescription';
import { translate } from '../../i18n/index';
import { ConditionDescription } from './ConditionDescription';
import { EM_DASH, SECTION_HEADING_CLASS } from './shared';
import type { VariableChip } from './parseConditionVariables';

export type { VariableChip } from './parseConditionVariables';

export function ConditionSection({
    condition,
    variables,
    descriptionState,
}: {
    condition: string | undefined;
    variables: VariableChip[];
    descriptionState: ConditionDescriptionState;
}) {
    return (
        <section>
            <h3 className={SECTION_HEADING_CLASS}>{translate('Condition')}</h3>
            <pre className="m-0 whitespace-pre-wrap break-words rounded-[3px] border border-dhis2-grey-300 bg-dhis2-grey-200 px-dp16 py-[14px] font-mono text-[13px] leading-[1.6] text-dhis2-grey-900">
                {condition ?? EM_DASH}
            </pre>
            <div className="py-dp16">
                <ConditionDescription {...descriptionState} />
            </div>
            {variables.length ? (
                <div className="mt-dp12">
                    <p className="m-0 mb-dp8 text-xs text-dhis2-grey-600">
                        {translate('Variables referenced')}
                    </p>
                    <div className="flex flex-wrap gap-dp8">
                        {variables.map((variable) => (
                            <span
                                key={variable.token}
                                className={`inline-flex items-center gap-[4px] rounded-full px-dp8 py-[2px] text-xs ${variable.className}`}
                            >
                                <span className="font-mono font-medium">{variable.label}</span>
                                <span className="opacity-70">{translate(variable.kind)}</span>
                            </span>
                        ))}
                    </div>
                </div>
            ) : null}
        </section>
    );
}
