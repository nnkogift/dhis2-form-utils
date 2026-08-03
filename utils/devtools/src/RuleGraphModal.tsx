import { Modal, ModalContent, ModalTitle } from '@dhis2/ui';
import { translate } from './i18n';
import { RuleGraphView, type RuleGraphViewProps } from './RuleGraphView';

export type RuleGraphModalProps = Omit<
    RuleGraphViewProps,
    'className' | 'minHeightClassName' | 'headerActions'
> & {
    open: boolean;
    onClose: () => void;
    subtitle?: string | null;
};

export function RuleGraphModal({
    open,
    onClose,
    subtitle,
    layoutKey,
    ...graphProps
}: RuleGraphModalProps) {
    if (!open) {
        return null;
    }

    return (
        <Modal large fluid onClose={onClose}>
            <ModalTitle>
                {translate('Rule dependency graph')}
                {subtitle ? (
                    <span className="mt-dp4 block text-sm font-normal text-dhis2-grey-700">
                        {subtitle}
                    </span>
                ) : null}
            </ModalTitle>
            <ModalContent className="p-0">
                <div className="h-[min(85vh,900px)] w-full min-w-[min(1200px,92vw)]">
                    <RuleGraphView
                        {...graphProps}
                        layoutKey={layoutKey ?? 'modal'}
                        className="h-full min-h-0 rounded-none border-0"
                        minHeightClassName="min-h-0 h-full"
                    />
                </div>
            </ModalContent>
        </Modal>
    );
}
