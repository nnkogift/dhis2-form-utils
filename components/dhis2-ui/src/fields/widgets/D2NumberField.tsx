import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { TypedTextField } from './TypedTextField';

export function D2NumberField(props: WidgetProps) {
    return <TypedTextField {...props} type="number" />;
}
