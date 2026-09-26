import type { ConditionDescriptionState } from '../../hooks/useConditionDescription';
import type { ProgramRuleDetail } from '../../api/programRuleDetailQuery';
import { translate } from '../../i18n/index';
import { ActionsSection } from './ActionsSection';
import { BasicDetails } from './BasicDetails';
import { ConditionSection, type VariableChip } from './ConditionSection';
import { SECTION_HEADING_CLASS } from './shared';

export function RuleDetailsContent({
    detail,
    ruleName,
    programStageName,
    variables,
    descriptionState,
}: {
    detail: ProgramRuleDetail;
    ruleName: string;
    programStageName?: string | null;
    variables: VariableChip[];
    descriptionState: ConditionDescriptionState;
}) {
    return (
        <div className="flex flex-col gap-dp24 pt-dp16">
            <section>
                <h3 className={SECTION_HEADING_CLASS}>{translate('Basic details')}</h3>
                <BasicDetails
                    rule={detail}
                    ruleName={ruleName}
                    programStageName={programStageName}
                />
            </section>
            <ConditionSection
                condition={detail.condition}
                variables={variables}
                descriptionState={descriptionState}
            />
            <ActionsSection actions={detail.programRuleActions ?? []} />
        </div>
    );
}
