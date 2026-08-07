// fallow-ignore-file code-duplication
import { NumberInput, Textarea } from '@mantine/core';
import type { WidgetProps } from '@nnkogift/dhis2-form-utils-hooks';
import { resolveFieldValidation } from '@nnkogift/dhis2-form-utils-hooks';
import {
    CoordinateMapPicker,
    GeoJsonMapEditor,
    joinCoordinateValue,
    parseCoordinateValue,
    parseGeojsonGeometry,
    stringifyGeojsonGeometry,
} from '@nnkogift/dhis2-form-utils-map';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useState } from 'react';

// fallow-ignore-next-line complexity
export function D2CoordinateField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError } = resolveFieldValidation(control);
    const value = field.value as string;

    // Local text buffers, not derived directly from field.value on every render — a controlled
    // numeric input driven straight off `parseCoordinateValue(value)` rejects intermediate
    // keystrokes (e.g. typing "-" alone parses to NaN and gets silently dropped, so a user can
    // never type a negative number). These stay in sync with external value changes (map clicks,
    // RHF reset) via the effect below, but aren't clobbered by the widget's own in-progress typing.
    const [lngText, setLngText] = useState(() => parseCoordinateValue(value)?.lng.toString() ?? '');
    const [latText, setLatText] = useState(() => parseCoordinateValue(value)?.lat.toString() ?? '');

    useEffect(() => {
        const parsed = parseCoordinateValue(value);
        setLngText(parsed ? parsed.lng.toString() : '');
        setLatText(parsed ? parsed.lat.toString() : '');
    }, [value]);

    const commit = (lngRaw: string, latRaw: string) => {
        const lng = parseFloat(lngRaw);
        const lat = parseFloat(latRaw);
        if (Number.isFinite(lng) && Number.isFinite(lat)) {
            field.onChange(joinCoordinateValue(lng, lat));
        }
    };

    return (
        <div>
            <label>
                {fieldConfig.label}
                {isMandatory ? ' *' : ''}
            </label>
            {fieldConfig.description ? <p>{fieldConfig.description}</p> : null}
            <CoordinateMapPicker value={value} onChange={field.onChange} disabled={isDisabled} />
            <NumberInput
                label="Longitude"
                value={lngText}
                disabled={isDisabled}
                onChange={(next) => {
                    const text = String(next);
                    setLngText(text);
                    commit(text, latText);
                }}
                onBlur={field.onBlur}
            />
            <NumberInput
                label="Latitude"
                value={latText}
                disabled={isDisabled}
                onChange={(next) => {
                    const text = String(next);
                    setLatText(text);
                    commit(lngText, text);
                }}
                onBlur={field.onBlur}
            />
            {hasError && validationText ? <p>{validationText}</p> : null}
        </div>
    );
}

// fallow-ignore-next-line complexity
export function D2GeoJsonField({ control }: WidgetProps) {
    const { fieldConfig, field, isMandatory, isDisabled } = control;
    const { validationText, hasError } = resolveFieldValidation(control);
    const value = field.value as string;
    const [textValue, setTextValue] = useState(value);
    const [textError, setTextError] = useState<string | undefined>(undefined);

    return (
        <div>
            <label>
                {fieldConfig.label}
                {isMandatory ? ' *' : ''}
            </label>
            {fieldConfig.description ? <p>{fieldConfig.description}</p> : null}
            <GeoJsonMapEditor
                value={value}
                onChange={(next) => {
                    field.onChange(next);
                    const geometry = parseGeojsonGeometry(next);
                    setTextValue(geometry ? JSON.stringify(geometry, null, 2) : next);
                    setTextError(undefined);
                }}
                disabled={isDisabled}
            />
            <Textarea
                label="Geometry (JSON)"
                value={textValue}
                disabled={isDisabled}
                error={textError}
                onChange={(event) => {
                    setTextValue(event.currentTarget.value);
                }}
                onBlur={() => {
                    if (!textValue) {
                        field.onChange('');
                        setTextError(undefined);
                        return;
                    }
                    const geometry = parseGeojsonGeometry(textValue);
                    if (geometry) {
                        field.onChange(stringifyGeojsonGeometry(geometry));
                        setTextError(undefined);
                    } else {
                        setTextError('Not a valid GeoJSON geometry');
                    }
                    field.onBlur();
                }}
            />
            {hasError && validationText ? <p>{validationText}</p> : null}
        </div>
    );
}
