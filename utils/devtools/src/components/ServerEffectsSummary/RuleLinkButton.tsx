export type RuleLinkButtonProps = {
    ruleId: string;
    ruleName: string;
    onOpen: (ruleId: string) => void;
};

export function RuleLinkButton({ ruleId, ruleName, onOpen }: RuleLinkButtonProps) {
    return (
        <button
            type="button"
            onClick={() => {
                onOpen(ruleId);
            }}
            className="cursor-pointer border-0 bg-transparent p-0 text-start text-[0.8125rem] font-medium text-dhis2-blue-900 underline hover:text-dhis2-blue-1000"
        >
            {ruleName}
        </button>
    );
}
