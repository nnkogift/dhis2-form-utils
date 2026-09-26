import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { D2TextField } from './TextField';

export function D2PercentageField({ control }: WidgetProps) {
    return (
        <D2TextField
            control={{
                ...control,
                fieldConfig: {
                    ...control.fieldConfig,
                    label: `${control.fieldConfig.label} (%)`,
                },
            }}
        />
    );
}
