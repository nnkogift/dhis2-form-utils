import { Button, ButtonStrip } from '@dhis2/ui';
import type { ProgramRuleEditorApp } from '../../lib/resolveProgramRuleEditUrl';
import { translate } from '../../i18n';

/**
 * A plain div (not `ModalActions`) — `ModalActions` sets `align-self: flex-end`, which
 * shrink-wraps it to its content width instead of stretching full-width, so the bleed-to-edge
 * trick here would compute against that shrunk box. `order: 3` reproduces `ModalActions`'
 * position in the flex column without that side effect.
 */
export function RuleDetailsFooter({
    onClose,
    editUrl,
    editorApp,
}: {
    onClose: () => void;
    editUrl: string;
    editorApp: ProgramRuleEditorApp;
}) {
    const appName =
        editorApp === 'metadata-management'
            ? translate('Metadata Management app')
            : translate('Maintenance app');

    return (
        <div
            style={{ order: 3 }}
            className="-mx-dp24 -mb-dp24 mt-dp16 flex items-center justify-between gap-dp12 border-t border-dhis2-grey-300 bg-dhis2-grey-050 px-dp24 py-[14px]"
        >
            <p className="m-0 text-sm text-dhis2-grey-600">
                {translate('Read-only view.')}{' '}
                <a
                    href={editUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-dhis2-blue-900 underline hover:text-dhis2-blue-1000"
                >
                    {translate('Edit in {{appName}}', { appName })}
                </a>
            </p>
            <ButtonStrip>
                <Button secondary onClick={onClose}>
                    {translate('Close')}
                </Button>
            </ButtonStrip>
        </div>
    );
}
