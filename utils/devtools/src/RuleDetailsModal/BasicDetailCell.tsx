export function BasicDetailCell({
    label,
    value,
    mono,
}: {
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div className="min-w-0">
            <p className="m-0 text-xs text-dhis2-grey-600">{label}</p>
            <p className={`m-0 mt-[2px] text-sm text-dhis2-grey-900 ${mono ? 'font-mono' : ''}`}>
                {value}
            </p>
        </div>
    );
}
