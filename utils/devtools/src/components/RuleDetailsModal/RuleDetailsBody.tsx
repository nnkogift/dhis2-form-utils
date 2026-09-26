import { CircularLoader } from '@dhis2/ui';
import type { ConditionDescriptionState } from '../../hooks/useConditionDescription';
import type { ProgramRuleDetail } from '../../api/programRuleDetailQuery';
import { translate } from '../../i18n';
import { RuleDetailsContent } from './RuleDetailsContent';
import type { VariableChip } from './ConditionSection';

export function RuleDetailsBody({
    detail,
    loading,
    error,
    ruleName,
    programStageName,
    variables,
    descriptionState,
}: {
    detail: ProgramRuleDetail | undefined;
    loading: boolean;
    error: Error | undefined;
    ruleName: string;
    programStageName?: string | null;
    variables: VariableChip[];
    descriptionState: ConditionDescriptionState;
}) {
    if (loading) {
        return (
            <div className="flex min-h-[280px] items-center justify-center">
                <CircularLoader small />
            </div>
        );
    }
    if (error) {
        return (
            <p className="m-0 text-sm text-dhis2-red-700">
                {translate('Could not load this rule: {{message}}', { message: error.message })}
            </p>
        );
    }
    if (!detail) {
        return null;
    }
    return (
        <RuleDetailsContent
            detail={detail}
            ruleName={ruleName}
            programStageName={programStageName}
            variables={variables}
            descriptionState={descriptionState}
        />
    );
}
