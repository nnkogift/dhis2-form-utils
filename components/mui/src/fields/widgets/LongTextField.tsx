import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { D2TextField } from './TextField';

export function D2LongTextField(props: WidgetProps) {
    return <D2TextField {...props} multiline />;
}
