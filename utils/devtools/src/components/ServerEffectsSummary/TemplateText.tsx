import { renderTemplatePlaceholders } from '../../lib/renderTemplatePlaceholders';

export type TemplateTextProps = {
    template: string;
    values: Record<string, unknown>;
};

export function TemplateText({ template, values }: TemplateTextProps) {
    const segments = renderTemplatePlaceholders(template, values);

    return (
        <p className="m-0 flex flex-wrap items-center gap-x-dp4 gap-y-dp4 text-[0.8125rem] leading-[1.45] break-words text-dhis2-grey-800">
            {segments.map((segment, index) =>
                segment.kind === 'text' ? (
                    <span key={index} className="whitespace-pre-wrap">
                        {segment.text}
                    </span>
                ) : (
                    <code
                        key={index}
                        className="rounded border border-dhis2-grey-400 bg-dhis2-grey-200 px-dp8 py-[1px] font-mono text-xs whitespace-nowrap text-dhis2-grey-900"
                    >
                        {segment.token}
                    </code>
                )
            )}
        </p>
    );
}
