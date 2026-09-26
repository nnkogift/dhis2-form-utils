import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { D2TextField } from './TextField';

export function D2NumberField(props: WidgetProps) {
    return <D2TextField {...props} type="number" />;
}
