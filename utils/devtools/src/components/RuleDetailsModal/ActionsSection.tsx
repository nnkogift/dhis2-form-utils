import type { ProgramRuleActionDetail } from '../../api/programRuleDetailQuery';
import { translate } from '../../i18n/index';
import { ActionCard } from './ActionCard';
import { SECTION_HEADING_CLASS } from './shared';

export function ActionsSection({ actions }: { actions: ProgramRuleActionDetail[] }) {
    return (
        <section>
            <h3 className={SECTION_HEADING_CLASS}>{translate('Actions')}</h3>
            <div className="flex flex-col gap-dp12">
                {actions.map((action, index) => (
                    <ActionCard key={action.id} action={action} index={index} />
                ))}
            </div>
        </section>
    );
}
