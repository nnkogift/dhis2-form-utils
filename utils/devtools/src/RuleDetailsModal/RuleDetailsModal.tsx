import { useConfig } from '@dhis2/app-runtime';
import { Modal, ModalContent } from '@dhis2/ui';
import type { ProgramRuleDetail } from '../programRuleDetailQuery';
import {
    resolveProgramRuleEditorApp,
    resolveProgramRuleEditUrl,
} from '../resolveProgramRuleEditUrl';
import { useConditionDescription } from '../useConditionDescription';
import { useProgramRuleDetail } from '../useProgramRuleDetail';
import { translate } from '../i18n';
import { parseConditionVariables } from './parseConditionVariables';
import { resolveRuleDisplayName } from './shared';
import { RuleDetailsBody } from './RuleDetailsBody';
import { RuleDetailsFooter } from './RuleDetailsFooter';
import { RuleDetailsHeader } from './RuleDetailsHeader';

export type RuleDetailsStatus = 'firing' | 'idle' | 'out-of-scope';

/**
 * Structural subset of `ProgramRuleVariable` (event) / the tracker `programRuleVariables` entry
 * shape — those two are distinct generated types (tracker variables never carry `dataElement`),
 * so this only asks for what condition-token resolution actually needs.
 */
export type ProgramRuleVariableLike = {
    name?: string;
    dataElement?: { displayName?: string };
    trackedEntityAttribute?: { displayName?: string };
};

export type RuleDetailsModalProps = {
    open: boolean;
    onClose: () => void;
    ruleId: string | null;
    /** Already known from the catalog list — shown immediately, before the detail fetch resolves. */
    ruleName: string;
    status: RuleDetailsStatus;
    programStageName?: string | null;
    programRuleVariables: readonly ProgramRuleVariableLike[];
};

function resolveStatusChip(status: RuleDetailsStatus): { label: string; className: string } {
    switch (status) {
        case 'firing':
            return {
                label: translate('Firing'),
                className: 'bg-dhis2-teal-100 text-dhis2-teal-900',
            };
        case 'idle':
            return { label: translate('Idle'), className: 'bg-dhis2-grey-200 text-dhis2-grey-700' };
        case 'out-of-scope':
            return {
                label: translate('Out of scope'),
                className: 'bg-dhis2-grey-200 text-dhis2-grey-600',
            };
    }
}

function resolveActiveRuleId(open: boolean, ruleId: string | null): string | null {
    return open ? ruleId : null;
}

function shouldRenderModal(open: boolean, ruleId: string | null): ruleId is string {
    return open && ruleId != null;
}

function resolveConditionText(rule: ProgramRuleDetail | undefined): string | undefined {
    return rule?.condition;
}

function resolveProgramId(rule: ProgramRuleDetail | undefined): string | undefined {
    return rule?.program?.id;
}

export function RuleDetailsModal({
    open,
    onClose,
    ruleId,
    ruleName,
    status,
    programStageName,
    programRuleVariables,
}: RuleDetailsModalProps) {
    const { detail, loading, error } = useProgramRuleDetail(resolveActiveRuleId(open, ruleId));
    const descriptionState = useConditionDescription(
        resolveConditionText(detail),
        resolveProgramId(detail)
    );
    const { baseUrl, serverVersion: { minor: minorVersion } = { minor: 0 } } = useConfig();

    if (!shouldRenderModal(open, ruleId)) {
        return null;
    }

    const chip = resolveStatusChip(status);
    const variables = parseConditionVariables(resolveConditionText(detail), programRuleVariables);
    const title = resolveRuleDisplayName(detail, ruleName);
    const editUrl = resolveProgramRuleEditUrl(baseUrl, minorVersion, ruleId);
    const editorApp = resolveProgramRuleEditorApp(minorVersion);

    return (
        <Modal position="middle" onClose={onClose}>
            <RuleDetailsHeader title={title} chip={chip} description={detail?.description} />
            <ModalContent>
                <RuleDetailsBody
                    detail={detail}
                    loading={loading}
                    error={error}
                    ruleName={ruleName}
                    programStageName={programStageName}
                    variables={variables}
                    descriptionState={descriptionState}
                />
            </ModalContent>
            <RuleDetailsFooter onClose={onClose} editUrl={editUrl} editorApp={editorApp} />
        </Modal>
    );
}
