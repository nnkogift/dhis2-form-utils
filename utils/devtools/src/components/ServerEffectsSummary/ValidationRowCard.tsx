import { Tag } from '@dhis2/ui';
import { translate } from '../../i18n/index';
import type { DevtoolsLabelLookup } from '../../lib/createLabelLookup';
import type { ServerValidationRow } from '../../lib/resolveServerEffectRows';
import type { ServerReportLevel } from '../../lib/serverVerification';
import { ProvenanceTag } from './ProvenanceTag';
import { RuleLinkButton } from './RuleLinkButton';

export type ValidationRowCardProps = {
    row: ServerValidationRow;
    labelLookup: DevtoolsLabelLookup;
    onOpenRule: (ruleId: string) => void;
};

function LevelTag({ level }: { level: ServerReportLevel }) {
    switch (level) {
        case 'ERROR':
            return <Tag negative>{translate('Error')}</Tag>;
        case 'WARNING':
            return <Tag neutral>{translate('Warning')}</Tag>;
        case 'ASSIGN_OVERWRITE':
            return <Tag neutral>{translate('Assign overwrite')}</Tag>;
    }
}

export function ValidationRowCard({ row, labelLookup, onOpenRule }: ValidationRowCardProps) {
    const { entry } = row;

    return (
        <li
            data-test="devtools-server-validation-row"
            className="flex flex-col gap-dp8 rounded border border-dhis2-grey-200 bg-dhis2-grey-050 p-dp12"
        >
            <div className="flex flex-wrap items-center gap-dp8">
                <LevelTag level={entry.level} />
                <RuleLinkButton
                    ruleId={row.ruleId}
                    ruleName={labelLookup.resolveRuleName(row.ruleId)}
                    onOpen={onOpenRule}
                />
                <span className="ms-auto">
                    <ProvenanceTag provenance={row.provenance} />
                </span>
            </div>
            <p className="m-0 text-[0.8125rem] leading-[1.45] break-words text-dhis2-grey-800">
                {entry.targetId ? `${labelLookup.resolveFieldName(entry.targetId)}: ` : ''}
                {entry.message}
            </p>
        </li>
    );
}
