import { useConfig } from '@dhis2/app-runtime';
import {
    Button,
    ButtonStrip,
    CircularLoader,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
    NoticeBox,
} from '@dhis2/ui';
import type { RuleTraceEntry } from '@nnkogift/dhis2-form-utils-hooks';
import { useMemo, useState, type ReactNode } from 'react';
import { useServerRuleActions } from '../../hooks/useServerRuleActions';
import { translate } from '../../i18n/index';
import type { DevtoolsLabelLookup } from '../../lib/createLabelLookup';
import { resolveServerEffectRows } from '../../lib/resolveServerEffectRows';
import { resolveServerRuleSupport } from '../../lib/resolveServerRuleSupport';
import type { ServerVerification } from '../../lib/serverVerification';
import { RuleDetailsModal } from '../RuleDetailsModal/index';
import { ServerEffectsSummaryContent } from './ServerEffectsSummaryContent';

export type ServerEffectsSummaryProps = {
    open: boolean;
    onClose: () => void;
    programId: string;
    /** Latest entry from the form store. */
    traceEntry: RuleTraceEntry | null;
    /** Current form values, used to fill `V{}`, `A{}` and `#{}` placeholders in templates. */
    values: Record<string, unknown>;
    labelLookup: DevtoolsLabelLookup;
    /** Supplied by the app after a server dry run. */
    serverReport?: ServerVerification;
    /** App-owned actions, e.g. Verify or Confirm save. */
    footer?: ReactNode;
};

export function ServerEffectsSummary({
    open,
    onClose,
    programId,
    traceEntry,
    values,
    labelLookup,
    serverReport,
    footer,
}: ServerEffectsSummaryProps) {
    const { serverVersion: { minor: minorVersion } = { minor: 0 } } = useConfig();
    const { actionsByRule, loading, error } = useServerRuleActions(programId, { enabled: open });
    const [detailsRuleId, setDetailsRuleId] = useState<string | null>(null);

    const rows = useMemo(
        () =>
            resolveServerEffectRows({
                traceEntry,
                actionsByRule,
                support: resolveServerRuleSupport(minorVersion),
                serverReport,
            }),
        [traceEntry, actionsByRule, minorVersion, serverReport]
    );

    if (!open) {
        return null;
    }

    return (
        <>
            <Modal position="middle" large onClose={onClose}>
                <ModalTitle>{translate('Server effects')}</ModalTitle>
                <ModalContent>
                    {error ? (
                        <NoticeBox error title={translate('Could not load server-side actions')}>
                            {error.message}
                        </NoticeBox>
                    ) : null}
                    {loading ? (
                        <CircularLoader small />
                    ) : (
                        <ServerEffectsSummaryContent
                            rows={rows}
                            values={values}
                            labelLookup={labelLookup}
                            onOpenRule={setDetailsRuleId}
                        />
                    )}
                </ModalContent>
                <ModalActions>
                    <ButtonStrip>
                        {footer}
                        <Button secondary onClick={onClose}>
                            {translate('Close')}
                        </Button>
                    </ButtonStrip>
                </ModalActions>
            </Modal>
            <RuleDetailsModal
                open={detailsRuleId !== null}
                onClose={() => {
                    setDetailsRuleId(null);
                }}
                ruleId={detailsRuleId}
                ruleName={detailsRuleId ? labelLookup.resolveRuleName(detailsRuleId) : ''}
                status="firing"
                programRuleVariables={[]}
            />
        </>
    );
}
