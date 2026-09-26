import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { TypedTextField } from './TypedTextField';

export function D2EmailField(props: WidgetProps) {
    return <TypedTextField {...props} type="email" />;
}
