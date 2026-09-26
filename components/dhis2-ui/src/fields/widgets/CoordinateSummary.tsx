import { parseCoordinateValue } from '@nnkogift/dhis2-form-utils-map';

import './fieldWidgetLayout.css';

// A definition list pairs each axis label with its value for assistive tech, and tabular figures
// keep the digits from jittering in width as the user edits the pair.
export function CoordinateSummary({ value }: { value: string }) {
    const parsed = parseCoordinateValue(value);
    if (!parsed) {
        return <span className="d2-field-muted">No location set</span>;
    }

    return (
        <dl className="d2-coordinate-summary">
            <div className="d2-coordinate-axis">
                <dt className="d2-coordinate-label">Lat</dt>
                <dd className="d2-coordinate-value">{parsed.lat.toFixed(5)}</dd>
            </div>
            <div className="d2-coordinate-axis">
                <dt className="d2-coordinate-label">Lng</dt>
                <dd className="d2-coordinate-value">{parsed.lng.toFixed(5)}</dd>
            </div>
        </dl>
    );
}
