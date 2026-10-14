export type RuleLinkButtonProps = {
    ruleId: string;
    ruleName: string;
    onOpen: (ruleId: string) => void;
};

export function RuleLinkButton({ ruleId, ruleName, onOpen }: RuleLinkButtonProps) {
    return (
        <button
            type="button"
            aria-haspopup="dialog"
            onClick={() => {
                onOpen(ruleId);
            }}
            className="cursor-pointer rounded-sm border-0 bg-transparent px-dp4 py-dp8 text-start text-[0.8125rem] font-medium text-dhis2-blue-900 underline hover:text-dhis2-blue-1000 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dhis2-blue-700"
        >
            {ruleName}
        </button>
    );
}
