import { translate } from '../i18n';

/**
 * `Modal` already renders its own absolutely-positioned close button and wraps every child in
 * a uniform 24px padding box — this bleeds that padding away on its own edges (negative margin)
 * and re-applies the design's own padding, instead of stacking a second layer of padding (and
 * a duplicate close icon) inside it. A plain div defaults to flex `order: 0`, which already
 * sorts before `ModalContent` (order 2) and the footer below (explicit `order: 3`).
 */
export function RuleDetailsHeader({
    title,
    chip,
    description,
}: {
    title: string;
    chip: { label: string; className: string };
    description?: string;
}) {
    return (
        <div className="-mx-dp24 -mt-dp24 mb-0 border-b border-dhis2-grey-300 px-dp24 pb-dp16 pe-[44px] pt-[20px]">
            <p className="m-0 text-[11px] font-bold uppercase tracking-[.09em] text-dhis2-grey-600">
                {translate('Program rule')}
            </p>
            <div className="mt-[6px] flex flex-wrap items-center gap-dp8">
                <h2 className="m-0 text-xl font-medium leading-[1.3] text-dhis2-grey-900">
                    {title}
                </h2>
                <span
                    className={`rounded-[4px] px-dp8 py-[2px] text-xs font-semibold ${chip.className}`}
                >
                    {chip.label}
                </span>
            </div>
            {description ? (
                <p
                    className="m-0 mt-[6px] text-sm text-dhis2-grey-700"
                    style={{ textWrap: 'pretty' }}
                >
                    {description}
                </p>
            ) : null}
        </div>
    );
}
