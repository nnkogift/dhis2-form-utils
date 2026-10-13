import { Chip } from '@dhis2/ui';
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
                    <Chip key={index} dense>
                        <span className="font-mono">{segment.token}</span>
                    </Chip>
                )
            )}
        </p>
    );
}
